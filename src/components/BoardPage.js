import { useContext, useEffect, useReducer } from "react";
import NavBar from "./NavBar";
import SidebarWrapper from "./sidebar2/SidebarWrapper"
import Sidebar from "./sidebar2/Sidebar";
import Global from "../GlobalContext";
import Helper from "../Helper";
import settings from "../settings";
import _ from "lodash";
import { sprintPreprocessing } from "./preprocessing";
import Board from "./board/Board";
import "./board/board.css";
import { differenceInCalendarDays } from "date-fns";

const status = ["Todo", "In Progress", "Done"];

const getStatusObject = status => {
	let defaultState = {};
	status.forEach(status_ => {
		defaultState[status_] = {};
	})
	return defaultState;
}

const sortIssueByStatus = (status, issues) => {
	let sorted = getStatusObject(status);

	issues.forEach(issue => {
		// filter in status that are in status array
		if (sorted[issue.status]) {
			sorted[issue.status][issue.id] = issue;
		}
	})

	return sorted;
}

const reducer = (state, action) => {
	switch(action.type) {
		case "update":
			return _.cloneDeep(action.state);
		case "patchIssueStatus":
			const nextState = _.cloneDeep(state);
			debugger;
			// so we can attach this issue to new status
			const issue = {...nextState.sortedIssues[action.oldStatus][action.issueId]};
			issue.status = action.status;
			// remove from old status
			delete nextState.sortedIssues[action.oldStatus][action.issueId];
			nextState.sortedIssues[action.status][action.issueId] = issue;
			return nextState;
	}
}

const BoardPage = props => {
	const [global,,] = useContext(Global);
	const [state, dispatch] = useReducer(reducer, {sortedIssues: getStatusObject(status)});

	const fetchActiveSprint = async () => {
		const url = settings.API_ROOT + "/project/" + global.project.id + "/active-sprint";
		const activeSprint = await Helper.http.request(url, "GET", localStorage.getItem("token"), null, true);
		return activeSprint;
	}

	const patchIssueStatus = async (issueId, oldStatus, status) => {
		const patch = {status};
		const url = settings.API_ROOT + "/project/" + global.project.id + "/issue/" + issueId;
		try {
			await Helper.http.request(url, "PATCH", localStorage.getItem("token"), patch, false);
			debugger;
			dispatch({type: "patchIssueStatus", issueId, status, oldStatus});
		} catch (e) {
			throw e;
		}
	}

	useEffect(() => {
		void async function() {
			try {
				const activeSprint = await fetchActiveSprint();
				const activeSprintProcessed = sprintPreprocessing(activeSprint);
				const sortedIssues = sortIssueByStatus(status, activeSprintProcessed.issues);
				dispatch({type: "update", state: {...activeSprintProcessed, issues: undefined, sortedIssues}});
			} catch (e) {
				console.error(e);
			}
		}()
	}, [])

	return (
		<>
			<NavBar loggedIn={true} activePage="Board" />
			<div className="container">
				<SidebarWrapper>
					<div className="content">
						<h1>Board</h1>
						{state.endDate && 
						<p>
							Sprint - {state.title}. <br />
							Due in {differenceInCalendarDays(new Date(), state.endDate)} days.
						</p>
						}
						<div className="board-container">
							{Object.keys(state.sortedIssues).map(statusType => {
								return <Board 
									title={statusType} 
									issues={Object.values(state.sortedIssues[statusType])}
									patchIssueStatus={patchIssueStatus} 
								/>
							})}
						</div>
					</div>
					<Sidebar />
				</SidebarWrapper>
			</div>
		</>
	)
}

export default BoardPage;