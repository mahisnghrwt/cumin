import { useContext } from "react";
import sidebarContext from "./sidebarContext";
import SidebarTabs from "./SidebarTabs";
import "./sidebar.css";
import SidebarTabContent from "./SidebarTabContent";

const Sidebar = ({children, ...restProps}) => {
	const {state} = useContext(sidebarContext);

	return (
		<div className="sidebar" {...restProps}>
			<SidebarTabs />
			{(state.tabs[state.activeTab] === undefined || state.activeTab === "default")
			? children
			: <SidebarTabContent>{state.tabs[state.activeTab].content}</SidebarTabContent>
			}
		</div>
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