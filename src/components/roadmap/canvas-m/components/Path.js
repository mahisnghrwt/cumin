import { gridToPixelBasedPos__ } from "../canvasHelper";
import { BASE_NODE_DIMENSIONS } from "../canvasEnums";
import { useReducer } from "react";

const highlightColor = "#f39c12";
const selectedColor = "#e67e22";

const reducer = (state, action) => {
	switch(action.type) {
		case "setMouseOver":
			return {
				...state,
				isMouseOver: action.isMouseOver
			}
	}
}

/**
 * 
 * @param {{x: number, y: number}} from 
 * @param {{x: number, y: number}} to 
 * @param {{x: number, y: number}} c 
 * @returns 
 */
const generatePathString = (from, to, c) => {
	const c1 = {
		x: from.x + c.x,
		y: from.y + c.y
	}

	const c2 = {
		x: to.x - c.x,
		y: to.y - c.y
	}

	return `M${from.x} ${from.y} C${c1.x} ${c1.y} ${c2.x} ${c2.y} ${to.x} ${to.y}`;
}

const Path = ({id, path, isSelected, selectPath, color="#34495e"}) => {
	const [state, dispatch] = useReducer(reducer, {isMouseOver: false});
	const width = "2px";

	const calcPathD = (path) => {
		const p1 = gridToPixelBasedPos__(path.head, BASE_NODE_DIMENSIONS);
		p1.y += BASE_NODE_DIMENSIONS.height / 2;

		const p2 = gridToPixelBasedPos__(path.tail, BASE_NODE_DIMENSIONS);
		p2.y += BASE_NODE_DIMENSIONS.height / 2;

		return generatePathString(p1, p2, {x: BASE_NODE_DIMENSIONS.width, y: 0})
	};

	const pathD = calcPathD(path);

	const mouseEnterHandler = e => {
		dispatch({type: "setMouseOver", isMouseOver: true});
	}

	const mouseLeaveHandler = e => {
		dispatch({type: "setMouseOver", isMouseOver: false});
	}

	const clickHandler = e => {
		selectPath(id);
	}

	return (
		<path d={pathD} 
			key={id}
			stroke={isSelected ? selectedColor : (state.isMouseOver ? highlightColor : color)}
			strokeWidth={width}
			pointerEvents="auto"
			onMouseEnter={mouseEnterHandler}
			onMouseLeave={mouseLeaveHandler}
			onClick={clickHandler}
			fill="transparent" />
	)
}

export default Path;