import IssueItemDetailed from "../issueItem/IssueItemDetailed";

const Board = ({title, issues = [], patchIssueStatus}) => {
	const dragOverHandler = e => {
		e.preventDefault();
		e.stopPropagation();
	}

	const drophandler = e => {
		e.preventDefault();
		e.stopPropagation();

		const issueJsonString = e.dataTransfer.getData("issue");
		const issue = JSON.parse(issueJsonString);

		// no need to patch picked and dropped on same board
		if (issue.oldStatus === title) return;

		patchIssueStatus(issue.id, issue.oldStatus, title);
	}

	return (
		<div className="board" onDragOver={dragOverHandler} onDrop={drophandler}>
			<div className="board-title">{title}</div>
			<div className="board-list-space">
				{issues.map(issue => <IssueItemDetailed issue={issue} />)}
			</div>
		</div>
	)
}

export default Board;