import {differenceInDays} from "date-fns";
import {gridToPixelBasedPos__} from "../canvasHelper";
import { BASE_NODE_DIMENSIONS, EPIC_FACE, PATH_ENDPOINT, DRAG_EVENTS } from "../canvasEnums";
import ApiCalls from "../ApiCalls";

const EPIC_SELECTED_COLOR = "#2ecc71";


const Epic = ({id, startDate, endDate, color, row, canvas, createPath, dragData, notifyPathEnd, projectId, reportClick, isSelected}) => {
	const calcPos = () => {
		return gridToPixelBasedPos__({
			x: differenceInDays(startDate, canvas.startDate),
			y: row
		}, BASE_NODE_DIMENSIONS)
	}

	const pos = calcPos();
	
	const width = (differenceInDays(endDate, startDate)) * BASE_NODE_DIMENSIONS.width;

	const resizeHandleCssDimensions = {
		width: Math.min(parseInt(width / 5), BASE_NODE_DIMENSIONS.width / 5),
		height: BASE_NODE_DIMENSIONS.height
	}

	const epicClickHandler = (e) => {
		debugger;
		// e.preventDefault();
		e.stopPropagation();
		reportClick(id);
	}

	const epicDragStartHandler = (e) => {
		e.stopPropagation();
		e.dataTransfer.setDragImage(new Image(), 0, 0);

		dragData.current.epicId = id;

		switch(e.target.className) {
			case "epic-resize-left-handle":
				dragData.current.face = EPIC_FACE.START;
				dragData.current.type = "RESIZE_EPIC";
				break;
			case "epic-resize-right-handle":
				dragData.current.face = EPIC_FACE.END;
				dragData.current.type = "RESIZE_EPIC";
				break;
			case "epic":
				dragData.current.type = DRAG_EVENTS.moveEpic;
				break;
			case "epic-left-tip":
				dragData.current.type = "DRAW_PATH";
				createPath(id, PATH_ENDPOINT.HEAD);
				break;
			case "epic-right-tip":
				dragData.current.type = "DRAW_PATH";
				createPath(id, PATH_ENDPOINT.TAIL);
				break;
		}
	}

	const epicDragEndHandler = (e) => {
		e.stopPropagation();

		if (id === "intermediate")
			return;

		switch(e.target.className) {
			case "epic-resize-left-handle":
				ApiCalls.patchEpicDuration({startDate, endDate, id}, projectId, localStorage.getItem("token"));
				break;
			case "epic-resize-right-handle":
				ApiCalls.patchEpicDuration({startDate, endDate, id}, projectId, localStorage.getItem("token"));
				break;
			case "epic":
				ApiCalls.patchEpicDuration({startDate, endDate, id}, projectId, localStorage.getItem("token"));
				break;
			case "epic-right-tip":
				notifyPathEnd(undefined);
				break;
			case "epic-left-tip":
				notifyPathEnd(undefined);
				break;
		}

		dragData.current = {};
	}

	const epicDropHandler = (e) => {
		e.preventDefault();
		if (dragData.current.type !== "DRAW_PATH") return;
		dragData.current.rawId = id;
	}

	return (
		<div
			className="epic"
			draggable={true}
			onClick={epicClickHandler}
			onDragStart={epicDragStartHandler}
			onDragEnd={epicDragEndHandler}
			onDragOver={e => e.preventDefault()}
			onDrop={epicDropHandler}
			style={{
				position: "absolute",
				left: pos.x,
				top: pos.y,
				height: BASE_NODE_DIMENSIONS.height,
				width,
				backgroundColor: isSelected ? EPIC_SELECTED_COLOR : color
			}}	
		>
			<div 
				className="epic-left-tip"
				draggable />
			<div 
				className="epic-resize-left-handle"
				draggable 
				style={resizeHandleCssDimensions} />
			<div 
				className="epic-resize-right-handle" 
				draggable
				style={resizeHandleCssDimensions} />
			<div 
				className="epic-right-tip" 
				draggable />
		</div>
	)
}

export default Epic;