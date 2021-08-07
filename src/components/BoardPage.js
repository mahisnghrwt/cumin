import { useCallback, useContext, useEffect, useReducer, useRef } from "react";
import Global from "../GlobalContext";
import NavBar from "./NavBar";
import settings from "../settings";
import Helper from "../Helper";
import webSocket from "../webSocket";
import {SOCKET_EVENT, ISSUE_STATUS, ISSUE_STATUS_TO_ENUM} from "../enums";
import { useHistory } from "react-router-dom";
import BoardIssueContainer from "./board/BoardIssueContainer";

const COMPONENT_ID = "BOARD_PAGE";

const reducer__ = (activeSprint, action) => {
	switch(action.type) {
		case "NEW":
			return {
				...action.activeSprint
			};
		default:
			throw new Error(`${action.type} not found!`);
	}
}

const reducerForIssuesSorted__ = (issuesSorted, action) => {
	switch(action.type) {
		case "NEW":
			return {
				todo: [...action.issuesSorted.todo], 
				inProgress: [...action.issuesSorted.inProgress], 
				complete: [...action.issuesSorted.complete]
			}
		case "ADD_ISSUE": {
			const updated =  {
				todo: [...issuesSorted.todo], 
				inProgress: [...issuesSorted.inProgress], 
				complete: [...issuesSorted.complete]
			}
			const status = ISSUE_STATUS_TO_ENUM(action.issue.status);
			// debugger;
			updated[status].push({...action.issue});
			// debugger;
			return updated;
		}
		case "UPDATE_ISSUE": {
			// action
			//		type
			//		prev
			//		current	
			let updated = {};
			Object.keys(ISSUE_STATUS).forEach(key => {
				// remove the old value
				if (ISSUE_STATUS[key] === action.prev.status) {
					updated[key] = issuesSorted[key].filter(x => x.id !== action.prev.id)
				}
				
				// add the new value
				if (ISSUE_STATUS[key] === action.current.status) {
					updated[key] = [...issuesSorted[key], {...action.current}];
				}

				if (typeof updated[key] === "undefined") {
					updated[key] = [...issuesSorted[key]];
				}
			});


			return updated;
		}
		case "DELETE_ISSUE": {
			let updated = {};
			// const status = ISSUE_STATUS_TO_ENUM(action.issue.status);
			Object.keys(ISSUE_STATUS).forEach(key => {
				// remove the old value
				if (ISSUE_STATUS[key] === action.issue.status) {
					updated[key] = issuesSorted[key].filter(x => x.id !== action.issue.id)
				}
				else {
					updated[key] = [...issuesSorted[key]];
				}	
			});
			return updated;
		}
		default:
			throw new Error(`Unexpected "action.type": ${action.type} in "reducerForIssuesSorted__"`);
	}
}

const sortIssues = (issues) => {
	const sorted = {todo: [], inProgress: [], complete: []};

	issues.forEach(x => {
		switch(x.status) {
			case "Todo":
				sorted.todo.push(x);
				break;
			case "In Progress":
				sorted.inProgress.push(x);
				break;
			case "Complete":
				sorted.complete.push(x);
				break;
			default:
				throw new Error(`Unexpected "issue.status": ${x.status}`);
		}
	})

	return sorted;
}

const careToUpdate = (lProjectId, lSprintId, rProjectId, rSprintId) => {
	return (lProjectId === rProjectId) && (lSprintId === rSprintId);
}

