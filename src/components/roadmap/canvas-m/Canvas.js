/*
 *	Custom Drag Events
 * 	==================
 *
 * 	Draggable Element
 *	----------------- 
 * 	OnDragStart => Pass drag data.
 * 
 * 	Droppable Element
 * 	-----------------
 * 	OnDrop => Clear drag data.
 */

import { useContext, useEffect, useReducer, useRef } from "react";
import "./canvas.css";
import { BASE_NODE_DIMENSIONS, EPIC_FACE, PATH_ENDPOINT, SCALE_UNIT, DRAG_EVENTS } from "./canvasEnums";
import Epic from "./components/Epic";
import HorizontalScale from "./components/HorizontalScale";
import VerticalScale from "./components/VerticalScale";
import { differenceInDays } from "date-fns/esm";
import { add, startOfMinute } from "date-fns";
import {pixelToGridBasedPos__} from "./canvasHelper";
import Path from "./components/Path";
import Vector2 from "./classes/Vector2"
import Placeholder from "../../Placeholder";
import webSocket from "../../../webSocket"
import {ISSUE_STATUS_TO_ENUM, SOCKET_EVENT} from "../../../enums";
import Helper from "../../../Helper";
import settings from "../../../settings";
import Global from "../../../GlobalContext";
import ApiCalls from "./ApiCalls";
import {epicPreprocessing, generateGridlinesCss, shouldExtendCanvas, gridToDate} from "./canvasHelper";
import reducer from "./canvasReducer";
import useEpicResizer from "./useEpicResizer";

const COMPONENT_ID = "CANVAS";



const EPIC_DEFAULT_COLOR = "#7ed6df";

const GRIDLINE_COLOR = "#bdc3c7";
const GRIDLINE_SIZE_IN_PX = 1;
const VERTICAL_SCALE_WIDTH = 100;
const HORIZONTAL_SCALE_HEIGHT = 20;

const INTERACTIVE_LAYER_CLASS_NAME = "interactive-layer";
const EPIC_CLASS_NAME = "epic";

let id = 1;
const getId__ = () => {
	return id++;
}

Date.prototype.isEqual = function(rhs) {
	if (!(rhs instanceof Date))
		return false;

	return (this.getFullYear() === rhs.getFullYear() && this.getMonth() === rhs.getMonth()) && this.getDate() === rhs.getDate();
}

/**
 * NOTE - Must be wrapped in try-catch block, incase argument is not synthetic event.
 */
 const epicEventPosToCanvas = (e) => {
	if (e.target.className !== EPIC_CLASS_NAME) {
		return null;
	}

	if (e.target.parentElement !== INTERACTIVE_LAYER_CLASS_NAME) {
		throw new Error("Epic element must be inside interactive-layer element!");
	}

	const pos = new Vector2(e.target.offsetX, e.target.offsetY);

	pos.x += e.target.offsetLeft;
	pos.y += e.target.offsetTop;

	return pos;
}

const createEpic = (pos, refDate, canvasSize, grids) => {
	// this can be dynamic, so we will store color in database as string ?!

	const gridPos = pixelToGridBasedPos__(pos, canvasSize, grids);

	const startDate = gridToDate(refDate, gridPos.x);
	const endDate = gridToDate(refDate, gridPos.x + 1);

	if (startDate == null || endDate == null)
		return null;


	const epic = {
		color: EPIC_DEFAULT_COLOR,
		startDate,
		endDate,
		row: gridPos.y,
		id: "intermediate"
	}

	return epic;
}

