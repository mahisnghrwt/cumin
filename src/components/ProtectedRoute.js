import { Redirect, Route } from "react-router-dom"
import LoginPage from "./LoginPage";
import Global from "../GlobalContext";
import { useContext } from "react";

export const ProtectedRoute = ({children, ...rest}) => {
	const [global, __globalDispatch] = useContext(Global);
	var hasUser = global.user != null || global.user != undefined;

	return (
		<Route exact {...rest}>
			{hasUser
			? children
			: <LoginPage redirectTo={rest.path} />
			}
		</Route>
	)
};