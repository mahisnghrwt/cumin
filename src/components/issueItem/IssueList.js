import IssueItemCompacter from "./IssueItemCompacter";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeartBroken } from "@fortawesome/free-solid-svg-icons";

const IssueList = ({issues}) => {

	return (	
		<div className="Box Box--condensed color-bg-subtle p-2 border-0 mb-4">
			<h4 className="h4 mb-2">Issues</h4>
			{(!issues || (Array.isArray(issues) && issues.length === 0))
			?	<div class="blankslate">
					<FontAwesomeIcon className="h4" icon={faHeartBroken} />
					<p>No issues in here.</p>
				</div>
			:	<div className="Box mb-4">
					{issues.map(issue => <IssueItemCompacter issue={issue} />)}
				</div>
			}
		</div>
	)
}

export default IssueList;