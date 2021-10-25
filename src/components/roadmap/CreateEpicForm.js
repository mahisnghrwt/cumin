import { useContext, useEffect, useReducer, useRef } from "react";
import Global from "../../GlobalContext";
import Helper from "../../Helper";
import settings from "../../settings";
import Form, {Input, Textarea, Select, SubmitButton} from "../form/v2/Form";

const defaultEpicColor = "#7ed6df";

const reducer = (state, action) => {
	switch(action.type) {
		case "UPDATE_FORM_FIELD":
			return {
				...state,
				values: {
					...state.values,
					[action.field]: action.value
				}
			}
	}
}

const DateRow = ({startDate, endDate}) => {
	if (!(startDate instanceof Date) || !(endDate instanceof Date))
		return null;

	return (
		<div className="form-row">
			<div className="form-item sm">
				<label>Start date: </label>
				<input 
					type="date" 
					// onChange={e => dispatch({type: "UPDATE_FORM_FIELD", field: "title", value: e.target.value})} 
					value={Helper.dateToInputString(startDate)}
					disabled
				/>
				{/* {state.errors.title !== undefined && <span class="form-item-error">{state.errors.title}</span>} */}
			</div>
			<div className="form-item sm">
				<label>End date: </label>
				<input 
					type="date" 
					// onChange={e => dispatch({type: "UPDATE_FORM_FIELD", field: "row", value: parseInt(e.target.value)})} 
					value={Helper.dateToInputString(endDate)}
					disabled
				/>
				{/* {state.errors.row !== undefined && <span class="form-item-error">{state.errors.row}</span>} */}
			</div>
		</div>
	)
}

const CreateEpicForm = ({intermediateEpic, clearIntermediateEpic, addEpic}) => {
	const [state, dispatch] = useReducer(reducer, {log: null, errors: {}, values: {title: "", row: 1, startDate: new Date().toDateString(), endDate: new Date().toDateString()}});
	const [global,,] = useContext(Global);

	const submitButtonRef = useRef(null);

	const formFields = {
		title: {
			value: "",
			validate: title => {
				if (!title || title.trim().length === 0)
					return "Title is required.";
			}
		},
		row: {
			value: intermediateEpic.row,
			validate: row => {
				if (!row)
					return "Row is required.";
			}
		},
		startDate: {
			value: Helper.dateToInputString(intermediateEpic.startDate),
			validate: startDate => {
				if (!startDate)
					return "Start Date is required.";
			}
		},
		endDate: {
			value: Helper.dateToInputString(intermediateEpic.endDate),
			validate: endDate => {
				if (!endDate)
					return "End Date is required.";
			}
		},
		color: {
			value: intermediateEpic.color,
			validate: color => {
				if (!color || color.trim().length === 0)
					return "Color is required.";
			}
		}
	}

	const createEpic = async (formValues) => {
		const url = `${settings.API_ROOT}/project/${global.project.id}/epic`;
		const token = localStorage.getItem("token");
		
		let createEpicReq = {
			title: formValues.title,
			startDate: new Date(formValues.startDate),
			endDate: new Date(formValues.endDate),
			row: parseInt(formValues.row),
			color: formValues.color
		};

		const epicCreated = await Helper.http.request(url, "POST", token, createEpicReq, true);
		addEpic(epicCreated);
		clearIntermediateEpic();
	}

	// useEffect(() => {
	// 	if (intermediateEpic === undefined) {
	// 		submitButtonRef.current.disabled = true;
	// 	}
	// 	else {
	// 		submitButtonRef.current.disabled = false;
	// 	}
	// }, [intermediateEpic])

	return (
		<div className="Box Box--condensed border-0 color-bg-subtle p-2">
			<h4 className="h4">Create Epic</h4>
			<Form formFields={formFields}>
				<Input kKey="title" label="Title" key="title" type="text" classNameAppend="input-sm" />
				<Input kKey="startDate" label="Start Date" key="startDate" type="date" classNameAppend="input-sm" />
				<Input kKey="endDate" label="End Date" key="endDate" type="date" classNameAppend="input-sm" />
				<Input kKey="row" label="Row" key="row" type="number" classNameAppend="width-auto input-sm" disabled />
				<Input kKey="color" label="Color" key="color" type="text" classNameAppend="width-auto input-sm" disabled />
				<div class="form-actions">
					<SubmitButton label="Create" onClick={createEpic} />
					<button onClick={clearIntermediateEpic} className="btn btn-danger" type="button">Cancel</button>
				</div>
			</Form>
		</div>
	)

	return (
		<>
			<h3>Create Epic</h3>
			<form onSubmit={e => e.preventDefault()}>
				<div className="form-row">
					<div className="form-item sm">
						<label>Title: </label>
						<input 
							type="text" 
							onChange={e => dispatch({type: "UPDATE_FORM_FIELD", field: "title", value: e.target.value})} 
							value={state.values.title}
						/>
						{state.errors.title !== undefined && <span class="form-item-error">{state.errors.title}</span>}
					</div>
					<div className="form-item sm">
						<label>Row: </label>
						<input 
							type="number" 
							// onChange={e => dispatch({type: "UPDATE_FORM_FIELD", field: "row", value: parseInt(e.target.value)})} 
							value={!intermediateEpic ? 0 : intermediateEpic.row}
							disabled
						/>
						{state.errors.row !== undefined && <span class="form-item-error">{state.errors.row}</span>}
					</div>
				</div>
				
				{intermediateEpic && <DateRow startDate={intermediateEpic.startDate} endDate={intermediateEpic.endDate} />}
				
				<div className="form-row">
					<button className="std-button" ref={submitButtonRef} onClick={createEpic}>Create</button>
					{intermediateEpic && <button className="std-button bg-red" onClick={clearIntermediateEpic}>Cancel</button>}
				</div>
				<div className="form-row">
					{state.log !== null && <div className={"form-item-alert " + state.log.type}>{state.log.message}</div>}
				</div>
			</form>
		</>
	);
}

export default CreateEpicForm;