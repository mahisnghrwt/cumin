import React, { useEffect } from 'react';
import { useHistory } from 'react-router';

const Logout = ({user, setUser}) => {
	const history_ = useHistory();

	useEffect(() => {
		// delete the token from localstorage to logout :)
		localStorage.removeItem("token");

		setUser(null);

		// redirect the user back to login page
		history_.push('/');
	}, [])

	return null;
};

export default Logout;