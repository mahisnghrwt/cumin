import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import NavBar from './NavBar';
import AlertBar from './AlertBar';
import Helper from '../Helper';
import settings from "../settings";

const apiUserRegistrationUrl = settings.API_ROOT + "/auth/register";
const apiUserLoginUrl = settings.API_ROOT + "/auth/login";

const RegisterPage = (props) => {
	const [state, setState] = useState({ username: "", password: "" });
	const [alert, setAlert] = useState({enabled: false, message: "", type: ""});
	const history_ = useHistory();

	const usernameChanged = e => {
		setState(prev => {
			return {
				...prev,
				username: e.target.value
			}
		});
	}

	const passwordChanged = e => {
		setState(prev => {
			return {
				...prev,
				password: e.target.value
			}
		});
	}

	const register = () => {
		if (state.username === "" || state.password === "") {
			throwAlert(<span>username or password is missing!</span>, "danger");
			return;
		}

		var ok = true;
		// make a call to the api and register the user
		const options = {
			method: "POST",
			mode: "cors",
			headers: {
				"Content-Type": "application/json"
			},
			body: JSON.stringify({
				Username: state.username,
				Password: state.password
			})
		};
		fetch(apiUserRegistrationUrl, options)
		.then(response => {
			if (response.ok === false) {
				ok = false;
				throwAlert(<span>Something went wrong in the backend!</span>, "danger");
				return;
			}

			throwAlert(<span>Successfully registered! Please <a href="/login">login</a> to continue!</span>, "success");
		})
		.catch(error => console.error(error));
	}

	const throwAlert = (message, type) => {
		setAlert(_ => ({
			message,
			type,
			enabled: true
		}));
	}

	const AlertBarI = () => {
		if (alert.enabled === false)
			return null;
		
		return <AlertBar message={alert.message} type={alert.type} /> 
	}

	return (
		<div className="wrapper">
			<AlertBarI />
			<NavBar loggedIn={false} />
			<div className="wrapper flex justify-content-center align-items-center">
				<div className="login-form">
					<div className="input-group">
						<label for="username-input-field">Username</label>
						<input type="text" id="username-input-field" value={state.username} onChange={usernameChanged}></input>
					</div>
					<div className="input-group">
						<label for="password-input-field">Password</label>
						<input type="password" id="password-input-field" value={state.password} onChange={passwordChanged} />
					</div>
					<div className="form-button-group">
						<button onClick={register}>Register</button>
					</div>
				</div>
			</div>
		</div>
	);
};

export default RegisterPage;