import IssueItemCompact from "./IssueItemCompact";
import "./issueItem.css";

const IssueList = ({issues}) => {
	if (!issues) return null;

	const actions = {
		"Show More": () => {}
	}

	return (	
		<div>
			<h3>Issues</h3>
			<div className="issue-list-sidebar">
				{issues.map(issue => <IssueItemCompact issue={issue} actions={actions} />)}
			</div>
		</div>
	)
}

export default IssueList;