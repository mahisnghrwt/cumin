import IssueItemCompact from "../issueItem/IssueItemCompact";

const UnassignedIssuesContainer = ({issues, updateIssueSprint}) => {
	const dragOverHandler = e => {
		e.preventDefault();
		e.stopPropagation();
	}

	const dropHandler = e => {
		e.preventDefault();
		e.stopPropagation();

		const data = JSON.parse(e.dataTransfer.getData("issue"));

		// ignore if issue dropped on sprint it was picked from
		if (data.oldSprintId === null) return;

		updateIssueSprint(data.issueId, data.oldSprintId, null);
	}

	return (
		<div className="sprint" onDragOver={dragOverHandler} onDrop={dropHandler}>
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