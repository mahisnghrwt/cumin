import { gridToPixelBasedPos__ } from "../canvasHelper";
import { BASE_NODE_DIMENSIONS } from "../canvasEnums";

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

const Path = ({id, path, color="#34495e"}) => {
	const width = "2px";

	const calcPathD = (path) => {
		const p1 = gridToPixelBasedPos__(path.head, BASE_NODE_DIMENSIONS);
		p1.y += BASE_NODE_DIMENSIONS.height / 2;

		const p2 = gridToPixelBasedPos__(path.tail, BASE_NODE_DIMENSIONS);
		p2.y += BASE_NODE_DIMENSIONS.height / 2;

		return generatePathString(p1, p2, {x: BASE_NODE_DIMENSIONS.width, y: 0})
	};

	const pathD = calcPathD(path);

	return (
		<path d={pathD} 
			// key={id}
			stroke={color}
			strokeWidth={width}
			fill="transparent" />
	)
}

export default Path;