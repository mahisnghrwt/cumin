import NavBar from "./NavBar";
import CreateEpicForm from "./roadmap/CreateEpicForm";
import { useState, useReducer, useContext } from "react";
import AlertBar from "./AlertBar";
import CanvasToolbar from "./roadmap/CanvasToolbar";
import EditEpicForm from "./roadmap/EditEpicForm";
import Helper from "../Helper";
import settings from "../settings";
import Global from "../GlobalContext";
import CreateIssueForm from "./issue/CreateIssueForm";
import Sidebar from "./sidebar/Sidebar"
import SidebarTabContent from "./sidebar/SidebarTabContent";
import IssueItemList from "./issueItem/IssueItemList";
import SidebarWrapper  from "./sidebar/SidebarWrapper";
import Canvas from "./roadmap/canvas-m/Canvas2";
import { useRef } from "react";

const ACTIVE_PAGE = "Roadmap";

const reducer = (state, action) => {
	switch(action.type) {
		case "updateIntermediateEpic":
			return {
				...state,
				intermediateEpic: action.intermediateEpic
			}
		case "patchIntermediateEpic":
			return {
				...state,
				intermediateEpic: {
					...state.intermediateEpic,
					...action.intermediateEpic
				}
			}
		case "setSelectedEpic": {
			return {
				...state,
				selectedEpic: action.selectedEpic
			}
		}
	}
}

const canvasToolsReducer = (state, action) => {
	switch(action.type) {
		case "add":
			return [...state, action.tool];
	}
}

const RoadmapPage = () => {
	const [global,,] = useContext(Global);
	const [alert, setAlert_] = useState(null);
	const [state, dispatch] = useReducer(reducer, {selectedEpic: null, intermediateEpic: null});
	const [canvasTools, dispatchCanvasTools] = useReducer(canvasToolsReducer, []);
	const isEpicSelected = state.selectedEpic !== null;

	const setAlert = (messageJsx, type) => {
		if (messageJsx === null) {
			setAlert_(null);
			return;
		}

		setAlert_({message: messageJsx, type});
	}

	const clearIntermediateEpic = () => {
		dispatch({type: "updateIntermediateEpic", intermediateEpic: null});
	}

	const setIntermediateEpic = (epic, patch = false) => {
		let action = {
			intermediateEpic: epic
		}
		action.type = patch ? "patchIntermediateEpic" : "updateIntermediateEpic";

		dispatch(action);
	}

	const setSelectedEpic = selectedEpic => {
		dispatch({type: "setSelectedEpic", selectedEpic});
	}

	const deleteSelectedEpic = async () => {
		if (state.selectedEpic === null || !state.selectedEpic.id) return;
		const epicId = state.selectedEpic.id;

		const token = localStorage.getItem("token");
		const url = `${settings.API_ROOT}/project/${global.project.id}/epic/${epicId}`;
		debugger;
		try {
			await Helper.http.request(url, "DELETE", token, null, false);
		} catch (e) {
			console.error(e);
		}
	}

	return (
		<>
			<NavBar loggedIn={true} activePage={ACTIVE_PAGE} />
			{alert && <AlertBar message={alert} />}
			<div className="roadmap-container">
				<SidebarWrapper>
					<Sidebar>
						<SidebarTabContent>
							<CreateEpicForm setAlert={setAlert} intermediateEpic={state.intermediateEpic} clearIntermediateEpic={clearIntermediateEpic} />
							{isEpicSelected && <EditEpicForm epic={state.selectedEpicId} />}
							{isEpicSelected && <CreateIssueForm />}
							{isEpicSelected && <IssueItemList selectedEpic={state.selectedEpic.id} />}
						</SidebarTabContent>
					</Sidebar>
				</SidebarWrapper>
				
				<h1>Roadmap</h1>
				<CanvasToolbar>
					{canvasTools}
					<button onClick={deleteSelectedEpic} className="x-sm-2 bg-red" disabled={state.selectedEpic === null}>- Delete Epic</button>
				</CanvasToolbar>
				<div className="canvas-wrapper">
					<Canvas roadmap={{setAlert, setIntermediateEpic, setSelectedEpic, selectedEpic: state.selectedEpic, intermediateEpic: state.intermediateEpic, dispatchCanvasTools}} />
				</div>
			</div>
		</>
	)

}

export default RoadmapPage;