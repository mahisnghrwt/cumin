import React, { useContext } from "react";
import Global from "../../GlobalContext";
import Helper from "../../Helper";
import settings from "../../settings";
import issueStatus from "./issueStatus";
import issueType from "./issueType";
import Form, {SubmitButton, Input, Textarea, Select} from "../form/v2/Form";

const CreateIssueForm = ({sprints, members, epics, successCallback, originalIssue = null }) => {
	const [global,,] = useContext(Global);

	const saveIssue = async (formValues) => {
		const URL = !originalIssue 
			? settings.API_ROOT + "/project/" + global.project.id + "/issue" 
			: settings.API_ROOT + "/project/" + global.project.id + "/issue/" + originalIssue.id;
		const token = localStorage.getItem("token");

		let issue = {projectId: global.project.id, reporterId: global.user.id};
		issue.title = formValues.title;
		issue.type = formValues.type;
		issue.status = formValues.status;
		issue.description = formValues.description;
		issue.epicId = formValues.epic === "" ? null : parseInt(formValues.epic);
		issue.sprintId = formValues.sprint === "" ? null : parseInt(formValues.sprint);
		issue.assignedToId = formValues.assignedTo === "" ? null : parseInt(formValues.assignedTo);

		const result = await Helper.http.request(URL, !originalIssue ? "POST" : "PATCH", token, issue, true);
		// only if successcallback is passed
		if (typeof successCallback === "function") {
			if (!originalIssue)
				successCallback(result);
			else
				successCallback(originalIssue, result);
		}
	}

	const formFields = {
		title: {
			value: !originalIssue ? "" : originalIssue.title,
			validate: val => {
				if (!val || val.trim().length === 0)
					return "Title is required."
			}
		},
		description: {
			value: !originalIssue ? "" : originalIssue.description
		},
		type: {
			value: !originalIssue ? "" : originalIssue.type,
			validate: val => {
				if (!val || val.trim().length === 0)
					return "Type is required."
			}
		},
		status: {
			value: !originalIssue ? "" : originalIssue.status,
			validate: val => {
				if (!val || val.trim().length === 0)
					return "Status is required."
			}
		},
		sprint: {
			value: !originalIssue ? "" : originalIssue.sprintId
		},
		epic: {
			value: !originalIssue ? "" : originalIssue.epicId
		},
		assignedTo: {
			value: !originalIssue ? "" : originalIssue.assignedToId
		},
	}

	return (
		<Form formFields={formFields}>
			<Input kKey="title" type="text" label="Title"/>
			<Select kKey="type" label="Type">
				<option value="">Select</option>
				{ Object.values(issueType).map(x => <option value={x}>{x}</option>) }
			</Select>
			<Select kKey="status" label="Status">
				<option value="">Select</option>
				{ Object.values(issueStatus).map(x => <option value={x.value}>{x.value}</option>) }
			</Select>
			<Select kKey="sprint" label="Sprint">
				<option value="">Select</option>
				{ sprints.map(sprint => <option value={sprint.id}>{sprint.title}</option>) }
			</Select>
			<Select kKey="epic" label="Epic">
				<option value="">Select</option>
				{ epics.map(epic => <option value={epic.id}>{epic.title}</option>) }
			</Select>
			<Select kKey="assignedTo" label="Assign to">
				<option value="">Select</option>
				{ members.map(member => <option value={ member.id }>{ member.username }</option>) }
			</Select>
			<Textarea key="description" kKey="description" label="Description"/>
			<div class="form-actions">
				<SubmitButton label={ !originalIssue ? "Create" : "Update" } onClick={saveIssue} />
			</div>
		</Form>
	)
};

export default CreateIssueForm;