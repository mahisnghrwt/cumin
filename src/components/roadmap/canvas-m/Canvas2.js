import { useContext, useEffect, useRef, useReducer, useCallback } from "react";
import "./canvas.css";
import { BASE_NODE_DIMENSIONS, PATH_ENDPOINT, SCALE_UNIT, DRAG_EVENTS, pathEndpoint } from "./canvasEnums";
import HorizontalScale from "./components/HorizontalScale";
import VerticalScale from "./components/VerticalScale";
import { differenceInDays } from "date-fns/esm";
import { add, differenceInCalendarDays, isWithinInterval } from "date-fns";
import {createCyclePatch, detectCycles, gridToPixelBasedPos__, pathPreprocessing} from "./canvasHelper";
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
import AlertBar from "../../AlertBar.js"

const COMPONENT_ID = "CANVAS";
const DEFAULT_ROWS = 7;
const DEFAULT_ROADMAP_DURATION = 100;
const EPIC_DEFAULT_COLOR = "#f1c40f";
const GRIDLINE_COLOR = "#bdc3c7";
const GRIDLINE_SIZE_IN_PX = 1;
const VERTICAL_SCALE_WIDTH = "100px";
const HORIZONTAL_SCALE_HEIGHT = "60px";
const INTERMEDIATE_EPIC_COLOR = "#f1c40f";

const canvasReducer = (state, action) => {
	switch(action.type) {
		case "patch":
			return {
				...state,
				...action.state
			}
	}
}

