import { useReducer } from "react";
import toggleContext from "./toggleContext";
import "./toggleContainer.css";

const reducer = (state, action) => {
	switch(action.type) {
		case "ENABLE":
			return {
				...state,
				enabled: true
			}
		case "DISABLE":
			return {
				...state,
				enabled: false
			}
		case "TOGGLE":
			return {
				...state,
				enabled: !state.enabled
			}
	}
}

const ToggleContainer = ({enabled = true, children}) => {
	const [state, dispatch] = useReducer(reducer, {enabled});

	return (
		<toggleContext.Provider value={[state, dispatch]}>
			<div className="toggle-container">
				{children}
			</div>
		</toggleContext.Provider>
	)
}

export default ToggleContainer;