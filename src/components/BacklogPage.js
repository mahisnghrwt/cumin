import React, { useContext, useEffect, useReducer, useState } from 'react';
import NavBar from './NavBar';
import Global from "../GlobalContext"
import CreateIssueForm from './issue/CreateIssueForm';
import SidebarWrapper from "./sidebar2/SidebarWrapper";
import Sidebar from "./sidebar2/Sidebar";
import { epicPreprocessing, issuePreprocessing, sprintPreprocessing } from './roadmap/canvas-m/canvasHelper';
import settings from '../settings';
import Helper from '../Helper';
import Sprint from './sprint/Sprint';
import UnassignedIssuesContainer from './sprint/UnassignedIssuesContainer';
import Modal from "./modal/Modal";
import EditSprintForm from './sprint/EditSprintForm';
import _ from "lodash";

const ACTIVE_PAGE = "Backlog";
const defaultState = {activeSprint: null, sprint: null, unassignedIssue: null};

const deleteSprint = (state, sprintId) => {
	// make a copy of issues
	const issues = state.sprint[sprintId].issue;

	// remove sprintId from each issue
	Object.keys(issues).forEach(issueId => {
		issues[issueId] = {
			...issues[issueId],
			sprintId: null
		}
	});

	// remove sprint
	delete state.sprint[sprintId];

	// assign issues to "unassignedIssues"
	state.unassignedIssue = {
		...state.unassignedIssue,
		...issues
	}

	return state;
}

const reducer = (state, action) => {
	switch(action.type) {
		case "update":
			return {
				...(state && state),
				...action.state
			}
		case "addIssue":
			return  {
				...state,
				...(!action.sprintId && 
					{unassignedIssue: {
						...(state.unassignedIssue && state.unassignedIssue),
						[action.issueId]: {
							...action.issue
						}
					}}),
					...(action.sprintId && {sprint: {
						...state.sprint,
						[action.sprintId]: {
							...state.sprint[action.sprintId],
							issue: {
								...state.sprint[action.sprintId].issue,
								[action.issueId]: {
									...action.issue
								}
							}
						}
					}})
			};
		case "addSprint":
			return {
				...state,
				sprint: {
					...(state.sprint && state.sprint),
					[action.sprintId]: {
						...action.sprint
					}
				}
			}
		case "patchSprint":
			return {
				...state,
				sprint: {
					...state.sprint,
					[action.sprintId]: {
						...state.sprint[action.sprintId],
						...action.sprint
					}
				}
			}
		case "deleteSprint":
			return deleteSprint(_.cloneDeep(state), action.sprintId);
		case "changeActiveSprint":
			const oldSprint = state.activeSprint.id;
			
			const nextState = {
				...state,
				activeSprint: {
					id: action.sprintId // update the state.activeSprint.id
				},
				sprint: {
					...state.sprint,
					...(oldSprint && {[oldSprint]: {...state.sprint[oldSprint], active: false}}), // mark the old sprint as inactive
					...(action.sprintId && {[action.sprintId]: {...state.sprint[action.sprintId], active: true}}) // mark the new sprint, if any, as active
				}
			}
			return nextState;
		case "patchIssueSprint": {
			// copy issue
			const issue = action.oldSprintId === null ? {...state.unassignedIssue[action.issueId]} : {...state.sprint[action.oldSprintId].issue[action.issueId]};
			issue.sprintId = action.sprintId;
			// add to new sprint
			const nextState = {
				...state,
				sprint: {
					...state.sprint,
					...(action.oldSprintId && {[action.oldSprintId]: {
						...state.sprint[action.oldSprintId],
						issue: {
							...state.sprint[action.oldSprintId].issue
						}
					}}),
					...(action.sprintId && {[action.sprintId]: {
						...state.sprint[action.sprintId],
						issue: {
							...state.sprint[action.sprintId].issue,
							[action.issueId]: issue
						}
					}})
				},
				...((!action.oldSprintId || !action.sprintId) && {unassignedIssue: {
					...state.unassignedIssue,
					...(!action.sprintId && {[action.issueId]: issue}) // if sprint Id is null
				}}),
			}

			debugger;

			if (!action.oldSprintId)
				delete nextState.unassignedIssue[action.issueId]; // if is was an unassigned issue
			else
				delete nextState.sprint[action.oldSprintId].issue[action.issueId];

			return nextState;
		}
	}
}

