import {forwardRef, useContext, useReducer, useRef} from "react"
import useGetPosInCanvas from "../hooks/useGetPosInCanvas";
import usePixelToGrid from "../hooks/usePixelToGrid";
import canvasContext from "../canvasContext";
import { canvasEvent } from "../canvasEnums";
import Epic2 from "./Epic2";
import ContextMenu from "../../../context-menu/ContextMenu";
import ContextMenuItem from "../../../context-menu/ContextMenuItem";

const contextMenuStateReducer = (state, action) => {
	switch(action.type) {
		case "add":
			return {
				...state,
				items: [...state.items, action.item],
				pos: action.pos ? action.pos : state.pos
			}
	}
}

const InteractiveLayer = forwardRef(({epics, drawPath, moveEpic, resizeEpic, createIntermediatePath, finaliseIntermediatePath, createIntermediateEpic, selectEpic, patchEpicDuration}, ref) => {
	const {canvasSize, gridSize} = useContext(canvasContext);
	const getPosInCanvasRef = useGetPosInCanvas(ref);
	const pixelToGridRef = usePixelToGrid(canvasSize, gridSize);
	const mouseDataTransferRef = useRef({type: null});
	const [contextMenuState, dispatchContextMenuState] = useReducer(contextMenuStateReducer, {items: [], pos: null});

	const extractMouseEventData = e => {
		const pos = getPosInCanvasRef.current(e.nativeEvent);
		const gridPos = pixelToGridRef.current(pos);

		const eventData = {
			pos,
			gridPos,
			...mouseDataTransferRef.current
		}

		return eventData;
	}

	const dragEnterHandler = e => {
		e.preventDefault();
		e.stopPropagation();

		const eventData = extractMouseEventData(e);

		switch(eventData.type) {
			case canvasEvent.DRAW_PATH:
				createIntermediatePath(eventData.targetEpic, eventData.endpointConnected);
				break;
		}
	}

	const dragOverHandler = e => {
		e.preventDefault();
		e.stopPropagation();

		if (e.target.className !== "epic" && e.target.className !== "interactive-layer") {
			return;
		}

		const eventData = extractMouseEventData(e);

		switch(eventData.type) {
			case canvasEvent.DRAW_PATH:
				drawPath(eventData.gridPos);
				break;
			case canvasEvent.MOVE_EPIC:
				moveEpic(eventData.targetEpic, eventData.gridPos);
				break;
			case canvasEvent.RESIZE_EPIC:
				resizeEpic(eventData.targetEpic, eventData.face, eventData.gridPos);
				break;
		}
	}

	const dropHandler = e => {
		e.preventDefault();
		e.stopPropagation();

		const eventData = extractMouseEventData(e);

		switch(eventData.type) {
			case canvasEvent.DRAW_PATH:
				finaliseIntermediatePath(eventData.targetEpic);
				break;
			case canvasEvent.MOVE_EPIC:
				patchEpicDuration(eventData.targetEpic)
				break;
			case canvasEvent.RESIZE_EPIC:
				patchEpicDuration(eventData.targetEpic)
				break;
		}
	}	

	const doubleClickHandler = e => {
		e.preventDefault();

		const eventData = extractMouseEventData(e);

		createIntermediateEpic(eventData.gridPos);
	}

	const clickHandler = e => {
		selectEpic(null);
	}

	const contextMenuHandler = e => {
		e.preventDefault();
		debugger;
		const pos = getPosInCanvasRef.current(e.nativeEvent);
		const hello = new ContextMenuItem("Hello", () => {});
		dispatchContextMenuState({type: "add", item: hello, pos});
	}

	const setMouseEventData = data => {
		mouseDataTransferRef.current = data;
	}

	return (
		<div 
			id="interactive-layer"
			className="interactive-layer"
			onDragEnter={dragEnterHandler}
			onDragOver={dragOverHandler}
			onDrop={dropHandler}
			onDoubleClick={doubleClickHandler}
			onClick={clickHandler}
			onContextMenu={contextMenuHandler}
			ref={ref}
		>
			<ContextMenu pos={contextMenuState.pos} items={contextMenuState.items} />
			{epics.map(epic => {
				return <Epic2 {...epic} setMouseEventData={setMouseEventData} mouseDataTransferRef={mouseDataTransferRef} />
			})}
		</div>
	)
})

export default InteractiveLayer;