import IssueItemCompact from "../issueItem/IssueItemCompact";

const UnassignedIssuesContainer = ({issues}) => {
	return (
		<div className="sprint">
			<div className="sprint-header">
				<span className="sprint-title">
					Unassigned issues
				</span>
			</div>
			<div className="sprint-body">
				{issues.map(issue => <IssueItemCompact key={issue.id} issue={issue} />)}
			</div>
		</div>
	)
}

export default UnassignedIssuesContainer;