import NavBar from "./NavBar";
import CreateEpicForm from "./roadmap/CreateEpicForm";
import { useState, useReducer, useContext } from "react";
import AlertBar from "./AlertBar";
import CanvasToolbar from "./roadmap/CanvasToolbar/CanvasToolbar";
import EditEpicForm from "./roadmap/EditEpicForm";
import Helper from "../Helper";
import settings from "../settings";
import Global from "../GlobalContext";
import CreateIssueForm from "./issue/CreateIssueForm";
import Sidebar from "./sidebar2/Sidebar"
import SidebarWrapper  from "./sidebar2/SidebarWrapper";
import Canvas from "./roadmap/canvas-m/Canvas2";
import RoadmapSelector from "./roadmap/RoadmapSelector";
import { useEffect } from "react";
import CanvasWrapper from "./roadmap/CanvasWrapper";
import roadmapContext from "./roadmap/roadmapContext";
import canvasTool from "./roadmap/CanvasToolbar/canvasTool";

const ACTIVE_PAGE = "Roadmap";

const reducer = (state, action) => {
	switch(action.type) {
		case "setSelectedRoadmap":
			return {
				...state,
				selectedRoadmap: action.roadmap
			}
	}
}

const canvasToolsReducer = (state, action) => {
	switch(action.type) {
		case "add":
			return {
				...state,
				[action.id]: action.tool
			}
		case "remove":
			const state_ = {...state};
			delete state_[action.id];
			return state_;
		case "clear":
			return {};
	}
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
					...action.patch
				}
			}
	}
}

const RoadmapPage = () => {
	const [global,,] = useContext(Global);
	const [alert, setAlert_] = useState(null);
	const [state, dispatch] = useReducer(reducer, {selectedRoadmap: null});
	const [roadmap, roadmapDispatch] = useReducer(roadmapReducer, {});
	const [canvasTools, dispatchCanvasTools] = useReducer(canvasToolsReducer, {});

	const setAlert = (messageJsx, type) => {
		if (messageJsx === null) {
			setAlert_(null);
			return;
		}

		setAlert_({message: messageJsx, type});
	}

	// fetch roadmaps
	const fetchRoadmaps = async () => {
		const token = localStorage.getItem("token");
		const projectId = global.project.id;
		const url = `${settings.API_ROOT}/project/${projectId}/roadmap`;

		try {
			const roadmaps = await Helper.http.request(url, "GET", token, null, true);
			return roadmaps;
		} catch (e) {
			console.error(e);
		}

		return null;
	}

	const findMainRoadmapId = roadmaps => {
		// main roadmap does not have a creatorId 
		const r = roadmaps.find(r => r.creatorId === null);
		return r === undefined ? null : r.id;
	}

	const enableRoadmapSelector = roadmap && Object.values(roadmap).length !== 0;

	const selectRoadmap = id => {
		dispatch({ type: "setSelectedRoadmap", roadmap: id });
	}

	useEffect(() => {
		// fetch roadmaps
		void async function() {
			const roadmaps = await fetchRoadmaps();
			if (roadmaps === null) return;
			
			// store roadmaps as Object, for faster access
			let roadmapObj = {};
			roadmaps.forEach(r => {
				roadmapObj[r.id] = r;
			});

			roadmapDispatch({ type: "addMultiple", roadmaps: roadmapObj});

			let mainRoadmapId = findMainRoadmapId(roadmaps);
			if (mainRoadmapId === null) {
				// throw new Error("Could not find main roadmap.");
				mainRoadmapId = roadmaps[0].id;
			}
			
			// by default, select the main roadmap as active
			dispatch({ type: "setSelectedRoadmap", roadmap: mainRoadmapId});
			dispatchCanvasTools({type: "add", id: canvasTool.ROADMAP_SELECTOR, tool: {
				enabled: true, 
				props: {
					roadmap: roadmapObj, 
					defaultRoadmapId: mainRoadmapId, 
					notifyChange: selectRoadmap
			}}})
		}()	
	}, [])

	return (
		<roadmapContext.Provider value={{setAlert, dispatchCanvasTools}}>
			<NavBar loggedIn={true} activePage={ACTIVE_PAGE} />
			{alert && <AlertBar message={alert} />}
			<div className="container">
				<SidebarWrapper>
					<div className="roadmap-content">
						<h1>Roadmap</h1>
						{/* <CanvasToolbar tools={canvasTools}> 
							{ enableRoadmapSelector && <RoadmapSelector roadmap={roadmap} defaultRoadmapId={state.selectedRoadmap} notifyChange={selectRoadmap} /> }
							{Object.values(canvasTools).map(tool => tool)}
						</CanvasToolbar> */}
						<CanvasToolbar tools={canvasTools} /> 
						<CanvasWrapper selectedRoadmap={state.selectedRoadmap} />
					</div>
					<Sidebar />
				</SidebarWrapper>
			</div>
		</roadmapContext.Provider>
	)
}

export default RoadmapPage;