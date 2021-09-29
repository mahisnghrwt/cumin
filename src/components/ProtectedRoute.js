import { Redirect, Route } from "react-router-dom"
import Global from "../GlobalContext";
import { useContext } from "react";

export const ProtectedRoute = ({children, ...rest}) => {
	const [global,,] = useContext(Global);
	var hasUser = global.user != null || global.user != undefined;

	const redirectPath = "/login" + ((rest.path === "" || rest.path === "/") ? "" : "?redirect-to=" + rest.path.substr(1));
	return (
		<Route exact {...rest}>
			{hasUser
			? children
			: <Redirect to={redirectPath} />
			}
		</Route>
	)
};