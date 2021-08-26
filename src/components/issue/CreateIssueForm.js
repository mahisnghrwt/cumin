import React, { createContext, useContext, useReducer, useRef } from "react";
import {ISSUE_TYPES} from "../../enums";
import Global from "../../GlobalContext";
import Helper from "../../Helper";
import settings from "../../settings";
import FieldConstraint from "../classes/FieldConstraint";
import formInputType from "../form/formInputType";
import FormItem from "../form/FormItem";
import formItemSize from "../form/formItemSize";
import FormContext from "../form/FormContext";
import Form from "../form/Form";
import Button from "../form/Button";
import InputItem from "../form/InputItem";
import SelectItem from "../form/SelectItem";
import LogItem from "../form/LogItem";

const CreateIssueForm = () => {
	const [global, globalDispatch] = useContext(Global);

	const createIssue = async (formValues) => {
		const URL = settings.API_ROOT + "/project/" + global.project.id + "/issue";
		const token = localStorage.getItem("token");

		let issue = {projectId: global.project.id, reporterId: global.user.id};
		
		issue = {
			...formValues
		}

		try {
			const result = await Helper.http.request(URL, "POST", token, issue, true);
			debugger;
		} catch (e) {
			console.error(e);
		}
	}

	const formFields = ["title", "type", "description"];

	return (
		<>
		<Form formFields={formFields}>
			<div className="form-row">
				<InputItem kKey="title" type={formInputType.TEXT} label="Title" size={formItemSize.SMALL} required />
				<SelectItem kKey="type" label="Type" size={formItemSize.SMALL} required>
					<option value="">Select</option>
					{ISSUE_TYPES.map(x => <option value={x}>{x}</option>)}
				</SelectItem>
			</div>
			<div className="form-row">
				<InputItem kKey="description" type={formInputType.TEXT} label="Description" size={formItemSize.SMALL} />
			</div>
			<div className="form-row">
				<Button kKey="create" label="Create" doesSubmit={true} onClick={createIssue} />
			</div>
			<div className="form-row">
				<LogItem />
			</div> 
		</Form>
		</>
	);
};

export default CreateIssueForm;