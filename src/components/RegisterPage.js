import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import NavBar from './NavBar';
import Helper from '../Helper';
import settings from "../settings";
import Form, { Input, SubmitButton } from './form/v2/Form';

const RegisterPage = () => {
	const history = useHistory();

	const register = async (formValues) => {
		const url = settings.API_ROOT + "/auth/register";
		const body = {
			username: formValues.username,
			password: formValues.password
		};

		const response = await Helper.fetch(url, "POST", body);

		localStorage.setItem("token", response.token);

		return <>Success! <Link to="/login">login</Link> to continue!</>
	}
	
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
					<h1 className="h1 mb-4">Register</h1>
					<Form formFields={formFields}>
						<Input key="username" kKey="username" label="Username" type="text" />
						<Input key="password" kKey="password" label="Password" type="password" />
						<div className="form-actions">
							<SubmitButton label="Register" kKey="register" onClick={register} />
						</div>
					</Form>
				</div>
			</div>
		</div>
		</>
	);
};

export default RegisterPage;