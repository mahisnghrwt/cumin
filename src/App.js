import React, {useReducer, useEffect, useState } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import BacklogPage from './components/BacklogPage';
import DashboardPage from './components/DashboardPage';
import LoginPage from './components/LoginPage';
import Logout from './components/Logout';
import RegisterPage from './components/RegisterPage';
import Global from "./GlobalContext";
import AlertBar from './components/AlertBar';
import { ProtectedRoute } from './components/ProtectedRoute';
import BoardPage from './components/BoardPage';
import RoadmapPage from './components/RoadmapPage';
import { HttpTransportType, HubConnectionBuilder } from "@microsoft/signalr";

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
	const [connection, setConnection] = useState(null);

	useEffect(() => {
		if (!global.user) return;
		const connect = new HubConnectionBuilder()
		  .withUrl("https://localhost:44343/notification", {transport: HttpTransportType.LongPolling, accessTokenFactory: () => localStorage.getItem("token")})
		  .withAutomaticReconnect()
		  .build();
	
		setConnection(connect);
	  }, [global]);
	
	  useEffect(() => {
		if (connection) {
		  connection
			.start()
			.then(() => {
			  connection.on("ReceiveMessage", (message) => {
				console.log(message);
			  });
			})
			.catch((error) => console.log(error));
		}
	  }, [connection]);

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
						<ProtectedRoute path="/" exact>
							<DashboardPage>
								{alert_ && <AlertBar message={alert_} type="success" />}
							</DashboardPage>
						</ProtectedRoute>
						<Route>
							<h1 style={{color: "red"}}>Page not found.</h1>
						</Route>
					</Switch>
				</Global.Provider>
			</BrowserRouter>
		</div>
	);
}

export default App;