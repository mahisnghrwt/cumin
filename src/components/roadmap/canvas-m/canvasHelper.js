import {differenceInDays, add} from "date-fns"

/**
 * Converts the grid based position into pixel based position (canvas)
 * @param {{x: number, y: number}} gridPos 
 * @param {{height: number, width: number}} baseNodeDimensions 
 * @returns 
 */
 export const gridToPixelBasedPos__ = (gridPos, baseNodeDimensions) => {
	const x = gridPos.x  * baseNodeDimensions.width;
	const y = gridPos.y * baseNodeDimensions.height;

	return {
		x,
		y
	}
}

/**
 * 
 * @param {{x: number, y: number}} pos 
 * @param {{width: number, height: number}} canvasDimensions 
 * @param {{x: number, y: number}} totalGrids 
 * @param {boolean} roundUp [Optional] round up the value 
 * @returns 
 */
export const pixelToGridBasedPos__ = (pos, canvasDimensions, totalGrids) => {
	const x = (pos.x / canvasDimensions.width) * totalGrids.x;
	const y = (pos.y / canvasDimensions.height) * totalGrids.y;

	return {
		x: Number.parseInt(x),
		y: Number.parseInt(y)
	}
}

/**
 * Generates a string representing smooth brezier curve for Svg->Path("d" attribute) element.
 */
export const generatePathD = (head, tail, controlPoint) => {
	const controlPoint1 = {
		x: head.x + controlPoint.x,
		y: head.y + controlPoint.y
	}

	const controlPoint2 = {
		x: tail.x - controlPoint.x,
		y: tail.y - controlPoint.y
	}

	return `M${head.x} ${head.y} C${controlPoint1.x} ${controlPoint1.y} ${controlPoint2.x} ${controlPoint2.y} ${tail.x} ${tail.y}`;
}

export const epicPreprocessing = (epic) => {
	const EPIC_DEFAULT_COLOR = "#7ed6df";

	let epic_ = {...epic };
	epic_.startDate = new Date(epic.startDate);
	epic_.endDate = new Date(epic.endDate);
	epic_.color = EPIC_DEFAULT_COLOR;
	return epic_;
}

export const generateGridlinesCss = (nodeDimensions, gridlineWidth, gridlineColor)  => {
	const verticalGirdlinesCss = `repeating-linear-gradient(
	to right, 
	${gridlineColor} 0 1px,
	transparent 1px ${nodeDimensions.width - gridlineWidth}px, 
	${gridlineColor} ${nodeDimensions.width - gridlineWidth}px ${nodeDimensions.width}px)`;

	const horizontalGridlinesCss = `repeating-linear-gradient(
	to bottom, 
	${gridlineColor} 0 1px,
	transparent 1px ${nodeDimensions.height - 1}px, 
	${gridlineColor} ${nodeDimensions.height - 1}px ${nodeDimensions.height}px)`;

	return horizontalGridlinesCss + ", " + verticalGirdlinesCss;
}

/**
 * Use it to check if a "date" is extending over canvas endDate.
 */
export const shouldExtendCanvas = (refDate, canvasEndDate) => {
	const threshold = 1;
	
	if (differenceInDays(canvasEndDate, refDate) <= threshold)
		return true;

	return false;
}

export const gridToDate = (date, offset) => {
	if (!(date instanceof Date))
		return null;

	if (typeof offset !== "number")
		return null;

	return add(date, {days: offset});
}

