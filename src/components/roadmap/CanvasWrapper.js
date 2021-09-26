import { useContext, useEffect, useReducer} from "react";
import Canvas from "./canvas-m/Canvas2";
import settings from "../../settings";
import Helper from "../../Helper";
import {createGraph, epicPreprocessing, pathPreprocessing} from "./canvas-m/canvasHelper";
import Global from "../../GlobalContext";
import {add} from "date-fns";
import { getSupersetCanvas } from "./canvas-m/canvasHelper";

const DEFAULT_ROWS = 1;
const DEFAULT_ROADMAP_DURATION = 100;

const defaultCanvas = {
	startDate: new Date(),
	endDate: add(new Date(), {days: DEFAULT_ROADMAP_DURATION}),
	rows: DEFAULT_ROWS,
};

const removeEpic = (state, action) => {
	const targetRow = state[action.roadmapId].epics[action.epicId].row;

	const state_ =  {
		...state,
		[action.roadmapId]: {
			...state[action.roadmapId],
			canvas: {
				...state[action.roadmapId].canvas,
				rows: state[action.roadmapId].canvas.rows - 1
			},
			epics: { },
			paths: { }
		}
	}
	
	// decrement all the rows after target row
	Object.values(state[action.roadmapId].epics).forEach(epic => {
		if (epic.id !== action.epicId) {
			state_[action.roadmapId].epics[epic.id] = {
				...epic,
				row: epic.row > targetRow ? epic.row - 1 : epic.row
			}
		}
	});

	// delete all the paths connected to the target epic
	Object.values(state[action.roadmapId].paths).forEach(path => {
		if (path.head !== action.epicId && path.tail !== action.epicId) {
			state_[action.roadmapId].paths[path.id] = path;
		}
	});


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
			return removeEpic(state, action);
		}
		case "addPath": {
			return {
				...state,
				[action.roadmapId]: {
					...state[action.roadmapId],
					paths: 
					{
						...state[action.roadmapId].paths,
						[action.path.id]: {
							...action.path
						}
					}
				}
			}
		}
		case "removePath": {
			const state_ = {
				...state,
				[action.roadmapId]: {
					...state[action.roadmapId],
					paths: 
					{
						...state[action.roadmapId].paths
					}
				}
			}
			delete state_[action.roadmapId].paths[action.pathId];
			return state_;
		}
		case "patchEpic": {
			return {
				...state,
				[action.roadmapId]: {
					...state[action.roadmapId],
					epics: 
					{
						...state[action.roadmapId].epics,
						[action.epic.id]: {
							...state[action.roadmapId].epics[action.epic.id],
							...action.epic
						}
					}
				}
			}
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

		roadmapPatch.graph = createGraph(Object.keys(roadmapPatch.epics), roadmapPatch.paths);

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