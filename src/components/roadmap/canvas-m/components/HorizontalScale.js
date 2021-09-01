import { add, differenceInDays, endOfMonth, nextSunday, sub } from "date-fns";
import { useCallback, useEffect, useReducer, useState } from "react";
import { SCALE_UNIT } from "../canvasEnums";
import Helper from "../../../../Helper";
import usePixelToGrid from "../hooks/usePixelToGrid";

const reducer__ = (labels, action) => {
	switch(action.type) {
		case "NEW": {
			return [...action.labels];
		}
		default:
			throw new Error(`Unkown case ${action.type}`);
	}
}

const getDateString = date => {
	return Helper.dateToInputString(date);
}

const makeLabels = (startDate, endDate, unit, baseNodeDimensions) => {
	let labels = [];

	let prevDate = null;
	let endReached = false;

	while(!endReached) {
		let currentDate = prevDate === null ? new Date(startDate) : getNextDate__(prevDate, unit);

		// if the current date is greater than the end date of canvas 
		if (differenceInDays(currentDate, endDate) >= -1) {
			// dont run the next loop iteration
			endReached = true;
			currentDate = sub(endDate, {days: 1});
		}

		// calc the days between prev date and current date
		const duration = differenceInDays(currentDate, prevDate === null ? currentDate: prevDate);

		// covert duration into px
		const durationInPx = duration * baseNodeDimensions.width;

		// offset = prev label's position
		const offset = labels.length === 0 ? 0 : labels[labels.length - 1].posX;

		labels.push({label: getDateString(currentDate), posX: durationInPx + offset});

		// current date will be prev date for next loop iteration
		prevDate = new Date(currentDate);
	}


	return labels;
}

const getNextDate__ = (date, unit) => {
	let nextDate = null;
	switch(unit) {
		case SCALE_UNIT.week:
			nextDate = nextSunday(date);
			break;
		case SCALE_UNIT.month:
			nextDate = endOfMonth(date);
			break;
		case SCALE_UNIT.day:
			nextDate = date;
			break;
		default:
			throw new Error(`Unknown case ${unit}`);
	}

	return add(nextDate, {days: 1});
}

const highlightedLabelStyle = {
	color: "#e67e22",
	fontWeight: "bolder"
}

const HorizontalScale = ({startDate, endDate, unit, style, baseNodeDimensions, canvasRef, gridDimensions, canvasDimensions}) => {
	const [labels, dispatch] = useReducer(reducer__, []);
	const [highlightedLabel, setHighlightedLabel] = useState(-1);
	const pixelToGrid = usePixelToGrid(canvasDimensions, gridDimensions);

	useEffect(() => {
		const labels = makeLabels(startDate, endDate, unit, baseNodeDimensions);
		dispatch({type: "NEW", labels});

	}, [startDate, endDate, unit]);

	const highlightLabelAtPos = useCallback((pos) => {
		if (pos.x !== highlightedLabel)
			setHighlightedLabel(pos.x);
	}, [highlightedLabel, setHighlightedLabel])

	useEffect(() => {
		canvasRef.current.addEventListener("mousemove", e => {
			if (e.target.className !== "interactive-layer") return;
			const pos = pixelToGrid.current({x: e.offsetX, y: e.offsetY});
			highlightLabelAtPos(pos);
		})
	}, [canvasRef, pixelToGrid, highlightLabelAtPos])


	const width = differenceInDays(endDate, startDate) * baseNodeDimensions.width;

	return (
		<div className="horizontal-scale" style={{...style, width}}>
			{labels.map((x, index) => {
				let style = {
					width: baseNodeDimensions.width,
				}
				if (highlightedLabel === index)	style = {...style, ...highlightedLabelStyle};
				return <span className="horizontal-scale-label" key={x.label} style={{...style}}>
					{x.label}
				</span>
			})}
		</div>
	)
}

export default HorizontalScale;