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

const addPath = (path, state_) => {
	// add path
	state_.paths[path.id] = {
		...path
	};

	// add reference of path to path head and tail
	state_.epics[path.head].pathHeads.push(path.id);
	state_.epics[path.tail].pathTails.push(path.id);

	// re-evaluate the path tail
	if (isEpicBlocked(path.tail, state_.epics, state_.paths)) {
		state_.epics[path.tail].blocked = true;
	}

	return state_;
}

const removePath = (pathId, state_) => {

	const headId = state_.paths[pathId].head;
	const tailId = state_.paths[pathId].tail;

	// for path head nothing changes, simply remove the path reference
	state_.epics[headId].pathHeads = state_.epics[headId].pathHeads.filter(pid => pid !== pathId);


	// for path tail similarly remove the reference then re-evaluate the path tail for blockages
	state_.epics[tailId].pathTails = state_.epics[tailId].pathTails.filter(pid => pid !== pathId);
	if (isEpicBlocked(tailId, state_.epics, state_.paths)) {
		state_.epics[tailId].blocked = true;
	}
	else {
		state_.epics[tailId].blocked = false;
	}

	// delete the path object itself
	delete state_.paths[pathId];

	return state_;
}

const removeEpic = (state_, action) => {
	// pull all epics after targetRow up by one row 
	const targetRow = state_.epics[action.epicId].row;

	// remove path reference from all dependencies
	state_.epics[action.epicId].pathTails
	.forEach(pathId => {
		state_ = removePath(pathId, state_);
	});

	// remove path reference form all dependees, re-evaluate epic blockage as well
	state_.epics[action.epicId].pathHeads
	.forEach(pathId => {
		state_ = removePath(pathId, state_);
	});
	
	// decrement all the rows after target row
	Object.values(state_.epics).forEach(epic => {
		if (epic.id !== action.epicId) {
			if (epic.row > targetRow) {
				state_.epics[epic.id].row--;
			}	
		}
	});

	// clear row along with the epic
	state_.canvas.rows--;

	// remove the epic
	delete state_.epics[action.epicId];
	
	return state_;
}

const patchEpic = (state_, epicId, patch) => {
	// patch epic
	state_.epics[epicId] = {
		...state_.epics[epicId],
		...patch
	}

	// re-evaluate self
	const isBlocked = isEpicBlocked(epicId, state_.epics, state_.paths);
	state_.epics[epicId].blocked = isBlocked;

	// re-evaluate all dependee epics
	state_.epics[epicId].pathHeads
	.forEach(pathId => {
		const dependeeId = state_.paths[pathId].tail;
		const isBlocked = isEpicBlocked(dependeeId, state_.epics, state_.paths);

		state_.epics[dependeeId].blocked = isBlocked;
	})
	
	return state_;
}

const roadmapReducer = (state, action) => {
	switch(action.type) {
		case "replace":
			return action.state;
		case "patchRoadmap":
			return {
				...state,
				...action.patch
			}
		case "addEpic": {
			return {
				...state,
				epics: {
					...state.epics,
					[action.epicId]: {
						...action.epic
					}
				}	
			}
		}
		case "removeEpic": {
			return removeEpic(_.cloneDeep(state), action);
		}
		case "addPath": {
			return addPath(action.path, _.cloneDeep(state));
		}
		case "removePath": {
			return removePath(action.pathId, _.cloneDeep(state));
		}
		case "patchEpic": {
			return patchEpic(_.cloneDeep(state), action.epicId, action.patch);
		}
		case "patchCanvas": {
			return {
				...state,
				canvas: {
					...state.canvas,
					...action.patch
				}
			}
		}
		case "updateCanvas": {
			return {
				...state,
				canvas: action.canvas
			}
		}
		case "addRowsToCanvas": {
			return {
				...state,
				canvas: {
					...state.canvas,
					rows: state.canvas.rows + action.rows
				}
			}
		}
		default:
			throw new Error(action);
	}
}

const CanvasWrapper = () => {
	const [roadmap, roadmapDispatch] = useReducer(roadmapReducer, {});
	const [global,,] = useContext(Global);

	const fetchRoadmap = async () => {
		const token = localStorage.getItem("token");
		const projectId = global.project.id;
		const url = `${settings.API_ROOT}/project/${projectId}/roadmap`;
	
		try {
			const roadmap = await Helper.http.request(url, "GET", token, null, true);
			return roadmap;
		} catch (e) {
			console.error(e);
		}
	
		return null;
	}

	const roadmapPreprocessing = roadmap => {
		// remove the original epics and paths
		// mark it as processed, so we do not perform preprocessing again
		let roadmapPatch = {
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
			const roadmap = await fetchRoadmap();
			if (roadmap === null) return;
			
			debugger;
			let roadmap_ = roadmapPreprocessing(roadmap);
			

			roadmapDispatch({type: "replace", state: roadmap_});
		}()	
	}, []);

	if (!roadmap || !roadmap.processed)
		return <h1>Could not fetch roadmap.</h1>;

	return (
		<div className="canvas-wrapper">
			<Canvas roadmap={roadmap} roadmapDispatch={roadmapDispatch} />
		</div>
	);
}

export default CanvasWrapper;