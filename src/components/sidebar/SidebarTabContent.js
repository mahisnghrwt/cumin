import { useContext } from "react";
import sidebarContext from "./sidebarContext";

const SidebarTabContent = ({kKey, children}) => {
	const [sidebarState,,] = useContext(sidebarContext);

	if (sidebarState.activeTab !== kKey) return null;

	return (
		<div className="sidebar-tab-content">
			{children}
		</div>
	)

}

export default SidebarTabContent;