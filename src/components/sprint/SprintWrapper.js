import React, { useContext, useEffect, useReducer, useRef } from "react";
import Sprint from "./Sprint";
import settings from "../../settings";
import socket from "../../webSocket";
import {SOCKET_EVENT} from "../../enums";
import FreeIssuesContainer from "../issue/FreeIssuesContainer";
import Helper from "../../Helper";
import Global from "../../GlobalContext";

const COMPONENT_ID = "SPRINT_WRAPPER";

const putIssue = async (issue) => {
	const URL = settings.API_ROOT + "/issue";

	const fetchOptions = Helper.getFetchOptions();
	fetchOptions.method = "PUT";
	fetchOptions.headers.Authorization = "Bearer " + localStorage.getItem("token");
	fetchOptions.body = JSON.stringify(issue);

	const response = await fetch(URL, fetchOptions);
	if (response.ok)
		return response.json();
	return null;
}


const reducer__ = (sprints, action) => {
	switch (action.type) {
		case "NEW":
			return {...action.sprints};
		case "ADD":
			return {...sprints, [action.sprint.id]: action.sprint};
		case "REMOVE":
			return {...sprints, [action.targetId]: undefined}
			// return sprints.filter(x => x.id != action.targetId);
		case "ADD_ISSUE": {
			const sprint = {...sprints[action.issue.sprintId]};
			sprint.issues = [...sprint.issues, action.issue];
			return {
				...sprints,
				[action.issue.sprintId]: sprint
			}
		}
		case "REMOVE_ISSUE":
			const sprint = {...sprints[action.targetSprintId]};
			sprint.issues = sprint.issues.filter(x => x.id !== action.targetIssueId);
			return {
				...sprints,
				[action.targetSprintId]: sprint
			}
		case "UPDATE_ACTIVE_SPRINT":
			let prev_ = {id: -1};
			let current_ = {id: -1};

			if (action.prev != null) {
				const prev = sprints.find(x => x.id === action.prev.id);
				if (prev != null) {
					prev_ = {...prev};
					if (prev_.active !== undefined) {
						prev_.active = undefined;
					}
				}
			}

			const current = sprints.find(x => x.id === action.current.id);
			if (current != null) {
				current_ = {...current};
				current_["active"] = true;
			}

			return sprints.map(x => {
				if (x.id === current_.id)
					return current_;
				else if (x.id === prev_.id)
					return prev_;
				else
					return x;
			})
			// get the object of last active sprint, if it is not null
			// mark its "active" property as undefined
			// get the current active sprint, mark it as "active"
		default:
			console.error(`Unexpected case: ${action.type}`);
	}
}

const reducerForFreeIssues__ = (freeIssues, action) => {
	switch (action.type) {
		case "NEW":
			return [...action.freeIssues];
		case "ADD":
			return [...freeIssues, action.freeIssue];
		case "REMOVE":
			return freeIssues.filter(x => x.id !== action.targetId);
		default:
			console.error(`Unexpected case: ${action.type}`);
	}
}


