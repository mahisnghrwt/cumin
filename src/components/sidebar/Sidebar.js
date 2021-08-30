import { useReducer } from "react";
import sidebarContext from "./sidebarContext";
import SidebarTabs from "./SidebarTabs";
import "./sidebar.css";

const reducer = (state, action) => {
	switch(action.type) {
		case "SWITCH_TAB":
			return {
				...state,
				activeTab: action.tab
			}
	}
}

const Sidebar = ({tabs, defaultTab = null, children, ...restProps}) => {
	const [sidebarState, sidebarDispatch] = useReducer(reducer, {activeTab: defaultTab, defaultTab});

	const switchTab = tabKey => {
		sidebarDispatch({type: "SWITCH_TAB", tab: tabKey})
	}

	return (
		<sidebarContext.Provider value={[sidebarState, sidebarDispatch]}>
			<div className="sidebar" {...restProps}>
				<SidebarTabs tabs={tabs} switchTab={switchTab} />
				{children}
			</div>
		</sidebarContext.Provider>
	)
}

export default Sidebar;

/**
 * What is a sidebar?
 * sidebar -> tabs
 * tab -> key, title, children/content, f() close tab
 * 
 * API
 * Add tabs
 * Remove tabs
 * Switch tab
 */