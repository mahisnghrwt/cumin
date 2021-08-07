import React, { useCallback, useContext, useEffect, useReducer, useRef } from "react";
import socket from "../../webSocket";
import {SOCKET_EVENT} from "../../enums";
import settings from "../../settings";
import Global from "../../GlobalContext";

const PENDING_INVITES_URL = settings.API_ROOT + "/invite/pending";
const ACCEPT_INVITE_URL = settings.API_ROOT + "/invite/accept";
const REJECT_INVITE_URL = settings.API_ROOT + "/invite/reject";

const reducer_ = (state, action) => {
	switch(action.type) {
		case "NEW":
			return [...action.invitations];
		case "ADD":
			return [...state, action.invite];
		case "REMOVE":
			return state.filter(x => x.id != action.id);
	}
}

const InvitationList = ({addProject}) => {
	const mounted = useRef(true);
	const [global, dispatchGlobal] = useContext(Global);
	const [invitations, dispatch] = useReducer(reducer_, []);

	const pushInvitation = invite => {
		if (mounted.current === false)
			return;
		dispatch({type: "ADD", invite});
	}	

	useEffect(() => {
		mounted.current = true;
		socket.addListener(SOCKET_EVENT.INVITATION_RECEIVED, "INVITATION_LIST", pushInvitation);

		// get the list of pending invitations
		let ok = true;
		fetch(PENDING_INVITES_URL, {
			method: "GET",
			mode: "cors",
			credentials: "include",
			headers: {
				"Authorization": "Bearer " + localStorage.getItem("token"),
				"Content-Type": "application/json"
			}
		})
		.then(response => {
			ok = response.ok;
			if (response.ok) {
				return response.json();
			}
		})
		.then(invitations => {
			console.log(invitations);
			if (ok && mounted.current) {
				dispatch({type: "NEW", invitations});
			}
		})
		.catch(error => console.log(error));

		return () => {
			mounted.current = false;
			socket.removeListener(SOCKET_EVENT.INVITATION_RECEIVED, "INVITATION_LIST");
		}
	}, [])

	const accept = async invitationId => {
		const response = await fetch(ACCEPT_INVITE_URL + "/" + invitationId.toString(), {
			method: "GET",
			mode: "cors",
			withCredentials: true,
			credentials: "include",
			headers: {
				"Authorization": "Bearer " + localStorage.getItem("token"),
				"Content-Type": "application/json"
			}
		});

		if (response.ok) {
			dispatch({type: "REMOVE", id: invitationId});
		}

		const project = await response.json();
		addProject(project);
	}

	const reject = async invitationId => {
		const response = await fetch(REJECT_INVITE_URL + "/" + invitationId.toString(), {
			method: "GET",
			mode: "cors",
			credentials: "include",
			headers: {
				"Authorization": "Bearer " + localStorage.getItem("token"),
				"Content-Type": "application/json"
			}
		});

		if (response.ok) {
			dispatch({type: "REMOVE", id: invitationId});
		}
	}

	return (
		<>
			<h3>Pending invitations</h3>
			<pre>
				{invitations.length === 0
				? <>No pending invitations!</>
				: <ul>
				{invitations.map(x => {
					return <li>
						{`${x.inviter.username} invited to join project ${x.project.name}`} 
						<button className="button-sml success-background" onClick={() => accept(x.id)}>Accept</button> 
						<button className="button-sml danger-background" onClick={() => reject(x.id)}>Reject</button>
					</li>
				})}
				</ul>
				}
			</pre>
		</>
	)
}

export default InvitationList;