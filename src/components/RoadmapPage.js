import NavBar from "./NavBar";
import { useContext, useReducer } from "react";
import CanvasToolbar from "./roadmap/CanvasToolbar/CanvasToolbar";
import Sidebar from "./sidebar2/Sidebar"
import SidebarWrapper  from "./sidebar2/SidebarWrapper";
import CanvasWrapper from "./roadmap/CanvasWrapper";
import roadmapContext from "./roadmap/roadmapContext";
import "../App.css";
import Global from "../GlobalContext";
import { faHeartBroken } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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
	const [canvasTools, dispatchCanvasTools] = useReducer(canvasToolsReducer, {});
	const [global,,] = useContext(Global);

	return (
		<roadmapContext.Provider value={{ dispatchCanvasTools }}>
			<SidebarWrapper>
			<div className="d-flex flex-column height-full">
				<NavBar />
				<div className="flex-1">
					<div className="Layout Layout--sidebarPosition-end Layout--sidebar-wide Layout--gutter-none height-full">
						<div className="Layout-main ml-6">
							<h1 className="h1 mb-4">Roadmap</h1>
							{!global.project ?
								<div className="Box">
									<div class="blankslate">
										<FontAwesomeIcon className="f1" icon={faHeartBroken} />
										<h3 className="mb-1">You don’t seem to have any active project.</h3>
									</div>
								</div>
							:
								<>
									<CanvasToolbar tools={canvasTools} /> 
									<CanvasWrapper />
								</>
							}
						</div>
						<Sidebar />
					</div>
				</div>
			</div>
			</SidebarWrapper>
		</roadmapContext.Provider>
	);
}

export default RoadmapPage;