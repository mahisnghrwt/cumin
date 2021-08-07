import React, { useContext, useReducer, useRef, useState } from "react";
import Global from "../../GlobalContext";
import settings from "../../settings";
import Helper from "../../Helper";

const CreateSprintForm = (props) => {
	const [state, setState] = useState({title: ""});
	const [global, globalDispatch] = useContext(Global);

	const createSprint = async (e) => {
		const POST_SPRINT_URL = settings.API_ROOT + "/project/" + global.project.id + "/sprint";
		const token = localStorage.getItem("token");
		const sprint = {...state, projectId: global.project.id};
		try {
			await Helper.http.request(POST_SPRINT_URL, "POST", token, sprint, false);
			// clear the input field
			setState({title: ""});
		} catch (e) {
			console.error(e);
		}
	}

	if (typeof global.project === "undefined" || global.project.id === undefined) {
		return (
			<pre>
				PLEASE SELECT A PROJECT TO CREATE SPRINT
			</pre>
		)
	}

	return (
		<>
			<h3>Create Sprint</h3>
			<form onSubmit={e => e.preventDefault()}>
				<div className="form-row">
					<div className="form-item sm">
						<label>Sprint title: </label>
						<input type="text" value={state.title} onChange={e => setState({title: e.target.value})} />
					</div>
					<button className="x-sm" onClick={createSprint}>Create</button>	
				</div>
			</form>
		</>
	);
}

export default CreateSprintForm;