import { useReducer } from "react";
import sidebarContext from "./sidebarContext";

const reducer = (state, action) => {
	switch(action.type) {
		case "add":
			return {
				...state,
				[action.key]: action.action
			}
		case "remove": 
			const state_ = {...state};
			delete state_[action.key];
			return state_;
		default:
			throw new Error(`Unkown action type: ${action.type}!`);
	}
}

const SidebarWrapper2 = ({children}) => {
	const [state, dispatch] = useReducer(reducer, {});

	return (
		<sidebarContext.Provider value={{
			state: state,
			dispatch: dispatch
		}}>
			{children}
		</sidebarContext.Provider>
	)

}

export default SidebarWrapper2;