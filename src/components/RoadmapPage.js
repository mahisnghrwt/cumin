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

const RoadmapPage = () => {
	const [alert, setAlert_] = useState(null);
	const [canvasTools, dispatchCanvasTools] = useReducer(canvasToolsReducer, {});

	const setAlert = (messageJsx, type) => {
		if (messageJsx === null) {
			setAlert_(null);
			return;
		}

		setAlert_({message: messageJsx, type});
	}

	return (
		<roadmapContext.Provider value={{setAlert, dispatchCanvasTools}}>
			<NavBar loggedIn={true} activePage={ACTIVE_PAGE} />
			{alert && <AlertBar message={alert} />}
			<div className="container">
				<SidebarWrapper>
					<div className="roadmap-content">
						<h1>Roadmap</h1>
						<div className="canvas-hint">Read only.</div>
						<CanvasToolbar tools={canvasTools} /> 
						<CanvasWrapper />
					</div>
					<Sidebar />
				</SidebarWrapper>
			</div>
		</roadmapContext.Provider>
	)
}

export default RoadmapPage;