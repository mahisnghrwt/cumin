import "./sprint.css";
import ProgressBar from "../progressBar/ProgressBar";
import IssueItemCompact from "../issueItem/IssueItemCompact";
import issueStatus from "../issue/issueStatus";

const issueStatusKey = {
	"Todo": "TODO",
	"In Progress": "IN_PROGRESS",
	"Done": "DONE"
}

const calcProgress = issues => {
	if (!issues || issues.length === 0) return 0;

	const reducer = (prev, current) => {
		const key = issueStatusKey[current.status];
		if (key !== undefined)
			return prev + (issueStatus[key] ? issueStatus[key].progress : 0)
		return 0;
	}

	return issues.reduce(reducer, 0) / issues.length;
}

const Sprint = ({sprint, bubbleMouseEvent, updateIssueSprint}) => {
	const progress = (!sprint.issue || Object.keys(sprint.issue).length === 0) ? 0 : calcProgress(Object.values(sprint.issue));

	return (
		<div className="sprint">
			<div className="sprint-header">
				<span className="sprint-id">
					{sprint.id}
				</span>
				<span className="sprint-title">
					{sprint.title}
				</span>
				<span className="sprint-progress">
					<ProgressBar progress={progress} />
				</span>
				<span className="sprint-buttons">
					<button onClick={e => bubbleMouseEvent({type: "editSprint", sprintId: sprint.id})} className="sm-button border-button">Edit</button>
					<button onClick={e => bubbleMouseEvent({type: "deleteSprint", sprintId: sprint.id})} className="sm-button border-button">Delete</button>
					<span>|</span>
					<button onClick={e => bubbleMouseEvent({type: "toggleActiveSprint", sprintId: sprint.id})} className="sm-button border-button">{sprint.active ? "End" : "Start"}</button>
				</span>
			</div>
			<div className="sprint-body">
				{Object.values(sprint.issue).map(issue => <IssueItemCompact key={issue.id} issue={issue} />)}
			</div>
		</div>
	)
}

export default Sprint;