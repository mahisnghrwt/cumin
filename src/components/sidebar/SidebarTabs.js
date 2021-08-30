import { useContext } from "react";
import sidebarContext from "./sidebarContext";

const SidebarTabs = () => {
	const {state: sidebarState, switchTab} = useContext(sidebarContext);

	return (
		<div className="sidebar-tabs">
			{Object.keys(sidebarState.tabs).map(tabKey => {
				return (
					<button onClick={e => switchTab(tabKey)} className={sidebarState.activeTab === tabKey ? "active" : ""} >
						{sidebarState.tabs[tabKey].title}
					</button>
				);
			})}
		</div>
	)
}

export default SidebarTabs;