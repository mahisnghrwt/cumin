import {differenceInDays, add, max, differenceInCalendarDays} from "date-fns"
import { pathEndpoint } from "./canvasEnums";

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
	return {
		...epic,
		startDate: new Date(epic.startDate),
		endDate: new Date(epic.endDate),
		issues: epic.issues.map(issue => issuePreprocessing(issue))
	}
}

export const pathPreprocessing = path => {
	const {fromEpicId, toEpicId, ...rest} = path;
	const finalPath = {
		...rest,
		[pathEndpoint.HEAD]: fromEpicId,
		[pathEndpoint.TAIL]: toEpicId
	}

	return finalPath;
}

export const issuePreprocessing = issue => {
	return {
		...issue,
		createdAt: new Date(issue.createdAt)
	}
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

const createGraph = (epics, paths) => {
	let graph = {};
	epics.forEach(epic => {
		graph[epic] = {
			id: parseInt(epic),
			dependsOn: []
		}
	});

	Object.values(paths).forEach(path => {
		const dependency = {
			viaPath: path.id,
			id: path.from
		};
		graph[path.to] = {
			...graph[path.to],
			dependsOn: [...graph[path.to].dependsOn, dependency]
		}
	})

	return graph;
}

const storeCycle = (cycle, cycles) => {
	cycles.push([...cycle]);
}

const checkCycles = (node, arr, checked, cycles, graph) => {
	const lastCheckResult = checked[node.id];
	// if already checked, return the last result
	if (lastCheckResult !== undefined)
		return lastCheckResult;

	// node must be part of the graph
	if (graph[node.id] === undefined)
		throw new Error("Node not present in the graph");

	let clear = true;

	// what does the node depends on?
	graph[node.id].dependsOn.forEach(dependency => {
		// either dependency is already checked or not.
		if (checked[dependency.id] !== undefined) {
			clear = clear && checked[dependency.id];
		}
		else {
			// if dependecy is in the current stack "arr", that means there is a cycle
			const isCycle = arr.some(n => n.id === dependency.id);
			if (isCycle) {
				// do something with the cycle
				storeCycle([...arr, node, dependency], cycles);
				clear = false;
			}
			else {
				// recursively check cycle on the dependecy.
				const c = checkCycles(dependency, [...arr, node], checked, cycles, graph);
				clear = clear && c;
			}
		}
	})

	// mark the node as checked
	checked[node.id] = clear;

	// return the result;
	return clear;
}

export const detectCycles = (epics, paths) => {
	const graph = createGraph(Object.keys(epics), paths);

	// 2d array, all the cycles
	let cycles = [];

	// object representing whether epic is blocked or not
	// true => clean
	// false => blocked
	// undefined => not checked yet
	let checked = {};
	let stackArr = [];

	Object.values(graph).forEach(node => {
		if (checked[node.id] === undefined) {
			checkCycles({id: node.id, viaPath: "root"}, stackArr, checked, cycles, graph);
		}
	})

	return cycles;
}

export const createCyclePatch = cycles => {
	let patch = {};
	// colors to distinguish cycles
	const colorPalette = ["#e67e22", "#d35400", "#e74c3c", "#c0392b"];
	const cl = colorPalette.length;

	let ci = 0;

	cycles.forEach(cycle => {
		cycle.forEach(node => {
			const path = node.viaPath
			if (path !== "root") {
				patch[path] = {
					color: colorPalette[ci]
				}
			}
		})

		ci = (ci + 1) % cl;
	})

	return patch;
}

export const getSupersetCanvas = (canvas, nodes) => {
	let duration = [canvas.startDate, canvas.endDate];
	let rows = canvas.rows - 1;

	for (let i = 0; i < nodes.length; i++) {
		duration[0] = differenceInCalendarDays(duration[0], nodes[i].startDate) > 0 ? nodes[i].startDate : duration[0];
		duration[1] = differenceInCalendarDays(nodes[i].endDate, duration[1]) > 0 ? nodes[i].endDate : duration[1];
		rows = Math.max(rows, nodes[i].row)
	}

	return {
		startDate: duration[0],
		endDate: duration[1],
		rows: rows + 1
	}
};

export const makePath = (fromEpic, toEpic, canvasStartDate) => {
	const head = {
		x: differenceInCalendarDays(fromEpic.endDate, canvasStartDate),
		y: fromEpic.row
	}

	const tail = {
		x: differenceInCalendarDays(toEpic.startDate, canvasStartDate),
		y: toEpic.row
	}

	return {
		head, tail
	}
}