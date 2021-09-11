import { Redirect, Route } from "react-router-dom"
import Global from "../GlobalContext";
import { useContext } from "react";

export const ProtectedRoute = ({children, ...rest}) => {
	const [global,,] = useContext(Global);
	var hasUser = global.user != null || global.user != undefined;

	return (
		<Route exact {...rest}>
			{hasUser
			? children
			: <Redirect to={{
				pathname: "/login",
				state: {
					referrer: rest.path
				}
			}} />
			}
		</Route>
	)
};