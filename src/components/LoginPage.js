import React, { useEffect, useCallback, useReducer, useContext } from 'react';
import NavBar from './NavBar';
import Helper from '../Helper';
import socket from '../webSocket';
import settings from "../settings";
import Global from '../GlobalContext';
import { useHistory, useLocation } from 'react-router-dom';

const userLoginApiUrl = settings.API_ROOT + "/auth/login";
const userTokenValidateApiUrl = settings.API_ROOT + "/auth";

const FIELDS = {
	username: "username",
	password: "password"
};

const reducer = (state, action) => {
	switch(action.type) {
		case "UPDATE_USERNAME":
			return {
				...state,
				username: {
					...state.username,
					value: action.value
				}
			}
		case "UPDATE_PASSWORD":
			return {
				...state,
				password: {
					...state.password,
					value: action.value
				}
			}
		default:
			throw new Error("Unknown action.type: " + action.type);
	}
}

const LoginPage = ({location: location_}) => {
	const [global, globalDispatch] = useContext(Global);
	const [state, dispatch] = useReducer(reducer, {
		[FIELDS.username]: {
			value: "",
			error: ""
		},
		[FIELDS.password]: {
			value: "",
			error: ""
		}
	})

	const history_ = useHistory();
	const location__ = useLocation();
	const params = new URLSearchParams(location__.search);
	const redirectTo = params.get("redirect-to");
	
	const setUserAndProject = (user, project) => {
		globalDispatch({type: "PATCH", patch: {user, project}});
	}

	const startSession = (user, project, token) => {
		// save token
		localStorage.setItem("token", token);
		// save user and project in context
		setUserAndProject(user, project);
	}

	const redirectOnSuccess = () => {
		history_.push(`/${redirectTo === null ? "" : redirectTo}`)
	}

	const login = (e) => {
		e.preventDefault();
		if (state.username.value === "" || state.password.value === "") {
			// perform input validation here
			// set the relevant error
			return;
		}

		const body = { username: state.username.value, password: state.password.value }

		try {
			Helper.http.request(userLoginApiUrl, "POST", null, body, true)
			.then(response => {
				startSession(response.user, response.user.activeProject, response.token);
				//redirectOnSuccess();
			})
			.catch(e => console.error(e));
			
		} catch (e) {
			console.error(e);
		}
	}

	const authWithLocalToken = useCallback(async () => {
		const token = localStorage.getItem("token");
		// if has token, check whether it is valid
		if (token != null) {
			try {
				const response =  await Helper.http.request(userTokenValidateApiUrl, "GET", token, null, true);
				startSession(response, response.activeProject, token);
				//redirectOnSuccess();
			} catch (e) {
				localStorage.removeItem("token");
				console.error(e);
			}
		}
	}, [])

	useEffect(() => {
		authWithLocalToken();
	}, [])

	useEffect(() => {
		if (global.user !== null && global.project !== null) {
			redirectOnSuccess();
		}
	}, [global.user, global.project]);


	const updateFieldValue = (field, value) => {
		dispatch({
				type: "UPDATE_" + field.toUpperCase(),
				value: value
			})
	}

	return (
		<>
			<NavBar loggedIn={false} activePage={"Login"} />
			<div className="content">
				<h1>Login</h1>
				<form onSubmit={e => e.preventDefault()}>
					<div className="form-row">
						<div className="form-item sm">
							<label>Username</label>
							<input 
								type="text" 
								id="username-input-field" 
								value={state.username.value} 
								onChange={(e) => updateFieldValue(FIELDS.username, e.target.value)}>
							</input>
						</div>
					</div>
					<div className="form-row">
						<div className="form-item sm">
							<label>Password</label>
							<input 
								type="password" 
								id="password-input-field" 
								value={state.password.value} 
								onChange={(e) => updateFieldValue(FIELDS.password, e.target.value)} 
							/>
						</div>
					</div>
					<div className="form-row">
						<button className="std-button sm" onClick={login}>Login</button>
					</div>
				</form>
			</div>
		</>
	);
};

export default LoginPage;