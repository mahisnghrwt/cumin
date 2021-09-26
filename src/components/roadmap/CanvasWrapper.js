import { useContext, useEffect, useReducer} from "react";
import Canvas from "./canvas-m/Canvas2";
import settings from "../../settings";
import Helper from "../../Helper";
import {epicPreprocessing, findBlockedEpics, isEpicBlocked, pathPreprocessing} from "./canvas-m/canvasHelper";
import Global from "../../GlobalContext";
import {add} from "date-fns";
import { getSupersetCanvas } from "./canvas-m/canvasHelper";
import _ from "lodash";

const DEFAULT_ROWS = 1;
const DEFAULT_ROADMAP_DURATION = 100;

const defaultCanvas = {
	startDate: new Date(),
	endDate: add(new Date(), {days: DEFAULT_ROADMAP_DURATION}),
	rows: DEFAULT_ROWS,
};

const addPath = (path, roadmapId, state_) => {
	// add path
	state_[roadmapId].paths[path.id] = {
		...path
	};

	// add reference of path to path head and tail
	state_[roadmapId].epics[path.head].pathHeads.push(path.id);
	state_[roadmapId].epics[path.tail].pathTails.push(path.id);

	// re-evaluate the path tail
	if (isEpicBlocked(path.tail, state_[roadmapId].epics, state_[roadmapId].paths)) {
		state_[roadmapId].epics[path.tail].blocked = true;
	}

	return state_;
}

const removePath = (pathId, roadmapId, state_) => {

	const headId = state_[roadmapId].paths[pathId].head;
	const tailId = state_[roadmapId].paths[pathId].tail;

	// for path head nothing changes, simply remove the path reference
	state_[roadmapId].epics[headId].pathHeads = state_[roadmapId].epics[headId].pathHeads.filter(pid => pid !== pathId);


	// for path tail similarly remove the reference then re-evaluate the path tail for blockages
	state_[roadmapId].epics[tailId].pathTails = state_[roadmapId].epics[tailId].pathTails.filter(pid => pid !== pathId);
	if (isEpicBlocked(tailId, state_[roadmapId].epics, state_[roadmapId].paths)) {
		state_[roadmapId].epics[tailId].blocked = true;
	}
	else {
		state_[roadmapId].epics[tailId].blocked = false;
	}

	// delete the path object itself
	delete state_[roadmapId].paths[pathId];

	return state_;
}

const removeEpic = (state_, action) => {
	// pull all epics after targetRow up by one row 
	const targetRow = state_[action.roadmapId].epics[action.epicId].row;

	// remove path reference from all dependencies
	state_[action.roadmapId].epics[action.epicId].pathTails
	.forEach(pathId => {
		state_ = removePath(pathId, action.roadmapId, state_);
	});

	// remove path reference form all dependees, re-evaluate epic blockage as well
	state_[action.roadmapId].epics[action.epicId].pathHeads
	.forEach(pathId => {
		state_ = removePath(pathId, action.roadmapId, state_);
	});
	
	// decrement all the rows after target row
	Object.values(state_[action.roadmapId].epics).forEach(epic => {
		if (epic.id !== action.epicId) {
			if (epic.row > targetRow) {
				state_[action.roadmapId].epics[epic.id].row--;
			}	
		}
	});

	// clear row along with the epic
	state_[action.roadmapId].canvas.rows--;

	// remove the epic
	delete state_[action.roadmapId].epics[action.epicId];
	
	return state_;
}

const patchEpic = (state_, action) => {
	// patch epic
	state_[action.roadmapId].epics[action.epic.id] = {
		...state_[action.roadmapId].epics[action.epic.id],
		...action.epic
	}

	// re-evaluate self
	const isBlocked = isEpicBlocked(action.epic.id, state_[action.roadmapId].epics, state_[action.roadmapId].paths);
	state_[action.roadmapId].epics[action.epic.id].blocked = isBlocked;

	// re-evaluate all dependee epics
	state_[action.roadmapId].epics[action.epic.id].pathHeads
	.forEach(pathId => {
		const dependeeId = state_[action.roadmapId].paths[pathId].tail;
		const isBlocked = isEpicBlocked(dependeeId, state_[action.roadmapId].epics, state_[action.roadmapId].paths);

		state_[action.roadmapId].epics[dependeeId].blocked = isBlocked;
	})
	
	return state_;
}

