import "./issueItem.css";
import DependencyCompact from "./DependencyCompact";

const DependencyList = ({dependencies}) => {
	if (!dependencies) return null;

	return (	
		<div className="sidebar-item">
			<div className="sidebar-item-title">Dependencies</div>
			{(!dependencies || (Array.isArray(dependencies) && dependencies.length === 0))
			?	<span className="whisper">Epic has no dependencies.</span>
			:	<div className="issue-list-sidebar">
					{dependencies.map(epic => <DependencyCompact epic={epic} />)}
				</div>
			}
		</div>
	)
}

export default DependencyList;