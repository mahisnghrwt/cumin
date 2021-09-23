import { useContext, useEffect, useReducer, useRef } from "react";
import Global from "../../GlobalContext";
import Helper from "../../Helper";
import settings from "../../settings";

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

const CreateEpicForm = ({roadmap, intermediateEpic, clearIntermediateEpic, addEpic}) => {
	const [state, dispatch] = useReducer(reducer, {log: null, errors: {}, values: {title: "", row: 1, startDate: new Date().toDateString(), endDate: new Date().toDateString()}});
	const [global,,] = useContext(Global);

	const submitButtonRef = useRef(null);

	const createEpic = (e) => {
		const url = `${settings.API_ROOT}/project/${global.project.id}/roadmap/${roadmap}/epic`;
		const token = localStorage.getItem("token");


		let createEpicReq = {
			title: state.values.title,
			startDate: intermediateEpic.startDate,
			endDate: intermediateEpic.endDate,
			row: intermediateEpic.row,
			color: intermediateEpic.row
		};

		Helper.http.request(url, "POST", token, createEpicReq, true)
		.then(epicCreated => {
			addEpic(epicCreated);
			clearIntermediateEpic();
		})
		.catch(e => console.error(e));
	}

	useEffect(() => {
		if (intermediateEpic === undefined) {
			submitButtonRef.current.disabled = true;
		}
		else {
			submitButtonRef.current.disabled = false;
		}
	}, [intermediateEpic])

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