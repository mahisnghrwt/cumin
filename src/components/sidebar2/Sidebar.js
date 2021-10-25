import { useContext, useEffect, useReducer } from "react";
import sidebarContext from "./sidebarContext";

const reducer = (state, action) => {
	switch(action.type) {
		case "add":
			return {
				...state,
				[action.key]: action.item
			}
		case "remove": 
			const state_ = {...state};
			delete state_[action.key];
			return state_;
		default:
			throw new Error(`Unkown action type: ${action.type}!`);
	}
}

const Sidebar2 = ({children}) => {
	const {dispatch: dispatchWrapper} = useContext(sidebarContext);
	const [state, dispatch] = useReducer(reducer, {});

	useEffect(() => {
		dispatchWrapper({type: "add", key: "dispatch", action: dispatch});
	}, [dispatch, dispatchWrapper])

	if (children === undefined && (!state || Object.keys(state).length === 0)) return null;

	return (
		<div className="Layout-sidebar color-bg-subtle mb-4 mx-4">
			<div className="box p-1">
				{ children }
				{Object.values(state).map(item => item)}
			</div>
		</div>
	)
}

export default Sidebar2;