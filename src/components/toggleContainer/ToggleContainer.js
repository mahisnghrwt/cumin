import { useReducer } from "react";
import toggleContext from "./toggleContext";
import "./toggleContainer.css";

const reducer = (state, action) => {
	switch(action.type) {
		case "expand":
			return true;
		case "collapse":
			return false;
		case "toggle":
			return !state;
	}
}

const ToggleContainer = ({expanded, children}) => {
	const [isExpanded, dispatch] = useReducer(reducer, expanded);

	return (
		<toggleContext.Provider value={{isExpanded, dispatch}}>
			<div className="toggle-container">
				{children}
			</div>
		</toggleContext.Provider>
	)
}

export default ToggleContainer;