import {differenceInDays, add, max} from "date-fns"

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

export const pathPreprocessing = path => {
	const {fromEpicId, toEpicId, ...rest} = path;
	const finalPath = {
		...rest,
		from: fromEpicId,
		to: toEpicId
	}

	return finalPath;
}


export const getStartEndDates = (dates, epic) => {
	// dates[0] == startDate
	// dates[1] == endDate
	let newDates = [];

	newDates.push(differenceInDays(dates[0], epic.startDate) > 0 ? epic.startDate : dates[0]);
	newDates.push(differenceInDays(epic.endDate, dates[1]) > 0 ? epic.endDate : dates[1]);

	return newDates;
}

export const generateGridlinesCss = (nodeDimensions, gridlineWidth, gridlineColor)  => {
	const verticalGirdlinesCss = `repeating-linear-gradient(
	to right, 
	transparent 0 ${nodeDimensions.width - 1}px,
	${gridlineColor} ${nodeDimensions.width -1}px ${nodeDimensions.width}px)`;

	const horizontalGridlinesCss = `repeating-linear-gradient(
	to bottom, 
	transparent 0 ${nodeDimensions.height - 1}px, 
	${gridlineColor} ${nodeDimensions.height + -1}px ${nodeDimensions.height}px)`;

	return horizontalGridlinesCss + ", " + verticalGirdlinesCss;
}

export const gridToDate = (date, offset) => {
	if (!(date instanceof Date))
		return null;

	if (typeof offset !== "number")
		return null;

	return add(date, {days: offset});
}