const BoardPage = (props) => {
	let hasProjectSelected = true;
	const [global, globalDispatch] = useContext(Global);
	const [activeSprint, dispatch] = useReducer(reducer__, {});
	const activeSprintRef = useRef(activeSprint);
	const [issuesSorted, dispatchForIssuesSorted] = useReducer(reducerForIssuesSorted__, {todo: [], inProgress: [], complete: []});
	const history = useHistory();

	const MOUNTED = useRef(false);

	if (typeof global.project === "undefined" || global.project == null) {
		hasProjectSelected = false;
	}

	const issueCreatedOverSocket = (issue) => {
		if (MOUNTED.current === false) return;
		if (!careToUpdate(global.project.id, activeSprint.id, issue.projectId, issue.sprintId))
			return;

		dispatchForIssuesSorted({type: "ADD_ISSUE", issue});
	}

	const issueUpdatedOverSocket = ([prev, current]) => {		
		if (MOUNTED.current === false) return;

		if ((prev.sprintId === current.sprintId) && ( prev.sprintId === activeSprintRef.current.id)) {
			// update the issue
			dispatchForIssuesSorted({type: "UPDATE_ISSUE", prev, current});
		}
		else if (prev.sprintId === activeSprintRef.current.id) {
			// delete the issue
			dispatchForIssuesSorted({type: "DELETE_ISSUE", issue: prev});
		}
		else if (current.sprintId === activeSprintRef.current.id) {
			// add the issue
			dispatchForIssuesSorted({type: "ADD_ISSUE", issue: current});
		}
		else {
			throw new Error("Unknown case detected!");
		}
	}

	const issueDeletedOverSocket = (issue) => {
		if (MOUNTED.current === false) return;
		if (!careToUpdate(global.project.id, activeSprint.id, issue.projectId, issue.sprintId))
			return;

		dispatchForIssuesSorted({type: "DELETE_ISSUE", issue});
	}

	const activeSprintUpdatedOverSocket = (activeSprint_) => {
		if (MOUNTED.current === false || activeSprint_.projectId !== global.project.id) return;

		// active sprint update, redirect the user to backlog page
		history.push("/backlog");
	}

	const issueStatusUpdated = (issueId, status) => {
		const PATCH_STATUS_URL = settings.API_ROOT + "/issue/status";
		Helper.httpRequest(PATCH_STATUS_URL, "PATCH", JSON.stringify({id: issueId, status: ISSUE_STATUS[status]}))
		.then(response => console.log(response));
	}


	useEffect(() => {
		if (hasProjectSelected === false) return;

		// mark the component as mounted
		MOUNTED.current = true;

		const URL_GET_ACTIVE_SPRINT = settings.API_ROOT + "/project/" + global.project.id + "/active-sprint";
		Helper.httpRequest(URL_GET_ACTIVE_SPRINT, "GET", null)
		.then(activeSprint_ => {
			activeSprintRef.current.id = activeSprint_.id;
			dispatch({type: "NEW", activeSprint: activeSprint_});
			// sort and add issues
			const issuesSorted_ = sortIssues(activeSprint_.issues);
			dispatchForIssuesSorted({type: "NEW", issuesSorted: issuesSorted_});
		})
		.catch(e => console.error(e));

		// Subscribe to all events
		webSocket.addListener(SOCKET_EVENT.ISSUE_UPDATED, COMPONENT_ID, issueUpdatedOverSocket);
		webSocket.addListener(SOCKET_EVENT.ISSUE_CREATED, COMPONENT_ID, issueCreatedOverSocket);
		webSocket.addListener(SOCKET_EVENT.ISSUE_DELETED, COMPONENT_ID, issueDeletedOverSocket);
		webSocket.addListener(SOCKET_EVENT.ACTIVE_SPRINT_UPDATED, COMPONENT_ID, activeSprintUpdatedOverSocket);

		return () => {
			MOUNTED.current = false;

			// unsubscribe all socket events
			webSocket.removeListener(SOCKET_EVENT.ISSUE_CREATED, COMPONENT_ID);
			webSocket.removeListener(SOCKET_EVENT.ISSUE_UPDATED, COMPONENT_ID);
			webSocket.removeListener(SOCKET_EVENT.ISSUE_DELETED, COMPONENT_ID);
			webSocket.removeListener(SOCKET_EVENT.ACTIVE_SPRINT_UPDATED, COMPONENT_ID);
		}
	}, [])

	useEffect(() => activeSprintRef.current = activeSprint);

	return (
		<>
		<NavBar loggedIn={true} />
		<div className="wrapper">
			<div className="markdown-body">
				<h1>Board</h1>
				{hasProjectSelected === false
				? <pre>Select a project to start working with the Board.</pre>	
				:<>
					{activeSprint == null
					?<pre>No active sprint</pre>
					:<div className="board-container">
						{Object.keys(ISSUE_STATUS).map(statusKey => {
							return <BoardIssueContainer 
								key={statusKey} 
								status={statusKey} 
								issues={issuesSorted[statusKey]} 
								onDropNotifyParent={issueStatusUpdated} />;

						})}
					</div>
					}
				</>
				}	
			</div>
		</div>
		</>
	)
}

export default BoardPage;