const Canvas = ({increaseCanvasSizeBy, dispatch, state}) => {
	const [global, globalDispatch] = useContext(Global);
	// const [state, dispatch] = useReducer(reducer, {epics: {}, paths: {}, intermediate: {}, canvas: {
	// 	startDate: new Date(),
	// 	endDate: add(new Date(), {days: CANVAS_DEFAULT_LENGTH}),
	// 	rows: CANVAS_DEFAULT_ROWS
	// }});

	const numOfUnits = {
		x: differenceInDays(state.canvas.endDate, state.canvas.startDate),
		y: state.canvas.rows
	}

	const canvasSize = {
		height: BASE_NODE_DIMENSIONS.height * numOfUnits.y,
		width: BASE_NODE_DIMENSIONS.width * numOfUnits.x
	}

	// rename to cutomDragEvent
	const dragData = useRef({type: ""});

	const usedRows = useRef(new Set());

	const interactiveLayerDoubleClickHandler = (e) => {
		e.preventDefault();

		// We can only create epic on top of "interactive-layer"
		if (e.target.className !== INTERACTIVE_LAYER_CLASS_NAME)
			return;

		const pos = {x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY};

		let epic = createEpic(pos, state.canvas.startDate, canvasSize, numOfUnits);
		epic.color = "#f1c40f";
		if (epic == null)
			return;

		dispatch({type: "UPDATE_INTERMEDIATE_EPIC", epic});
	}

	const createIntermediatePath = (originEpicId, rawEndpoint) => {
		let path = {
			id: getId__(),
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

	/**
	 * 
	 * @param {number} id Epic Id
	 * @returns 
	 */
	const finaliseIntermediatePath = (rawEpicId) => {
		if (state.intermediate.path === undefined)
			return;

		// debugger;
		if (rawEpicId === undefined) {
			dispatch({type: "REMOVE_INTERMEDIATE_PATH"});
			return;
		}

		const rawEpicKey = state.intermediate.path.rawEndpoint === PATH_ENDPOINT.HEAD ? "from" : "to";
		const originEpicKey = rawEpicKey === "from" ? "to" : "from";
		
		const p = {
			id: getId__(),
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
		let epic = null;
		if (epicId === "intermediate")
			epic = state.intermediate.epic;
		else
			epic = state.epics[epicId];


		if (epic === null || epic === undefined)
			return;

		if (targetDate.isEqual(epic.startDate)) {
			return;
		}

		const widthInDays = differenceInDays(epic.endDate, epic.startDate);

		const newEndDate = add(targetDate, {days: widthInDays});

		if (shouldExtendCanvas(newEndDate, state.canvas.endDate)) {
			increaseCanvasSizeBy(1);
		}

		let action = {type: "UPDATE_EPIC", id: epicId, patch: {startDate: targetDate, endDate: newEndDate}};
		if (epicId === "intermediate") {
			action = {type: "UPDATE_INTERMEDIATE_EPIC", epic: {startDate: targetDate, endDate: newEndDate}};
		}
		dispatch(action)
	}


	// const resizeEpic = (epicId, face, targetDate) => {
	// 	const epic = state.epics[epicId];

	// 	if (targetDate.isEqual(epic.startDate) || targetDate.isEqual(epic.endDate)) {
	// 		return;
	// 	}

	// 	if (shouldExtendCanvas(targetDate, state.canvas.endDate)) {
	// 		increaseCanvasSizeBy(1);
	// 	}

	// 	dispatch({type: "UPDATE_EPIC", id: epic.id, patch: {
	// 		startDate: face === EPIC_FACE.START ? targetDate : epic.startDate,
	// 		endDate: face === EPIC_FACE.END ? targetDate : epic.endDate
	// 	}})
	// }

	const resizeEpic = useEpicResizer(state, dispatch);

	const dragOver = (e) => {
		console.log("Drag over! interacative-layer");
		e.preventDefault();
		e.stopPropagation();

		// these are the only valid drop target, because we can only calculate position relative to interactive-layer for them
		if (e.target.className !== "epic" && e.target.className !== "interactive-layer") {
			return;
		}

		const pos = {x: e.nativeEvent.offsetX, y: e.nativeEvent.offsetY};

		// position is always relative to interactive-layer
		if (e.target.className === "epic") {
			pos.x += e.target.offsetLeft;
			pos.y += e.target.offsetTop;
		}

		const gridPos = pixelToGridBasedPos__(pos, canvasSize, numOfUnits);
		const targetDate = gridToDate(state.canvas.startDate, gridPos.x);

		switch(dragData.current.type) {
			case "DRAW_PATH":
				drawPath(targetDate, gridPos.y);
				break;
			case DRAG_EVENTS.moveEpic:
				moveEpic(dragData.current.epicId, targetDate);
				break;
			case "RESIZE_EPIC":
				resizeEpic.current(dragData.current.epicId, dragData.current.face, targetDate);
				break;
			// default:
			// 	throw new Error(`Unknown drag event type: ${dragData.current.type}`);
		}

	}

	const drop = (e) => {
		e.preventDefault();
		e.stopPropagation();

		if (dragData.current.type === undefined)
			return;

		switch(dragData.current.type) {
			case "DRAW_PATH":
				finaliseIntermediatePath(dragData.current.rawId);
				break;
			case DRAG_EVENTS.moveEpic: 
			break;
		}
	}	

	const epicCreatedOverSocket = (epic) => {
		if (epic.row >= state.canvas.rows) {
			dispatch({type: "UPDATE_CANVAS", patch: {rows: epic.row}});
		}

		const epic_ = epicPreprocessing(epic);

		usedRows.current.add(epic_.row);
		increaseCanvasRowsIfEpicOverflow(epic);

		dispatch({type: "ADD_EPIC", epic: epic_});
	}

	const epicUpdatedOverSocket = epics => {
		debugger;

		if (Array.isArray(epics) === false) {
			console.error("Updated epic must be sent as an array!");
			return;
		}
		if (epics[1].row >= state.canvas.row) {
			dispatch({type: "UPDATE_CANVAS", patch: {rows: epic.row}});
		}

		const epic = epicPreprocessing(epics[1]);

		// dispatch epic update
		dispatch({type: "UPDATE_EPIC", id: epic.id, patch: epic});
	}

	const getMaxRow = (epics) => {
		let row = -1;
		Object.values(epics).forEach(epic => {
			row = Math.max(row, epic.row);
		})

		return row;
	}

	const increaseCanvasRowsIfEpicOverflow = (epic) => {
		if (epic.row > state.canvas.row) {
			dispatch({type: "UPDATE_CANVAS", patch: {rows: epic.row + 1}});
		}
	}

	useEffect(() => {
		let statePatch = {};
		const token = localStorage.getItem("token");

		console.log(global);
		const getEpicUrl = settings.API_ROOT + "/project/" + global.project.id + "/epic";

		(async () => {
			try {
				const epics = await Helper.http.request(getEpicUrl, "GET", token, null, true);
				statePatch.epics = {...epics};
			} catch (e) {
				console.error(e);
			}

			if (statePatch.epics === undefined)
				return;

			Object.keys(statePatch.epics).forEach(key => {
				statePatch.epics[key] = epicPreprocessing(statePatch.epics[key]);
				usedRows.current.add(statePatch.epics[key].row);
			})

			const maxRow = getMaxRow(statePatch.epics);
			if (maxRow >= state.canvas.rows) {
				dispatch({type: "UPDATE_CANVAS", patch: {rows: maxRow + 1}});
			};

			dispatch({type: "PATCH", patch: statePatch});

		})()

		

		// load all the paths

		webSocket.addListener(SOCKET_EVENT.EPIC_CREATED, COMPONENT_ID, epicCreatedOverSocket);
		webSocket.addListener(SOCKET_EVENT.EPIC_UPDATED, COMPONENT_ID, epicUpdatedOverSocket);

		return () => {
			webSocket.removeListener(SOCKET_EVENT.EPIC_CREATED, COMPONENT_ID);
			webSocket.removeListener(SOCKET_EVENT.EPIC_UPDATED, COMPONENT_ID);
		}

		// add all the socket listeners
	}, []);

	if (Object.values(state.epics).length === 0) {
		return  <Placeholder><span style={{color: "white"}}>&#128528; Create an epic to start working on Roadmap.</span></Placeholder>
	}

	return (
		<div className="canvas-with-scale" style={{position: "relative"}}>
			<HorizontalScale 
				style={{height: HORIZONTAL_SCALE_HEIGHT, position: "sticky", left: `${VERTICAL_SCALE_WIDTH}px`}} 
				startDate={state.canvas.startDate} 
				endDate={state.canvas.endDate} 
				baseNodeDimensions={BASE_NODE_DIMENSIONS} 
				unit={SCALE_UNIT.month}
			/>
			<VerticalScale style={{width: VERTICAL_SCALE_WIDTH, position: "sticky"}} labels={["label 1", "label 2", "label 3"]} unit={BASE_NODE_DIMENSIONS} />
			<div 
				className="canvas-layer" 
				id="canvas-layer"
				style={{
					...canvasSize,
					position: "absolute",
					left: `${VERTICAL_SCALE_WIDTH}px`,
					top: `${HORIZONTAL_SCALE_HEIGHT}px`,
					backgroundImage: generateGridlinesCss(BASE_NODE_DIMENSIONS, GRIDLINE_SIZE_IN_PX, GRIDLINE_COLOR)
				}}>

				{/* Svg Layer */}
				<svg id="svg-layer">
					{Object.values(state.paths).map(x => {
						return <Path 
							canvas={{startDate: state.canvas.startDate}}
							from={state.epics[x.from]}
							to={state.epics[x.to]}
							id={id} />
					})}
					{state.intermediate.path !== undefined && <Path path={state.intermediate.path} canvas={{startDate: state.canvas.startDate}} />}
				</svg>

				<div 
					id="interactive-layer"
					className="interactive-layer"
					onDragOver={dragOver}
					onDrop={drop}
					onDoubleClick={interactiveLayerDoubleClickHandler}
					// onMouseMove={interactiveLayerMouseMoveHandler}
					// onMouseLeave={interactiveLayerMouseLeaveHandler}
					mouse
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
								...numOfUnits
							}
						}} />
					)}
					{Object.values(state.epics).map((x) => {
						return <Epic 
							key={x.id}
							createPath={createIntermediatePath}
							notifyPathEnd={finaliseIntermediatePath}
							dragData={dragData}
							{...x}
							canvas={{
								dimensions: {...canvasSize},
								startDate: state.canvas.startDate,
								endDate: state.canvas.endDate,
								grid: {
									...numOfUnits
								}
							}} />
					})}
				</div>
			</div>
		</div>
  );
}

export default Canvas;
