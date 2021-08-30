import { useContext, useEffect, useReducer } from "react";
import Global from "../../GlobalContext";
import Button from "../form/Button";
import Form from "../form/Form"
import formItemSize from "../form/formItemSize";
import InputItem from "../form/InputItem"
import SelectItem from "../form/SelectItem";
import issueStatus from "./issueStatus";
import issueType from "./issueType";
import Helper from "../../Helper";
import settings from "../../settings";
import useSocketEvent from "../hooks/useSocketEvent";
import { SOCKET_EVENT } from "../../enums";

/**
 * Why bother sync multiple state values?
 * * [X] Server will be sending the "events" anyways, why not.
 * * [O] Other option is to fetch the list of various resources (e.g. users, sprints) which are accessible to the user. 
 * * Then either I would have to implement another endpoint to cater sepecfic resources needed for this form, or perform fetch on multiple endpoints to fetch resources.
 * 
 */

const COMPONENT_ID = "EDIT_ISSUE_FORM";

const reducer = (state, action) => {
	switch(action.type) {
		case "NEW":
			return {
				...action.state
			}
		case "EPIC_ADDED":
			return {
				...state,
				epics: [...state.epics, action.epic]
			}
		case "EPIC_DELETED":
			return {
				...state,
				epics: [...state.epics, action.epicId]
			}
		case "EPIC_UPDATED":
			return {
				...state,
				epics: [state.epics.filter(epic => epic.id !== action.epic.id), {...action.epic}]
			}
		case "SPRINT_ADDED":
			return {
				...state,
				sprints: [...state.sprints, action.sprint]
			}
		case "SPRINT_DELETED":
			return {
				...state,
				sprints: [...state.sprits, action.sprintId]
			}
		default:
			throw new Error(`Unexpected action.type ${action.type}.`);
	}
}

const EditIssueForm = ({issue}) => {
	// fetch the list of sprints
	const [state, dispatch] = useReducer(reducer, {sprints: null, epics: null});
	const [global,,] = useContext(Global);

	const projectId = global.project.id;
	const token = localStorage.getItem("token");

	const formFields = {
		"title": issue.title,
		"type": issue.type,
		"status": issue.status,
		"sprint": issue.sprintId,
		"epic": issue.epicId
	}

	const haveSprints = state.sprints !== null;
	const haveEpics = state.epics !== null;

	const fetchSprints = async () => {
		const url = `${settings.API_ROOT}/project/${projectId}/sprint`;
		try {
			const sprints = await Helper.http.request(url, "GET", token, null, true);
			return sprints;
		} catch (e) {
			console.error(e);
		}

		return null;
	}

	const fetchEpics = async () => {
		const url = `${settings.API_ROOT}/project/${projectId}/epic`;
		try {
			const epics = await Helper.http.request(url, "GET", token, null, true);
			return epics;
		} catch (e) {
			console.error(e);
		}

		return null;
	}

	const epicUpdateOverSocket = ([staleEpic, epic]) => {
		if (epic.title !== staleEpic.title)
			dispatch({type: "UPDATE_EPIC", epic});
	}

	const epicAddedOverSocket = epic => {
		dispatch({type: "ADD_EPIC", epic});
	}

	const epicDeletedOverSocket = epic => {
		dispatch({type: "DELETE_EPIC", epicId: epic.id});
	}

	// const sprintUpdateOverSocket = ([staleSprint, sprint]) => {
	// 	if (sprint.title !== staleSprint.title)
	// 		dispatch({type: "UPDATE_SPRINT", stale: staleSprint.id, sprint});
	// }

	const sprintAddedOverSocket = sprint => {
		dispatch({type: "ADD_SPRINT", sprint});
	}

	const sprintDeletedOverSocket = sprint => {
		dispatch({type: "DELETE_SPRINT", sprintId: sprint.id});
	}

	// subscribe to sprint updates
	// subscribe to issue updates
	// No sprint updated event available
	useSocketEvent(COMPONENT_ID, SOCKET_EVENT.SPRINT_CREATED, sprintAddedOverSocket);
	useSocketEvent(COMPONENT_ID, SOCKET_EVENT.SPRINT_DELETED, sprintDeletedOverSocket);
	useSocketEvent(COMPONENT_ID, SOCKET_EVENT.EPIC_CREATED, epicAddedOverSocket);
	useSocketEvent(COMPONENT_ID, SOCKET_EVENT.EPIC_UPDATED, epicUpdateOverSocket);
	useSocketEvent(COMPONENT_ID, SOCKET_EVENT.EPIC_DELETED, epicDeletedOverSocket);

	const updateIssue = async formValues => {
		// title, type, status, description, sprintId, epicId
		// implement desc
		const patch = {
			id: issue.id,
			title: formValues.title, 
			type: formValues.type, 
			status: formValues.status, 
			sprintId: parseInt(formValues.sprint),
			epicId: parseInt(formValues.epic)
		};
		const url = `${settings.API_ROOT}/project/${projectId}/issue`;

		try {
			const updatedIssue = await Helper.http.request(url, "PATCH", token, patch, true);
			console.log(updatedIssue);
		} catch (e) {
			console.error(e);
		}
	}

	useEffect(() => {
		// fetch list of sprints
		// fetch list of issue
		void async function () {
			try {
				const sprints = Object.values(await fetchSprints());
				const epics = Object.values(await fetchEpics());
				dispatch({type: "NEW", state: {sprints, epics}});
			} catch (e) {
				console.error(e);
			}
		}()
	}, [])

	return (
		<div className="edit-issue-form">
			<h3>Edit Issue</h3>
			<Form formFields={formFields}>
				<div className="form-row">
					<InputItem kKey="title" label="label" size={formItemSize.SMALL} />
					<SelectItem kKey="type" label="Type" size={formItemSize.SMALL} >
						<option value="">Select</option>
						{Object.values(issueType).map(type => {
							return <option value={type}>{type}</option>
						})}
					</SelectItem>
				</div>
				<div className="form-row">
					<SelectItem kKey="status" label="Status" size={formItemSize.SMALL} >
						<option value="">Select</option>
						{Object.values(issueStatus).map(status => { return (
							<option value={status}>
								{status}
							</option>
						)})}
					</SelectItem>
				</div>
				<div className="form-row">
					<SelectItem kKey="sprint" label="Sprint" size={formItemSize.SMALL} disabled={!haveSprints} >
						<option value="">Select</option>
						{haveSprints && state.sprints.map(sprint => { return (
							<option 
								value={sprint.id}>
								{sprint.title}
							</option>
						)})}
					</SelectItem>
					<SelectItem kKey="epic" label="Epic" size={formItemSize.SMALL} disabled={!haveEpics} >
						<option value="">Select</option>
						{haveEpics && state.epics.map(epic => { return (
							<option 
								value={epic.id}>
								{epic.title}
							</option>
						)})}
					</SelectItem>
				</div>
				<div className="form-row">
					<Button kKey="update" label="Update" doesSubmit={true} onClick={updateIssue} />
				</div>
			</Form>
		</div>
	)
}

export default EditIssueForm;