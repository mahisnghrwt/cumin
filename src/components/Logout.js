import React, { useContext, useEffect } from 'react';
import { useHistory } from 'react-router';
import Global from '../GlobalContext';

const Logout = () => {
	const history_ = useHistory();
	const [,globalDispatch] = useContext(Global);

	useEffect(() => {
		// delete the token from localstorage to logout :)
		localStorage.removeItem("token");
		debugger;
		globalDispatch({type: "update", update: null});

		// redirect the user back to login page
		history_.push('/');
	}, [])

	return (
		<span>Logging out<span className="AnimatedEllipsis" /></span>
	)

};

export default Logout;