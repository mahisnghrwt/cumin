import { faHeartBroken } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import IssueItemDetailed from "../issueItem/IssueItemDetailed";

const UnassignedIssuesContainer = ({issues, updateIssueSprint, issueEditHandler}) => {
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
		<div className="Box Box--condensed mb-4" onDragOver={dragOverHandler} onDrop={dropHandler}>
			<div className="Box-header">
				<h3 className="Box-title d-inline-block">Open Issues </h3>
				<span className="Counter ml-2">{issues.length}</span>
			</div>
			{Object.keys(issues).length === 0
			&& <div class="blankslate">
				<FontAwesomeIcon className="h4" icon={ faHeartBroken } />
				<p>No open issues.</p>
			</div>}
			{ issues.map(issue => <IssueItemDetailed key={issue.id} forPage="backlog" issue={issue} omit={{assignedToId: true}} editHandler={ issueEditHandler } />) }
		</div>
	)
}

export default UnassignedIssuesContainer;