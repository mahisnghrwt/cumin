import { useContext, useReducer } from "react";
import Global from "../../GlobalContext";
import Helper from "../../Helper";
import settings from "../../settings";
import {add} from "date-fns";

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

const CreateEpicForm = (props) => {
	const [state, dispatch] = useReducer(reducer, {log: null, errors: {}, values: {title: "", row: 1}});
	const [global, globalDispatch] = useContext(Global);

	const createEpic = (e) => {
		const url = settings.API_ROOT + "/project/" + global.project.id + "/epic";
		const token = localStorage.getItem("token");

		let createEpicReq = {
			...state.values
		};

		const today = new Date();
		createEpicReq.startDate = today;
		createEpicReq.endDate = add(today, {days: 1});

		Helper.http.request(url, "POST", token, createEpicReq, true)
		.then(epicCreated => console.log(epicCreated))
		.catch(e => console.error(e));
	}

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
							type="text" 
							onChange={e => dispatch({type: "UPDATE_FORM_FIELD", field: "row", value: parseInt(e.target.value)})} 
							value={state.values.row}
						/>
						{state.errors.row !== undefined && <span class="form-item-error">{state.errors.row}</span>}
					</div>
				</div>
				
				<div className="form-row">
					<button onClick={createEpic}>Create</button>
				</div>
				<div className="form-row">
					{state.log !== null && <div className={"form-item-alert " + state.log.type}>{state.log.message}</div>}
				</div>
			</form>
		</>
	);
}

export default CreateEpicForm;