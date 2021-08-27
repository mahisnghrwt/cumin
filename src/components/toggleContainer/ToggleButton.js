import { useContext } from "react"
import toggleContext from "./toggleContext";

/**
 * @desc on === undefined -> will work as a toggle button
 */
const ToggleButton = ({children, on, ...restProps}) => {
	const [state, dispatch] = useContext(toggleContext);

	if (on === state.enabled) return null;

	const toggleButton = () => {
		if (on === undefined) dispatch({type: "TOGGLE"});
		dispatch({type: on ? "ENABLE": "DISABLE"});
	}

	return (
		<button className="toggle-button" {...restProps} onClick={toggleButton}>{children}</button>
	)
}

export default ToggleButton;