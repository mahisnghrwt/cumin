import React, { createContext, useContext, useReducer, useRef } from "react";

import Global from "../../GlobalContext";
import Helper from "../../Helper";
import settings from "../../settings";
import formInputType from "../form/formInputType";
import formItemSize from "../form/formItemSize";
import Form from "../form/Form";
import Button from "../form/Button";
import InputItem from "../form/InputItem";
import SelectItem from "../form/SelectItem";
import LogItem from "../form/LogItem";
import issueStatus from "./issueStatus";
import issueType from "./issueType";

const CreateIssueForm = ({sprints, members, epics, successCallback, formHidden = false, }) => {
	const [global,,] = useContext(Global);

	const createIssue = async (formValues) => {
		const URL = settings.API_ROOT + "/project/" + global.project.id + "/issue";
		const token = localStorage.getItem("token");

		let issue = {projectId: global.project.id, reporterId: global.user.id};
		issue.title = formValues.title;
		issue.type = formValues.type;
		issue.status = formValues.status;
		issue.description = formValues.description;
		issue.epicId = formValues.epic === "" ? null : parseInt(formValues.epic);
		issue.sprintId = formValues.sprint === "" ? null : parseInt(formValues.sprint);
		issue.assignedToId = formValues.assignedTo === "" ? null : parseInt(formValues.assignedTo);

		try {
			const result = await Helper.http.request(URL, "POST", token, issue, true);
			// only if successcallback is passed
			if (typeof successCallback === "function") {
				debugger;
				successCallback(result);
			}
		} catch (e) {
			console.error(e);
		}
	}

	const formFields = ["title", "description", "type", "status", "sprint", "epic", "assignedTo"];

	return (
		<Form formFields={formFields}>
			<div className="form-row">
				<InputItem kKey="title" type={formInputType.TEXT} label="Title" size={formItemSize.SMALL} required/>
			</div>
			<div className="form-row">
				<InputItem kKey="description" type={formInputType.TEXT} label="Description" size={formItemSize.SMALL} />
			</div>
			<div className="form-row">
				<SelectItem kKey="type" label="Type" size={formItemSize.SMALL} required>
					<option value="">Select</option>
					{Object.values(issueType).map(x => <option value={x}>{x}</option>)}
				</SelectItem>
				<SelectItem kKey="status" label="Status" size={formItemSize.SMALL} required>
					<option value="">Select</option>
					{Object.values(issueStatus).map(x => <option value={x.value}>{x.value}</option>)}
				</SelectItem>
			</div>
			<div className="form-row">
				<SelectItem kKey="sprint" label="Sprint" size={formItemSize.SMALL}>
					<option value="">Select</option>
					{sprints.map(sprint => <option value={sprint.id}>{sprint.title}</option>)}
				</SelectItem>
			</div>
			<div className="form-row">
				<SelectItem kKey="epic" label="Epic" size={formItemSize.SMALL}>
					<option value="">Select</option>
					{epics.map(epic => <option value={epic.id}>{epic.title}</option>)}
				</SelectItem>
			</div>
			<div className="form-row">
				<SelectItem kKey="assignedTo" label="Assign to" size={formItemSize.SMALL}>
					<option value="">Select</option>
					{members.map(member => <option value={member.id}>{member.username}</option>)}
				</SelectItem>
			</div>
			<div className="form-row">
				<Button kKey="create" label="Create" doesSubmit={true} onClick={createIssue} />
			</div>
			<div className="form-row">
				<LogItem />
			</div> 
		</Form>
	)
};

export default CreateIssueForm;