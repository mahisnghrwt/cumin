import { useContext } from "react";
import toggleContext from "./toggleContext";

const ToggleBody = ({children}) => {
	const [state,,] = useContext(toggleContext);

	if (state.enabled === false) return null;

	return (<>{children}</>);
}

export default ToggleBody;