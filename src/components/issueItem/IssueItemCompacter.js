import Helper from "../../Helper";

const IssueItemCompacter = ({issue}) => {
	const tags = {
		"Type": issue.type,
		"Status": issue.status,
	}

	const tagWidth = (1 / Object.keys(tags).length) * 70;

	return (
		<div className="issue-item-compact" style={{border: "0", borderBottom: "1px dashed var(--border-color)"}}>
			<div className="issue-item-header">
		  		<span className="issue-item-title" style={{width: "30%"}}>{issue.title}</span>
				<div className="issue-item-tags" style={{width: "50%", flexWrap: "nowrap"}}>
					{Object.keys(tags).map(tag => { return (
						<span className="issue-item-tag" style={{width: "50%"}}>
							<span className="issue-item-tag-key">{tag}:</span>
							<span className="issue-item-tag-value">{tags[tag]}</span>
						</span>
					)})}
				</div>
			</div>
	  </div>
	);
  };

export default IssueItemCompacter;