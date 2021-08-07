import React, { useContext, useEffect, useReducer, useRef } from "react";
import socket from "../../webSocket";
import {SOCKET_EVENT} from "../../enums";
import Global from "../../GlobalContext";
import settings from "../../settings";

const fetchMembers = async (projectId) => {
	projectId = projectId.toString();
	const URL = settings.API_ROOT + "/project/" + projectId + "/members";
	const response = await fetch(URL, {
		method: "GET",
		mode: "cors",
		credentials: "include",
		headers: {
			"Authorization": "Bearer " + localStorage.getItem("token"),
			"Content-Type": "application/json"
		}
	});

	if (response.ok) {
		return response.json();
	}

	return null;
}

const reducer = (members, action) => {
	switch(action.type) {
		case "NEW":
			return [...action.members];
		case "ADD":
			return [...members, action.member];
		default:
			console.log(`~ Case nnot defined for ${action.type}!`);
			return;
	}
};

const SUB_KEY = "MEMBER_LIST";

export const MembersList = () => {
	const [global, dispatchGlobal] = useContext(Global);
	const [members, dispatch] = useReducer(reducer, []);

	const mounted = useRef(false);

	const memberJoined = member => {
		if (mounted.current)
			dispatch({type: "ADD", member});
	};

	// will be triggered every rerender, at least thats what I think :P
	useEffect(() => {
		mounted.current = true;
		// fetch the list for active user for the current project
		fetchMembers(global.project.id)
		.then(members => {
			if (mounted.current)
				dispatch({type: "NEW", members});
		})
		.catch(e => console.error(e));
	})

	useEffect(() => {
		socket.addListener(SOCKET_EVENT.NEW_USER_JOINED, SUB_KEY, memberJoined);

		return () => socket.removeListener(SOCKET_EVENT.NEW_USER_JOINED, SUB_KEY);
	}, []);

	return (
	<>
		<h3>Members</h3>
		<ul>
			{members.map(x => {
				return <li>{x.username}</li>
			})}
		</ul>
	</>
	)
};