import React, { useContext, useReducer, useRef } from "react";
import {ISSUE_TYPES} from "../../enums";
import Global from "../../GlobalContext";
import Helper from "../../Helper";
import settings from "../../settings";
import FieldConstraint from "../classes/FieldConstraint";


const formValidationParams__ = {
	title: new FieldConstraint("string", true, [""]),
	description: new FieldConstraint("string", false, null),
	type: new FieldConstraint("string", true, [""])
}


const reducer__ = (state, action) => {
	switch(action.type) {
		case "UPDATE_FORM_FIELD":
			return {
				...state,
				formFields: {
					...state.formFields,
					[action.field]: action.value
				}
			}
		case "UPDATE_FIELD_ERRORS":
			return {
				...state,
				errors: {
					...state.errors,
					...action.errors
				}
			}
		case "UPDATE_LOG":
			return {
				...state,
				log: { ...action.log
				}
			}
		case "CLEAR":
			return {log: undefined, errors: {}, formFields: {title: "", description: "", type: ""}};
	}
}

const CreateIssueForm = () => {
	const [state, dispatch] = useReducer(reducer__, {log: [], errors: {}, formFields: {title: "", description: "", type: ""}});
	const [global, globalDispatch] = useContext(Global);
	const testRef = useRef();


	const createIssue = async (e) => {
		// disable all the input fields, inclding submit button
		let valid = true;
		let errors = {}
		Object.keys(state.formFields).forEach(fieldName => {
			if (formValidationParams__[fieldName].validate(state.formFields[fieldName]) === false) {
				errors[fieldName] = "Invalid!";
				valid = false;
			}
			else {
				errors[fieldName] = undefined;
			}
		})

		if (!valid) {
			dispatch({type: "UPDATE_FIELD_ERRORS", errors});
			return;
		}


		const URL = settings.API_ROOT + "/project/" + global.project.id + "/issue";
		const token = localStorage.getItem("token");

		const issue = {...state.formFields, projectId: global.project.id, reporterId: global.user.id};
		try {
			await Helper.http.request(URL, "POST", token, issue, true);
			dispatch({type: "CLEAR"});
			dispatch({type: "UPDATE_LOG", log: {message: "! Issue created.", type: Helper.css.successBg}})
		} catch (e) {
			dispatch({type: "UPDATE_LOG", log: {message: "! " + e, type: Helper.css.dangerBg}})
			console.error(e);
		}
	}

	const disable_ = e => {
		testRef.current.disabled = true;
		console.log(testRef.current);
	}

	return (
		<>
			<h3>Create Issue</h3>
			<form onSubmit={e => e.preventDefault()}>
				<div className="form-row">
					<div className="form-item sm">
						<label>Title: </label>
						<input 
							ref={testRef}
							type="text" 
							onChange={e => dispatch({type: "UPDATE_FORM_FIELD", field: "title", value: e.target.value})} 
							value={state.formFields.title}
						/>
						{state.errors.title !== undefined && <span class="form-item-error">{state.errors.title}</span>}
					</div>
					<div className="form-item">
						<label>Type: </label>
						<select 
							onChange={e => dispatch({type: "UPDATE_FORM_FIELD", field: "type", value: e.target.value})} 
							value={state.formFields.type}
						>
							<option value="">Select type</option>
							{ISSUE_TYPES.map(x => <option value={x}>{x}</option>)}
						</select>
						{state.errors.type !== undefined && <span class="form-item-error">{state.errors.type}</span>}
					</div>
				</div>
				<div className="form-row">
					<div className="form-item sm">
						<label>Description: </label>
						<input 
							type="textarea" 
							onChange={e => dispatch({type: "UPDATE_FORM_FIELD", field: "description", value: e.target.value})} 
							value={state.formFields.description}
						/>
						{state.errors.description !== undefined && <span class="form-item-error">{state.errors.description}</span>}
					</div>
				</div>
				<div className="form-row">
					<button onClick={createIssue}>Create</button>
				</div>
				<div className="form-row">
					<button onClick={disable_}>Disable</button>
				</div>
				<div className="form-row">
					{state.log !== undefined && <div className={"form-item-alert " + state.log.type}>{state.log.message}</div>}
				</div>
			</form>
		</>
	);
};

export default CreateIssueForm;