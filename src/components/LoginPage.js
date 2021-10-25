import React, { useEffect, useCallback, useContext } from 'react';
import NavBar from './NavBar';
import Helper from '../Helper';
import settings from "../settings";
import Global from '../GlobalContext';
import { useHistory, useLocation } from 'react-router-dom';
import Form, {Input, SubmitButton} from "./form/v2/Form";

const LoginPage = () => {
	const [, globalDispatch] = useContext(Global);

	const history_ = useHistory();
	const location__ = useLocation();
	const params = new URLSearchParams(location__.search);
	const redirectTo = params.get("redirect-to");
	
	const startSession = (user, project, token) => {
		// save token
		localStorage.setItem("token", token);
		// save user and project in context
		globalDispatch({type: "PATCH", patch: {user, project}});
		redirectOnSuccess();
	}

	const redirectOnSuccess = () => {
		history_.push(`/${(redirectTo === null) ? "" : redirectTo}`)
	}

	const login = async (formValues) => {
		const url = settings.API_ROOT + "/auth/login";
		const body = { username: formValues.username, password: formValues.password }

		try {
			const response = await Helper.fetch(url, "POST", body);
			startSession(response.user, response.project, response.token);			
		} catch (e) {
			console.error(e);
		}
	}

	const authWithLocalToken = useCallback(async () => {
		const userTokenValidateApiUrl = settings.API_ROOT + "/auth";
		const token = localStorage.getItem("token");
		// if has token, check whether it is valid
		if (token != null) {
			try {
				const response =  await Helper.fetch(userTokenValidateApiUrl, "GET", null);
				startSession(response.user, response.project, token);
				//redirectOnSuccess();
			} catch (e) {
				localStorage.removeItem("token");
				console.error(e);
			}
		}
	}, [])

	useEffect(() => {
		authWithLocalToken();
	}, []);

	const formFields = {
		username: {
			value: "",
			validate: username => {
				if (!username || username.trim().length === 0)
					return "Username is required.";
			}
		},
		password: {
			value: "",
			validate: password => {
				if (!password || password.trim().length === 0)
					return "Username is required.";
			}
		},
	}

	return (
		<>
		<NavBar />
		<div className="Layout container-sm">
			<div className="Layout-main">
				<div className="Box p-2" style={{width: "50%"}}>
					<h1 className="h1 mb-4">Login</h1>
					<Form formFields={formFields}>
						<Input key="username" kKey="username" label="Username" type="text" />
						<Input key="password" kKey="password" label="Password" type="password" />
						<div className="form-actions">
							<SubmitButton label="Login" kKey="login" onClick={login} />
						</div>
					</Form>
				</div>
			</div>
		</div>
		</>
	);
};

export default LoginPage;