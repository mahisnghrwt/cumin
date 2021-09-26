import IssueItemCompact from "./IssueItemCompact";
import "./issueItem.css";

const IssueList = ({issues}) => {
	const actions = {
		"Show More": () => {}
	}

	return (	
		<div className="sidebar-item">
			<div className="sidebar-item-title">Issues</div>
			{(!issues || (Array.isArray(issues) && issues.length === 0))
			?	<span className="whisper">No issues yet.</span>
			:	<div className="issue-list-sidebar">
					{issues.map(issue => <IssueItemCompact issue={issue} actions={actions} />)}
				</div>
			}
		</div>
	)
}

export default IssueList;