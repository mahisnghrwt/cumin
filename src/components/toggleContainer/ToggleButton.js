import { useContext } from "react";
import toggleContext from "./toggleContext";

const ToggleButton = ({expandText, collapseText, ...rest}) => {
	const {isExpanded, dispatch} = useContext(toggleContext);

	const toggle = e => {
		dispatch({type: "toggle"});
	}

	return <button {...rest} onClick={toggle}>{isExpanded ? collapseText : expandText}</button>
}

export default ToggleButton;