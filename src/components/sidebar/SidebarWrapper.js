import { useReducer } from "react";
import sidebarContext from "./sidebarContext";

const reducer = (state, action) => {
	switch(action.type) {
		case "ADD_TAB":
			return {
				...state,
				tabs: {
					...state.tabs,
					[action.tab.key]: action.tab
				}
			}
		case "REMOVE_TAB": 
			const tabs = {...state.tabs};
			delete tabs[action.tab];
			return {
				...state,
				tabs
			}
		case "SWITCH_TAB":
			return {
				...state,
				activeTab: action.tab
			}
		default:
			throw new Error(`Unkown action type: ${action.type}!`);
	}
}

const SidebarWrapper = ({children, tabs = {}}) => {
	const defaultState = {
		activeTab: "default", 
		tabs: {
			default: {
				key: "default",
				title: "Default"
			},
			...tabs
		}};
	const [state, dispatch] = useReducer(reducer, defaultState);
	
	const addTab = (key, title, content) => {
		dispatch({type: "ADD_TAB", tab: {key, title, content}});
	}

	const removeTab = (key) => {
		dispatch({type: "REMOVE_TAB", tab: key});
	}

	const switchTab = key => {
		dispatch({type: "SWITCH_TAB", tab: key});
	}

	return (
		<sidebarContext.Provider value={{state, addTab, removeTab, switchTab}}>
			{children}
		</sidebarContext.Provider>
	)

}

export default SidebarWrapper;