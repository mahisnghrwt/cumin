import { differenceInCalendarDays } from "date-fns";

const DependencyCompact = ({epic}) => {
	const tags = {
		"Progress": "x%",
		"Due in": differenceInCalendarDays(new Date(), epic.endDate) + " days"
	}

	return (
		<div className="issue-item-compact">
			<div className="issue-item-header-only">
		  		<span className="issue-item-title">{epic.title}</span>
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

export default DependencyCompact;