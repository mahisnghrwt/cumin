import { useContext, useEffect, useRef, useReducer } from "react";
import "./canvas.css";
import { BASE_NODE_DIMENSIONS, PATH_ENDPOINT, SCALE_UNIT, DRAG_EVENTS } from "./canvasEnums";
import Epic from "./components/Epic";
import HorizontalScale from "./components/HorizontalScale";
import VerticalScale from "./components/VerticalScale";
import { differenceInDays } from "date-fns/esm";
import { add, differenceInCalendarDays } from "date-fns";
import {getStartEndDates, gridToPixelBasedPos__, pixelToGridBasedPos__} from "./canvasHelper";
import Path from "./components/Path";
import webSocket from "../../../webSocket"
import {SOCKET_EVENT} from "../../../enums";
import Helper from "../../../Helper";
import settings from "../../../settings";
import Global from "../../../GlobalContext";
import {epicPreprocessing, generateGridlinesCss, shouldExtendCanvas, gridToDate} from "./canvasHelper";
// import useAddRowsToFitEpic from "./hooks/useAddRowsToFitEpic";
import usePixelToGrid from "./hooks/usePixelToGrid";
import useGetPosInCanvas from "./hooks/useGetPosInCanvas";
import reducer from "./canvasReducer";
import { EPIC_FACE } from "./canvasEnums";

const COMPONENT_ID = "CANVAS";

const DEFAULT_ROWS = 7;
const DEFAULT_ROADMAP_DURATION = 100;

const EPIC_DEFAULT_COLOR = "#f1c40f";

const GRIDLINE_COLOR = "#bdc3c7";
const GRIDLINE_SIZE_IN_PX = 1;
const VERTICAL_SCALE_WIDTH = "100px";
const HORIZONTAL_SCALE_HEIGHT = "60px";
const INTERMEDIATE_EPIC_COLOR = "#f1c40f";


// const createEpic = (pos, refDate, canvasSize, grids) => {
// 	// this can be dynamic, so we will store color in database as string ?!

// 	const gridPos = pixelToGridBasedPos__(pos, canvasSize, grids);

// 	const startDate = gridToDate(refDate, gridPos.x);
// 	const endDate = gridToDate(refDate, gridPos.x + 1);

// 	if (startDate == null || endDate == null)
// 		return null;


// 	const epic = {
// 		color: EPIC_DEFAULT_COLOR,
// 		startDate,
// 		endDate,
// 		row: gridPos.y,
// 		id: "intermediate"
// 	}

// 	return epic;
// }

const createIntermediateEpic = (startDate, row) => {
	const duration = 1;

	const epic = {
		color: INTERMEDIATE_EPIC_COLOR,
		startDate,
		endDate: add(startDate, {days: duration}),
		row,
		id: "intermediate"
	}

	return epic;
}

