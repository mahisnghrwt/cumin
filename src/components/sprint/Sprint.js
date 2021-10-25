import { faHeartBroken } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import issueStatus from "../issue/issueStatus";
import IssueItemDetailed from "../issueItem/IssueItemDetailed";

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

const Sprint = ({sprint, isActive, bubbleMouseEvent, updateIssueSprint, issueEditHandler}) => {
	const progress = (!sprint.issue || Object.keys(sprint.issue).length === 0) ? 0 : calcProgress(Object.values(sprint.issue));

	const dragOverHandler = e => {
		e.preventDefault();
		e.stopPropagation();
	}

	const dropHandler = e => {
		e.preventDefault();
		e.stopPropagation();

		const data = JSON.parse(e.dataTransfer.getData("issue"));

		// ignore if issue dropped on sprint it was picked from
		if (data.oldSprintId === sprint.id) return;

		updateIssueSprint(data.issueId, data.oldSprintId, sprint.id);
	}

	return (
		<div className="Box Box--condensed mb-4" onDragOver={dragOverHandler} onDrop={dropHandler}>
			<div className="Box-header">
				<div className="Box-title d-flex flex-row flex-items-center">
					<span>{sprint.title}</span>
					<span className="Progress ml-2" style={{width: "10%"}}>
						<span className="Progress-item color-bg-success-emphasis" style={{width: `${progress}%`}}></span>
					</span>
					{ isActive && <span class="Label ml-2 Label--success">Active</span> }
					<span className="flex-1" />
					<span className="float-right">
						<button className="btn btn-sm mr-1" 
							onClick={e => bubbleMouseEvent({type: "editSprint", sprintId: sprint.id})} type="button">
								Edit
						</button>
						<button className="btn btn-sm btn-danger mr-1" 
							onClick={e => bubbleMouseEvent({type: "deleteSprint", sprintId: sprint.id})} type="button">
								Delete
						</button>
						<button className="btn btn-sm btn-outline" 
							onClick={e => bubbleMouseEvent({type: "toggleActiveSprint", sprintId: sprint.id})} type="button">
								{sprint.active ? "End" : "Start"}
						</button>
					</span>
				</div>
			</div>
			{Object.keys(sprint.issue).length === 0
			&& <div class="blankslate">
				<FontAwesomeIcon className="h4" icon={faHeartBroken} />
				<p>No issues in here.</p>
			</div>}
			{Object.values(sprint.issue).map(issue => <IssueItemDetailed key={issue.id} forPage="backlog" issue={issue} editHandler={ issueEditHandler } />)}
		</div>
	)
}

export default Sprint;