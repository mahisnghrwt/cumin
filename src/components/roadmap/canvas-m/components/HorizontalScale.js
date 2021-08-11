import { add, differenceInDays, endOfMonth, nextSunday, sub } from "date-fns";
import { useEffect, useReducer } from "react";
import { SCALE_UNIT } from "../canvasEnums";
import Helper from "../../../../Helper";

const reducer__ = (labels, action) => {
	switch(action.type) {
		case "NEW": {
			return [...action.labels];
		}
		default:
			throw new Error(`Unkown case ${action.type}`);
	}
}

/**
 * 
 * @param {Date} startDate 
 * @param {Date} endDate 
 * @param {string} unit 
 * @param {{height: number, width: number}} baseNodeDimensions
 */
const makeLabels__ = (startDate, endDate, unit, baseNodeDimensions) => {
	let labels = [];

	let l = new Date(startDate);
	let endReached = false;
	while(!endReached) {
		let temp = getNextDate__(l, unit);
		let r;
		if (temp < endDate) {
			r = temp;
		}
		else  {
			r = endDate;
		}

		let d = differenceInDays(r, l) + 1;


		// let cumulative = labels.length > 0 ? labels[labels.length - 1].width : 0;
		labels.push({value: l.toDateString(), width: (d * baseNodeDimensions.width)})
		
		if (differenceInDays(endDate, r) === 0) {
			endReached = true;
		}

		l = add(r, {days: 1});
	}

	return labels;
}

const getDateString = date => {
	return Helper.dateToInputString(date);
}

const makeLabels = (startDate, endDate, unit, baseNodeDimensions) => {
	let labels = [];

	let prevDate = null;
	let endReached = false;

	debugger;

	while(!endReached) {
		let currentDate = prevDate === null ? new Date(startDate) : getNextDate__(prevDate, unit);

		// if the current date is greater than the end date of canvas 
		if (differenceInDays(currentDate, endDate) >= 0) {
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
		default:
			throw new Error(`Unknown case ${unit}`);
	}

	return add(nextDate, {days: 1});
}

const HorizontalScale = ({startDate, endDate, unit, style, baseNodeDimensions}) => {
	const [labels, dispatch] = useReducer(reducer__, []);

	useEffect(() => {
		const labels = makeLabels(startDate, endDate, unit, baseNodeDimensions);
		dispatch({type: "NEW", labels});

	}, [startDate, endDate, unit])

	return (
		// Make sure the horizontal scale can enclose the labels even when diagonal
		<div className="horizontal-scale" style={{...style}}>
			{labels.map(x => {
				return <span className="horizontal-scale-label" key={x.label} style={{left: x.posX}}>
					{x.label}
				</span>
			})}
		</div>
	)
}

export default HorizontalScale;