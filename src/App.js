import React, { createContext, useEffect, useReducer, useState } from 'react';
import { BrowserRouter, Switch, Route, useHistory, Redirect } from 'react-router-dom';
import BacklogPage from './components/BacklogPage';
import DashboardPage from './components/DashboardPage';
import LoginPage from './components/LoginPage';
import Logout from './components/Logout';
import RegisterPage from './components/RegisterPage';
import Global from "./GlobalContext";
import socket from "./webSocket";
import { SOCKET_EVENT } from './enums';
import AlertBar from './components/AlertBar';
import { ProtectedRoute } from './components/ProtectedRoute';
import BoardPage from './components/BoardPage';
import RoadmapPage from './components/RoadmapPage';

const reducer = (state, action) => {
	switch(action.type) {
		case "UPDATE_PROJECT":
			return {
				...state,
				project: {
					...action.project
				}
			}
		case "UPDATE_USER":
			return {
				...state,
				user: action.user
			}
		case "PATCH": 
			return {
				...state,
				...action.patch
			}
	}
};

const defaultGlobal = {
	user: null, 
	project: null,
	isPm: function() {
		return (this.user && this.user.role === "Project Manager")
	}
}

function App() {
	const [global, globalDispatch] = useReducer(reducer, defaultGlobal);
	const [alert_, setAlert_] = useState(null);

	// push notification
	const invitationReceived = invite => {
		setAlert_(() => `You have been invited to project ${invite.project.name} by ${invite.inviter.username}!`);
	};

	const newUserJoined = data => {
		setAlert_(() => `${data.invitee.username} has joined the project ${data.project.name}!`);
	}
	
	useEffect(() => {
		socket.addListener(SOCKET_EVENT.INVITATION_RECEIVED, "APP", invitationReceived);
		socket.addListener(SOCKET_EVENT.NEW_USER_JOINED, "APP", newUserJoined);

		return () => {
			socket.removeListener(SOCKET_EVENT.INVITATION_RECEIVED);
			socket.removeListener(SOCKET_EVENT.NEW_USER_JOINED);
		}
	}, []);

	return (
		<div className="App">
			<BrowserRouter>
				<Global.Provider value={[global, globalDispatch]}>
					<Switch>
						<Route path="/login" exact>
							<LoginPage />
						</Route>
						<Route path="/register" exact>
							<RegisterPage />
						</Route>
						<ProtectedRoute path="/roadmap" exact>
							<RoadmapPage />
						</ProtectedRoute>
						<ProtectedRoute path="/backlog" exact>
							<BacklogPage />
						</ProtectedRoute>
						<ProtectedRoute path="/logout" exact>
							<Logout />
						</ProtectedRoute>
						<ProtectedRoute path="/board" exact>
							<BoardPage />
						</ProtectedRoute>
						<ProtectedRoute path="/">
							<DashboardPage>
								{alert_ && <AlertBar message={alert_} type="success" />}
							</DashboardPage>
						</ProtectedRoute>
						
					</Switch>
				</Global.Provider>
			</BrowserRouter>
		</div>
	);
}

export default App;