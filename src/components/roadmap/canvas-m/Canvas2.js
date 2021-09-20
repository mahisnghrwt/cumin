import { useContext, useEffect, useRef, useReducer, useCallback } from "react";
import "./canvas.css";
import { BASE_NODE_DIMENSIONS, PATH_ENDPOINT, SCALE_UNIT, DRAG_EVENTS, pathEndpoint } from "./canvasEnums";
import HorizontalScale from "./components/HorizontalScale";
import VerticalScale from "./components/VerticalScale";
import { add, differenceInCalendarDays, isWithinInterval } from "date-fns";
import {createCyclePatch, detectCycles, getSupersetCanvas, gridToPixelBasedPos__, makePath, pathPreprocessing} from "./canvasHelper";
import Path from "./components/Path";
import webSocket from "../../../webSocket"
import {SOCKET_EVENT} from "../../../enums";
import Helper from "../../../Helper";
import settings from "../../../settings";
import Global from "../../../GlobalContext";
import {epicPreprocessing, generateGridlinesCss, gridToDate} from "./canvasHelper";
import usePixelToGrid from "./hooks/usePixelToGrid";
import useGetPosInCanvas from "./hooks/useGetPosInCanvas";
import reducer from "./canvasReducer";
import { EPIC_FACE } from "./canvasEnums";
import InteractiveLayer from "./components/InteractiveLayer";
import canvasContext from "./canvasContext";
import VerticalLine from "./components/VerticalLine";
import roadmapContext from "../roadmapContext";
import sidebarContext from "../../sidebar2/sidebarContext";
import CreateEpicForm from "../CreateEpicForm";
import IssueItemList from "../../issueItem/IssueItemList";
import EditEpicForm from "../EditEpicForm";


const EPIC_DEFAULT_COLOR = "#f1c40f";
const GRIDLINE_COLOR = "#bdc3c7";
const GRIDLINE_SIZE_IN_PX = 1;
const VERTICAL_SCALE_WIDTH = "100px";
const HORIZONTAL_SCALE_HEIGHT = "60px";
const INTERMEDIATE_EPIC_COLOR = "#f1c40f";

const defaultState = {selectedEpic: null, intermediate: {epic: null, path: null}};


const stateReducer = (state, action) => {
	switch(action.type) {
		case "update":
			return action.state;
		case "setSelectedEpic":
			return {
				...state,
				selectedEpic: action.epic
			}
		case "updateIntermediateEpic":
			return {
				...state,
				intermediate: {
					...state.intermediate,
					epic: action.epic
				}
			}
		case "updateIntermediatePath":
			return {
				...state,
				intermediate: {
					...state.intermediate,
					path: action.path
				}
			}
		case "patchIntermediateEpic":
			return {
				...state,
				intermediate: {
					...state.intermediate,
					epic: {
						...state.intermediate.epic,
						...action.epic
					}
				}
			}
		case "patchIntermediatePath":
			return {
				...state,
				intermediate: {
					...state.intermediate,
					path: {
						...state.intermediate.path,
						...action.path
					}
				}
			}
	}
};