const BacklogPage = (props) => {
	const [global,,] = useContext(Global);
	const [state, dispatch] = useReducer(reducer, defaultState);

	const [modal, setModal] = useState(null);

	const fetchSprints = async () => {
		const url = settings.API_ROOT + "/project/" + global.project.id + "/sprint";
		const token = localStorage.getItem("token");
		try {
			const sprints = await Helper.http.request(url, "GET", token, null, true);
			return sprints;
		} catch (e) {
			throw e;
		}
	}

	const fetchUnassingedIssues = async () => {
		const url = settings.API_ROOT + "/project/" + global.project.id + "/issue/sprint";
		const token = localStorage.getItem("token");
		try {
			const issues = await Helper.http.request(url, "GET", token, null, true);
			return issues;
		} catch (e) {
			throw e;
		}
	}

	const fetchActiveSprint = async () => {
		const url = settings.API_ROOT + "/project/" + global.project.id + "/active-sprint";
		const token = localStorage.getItem("token");
		try {
			const activeSprint = await Helper.http.request(url, "GET", token, null, true);
			return activeSprint;
		} catch (e) {
			throw e;
		}
	}

	const fetchEpics = async () => {
		const url = settings.API_ROOT + "/project/" + global.project.id + "/epic";
		return await Helper.fetch(url, "GET", null, true);
	}

	const fetchMembers = async () => {
		const url = settings.API_ROOT + "/project/" + global.project.id + "/member";
		return await Helper.fetch(url, "GET", null, true);
	}

	useEffect(() => {
		void async function() {
			try {
				const [activeSprint, sprints, issues, epics, members] = await Promise.all([fetchActiveSprint(), fetchSprints(), fetchUnassingedIssues(), fetchEpics(), fetchMembers()]);
			
				let nextState = {activeSprint: {}, sprint: {}, unassignedIssue: {}, epics: [], members: []};
				// we do copy other properties because we want single source of truth as they will be repeated in state.sprints
				if (activeSprint) {
					nextState.activeSprint.id = activeSprint.id;
				}

				sprints && sprints.forEach(sprint_ => {
					let sprintProcessed = sprintPreprocessing(sprint_);
					sprintProcessed.active = activeSprint.id === sprintProcessed.id;
					let issueProcessed = {};
					for(const issue of sprintProcessed.issues) {
						issueProcessed[issue.id] = issuePreprocessing(issue);
					}
					delete sprintProcessed.issues;
					sprintProcessed.issue = issueProcessed;
					nextState.sprint[sprint_.id] = sprintProcessed;
				})

				issues && issues.forEach(issue_ => {
					nextState.unassignedIssue[issue_.id] = issuePreprocessing(issue_);
				})

				nextState.epics = epics.map(epic => epicPreprocessing(epic));
				nextState.members = members;

				dispatch({type: "update", state: nextState});
			} catch (e) {
				throw e;
			}
		}()
	}, [])

	const createSprint = e => {
		setModal({title: "Create Sprint", body: <EditSprintForm successCallback={addSprint} />})
	}

	const deleteSprint = async sprintId => {
		const url = `${settings.API_ROOT}/project/${global.project.id}/sprint/${sprintId}`;
		try {
			await Helper.fetch(url, "DELETE", null, false);
			return true;
		} catch (e) {
			throw e;
		}
	}

	const changeActiveSprint = async sprintId => {
		const url = `${settings.API_ROOT}/project/${global.project.id}/active-sprint`;
		try {
			const body = {
				activeSprintId: sprintId
			};
			return await Helper.fetch(url, "PUT", body, false);
		} catch (e) {
			throw e;
		}
	}

	const sprintEventHandler = async customEvent => {
		if (!customEvent) return;
		if (customEvent.type === "editSprint") {
			editSprint(customEvent.sprintId);
		}
		else if (customEvent.type === "deleteSprint") {
			if (await deleteSprint(customEvent.sprintId) === true) {
				dispatch({type: "deleteSprint", sprintId: customEvent.sprintId});
			}
		}
		else if (customEvent.type === "toggleActiveSprint") {
			const project = await changeActiveSprint(customEvent.sprintId === state.activeSprint.id ? null : customEvent.sprintId);
			dispatch({type: "changeActiveSprint", sprintId: project.activeSprintId})
		}
	}

	const editSprint = sprintId => {
		setModal({title: "Edit Sprint", body: <EditSprintForm sprint={state.sprint[sprintId]} successCallback={addSprint} />})
	}

	const addIssue = issue => {
		const issue_ = issuePreprocessing(issue);
		dispatch({type: "addIssue", issueId: issue_.id, sprintId: issue_.sprintId, issue: issue_});
		
	}

	const addSprint = (sprint, isPatched) => {
		var sprint_ = sprintPreprocessing(sprint);
		// patch request's response does not include issues, so by default they will be null, and we do not want it to overwrite issues we have fetched already
		// for new sprint we can assume there is no  issues in it
		delete sprint_.issues;

		if (isPatched) {
			dispatch({type: "patchSprint", sprintId: sprint.id, sprint: sprint_});
		}
		else {
			sprint_.issue = {};
			dispatch({type: "addSprint", sprintId: sprint.id, sprint: sprint_});
		}
	}

	const createIssueForm = e => {
		setModal({title: "Create Issue", body: <CreateIssueForm sprints={Object.values(state.sprint)} epics={state.epics} members={state.members} successCallback={addIssue} />})
	}

	const updateIssueSprint = async (issueId, oldSprintId, sprintId) => {	
		const url = settings.API_ROOT + "/project/" + global.project.id + "/issue/" + issueId;
		const body = {sprintId};
		try {
			const issue = await Helper.fetch(url, "PATCH", body, true);
			if (issue.sprintId === sprintId) {
				dispatch({type: "patchIssueSprint", issueId, oldSprintId, sprintId});
			}
		} catch (e) {
			throw e;
		}

	}

	return (
	<>
		<NavBar loggedIn={true} activePage={ACTIVE_PAGE} />
		<div className="container">
			<SidebarWrapper>
				<div className="content">
					<h1 style={{marginBottom: "0rem"}}>Backlog</h1>
					<div style={{display: "flex", flexDirection: "row", marginBottom: "2rem"}}>
						<button className="std-button sm-button" onClick={createSprint}>+ Sprint</button>
						<button className="std-button sm-button" onClick={createIssueForm}>+ Issue</button>
					</div>
					{state.unassignedIssue && 
						<UnassignedIssuesContainer issues={Object.values(state.unassignedIssue)} updateIssueSprint={updateIssueSprint} />}
					{state.sprint && 
						Object.values(state.sprint).map(sprint => <Sprint sprint={sprint} bubbleMouseEvent={sprintEventHandler} updateIssueSprint={updateIssueSprint} />)}
				</div>
				<Sidebar />
			</SidebarWrapper>
			{modal && <Modal title={modal.title} close={_ => setModal(null)}>
				{modal.body}
			</Modal>}
		</div>
	</>
	);
};

export default BacklogPage;