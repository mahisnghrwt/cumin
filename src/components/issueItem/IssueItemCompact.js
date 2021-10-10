import Helper from "../../Helper";

const IssueItemCompact = ({issue, actions = []}) => {
	const tags = {
		"Type": issue.type,
		"Status": issue.status,
		"Created at": Helper.dateToInputString(issue.createdAt)
	}

	const dragStartHandler = e => {
		e.stopPropagation();
		e.dataTransfer.setData("issue", JSON.stringify({issueId: issue.id, oldSprintId: issue.sprintId}));
	}

	return (
		<div className="issue-item-compact" draggable onDragStart={dragStartHandler}>
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