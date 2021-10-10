import { useState } from "react";
import Helper from "../../Helper";

const IssueItemCompact = ({issue, actions = []}) => {
	const [isExpanded, setExpanded] = useState(false);

	const tags = {
		"Type": issue.type,
		"Status": issue.status,
		"Created at": Helper.dateToInputString(issue.createdAt),
		...(isExpanded && {
			"Assigned to": issue.assignedTo,
			"Reporter": issue.reporter,
			"Epic": issue.epic,
			"Sprint": issue.sprint
		})
	}

	const dragStartHandler = e => {
		e.stopPropagation();
		e.dataTransfer.setData("issue", JSON.stringify({issueId: issue.id, oldSprintId: issue.sprintId}));
	}

	return (
		<div className="issue-item"/*{isExpanded ? "issue-item" : "issue-item-compact"}*/ draggable onDragStart={dragStartHandler} onClick={e => setExpanded(!isExpanded)}>
			<div className="issue-item-header">
		  		<span className="issue-item-title">{issue.title}</span>
		  		<span className="issue-item-buttons">
					{Object.keys(actions).map(action => { return (
						<button 
							className="border-button" 
							onClick={e => actions[action](issue.id)}>
							{action}
						</button>
					)})}
		  		</span>
			</div>
			{(isExpanded && issue.description) && <div className="issue-item-description">
				{issue.description}
			</div> }
			<div className="issue-item-tags">
				{Object.keys(tags).map(tag => { return (
					<span className="issue-item-tag">
						<span className="issue-item-tag-key">{tag}:</span>
						<span className="issue-item-tag-value">{tags[tag]}</span>
					</span>
				)})}
			</div>
	  </div>
	);
  };

export default IssueItemCompact;