const Canvas = ({roadmap}) => {
	const [state, dispatch] = useReducer(reducer, {epics: {}, paths: {}, intermediate: {}});

	const [canvas, dispatchCanvas] = useReducer(canvasReducer, {
		startDate: new Date(),
		endDate: add(new Date(), {days: DEFAULT_ROADMAP_DURATION}),
		rows: DEFAULT_ROWS,
	})

	const gridSize = {
		x: differenceInDays(canvas.endDate, canvas.startDate),
		y: canvas.rows
	}
	const canvasSize = {
		height: BASE_NODE_DIMENSIONS.height * gridSize.y,
		width: BASE_NODE_DIMENSIONS.width * gridSize.x
	}

	const [globalContext,,] = useContext(Global);

	const pixelToGridRef = usePixelToGrid(canvasSize, gridSize);
	const interactiveLayerRef = useRef(null);
	const usedRowsRef = useRef(new Set());

	const getPosInCanvasRef = useGetPosInCanvas(interactiveLayerRef);

	const createIntermediateEpic = (pos) => {
		const duration = 1;
	
		const epic = {
			color: INTERMEDIATE_EPIC_COLOR,
			startDate: add(canvas.startDate, {days: pos.x}),
			endDate: add(canvas.startDate, {days: duration + pos.x}),
			row: pos.y,
			id: "intermediate"
		}

		roadmap.setIntermediateEpic(epic);
	}

	const selectEpic = epicId => {
		roadmap.setSelectedEpic(epicId === null ? null : state.epics[epicId]);
	}
	
	const createIntermediatePath = (originEpicId, rawEndpoint) => {
		let path = {
			id: "intermediate",
			originEpicId,
			rawEndpoint
		}

		const originEpic = state.epics[originEpicId];
		if (originEpic == null)	
			return;

		const refDate = rawEndpoint === pathEndpoint.HEAD ? originEpic.startDate : originEpic.endDate;

		let placeholderEndpoint = {
			x: differenceInDays(refDate, canvas.startDate),
			y: originEpic.row
		}

		path.head = {
			...placeholderEndpoint
		};

		path.tail = {
			...placeholderEndpoint
		};

		dispatch({type: "CREATE_INTERMEDIATE_PATH", path});
	}

	const finaliseIntermediatePath = async rawEpicId => {
		if (state.intermediate.path === undefined) return;

		if (rawEpicId === undefined) {
			dispatch({type: "REMOVE_INTERMEDIATE_PATH"});
			return;
		}

		const rawEpicKey = state.intermediate.path.rawEndpoint === PATH_ENDPOINT.HEAD ? "from" : "to";
		const originEpicKey = rawEpicKey === "from" ? "to" : "from";
		
		const p = {
			id: 1,
			[originEpicKey]: state.intermediate.path.originEpicId,
			[rawEpicKey]: rawEpicId
		}

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

		dispatch({type: "REMOVE_INTERMEDIATE_PATH"});
	}

	const drawPath = (pos) => {
		if (state.intermediate.path === undefined)
			return;

		const targetDate = add(canvas.startDate, {days: pos.x});

		const newPathX = differenceInDays(targetDate, canvas.startDate);
		const rawEndpoint = state.intermediate.path.rawEndpoint;
		const currentPathX =  state.intermediate.path[rawEndpoint].x;

		if (currentPathX === newPathX)
			return;

		const patch = {
			x: newPathX,
			y: pos.y
		};

		dispatch({type: "PATCH_INTERMEDIATE_PATH", patch});
	}

	const getSupersetCanvas = nodes => {
		let duration = [canvas.startDate, canvas.endDate];
		let rows = canvas.rows - 1;

		for (let i = 0; i < nodes.length; i++) {
			duration[0] = differenceInDays(duration[0], nodes[i].startDate) > 0 ? nodes[i].startDate : duration[0];
			duration[1] = differenceInDays(nodes[i].endDate, duration[1]) > 0 ? nodes[i].endDate : duration[1];
			rows = Math.max(rows, nodes[i].row)
		}

		return {
			startDate: duration[0],
			endDate: duration[1],
			rows: rows + 1
		}
	}

	const shouldExtendCanvas = epic => {
		const epicWPadding = {
			...epic,
			startDate: add(epic.startDate, {days: -2}),
			endDate: add(epic.endDate, {days: 2})
		}
		const superCanvas = getSupersetCanvas([epicWPadding]);

		if ((differenceInDays(superCanvas.startDate, canvas.startDate) !== 0 || 
			differenceInDays(superCanvas.endDate, canvas.endDate) !== 0) || 
			superCanvas.rows !== canvas.rows) {
				return superCanvas;
			}

		return null;
	}

	const extendCanvasToFitEpic = epic => {
		const superCanvas = shouldExtendCanvas(epic);
		if (superCanvas !== null)
			dispatchCanvas({type: "patch", state: superCanvas});
	}

	const moveEpic = (epicId, pos) => {
		const targetDate = add(canvas.startDate, {days: pos.x});
		let epic = epicId === "intermediate" ? roadmap.intermediateEpic : state.epics[epicId];

		if (epic === null || epic === undefined) return;
		if (differenceInDays(targetDate, epic.startDate) === 0) return;

		const duration = differenceInDays(epic.endDate, epic.startDate);
		const newEndDate = add(targetDate, {days: duration});

		extendCanvasToFitEpic({startDate: targetDate, endDate: newEndDate, row: epic.row});

		const epicPatch = {startDate: targetDate, endDate: newEndDate}

		if (epicId === "intermediate") {
			roadmap.setIntermediateEpic(epicPatch, true);
		}
		else {
			let action = {type: "UPDATE_EPIC", id: epicId, patch: {startDate: targetDate, endDate: newEndDate}};
			dispatch(action);

		}
	}

	const resizeEpic = (epicId, face, pos) => {
		const targetDate = add(canvas.startDate, {days: pos.x});

		let epic = state.epics[epicId];
		if (epicId === "intermediate")
			epic = roadmap.intermediateEpic;

		if (differenceInDays(targetDate, epic.startDate) === 0 || differenceInDays(targetDate, epic.endDate) === 0)
			return;

		let action = {type: "UPDATE_EPIC", id: epic.id, patch: {
			startDate: face === EPIC_FACE.START ? targetDate : epic.startDate,
			endDate: face === EPIC_FACE.END ? targetDate : epic.endDate
		}};

		if (epicId === "intermediate") {
			roadmap.setIntermediateEpic(action.patch, true);
		}
		else {
			dispatch(action);
		}
	}

	const detectAndMergeCycle = _ => {
		const cycles = detectCycles(state.epics, state.paths);
		const patch = createCyclePatch(cycles);

		dispatch({type: "MERGE_PATH_PATCHES", patch});
	}

	const patchEpicDuration = async epicId => {
		if (epicId === "intermediate") return;
		
		const reqBody = {startDate: state.epics[epicId].startDate, endDate: state.epics[epicId].endDate};
		const url = `${settings.API_ROOT}/project/${globalContext.project.id}/epic/${epicId}`;

		try {
			await Helper.http.request(url, "PATCH", localStorage.getItem("token"), reqBody, true);
		} catch (e) {
			console.error(e);
		}
	}

	const epicCreatedOverSocket = epic => {
		const epic_ = epicPreprocessing(epic);
		// what if the row is already occupied?
		usedRowsRef.current.add(epic_.row);
		extendCanvasToFitEpic(epic_);
		dispatch({type: "ADD_EPIC", epic: epic_});
	}

	const epicUpdatedOverSocket = epics => {
		if (Array.isArray(epics) === false) {
			console.error("Updated epic must be sent as an array!");
			return;
		}
		const epic = epicPreprocessing(epics[1]);
		extendCanvasToFitEpic(epic);
		dispatch({type: "UPDATE_EPIC", id: epic.id, patch: epic});
	}

	const epicDeletedOverSocket = epic => {
		dispatch({type: "DELETE_EPIC", id: epic.id});
	}

	const pathCreatedOverSocket = path => {
		dispatch({type: "CREATE_NEW_PATH", path: pathPreprocessing(path)});
		detectAndMergeCycle();
	}

	const pathDeletedOverSocket = path => {

	}

	useEffect(() => {
		let statePatch = {};
		const token = localStorage.getItem("token");

		(async () => {
			const getEpicUrl = settings.API_ROOT + "/project/" + globalContext.project.id + "/epic";
			const getPathsUrl = settings.API_ROOT + "/project/" + globalContext.project.id + "/path";
			
			try {
				const epics = await Helper.http.request(getEpicUrl, "GET", token, null, true);
				statePatch.epics = {...epics};
				const paths = await Helper.http.request(getPathsUrl, "GET", token, null, true);
				statePatch.paths = {...paths};
			} catch (e) {
				console.error(e);
			}

			if (statePatch.epics !== undefined) {
				Object.keys(statePatch.epics).forEach(key => {
					// some preprocessing for our React components (e.g. string date to Date)
					statePatch.epics[key] = epicPreprocessing(statePatch.epics[key]);
					usedRowsRef.current.add(statePatch.epics[key].row);
				})
	
				const superCanvas = getSupersetCanvas(Object.values(statePatch.epics));
				dispatchCanvas({type: "patch", state: superCanvas});
			}

			if (statePatch.paths !== undefined) {
				Object.keys(statePatch.paths).forEach(key => {
					statePatch.paths[key] = pathPreprocessing(statePatch.paths[key]);
				})
			}

			dispatch({type: "PATCH", patch: statePatch});

			// detect cycles and merge patch
			const cycles = detectCycles(statePatch.epics, statePatch.paths);
			const cyclePatch = createCyclePatch(cycles);
			dispatch({type: "MERGE_PATH_PATCHES", patch: cyclePatch});

		})()
	}, []);

	useEffect(() => {
		webSocket.addListener(SOCKET_EVENT.EPIC_CREATED, COMPONENT_ID, epicCreatedOverSocket);
		webSocket.addListener(SOCKET_EVENT.EPIC_DELETED, COMPONENT_ID, epicDeletedOverSocket);
		webSocket.addListener(SOCKET_EVENT.EPIC_UPDATED, COMPONENT_ID, epicUpdatedOverSocket);
		webSocket.addListener(SOCKET_EVENT.PATH_CREATED, COMPONENT_ID, pathCreatedOverSocket);
		webSocket.addListener(SOCKET_EVENT.PATH_DELETED, COMPONENT_ID, pathDeletedOverSocket);

		return () => {
			webSocket.removeListener(SOCKET_EVENT.EPIC_CREATED, COMPONENT_ID);
			webSocket.removeListener(SOCKET_EVENT.EPIC_UPDATED, COMPONENT_ID);
			webSocket.removeListener(SOCKET_EVENT.EPIC_DELETED, COMPONENT_ID);
			webSocket.removeListener(SOCKET_EVENT.PATH_CREATED, COMPONENT_ID);
			webSocket.removeListener(SOCKET_EVENT.PATH_DELETED, COMPONENT_ID);
		}
	}, [canvas])

	const getEpicPosInfo = epic => {
		let info = {
			width: differenceInDays(epic.endDate, epic.startDate) * BASE_NODE_DIMENSIONS.width,
			pos: {
				x: -1,
				y: epic.row * BASE_NODE_DIMENSIONS.height
			}
		};

		const pos = gridToPixelBasedPos__({x: differenceInDays(epic.startDate, canvas.startDate), y: 0}, BASE_NODE_DIMENSIONS);
		info.pos.x = pos.x;

		return info;
	}

	const normalizeEpics = () => {
		let epics = Object.values(state.epics).map(epic => {
			return {
				...epic,
				isSelected: !roadmap.selectedEpic ? false : roadmap.selectedEpic.id === epic.id,
				...getEpicPosInfo(epic)
			}
		});

		if (roadmap.intermediateEpic) {
			epics.push({...roadmap.intermediateEpic, ...getEpicPosInfo(roadmap.intermediateEpic)});
		}

		return epics;
	}

	const calcVerticalLinePos = () => {
		const today = new Date();
		return gridToPixelBasedPos__({x: differenceInCalendarDays(today, canvas.startDate), y: 0}, BASE_NODE_DIMENSIONS);
	}

	// only render today marker, if today is within canvas interval.
	const renderTodayMarker = isWithinInterval(new Date(), {start: canvas.startDate, end: canvas.endDate});



	return (
		<canvasContext.Provider value={{...canvas, selectEpic, canvasSize, gridSize}}>
		<div className="canvas-with-scale" style={{position: "relative"}}>
			<div className="canvas-with-scale-row">
				<div className="canvas-with-scale-origin"
					style={{
						height: HORIZONTAL_SCALE_HEIGHT,
						width: VERTICAL_SCALE_WIDTH
					}} />
				<HorizontalScale 
					style={{height: HORIZONTAL_SCALE_HEIGHT}} 
					startDate={canvas.startDate} 
					endDate={canvas.endDate} 
					baseNodeDimensions={BASE_NODE_DIMENSIONS} 
					unit={SCALE_UNIT.day}
					canvasDimensions={canvasSize}
					gridDimensions={gridSize}
					canvasRef={interactiveLayerRef}
				/>
			</div>
			<div className="canvas-with-scale-row">
				<VerticalScale style={{position: "sticky", width: VERTICAL_SCALE_WIDTH}} epics={Object.values(state.epics)} unit={BASE_NODE_DIMENSIONS} rows={canvas.rows} />
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
						{Object.values(state.paths).map(x => {
							return <Path 
								canvas={{startDate: canvas.startDate}}
								from={state.epics[x.from]}
								to={state.epics[x.to]}
								color={x.color}
								/>
						})}
						{state.intermediate.path !== undefined && <Path path={state.intermediate.path} canvas={{startDate: canvas.startDate}} />}
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