const roadmapReducer = (state, action) => {
	switch(action.type) {
		case "addMultiple":
			return {
				...state,
				...action.roadmaps
			}
		case "patchRoadmap":
			return {
				...state,
				[action.roadmapId]: {
					...state[action.roadmapId],
					...action.roadmap
				}
			}
		case "addEpic": {
			return {
				...state,
				[action.roadmapId]: {
					...state[action.roadmapId],
					epics: 
					{
						...state[action.roadmapId].epics,
						[action.epic.id]: {
							...action.epic
						}
					}
				}
			}
		}
		case "removeEpic": {
			return removeEpic(_.cloneDeep(state), action);
		}
		case "addPath": {
			return addPath(action.path, action.roadmapId, _.cloneDeep(state));
		}
		case "removePath": {
			return removePath(action.pathId, action.roadmapId, _.cloneDeep(state));
		}
		case "patchEpic": {
			return patchEpic(_.cloneDeep(state), action);
		}
		case "patchCanvas": {
			return {
				...state,
				[action.roadmapId]: {
					...state[action.roadmapId],
					canvas: {
						...state[action.roadmapId].canvas,
						...action.canvas
					}
				}
			}
		}
		case "updateCanvas": {
			return {
				...state,
				[action.roadmapId]: {
					...state[action.roadmapId],
					canvas: action.canvas
				}
			}
		}
		case "addRowsToCanvas": {
			return {
				...state,
				[action.roadmapId]: {
					...state[action.roadmapId],
					canvas: {
						...state[action.roadmapId].canvas,
						rows: state[action.roadmapId].canvas.rows + action.rows
					}
				}
			}
		}
		default:
			throw new Error(action);
	}
}

const CanvasWrapper = ({selectedRoadmap}) => {
	const [roadmap, roadmapDispatch] = useReducer(roadmapReducer, {});
	const [global,,] = useContext(Global);

	const fetchRoadmaps = async () => {
		const token = localStorage.getItem("token");
		const projectId = global.project.id;
		const url = `${settings.API_ROOT}/project/${projectId}/roadmap?detailed=true`;
	
		try {
			const roadmaps = await Helper.http.request(url, "GET", token, null, true);
			return roadmaps;
		} catch (e) {
			console.error(e);
		}
	
		return null;
	}

	const roadmapPreprocessing = roadmap => {
		// remove the original epics and paths
		// mark it as processed, so we do not perform preprocessing again
		let roadmapPatch = {
			id: roadmap.id,
			projectId: roadmap.projectId,
			processed: true,
			roadmapEpics: undefined,
			roadmapPaths: undefined,
			epics: {},
			paths: {},
			graph: {}
		};

		// preprocessing epics
		roadmap.epics.forEach(epic => {
			// some preprocessing for our React components (e.g. string date to Date)
			roadmapPatch.epics[epic.id] = epicPreprocessing(epic);
		})

		// preprocessing paths
		roadmap.paths.forEach(path => {
			roadmapPatch.paths[path.id] = pathPreprocessing(path);
		});

		Object.values(roadmapPatch.paths).forEach(path => {
			roadmapPatch.epics[path.head].pathHeads.push(path.id);
			roadmapPatch.epics[path.tail].pathTails.push(path.id);
		})

		findBlockedEpics(roadmapPatch.epics, roadmapPatch.paths)
		.forEach(epicId => {
			roadmapPatch.epics[epicId].blocked = true;
		})

		roadmapPatch.canvas = getSupersetCanvas(defaultCanvas, Object.values(roadmapPatch.epics));
		
		// add empty row at the bottom, if canvas is not empty
		if (Object.keys(roadmapPatch.epics).length !== 0)
			roadmapPatch.canvas.rows++;

		return roadmapPatch;
	}

	useEffect(() => {
		// fetch roadmaps
		void async function() {
			const roadmaps = await fetchRoadmaps();
			if (roadmaps === null) return;
			
			// store roadmaps as Object, for faster access
			let roadmapObj = {};
			roadmaps.forEach(r => {
				roadmapObj[r.id] = roadmapPreprocessing(r);
			});

			roadmapDispatch({type: "addMultiple", roadmaps: roadmapObj});
		}()	
	}, []);

	if (roadmap[selectedRoadmap] === undefined || !roadmap[selectedRoadmap].processed)
		return <h1>Could not fetch roadmap.</h1>;

	return (
		<div className="canvas-wrapper">
			<Canvas roadmap={roadmap[selectedRoadmap]} roadmapDispatch={roadmapDispatch} />
		</div>
	);
}

export default CanvasWrapper;