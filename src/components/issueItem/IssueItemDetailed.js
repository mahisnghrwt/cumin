import Helper from "../../Helper";
import "./issueItem.css";

const IssueItemDetailed = ({issue, actions = []}) => {
	const {id, title, description} = issue;
	const tags = {
		type: issue.type,
		createdAt: Helper.dateToInputString(new Date(issue.createdAt)),
		epicId: issue.epicId,
		assignedToId: issue.assignedToId
	}
	
	const dragStartHandler = e => {
		e.stopPropagation();
		const data = JSON.stringify({id: issue.id, oldStatus: issue.status});
		e.dataTransfer.setData("issue", data);
	}

	return (
		<div className="issue-item" draggable onDragStart={dragStartHandler}>
			<div className="issue-item-header">
		  		<span className="issue-item-title">{title}</span>
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
			<div className="issue-item-description">
				{description}
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

export default IssueItemDetailed;