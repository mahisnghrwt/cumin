import { BASE_NODE_DIMENSIONS, EPIC_FACE, PATH_ENDPOINT, canvasEvent, pathEndpoint } from "../canvasEnums";
import { useContext, useReducer, useState } from "react";
import canvasContext from "../canvasContext";

const highlightColor = "#f1c40f";

const reducer = (state, action) => {
	switch(action.type) {
		case "setDropMode":
			return {
				...state,
				dropMode: action.dropMode
			}
	}
}

const blockedEpicColor = "#e84118";

const Epic2 = ({id, color, isSelected, width, pos, setMouseEventData, mouseDataTransferRef, blocked}) => {
	const {selectEpic} = useContext(canvasContext);

	// const [state, dispatch] = useReducer(reducer, {dropMode: false});
	const [showHandles, setShowHandles] = useState(false);

	const epicHeight = 20; //px

	const backgroundColor = isSelected ? highlightColor : (blocked ? blockedEpicColor : color);
	
	const resizeHandleStyle = {
		width: Math.min(parseInt(width / 2), BASE_NODE_DIMENSIONS.width / 2),
		height: epicHeight
	}

	const modifiedPos = {
		x: pos.x,
		y: pos.y + ((BASE_NODE_DIMENSIONS.height - epicHeight) / 2)
	}

	const epicClickHandler = (e) => {
		e.stopPropagation();
		selectEpic(id);
	}

	const epicDragStartHandler = (e) => {
		e.stopPropagation();
		e.dataTransfer.setDragImage(new Image(), 0, 0);

		let eventData = {
			targetEpic: id
		}

		switch(e.target.className) {
			case "epic-resize-left-handle":
				eventData.face = EPIC_FACE.START;
				eventData.type = canvasEvent.RESIZE_EPIC;
				break;
			case "epic-resize-right-handle":
				eventData.face = EPIC_FACE.END;
				eventData.type = canvasEvent.RESIZE_EPIC;
				break;
			case "epic":
				eventData.type = canvasEvent.MOVE_EPIC;
				break;
			case "epic-left-tip":
				eventData.type = canvasEvent.DRAW_PATH;
				eventData.endpointConnected = pathEndpoint.HEAD;
				break;
			case "epic-right-tip":
				eventData.type = canvasEvent.DRAW_PATH;
				eventData.endpointConnected = pathEndpoint.TAIL;
				break;
		}

		setMouseEventData(eventData);
	}

	const epicDragEndHandler = e => {
		e.preventDefault();

		switch (mouseDataTransferRef.current.type) {
			case canvasEvent.DRAW_PATH:
				if (e.target.className !== "epic")
					setMouseEventData({type: null});
		}
	}

	const epicDropHandler = (e) => {
		e.preventDefault();

		if (mouseDataTransferRef.current.type !== canvasEvent.DRAW_PATH) return;
		setMouseEventData({type: canvasEvent.DRAW_PATH, targetEpic: id});
	}

	const epicDragEnterHandler = e => {
		if (mouseDataTransferRef.current.type !== canvasEvent.DRAW_PATH) return;
		if (showHandles === true)
			setShowHandles(false);
		// dispatch({type: "setDropMode", dropMode: true});
	}

	const epicMouseEnterHandler = e => {
		if (showHandles) return;
		setShowHandles(true);
		// dispatch({type: "setDropMode", dropMode: false});
	}

	const epicMouseLeaveHandler = e => {
		if (showHandles === false) return;
		setShowHandles(false);
	}

	return (
		<div
			className="epic"
			draggable
			onClick={epicClickHandler}
			onDragStart={epicDragStartHandler}
			onDragEnd={epicDragEndHandler}
			onDragOver={e => e.preventDefault()}
			onDrop={epicDropHandler}
			onDragEnter={epicDragEnterHandler}
			onMouseEnter={epicMouseEnterHandler}
			onMouseLeave={epicMouseLeaveHandler}
			style={{
				position: "absolute",
				left: modifiedPos.x + "px",
				top: modifiedPos.y + "px",
				height: epicHeight + "px",
				width,
				backgroundColor: backgroundColor
			}}	
		>
			{showHandles && <>
				
				<div 
					className="epic-resize-left-handle"
					draggable 
					style={resizeHandleStyle} />
				<div 
					className="epic-left-tip"
					draggable />
				<div 
					className="epic-resize-right-handle" 
					draggable
					style={resizeHandleStyle} />
				<div 
					className="epic-right-tip" 
					draggable />
			</>}
			
		</div>
	)
}

export default Epic2;