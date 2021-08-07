import React, {useContext, useReducer} from "react";
import Global from "../../GlobalContext";
import settings from "../../settings";
import Helper from "../../Helper";
import AlertBar from "../AlertBar";

const reducer = (state, action) => {
	switch(action.type) {	
		case "REPLACE":
			return action.username;
	}
}

export const AddMember = ({throwAlert}) => {
	const [username, dispatch] = useReducer(reducer, "");
	const [global, dispatchGlobal] = useContext(Global);
	
	let projectSelected = true;

	if (global.project === null || global.project === undefined)
		projectSelected = false;

	const invite = async (e) => {
		const makeInviteUrl = (projectId) => {
			return settings.API_ROOT + "/project/" + projectId.toString() + "/user/invite";
		}

		const INVITE_URL = settings.API_ROOT + "/invite";
		
		const response = await fetch(INVITE_URL, {
			method: "POST",
			mode: "cors",
			headers: {
				"Content-Type": "application/json",
				"Authorization": "Bearer " + localStorage.getItem("token")
			},
			body: JSON.stringify({
				inviteeUsername: username,
				projectId: parseInt(global.project.id)
			}),
			withCredentials: true,
			credentials: "include",
		});
		
		if (response.ok) {
			throwAlert(<AlertBar key={new Date().getMilliseconds()} message={`Invitation sent to ${username}!`} type="success" createdAt={new Date()} />);
		}
		else {
			throwAlert(<AlertBar key={new Date().getMilliseconds()} message={`Some error occured!`} type="danger" createdAt={new Date()} />);
			Helper.logHttpResponseError(response);
		}

		// clear the input field
		dispatch({type: "REPLACE", username: ""});
	}

	return (
		<>
			<h3>Invite</h3>
			<pre>
				{projectSelected === false
				? <>Please select a project to invite a user to.</>
				: <>
					Username: 
					<input 
						type="text" 
						placeholder="John Doe" 
						onChange={(e) => dispatch({type: "REPLACE", username: e.target.value})} 
						value={username} 
					/>
					<button onClick={invite}>Invite</button>
				</>}
			</pre>
		</>
	)
};