const Canvas = ({roadmap}) => {
	const [state, dispatch] = useReducer(reducer, {epics: {}, paths: {}, intermediate: {}, canvas: {
		startDate: new Date(),
		endDate: add(new Date(), {days: DEFAULT_ROADMAP_DURATION}),
		rows: DEFAULT_ROWS
	}});

	const [global,,] = useContext(Global);

	const gridSize = {
		x: differenceInDays(state.canvas.endDate, state.canvas.startDate),
		y: state.canvas.rows
	}

	const canvasSize = {
		height: BASE_NODE_DIMENSIONS.height * gridSize.y,
		width: BASE_NODE_DIMENSIONS.width * gridSize.x
	}

	const pixelToGrid = usePixelToGrid(canvasSize, gridSize);
	const interactiveLayerRef = useRef(null);

	// rename to cutomDragEvent
	const dragData = useRef({type: ""});

	const usedRowsRef = useRef(new Set());

	const getPosInCanvasRef = useGetPosInCanvas(interactiveLayerRef);

	const increaseCanvasSizeBy = () => {}

	const interactiveLayerDoubleClickHandler = e => {
		e.preventDefault();

		const pos = getPosInCanvasRef.current(e.nativeEvent);
		const gridPos = pixelToGrid.current(pos);

		let epic = createIntermediateEpic(add(state.canvas.startDate, {days: gridPos.x}), gridPos.y);

		dispatch({type: "UPDATE_INTERMEDIATE_EPIC", epic});
	}

	const unselectEpic = () => {
		if (state.canvas.selectedEpicId === undefined) return;
		dispatch({type: "UPDATE_CANVAS", patch: {selectedEpicId: undefined}});
	}

	const interactiveLayerClickHandler = (e) => {
		unselectEpic();
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

		const refDate = rawEndpoint === PATH_ENDPOINT.HEAD ? originEpic.startDate : originEpic.endDate;

		let placeholderEndpoint = {
			x: differenceInDays(refDate, state.canvas.startDate),
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

	const finaliseIntermediatePath = rawEpicId => {
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

		// NOTE -> again this function should return the path object

		// NOTE -> call api
		dispatch({type: "CREATE_NEW_PATH", path: p});
	}

	const drawPath = (targetDate, row) => {
		if (state.intermediate.path === undefined)
			return;

		const newPathX = differenceInDays(targetDate, state.canvas.startDate);
		const rawEndpoint = state.intermediate.path.rawEndpoint;
		const currentPathX =  state.intermediate.path[rawEndpoint].x;

		if (currentPathX === newPathX)
			return;

		const patch = {
			x: newPathX,
			y: row
		};

		dispatch({type: "PATCH_INTERMEDIATE_PATH", patch});
	}

	const moveEpic = (epicId, targetDate) => {
		let epic = epicId === "intermediate" ? state.intermediate.epic : state.epics[epicId];

		if (epic === null || epic === undefined) return;

		if (differenceInDays(targetDate, epic.startDate) === 0) return;

		const widthInDays = differenceInDays(epic.endDate, epic.startDate);

		const newEndDate = add(targetDate, {days: widthInDays});

		if (shouldExtendCanvas(newEndDate, state.canvas.endDate))
			increaseCanvasSizeBy(1);

		let action = {type: "UPDATE_EPIC", id: epicId, patch: {startDate: targetDate, endDate: newEndDate}};
		if (epicId === "intermediate") {
			action = {type: "UPDATE_INTERMEDIATE_EPIC", epic: {startDate: targetDate, endDate: newEndDate}};
		}
		dispatch(action);
	}

	// const resizeEpic = useEpicResizer(state, dispatch);

	const resizeEpic = (epicId, face, targetDate) => {
		let epic = state.epics[epicId];
		if (epicId === "intermediate")
			epic = state.intermediate.epic;

		if (differenceInDays(targetDate, epic.startDate) === 0 || differenceInDays(targetDate, epic.endDate) === 0)
			return;


		// if (shouldExtendCanvas(targetDate, state.canvas.endDate)) {
		// 	increaseCanvasSizeBy(1);
		// }

		let action = {type: "UPDATE_EPIC", id: epic.id, patch: {
			startDate: face === EPIC_FACE.START ? targetDate : epic.startDate,
			endDate: face === EPIC_FACE.END ? targetDate : epic.endDate
		}};

		if (epicId === "intermediate") {
			dispatch({type: "UPDATE_INTERMEDIATE_EPIC", epic: {...action.patch}});
		}
		else {
			dispatch(action);
		}
	}

	const dragOver = (e) => {
		e.preventDefault();
		e.stopPropagation();

		// these are the only valid drop target, because we can only calculate position relative to interactive-layer for them
		if (e.target.className !== "epic" && e.target.className !== "interactive-layer") {
			return;
		}

		const pos = getPosInCanvasRef.current(e.nativeEvent);

		const gridPos = pixelToGrid.current(pos);
		const targetDate = gridToDate(state.canvas.startDate, gridPos.x);

		switch(dragData.current.type) {
			case "DRAW_PATH":
				drawPath(targetDate, gridPos.y);
				break;
			case DRAG_EVENTS.moveEpic:
				moveEpic(dragData.current.epicId, targetDate);
				break;
			case "RESIZE_EPIC":
				resizeEpic(dragData.current.epicId, dragData.current.face, targetDate);
				break;
			// default:
			// 	throw new Error(`Unknown drag event type: ${dragData.current.type}`);
		}

	}

	const shouldExtendCanvas = () => {}

	const drop = (e) => {
		e.preventDefault();
		e.stopPropagation();

		if (dragData.current.type === undefined) return;

		switch(dragData.current.type) {
			case "DRAW_PATH":
				finaliseIntermediatePath(dragData.current.rawId);
				break;
			case DRAG_EVENTS.moveEpic: 
			break;
		}
	}	

	const epicCreatedOverSocket = epic => {
		const epic_ = epicPreprocessing(epic);
		// debugger;

		// what if the row is already occupied?
		usedRowsRef.current.add(epic_.row);

		// addRowsToFitEpic.current(epic_);
		
		extendCanvasToFitEpic(epic_);
		
		dispatch({type: "ADD_EPIC", epic: epic_});
	}

	const epicUpdatedOverSocket = epics => {
		if (Array.isArray(epics) === false) {
			console.error("Updated epic must be sent as an array!");
			return;
		}

		// no validation of row, since epic's row cannot be updated over socket

		const epic = epicPreprocessing(epics[1]);
		extendCanvasToFitEpic(epic);

		dispatch({type: "UPDATE_EPIC", id: epic.id, patch: epic});
	}

	const epicDeletedOverSocket = epic => {
		dispatch({type: "DELETE_EPIC", id: epic.id});
	}

	// const addRowsToFitEpic = useAddRowsToFitEpic(state, dispatch);

	const extendCanvasToFitEpic = (epic) => {
		if (differenceInDays(epic.startDate, state.canvas.startDate) > 0 && differenceInDays(state.canvas.endDate, epic.endDate) > 0)
			return;

		const patchedRoadmapDuration = getStartEndDates([state.canvas.startDate, state.canvas.endDate], epic);

		dispatch({type: "UPDATE_CANVAS", patch: {startDate: patchedRoadmapDuration[0], endDate: patchedRoadmapDuration[1]}});
	}

	const selectEpic = id => {
		dispatch({type: "UPDATE_CANVAS", patch: {selectedEpicId: id}});
	}

	useEffect(() => {
		let statePatch = {};
		const token = localStorage.getItem("token");


		(async () => {
			let lastRow = DEFAULT_ROWS;
			let roadmapDuration = [new Date(), add(new Date(), {days: DEFAULT_ROADMAP_DURATION})];

			const getEpicUrl = settings.API_ROOT + "/project/" + global.project.id + "/epic";
			
			try {
				const epics = await Helper.http.request(getEpicUrl, "GET", token, null, true);
				statePatch.epics = {...epics};
			} catch (e) {
				console.error(e);
			}

			if (statePatch.epics === undefined)
				return;

			Object.keys(statePatch.epics).forEach(key => {
				// some preprocessing for our React components (e.g. string date to Date)
				statePatch.epics[key] = epicPreprocessing(statePatch.epics[key]);

				// get the last row for roadmap
				// lastRow = getLastRow(lastRow, statePatch.epics[key]);
				
				// determine roadmap duration
				roadmapDuration = getStartEndDates(roadmapDuration, statePatch.epics[key]);

				// mark the rows as used
				usedRowsRef.current.add(statePatch.epics[key].row);
			})

			dispatch({type: "UPDATE_CANVAS", patch: {
				rows: lastRow, 
				startDate: roadmapDuration[0], 
				endDate: roadmapDuration[1]
			}});

			dispatch({type: "PATCH", patch: statePatch});

		})()
		// load all the paths

		webSocket.addListener(SOCKET_EVENT.EPIC_CREATED, COMPONENT_ID, epicCreatedOverSocket);
		webSocket.addListener(SOCKET_EVENT.EPIC_UPDATED, COMPONENT_ID, epicUpdatedOverSocket);
		webSocket.addListener(SOCKET_EVENT.EPIC_DELETED, COMPONENT_ID, epicDeletedOverSocket);

		return () => {
			webSocket.removeListener(SOCKET_EVENT.EPIC_CREATED, COMPONENT_ID);
			webSocket.removeListener(SOCKET_EVENT.EPIC_UPDATED, COMPONENT_ID);
			webSocket.removeListener(SOCKET_EVENT.EPIC_DELETED, COMPONENT_ID);

		}
	}, []);

	const getEpicPosInfo = epic => {
		let info = {
			width: differenceInDays(epic.endDate, epic.startDate),
			pos: {
				x: -1,
				y: epic.row
			}
		};

		const pos = gridToPixelBasedPos__({x: differenceInDays(epic.startDate, state.canvas.startDate), y: 0}, BASE_NODE_DIMENSIONS);
		info.pos.x = pos.x;

		return info;
	}

	return (
		<div className="canvas-with-scale" style={{position: "relative"}}>
			<div className="canvas-with-scale-row">
				<div className="canvas-with-scale-origin"
					style={{
						height: HORIZONTAL_SCALE_HEIGHT,
						width: VERTICAL_SCALE_WIDTH
					}} />
				<HorizontalScale 
					style={{height: HORIZONTAL_SCALE_HEIGHT}} 
					startDate={state.canvas.startDate} 
					endDate={state.canvas.endDate} 
					baseNodeDimensions={BASE_NODE_DIMENSIONS} 
					unit={SCALE_UNIT.day}
					canvasDimensions={canvasSize}
					gridDimensions={gridSize}
					canvasRef={interactiveLayerRef}
				/>
			</div>
			<div className="canvas-with-scale-row">
				<div>
					<VerticalScale style={{position: "sticky", width: VERTICAL_SCALE_WIDTH}} epics={Object.values(state.epics)} unit={BASE_NODE_DIMENSIONS} rows={state.canvas.rows} />
					{/* <button>Button</button> */}
				</div>
				<div 
					className="canvas-layer" 
					id="canvas-layer"
					style={{
						...canvasSize,
						backgroundImage: generateGridlinesCss(BASE_NODE_DIMENSIONS, GRIDLINE_SIZE_IN_PX, GRIDLINE_COLOR)
					}}>

					{/* Svg Layer */}
					<svg id="svg-layer">
						{Object.values(state.paths).map(x => {
							return <Path 
								canvas={{startDate: state.canvas.startDate}}
								from={state.epics[x.from]}
								to={state.epics[x.to]}
								/>
						})}
						{state.intermediate.path !== undefined && <Path path={state.intermediate.path} canvas={{startDate: state.canvas.startDate}} />}
					</svg>

					<div 
						id="interactive-layer"
						className="interactive-layer"
						onDragOver={dragOver}
						onDrop={drop}
						onDoubleClick={interactiveLayerDoubleClickHandler}
						onClick={interactiveLayerClickHandler}
						ref={interactiveLayerRef}
					>
						{state.intermediate.epic !== undefined && (
							<Epic 
							key={state.intermediate.epic.id}
							dragData={dragData}
							{...state.intermediate.epic}
							canvas={{
								dimensions: {...canvasSize},
								startDate: state.canvas.startDate,
								endDate: state.canvas.endDate,
								grid: {
									...gridSize
								}
							}} />
						)}
						{Object.values(state.epics).map((x) => {
							return <Epic 
								key={x.id}
								createPath={createIntermediatePath}
								notifyPathEnd={finaliseIntermediatePath}
								reportClick={selectEpic}
								dragData={dragData}
								isSelected={state.canvas.selectedEpicId === x.id ? true : false}
								{...x}
								canvas={{
									dimensions: {...canvasSize},
									startDate: state.canvas.startDate,
									endDate: state.canvas.endDate,
									grid: {
										...gridSize
									}
								}} />
						})}
					</div>
				</div>
			</div>
			
		</div>
  );
}

export default Canvas;