const Canvas = ({roadmap, roadmapDispatch}) => {
	const [globalContext,,] = useContext(Global);
	const {dispatchCanvasTools} = useContext(roadmapContext);
	const {state: {dispatch: sidebarDispatch}} = useContext(sidebarContext);
	const [state, stateDispatch] = useReducer(stateReducer, defaultState)
	const interactiveLayerRef = useRef(null);

	const gridSize = {
		x: differenceInCalendarDays(roadmap.canvas.endDate, roadmap.canvas.startDate),
		y: roadmap.canvas.rows
	}
	const canvasSize = {
		height: BASE_NODE_DIMENSIONS.height * gridSize.y,
		width: BASE_NODE_DIMENSIONS.width * gridSize.x
	}

	const createIntermediateEpic = (pos) => {
		const duration = 1;
	
		const epic = {
			color: INTERMEDIATE_EPIC_COLOR,
			startDate: add(roadmap.canvas.startDate, {days: pos.x}),
			endDate: add(roadmap.canvas.startDate, {days: duration + pos.x}),
			row: pos.y,
			id: "intermediate"
		}

		stateDispatch({type: "updateIntermediateEpic", epic});
	}

	const selectEpic = epicId => {
		stateDispatch({type: "setSelectedEpic", epic: epicId});
	}
	
	const createIntermediatePath = (originEpicId, rawEndpoint) => {
		let path = {
			id: "intermediate",
			originEpicId,
			rawEndpoint
		}

		const originEpic = roadmap.epics[originEpicId];
		if (originEpic == null)	
			return;

		const refDate = rawEndpoint === pathEndpoint.HEAD ? originEpic.startDate : originEpic.endDate;

		let placeholderEndpoint = {
			x: differenceInCalendarDays(refDate, roadmap.canvas.startDate),
			y: originEpic.row
		}

		if (rawEndpoint === pathEndpoint.HEAD) {
			path.head = {
				...placeholderEndpoint
			};
		}

		if (rawEndpoint === pathEndpoint.TAIL) {
			path.tail = {
				...placeholderEndpoint
			};
		}

		stateDispatch({type: "updateIntermediatePath", path});
	}

	const finaliseIntermediatePath = async rawEpicId => {
		if (state.intermediate.path === null) return;

		// do not remove intermediate path even if it does not ends on any epic.
		if (rawEpicId === undefined) {
			stateDispatch({type: "updateIntermediatePath", path: null});
			return;
		}

		const rawEpicKey = state.intermediate.path.rawEndpoint === PATH_ENDPOINT.HEAD ? "from" : "to";
		const originEpicKey = rawEpicKey === "from" ? "to" : "from";
		
		const p = {
			id: 1,
			[originEpicKey]: state.intermediate.path.originEpicId,
			[rawEpicKey]: rawEpicId
		};

		// submit create path request
		const createPathUrl = `${settings.API_ROOT}/project/${globalContext.project.id}/path`;
		const body = {
			fromEpicId: p.from,
			toEpicId: p.to
		};
		try {
			await Helper.http.request(createPathUrl, "POST", localStorage.getItem("token"), body, false);
		} catch (e) {
			console.error(e);
		}

		stateDispatch({type: "updateIntermediatePath", path: null});
	}

	const drawPath = (pos) => {
		if (state.intermediate.path === null)
			return;

		const targetDate = add(roadmap.canvas.startDate, {days: pos.x});

		const newPathX = differenceInCalendarDays(targetDate, roadmap.canvas.startDate);
		const rawEndpoint = state.intermediate.path.rawEndpoint;
		const currentPathX =  state.intermediate.path[rawEndpoint].x;

		if (currentPathX === newPathX)
			return;

		const patch = {
			[rawEndpoint]: {
				x: newPathX,
				y: pos.y
			}
		};

		stateDispatch({type: "patchIntermediatePath", path: patch});
	}

	const shouldExtendCanvas = epic => {
		const epicWPadding = {
			...epic,
			startDate: add(epic.startDate, {days: -2}),
			endDate: add(epic.endDate, {days: 2})
		}
		const superCanvas = getSupersetCanvas(roadmap.canvas, [epicWPadding]);

		if ((differenceInCalendarDays(superCanvas.startDate, roadmap.canvas.startDate) !== 0 || 
			differenceInCalendarDays(superCanvas.endDate, roadmap.canvas.endDate) !== 0) || 
			superCanvas.rows !== roadmap.canvas.rows) {
				return superCanvas;
			}

		return null;
	}

	const extendCanvasToFitEpic = epic => {
		const superCanvas = shouldExtendCanvas(epic);
		if (superCanvas !== null)
			roadmapDispatch({type: "patchCanvas", roadmapId: roadmap.id, canvas: superCanvas});
	}

	const moveEpic = (epicId, pos) => {
		const targetDate = add(roadmap.canvas.startDate, {days: pos.x});
		let epic = epicId === "intermediate" ? state.intermediate.epic : roadmap.epics[epicId];

		if (epic === null || epic === undefined) return;
		if (differenceInCalendarDays(targetDate, epic.startDate) === 0) return;

		const duration = differenceInCalendarDays(epic.endDate, epic.startDate);
		const newEndDate = add(targetDate, {days: duration});

		extendCanvasToFitEpic({startDate: targetDate, endDate: newEndDate, row: epic.row});

		const epicPatch = {startDate: targetDate, endDate: newEndDate}

		if (epicId === "intermediate") {
			stateDispatch({type: "patchIntermediateEpic", epic: epicPatch});
		}
		else {
			let action = {type: "patchEpic", roadmapId: roadmap.id, epic: {id: epicId, startDate: targetDate, endDate: newEndDate}};
			roadmapDispatch(action);
		}
	}

	const resizeEpic = (epicId, face, pos) => {
		const targetDate = add(roadmap.canvas.startDate, {days: pos.x});

		let epic = roadmap.epics[epicId];
		if (epicId === "intermediate")
			epic = state.intermediate.epic;

		if (differenceInCalendarDays(targetDate, epic.startDate) === 0 || differenceInCalendarDays(targetDate, epic.endDate) === 0)
			return;

		let action = {type: "patchEpic", roadmapId: roadmap.id, epic: {
			id: epic.id,
			startDate: face === EPIC_FACE.START ? targetDate : epic.startDate,
			endDate: face === EPIC_FACE.END ? targetDate : epic.endDate
		}};

		if (epicId === "intermediate") {
			stateDispatch({type: "patchIntermediateEpic", epic: action.epic});
		}
		else {
			roadmapDispatch(action);
		}
	}

	const deleteEpic = async epicId => {
		const url = `${settings.API_ROOT}/project/${globalContext.project.id}/roadmap/${roadmap.id}/epic/${epicId}`;
		try {
			await Helper.http.request(url, "DELETE", localStorage.getItem("token"), null, false);
			roadmapDispatch({type: "removeEpic", roadmapId: roadmap.id, epicId});
		} catch (e) {
			console.error(e);
		}
	}

	const patchEpicDuration = async epicId => {
		if (epicId === "intermediate") return;
		
		const reqBody = {startDate: roadmap.epics[epicId].startDate, endDate: roadmap.epics[epicId].endDate};
		const url = `${settings.API_ROOT}/project/${globalContext.project.id}/roadmap/${roadmap.id}/epic/${epicId}`;

		try {
			await Helper.http.request(url, "PATCH", localStorage.getItem("token"), reqBody, true);
		} catch (e) {
			console.error(e);
		}
	}

	useEffect(() => {
		if (roadmap === null || roadmap === undefined) return;

		stateDispatch({type: "update", state: defaultState});
		// Sample code to expose buttons from canvas
		// dispatchCanvasTools({type: "clear"});
		// dispatchCanvasTools({type: "add", id: "addRow", tool: (<button onClick={addRow} className="std-button x-sm-2">+ Add Row</button>)})
	}, [roadmap]);

	useEffect(() => {
		// So, CreateEpicForm has uptodate epic value
		if (state.intermediate.epic === null) {
			sidebarDispatch({type: "remove", key: "createEpicForm"})
			return;
		}

		const addEpic = epic => {
			const epic_ = epicPreprocessing(epic);
			roadmapDispatch({type: "addEpic", roadmapId: roadmap.id, epic: epic_});
			// always add an extra empty row at the bottom of canvas
			roadmapDispatch({type: "addRowsToCanvas", roadmapId: roadmap.id, rows: 1});
		}

		const clearIntermediateEpic = () => {
			stateDispatch({type: "updateIntermediateEpic", epic: null});
		}

		sidebarDispatch({type: "add", key: "createEpicForm", item: 
			(<CreateEpicForm 
				roadmap={roadmap.id} 
				intermediateEpic={state.intermediate.epic} 
				clearIntermediateEpic={clearIntermediateEpic}
				addEpic={addEpic}
			/>)})
	}, [state.intermediate.epic]);

	useEffect(() => {
		if (state.selectedEpic === null) {
			sidebarDispatch({type: "remove", key: "issueItemList"});
			sidebarDispatch({type: "remove", key: "editEpicForm"});
			dispatchCanvasTools({type: "remove", id: "deleteEpic"});
			return;
		}

		dispatchCanvasTools({type: "add", id: "deleteEpic", tool: (
			<button onClick={() => deleteEpic(state.selectedEpic)} className="std-button x-sm-2 danger-background">Delete Epic</button>
		)});

		sidebarDispatch({type: "add", key: "issueItemList", item: 
			(<IssueItemList selectedEpic={state.selectedEpic} />)});
		sidebarDispatch({type: "add", key: "editEpicForm", item: 
			(<EditEpicForm epic={roadmap.epics[state.selectedEpic]} />)});
	}, [state.selectedEpic])

	const getEpicPosInfo = epic => {
		let info = {
			width: differenceInCalendarDays(epic.endDate, epic.startDate) * BASE_NODE_DIMENSIONS.width,
			pos: {
				x: -1,
				y: epic.row * BASE_NODE_DIMENSIONS.height
			}
		};

		const pos = gridToPixelBasedPos__({x: differenceInCalendarDays(epic.startDate, roadmap.canvas.startDate), y: 0}, BASE_NODE_DIMENSIONS);
		info.pos.x = pos.x;

		return info;
	}

	const normalizeEpics = () => {
		let epics = Object.values(roadmap.epics).map(epic => {
			return {
				...epic,
				isSelected: !state.selectedEpic ? false : state.selectedEpic === epic.id,
				...getEpicPosInfo(epic)
			}
		});

		if (state.intermediate.epic) {
			epics.push({...state.intermediate.epic, ...getEpicPosInfo(state.intermediate.epic)});
		}

		return epics;
	}

	const normalizePaths = () => {
		let paths = Object.values(roadmap.paths).map(path => {
			return makePath(roadmap.epics[path.from], roadmap.epics[path.to], roadmap.canvas.startDate);
		});

		if (state.intermediate.path) {
			// intermediate.path.rawEndpoint -> pathEndpoint.HEAD | pathEndpoint.TAIL
			// intermediate.path.originEpicId
			// intermediate.path.head | intermediate.path.tail (gridPos)
			const p = makePath(roadmap.epics[state.intermediate.path.originEpicId], roadmap.epics[state.intermediate.path.originEpicId], roadmap.canvas.startDate);
			const pPos = {
				head: state.intermediate.path.rawEndpoint === pathEndpoint.HEAD ? state.intermediate.path.head : p.head,
				tail: state.intermediate.path.rawEndpoint === pathEndpoint.TAIL ? state.intermediate.path.tail : p.tail
			}
			paths.push(pPos);
		}

		return paths;
	}

	const calcVerticalLinePos = () => {
		const today = new Date();
		return gridToPixelBasedPos__({x: differenceInCalendarDays(today, roadmap.canvas.startDate), y: 0}, BASE_NODE_DIMENSIONS);
	}



	// only render today marker, if today is within canvas interval.
	const renderTodayMarker = isWithinInterval(new Date(), {start: roadmap.canvas.startDate, end: roadmap.canvas.endDate});

	if (!roadmap || !roadmap.processed) return null;

	return (
		<canvasContext.Provider value={{...roadmap.canvas, selectEpic, canvasSize, gridSize}}>
		<div className="canvas-with-scale" style={{position: "relative"}}>
			<div className="canvas-with-scale-row">
				<div className="canvas-with-scale-origin"
					style={{
						height: HORIZONTAL_SCALE_HEIGHT,
						width: VERTICAL_SCALE_WIDTH
					}} />
				<HorizontalScale 
					style={{height: HORIZONTAL_SCALE_HEIGHT}} 
					startDate={roadmap.canvas.startDate} 
					endDate={roadmap.canvas.endDate} 
					baseNodeDimensions={BASE_NODE_DIMENSIONS} 
					unit={SCALE_UNIT.day}
					canvasDimensions={canvasSize}
					gridDimensions={gridSize}
					canvasRef={interactiveLayerRef}
				/>
			</div>
			<div className="canvas-with-scale-row">
				<VerticalScale style={{position: "sticky", width: VERTICAL_SCALE_WIDTH}} epics={Object.values(roadmap.epics)} unit={BASE_NODE_DIMENSIONS} rows={roadmap.canvas.rows} />
				<div 
					className="canvas-layer" 
					id="canvas-layer"
					style={{
						...canvasSize,
						backgroundImage: generateGridlinesCss(BASE_NODE_DIMENSIONS, GRIDLINE_SIZE_IN_PX, GRIDLINE_COLOR)
					}}>
					{ renderTodayMarker && <VerticalLine pos={calcVerticalLinePos()} height={canvasSize.height} /> }

					{/* Svg Layer */}
					<svg id="svg-layer">
						{normalizePaths().map(path => {
							return <Path 
								canvasStartDate={roadmap.canvas.startDate}
								path={path}
							/>
						})}
						{/* {Object.values(roadmap.paths).map(x => {
							return <Path 
								canvas={{startDate: roadmap.canvas.startDate}}
								from={roadmap.epics[x.from]}
								to={roadmap.epics[x.to]}
								color={x.color}
								/>
						})}
						{state.intermediate.path && <Path path={state.intermediate.path} canvas={{startDate: roadmap.canvas.startDate}} />} */}
					</svg>

					<InteractiveLayer 
						epics={normalizeEpics()} 
						ref={interactiveLayerRef} 
						drawPath={drawPath} 
						moveEpic={moveEpic} 
						resizeEpic={resizeEpic} 
						createIntermediatePath={createIntermediatePath} 
						finaliseIntermediatePath={finaliseIntermediatePath}
						createIntermediateEpic={createIntermediateEpic}
						selectEpic={selectEpic}
						patchEpicDuration={patchEpicDuration}
					/>
				</div>
			</div>
		</div>
		</canvasContext.Provider>
  );
}

export default Canvas;
