import "./issueItem.css";

const IssueItemDetailed = ({issue, actions = []}) => {
	const {id, title, description, ...tags} = issue;
	return (
		<div className="issue-item">
			<div className="issue-item-header">
		  		<span className="issue-item-title">{title}</span>
		  		<span className="issue-item-buttons">
					{Object.keys(actions).map(action => { return (
						<button 
							className="issue-item-button" 
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