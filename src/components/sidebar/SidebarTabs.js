import { useContext } from "react";
import { unstable_continueExecution } from "scheduler";
import NavBar from "../NavBar";
import sidebarContext from "./sidebarContext";

/**
 * @param {Object} tabs Representing key->title ||
 * key ~ "sidebar tab content" it is pointing to ||
 * title" ~ title for "tab nav"
 */
const SidebarTabs = ({tabs, switchTab}) => {
	const [sidebarState,,] = useContext(sidebarContext);

	return (
		<div className="sidebar-tabs">
			{Object.values(tabs).map(tabKey => {
				return (
					<button onClick={e => switchTab(tabKey)} className={sidebarState.activeTab === tabKey ? "active" : ""} >
						{tabKey}
					</button>
				);
			})}
		</div>
	)
}

export default SidebarTabs;