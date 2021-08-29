import NavBar from "./NavBar";
import CreateEpicForm from "./roadmap/CreateEpicForm";
import Canvas from "./roadmap/canvas-m/Canvas";
import { useState, useReducer, useContext } from "react";
import AlertBar from "./AlertBar";
import {add} from "date-fns"
import reducer from "./roadmap/canvas-m/canvasReducer";
import CanvasToolbar from "./roadmap/CanvasToolbar";
import EditEpicForm from "./roadmap/EditEpicForm";
import Helper from "../Helper";
import settings from "../settings";
import Global from "../GlobalContext";
import CreateIssueForm from "./issue/CreateIssueForm";
import Sidebar from "./sidebar/Sidebar"
import SidebarTabContent from "./sidebar/SidebarTabContent";
import IssueItemDetailed from "./issueItem/IssueItemDetailed";
import IssueItemList from "./issueItem/IssueItemList";
import EditIssueForm from "./issue/EditIssueForm";

const ACTIVE_PAGE = "Roadmap";
const CANVAS_DEFAULT_LENGTH = 60;
const CANVAS_DEFAULT_ROWS = 0;

const RoadmapPage = () => {
	const [global,,] = useContext(Global);
	const [alert, setAlert_] = useState(null);
	const [state, dispatch] = useReducer(reducer, {epics: {}, paths: {}, intermediate: {}, canvas: {
		startDate: new Date(),
		endDate: add(new Date(), {days: CANVAS_DEFAULT_LENGTH}),
		rows: CANVAS_DEFAULT_ROWS
	}});
	const [issue, setIssue] = useState(null);

	const isEpicSelected = state.canvas.selectedEpicId !== undefined && state.epics[state.canvas.selectedEpicId] !== undefined;

	const setAlert = (messageJsx, type) => {
		if (messageJsx === null) {
			setAlert_(null);
			return;
		}

		setAlert_({message: messageJsx, type});
	}

	const clearIntermediateEpic = () => {
		dispatch({type: "UPDATE_INTERMEDIATE_EPIC", epic: null});
	}

	const addCanvasRow = () => {
		dispatch({type: "ADD_ROWS_TO_CANVAS", rows: 1});
	}

	const deleteSelectedEpic = async () => {
		const epicId = state.canvas.selectedEpicId;
		if (epicId === undefined)
			return;

		const token = localStorage.getItem("token");
		const url = `${settings.API_ROOT}/project/${global.project.id}/epic/${epicId}`;
		debugger;
		try {
			await Helper.http.request(url, "DELETE", token, null, false);
		} catch (e) {
			console.error(e);
		}
	}

	const sidebarTabs = {
		default: "Default",
		editEpic: "Edit Epic"
	}

	return (
		<>
			<NavBar loggedIn={true} activePage={ACTIVE_PAGE} />
			{alert !== null && <AlertBar messageJsx={alert.message} alertType={alert.type} />}
			<div className="roadmap-container">
				<Sidebar tabs={sidebarTabs} defaultTab={sidebarTabs.default}>
					<SidebarTabContent kKey={sidebarTabs.default}>
						<CreateEpicForm setAlert={setAlert} intermediateEpic={state.intermediate.epic} clearIntermediateEpic={clearIntermediateEpic} />
						{isEpicSelected && <EditEpicForm epic={state.epics[state.canvas.selectedEpicId]} />}
						{isEpicSelected && <CreateIssueForm />}
						<IssueItemList selectedEpic={state.canvas.selectedEpicId} editIssue={setIssue} />
					</SidebarTabContent>
					<SidebarTabContent kKey={sidebarTabs.editEpic}>
						{issue !== null && <EditIssueForm issue={issue} />}
					</SidebarTabContent>
				</Sidebar>
				<h1>Roadmap</h1>
				<CanvasToolbar>
					<button onClick={addCanvasRow} className="x-sm-2">+ Add Row</button>
					<button onClick={deleteSelectedEpic} className="x-sm-2 bg-red" disabled={state.canvas.selectedEpicId === undefined}>- Delete Epic</button>
				</CanvasToolbar>
				<div className="canvas-wrapper">
					<Canvas state={state} dispatch={dispatch} setAlert={setAlert} />
				</div>
			</div>
		</>
	)

}

export default RoadmapPage;