const SprintWrapper = () => {
	const mounted = useRef(false);
	const [sprints, dispatch] = useReducer(reducer__, {});
	const [freeIssues, dispatchForFreeIssues] = useReducer(reducerForFreeIssues__, []);
	const [global, globalDispatch] = useContext(Global);
	// const { project } = global.project;
	// get the list of all sprints in this project
	// "Sprint" will receive all the data from props
	// so the socket events will be subscribed here as well

	const sprintCreatedOverSocket__ = sprint => {
		// debugger;

		if (mounted.current === false || sprint.projectId !== global.project.id)
			return;
		

		dispatch({type: "ADD", sprint});
	}

	const sprintDeletedOverSocket__ = sprint => {
		if (mounted.current === false || sprint.projectId != global.project.id)
			return;
		dispatch({type: "REMOVE", targetId: sprint.id});
	}

	const issueCreatedOverSocket__ = freeIssue => {
		if (mounted.current === false || freeIssue.projectId != global.project.id)
			return;
		dispatchForFreeIssues({type: "ADD", freeIssue});
	}

	// issuesStates = [2] => [0] -> prevState, [1] -> currentState
	const issueUpdatedOverSocket__ = issueStates => {
		debugger;
		if (mounted.current === false || issueStates[0].projectId != global.project.id)
			return;

		// remove the issue from old sprint
		if (issueStates[0].sprintId == null) {
			// was a free issue(no sprint)
			dispatchForFreeIssues({type: "REMOVE", targetId: issueStates[0].id});
		}
		else {
			dispatch({type: "REMOVE_ISSUE", targetSprintId: issueStates[0].sprintId, targetIssueId: issueStates[0].id});
		}

		// add the state to new sprint
		if (issueStates[1].sprintId == null) {
			// was a free issue(no sprint)
			dispatchForFreeIssues({type: "ADD", freeIssue: issueStates[1]});
		}
		else {
			dispatch({type: "ADD_ISSUE", issue: issueStates[1]});
		}
	}

	// issuesStates = [2] => [0] -> prevState, [1] -> currentState
	const activeSprintUpdatedOverSocket__ = activeSprintStates => {
		console.log(activeSprintStates);

		if (mounted.current === false || activeSprintStates[0].projectId != global.project.id)
			return;
		

		dispatch({type: "UPDATE_ACTIVE_SPRINT", prev: activeSprintStates[0], current: activeSprintStates[1]});
	}

	useEffect(() => {
		// mark as mounted
		mounted.current = true;

		const token = localStorage.getItem("token");

		// fetch sprints for current project
		const fetchSprintsUrl = settings.API_ROOT + "/project/" + global.project.id + "/sprint";
		Helper.http.request(fetchSprintsUrl, "GET", token, null, true)
		.then(sprints => {
			// console.log(sprints);
			dispatch({type: "NEW", sprints});
		})
		.catch(e => console.error(e));


		const fetchFreeIssuesUrl = settings.API_ROOT + "/project/" + global.project.id + "/issue?sprintId=-1";
		Helper.http.request(fetchFreeIssuesUrl, "GET", token, null, true)
		.then(freeIssues => {
			/// console.log(freeIssues);
			dispatchForFreeIssues({type: "NEW", freeIssues});
		})
		.catch(e => console.error(e));

		// subscribe to socket event to listen for sprint events
		socket.addListener(SOCKET_EVENT.SPRINT_CREATED, COMPONENT_ID, sprintCreatedOverSocket__);
		socket.addListener(SOCKET_EVENT.SPRINT_DELETED, COMPONENT_ID, sprintDeletedOverSocket__);
		socket.addListener(SOCKET_EVENT.ISSUE_CREATED, COMPONENT_ID, issueCreatedOverSocket__);
		socket.addListener(SOCKET_EVENT.ISSUE_UPDATED, COMPONENT_ID, issueUpdatedOverSocket__);
		socket.addListener(SOCKET_EVENT.ACTIVE_SPRINT_UPDATED, COMPONENT_ID, activeSprintUpdatedOverSocket__);

		return () => {
			// mark as unmounted
			mounted.current = false;
			socket.removeListener(SOCKET_EVENT.SPRINT_CREATED, COMPONENT_ID);
			socket.removeListener(SOCKET_EVENT.SPRINT_DELETED, COMPONENT_ID);
			socket.removeListener(SOCKET_EVENT.ISSUE_CREATED, COMPONENT_ID);
			socket.removeListener(SOCKET_EVENT.ISSUE_UPDATED, COMPONENT_ID);
			socket.removeListener(SOCKET_EVENT.ACTIVE_SPRINT_UPDATED, COMPONENT_ID);
		}
	}, [])

	const dropIssue = async (issueId, prevSprintId, sprintId) => {
		// debugger;
		// if the issue was drag and dropped in the same sprint, then just ignore this event
		if (prevSprintId === sprintId)
			return;

		const patchIssueUrl = settings.API_ROOT + "/project/" + global.project.id + "/issue";
		const patch = {
			id: issueId,
			sprintId: sprintId
		};
		const token = localStorage.getItem("token");
		try {
			const response = await Helper.http.request(patchIssueUrl, "PATCH", token, patch, true);
			console.log(response);
		} catch (e) {
			console.error(e);
		}
	}


	
	return (
		<>
			{Object.values(sprints).map(x => {
				return <><Sprint 
				key={x.id} 
				sprint={x} 
				dropIssuePropagate={dropIssue}
				/>
				<br />
				</>
			})}

			<FreeIssuesContainer issues={freeIssues} dropIssuePropagate={dropIssue} />
		</>
	);
}

export default SprintWrapper;