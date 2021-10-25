import NavBar from "./NavBar";
import { useState, useReducer } from "react";
import CanvasToolbar from "./roadmap/CanvasToolbar/CanvasToolbar";
import Sidebar from "./sidebar2/Sidebar"
import SidebarWrapper  from "./sidebar2/SidebarWrapper";
import CanvasWrapper from "./roadmap/CanvasWrapper";
import roadmapContext from "./roadmap/roadmapContext";
import "../App.css";


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
			<SidebarWrapper>
			<div className="d-flex flex-column height-full">
				<NavBar />
				<div className="flex-1">
					<div className="Layout Layout--sidebarPosition-end Layout--sidebar-wide Layout--gutter-none height-full">
						<div className="Layout-main ml-6">
							<h1 className="h1 mb-4">Roadmap</h1>
							<CanvasToolbar tools={canvasTools} /> 
							<CanvasWrapper />
						</div>
						<Sidebar />
					</div>
				</div>
			</div>
			</SidebarWrapper>
			
		</roadmapContext.Provider>
	)

	return (
		<roadmapContext.Provider value={{setAlert, dispatchCanvasTools}}>
			<NavBar loggedIn={true} activePage={ACTIVE_PAGE} />
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