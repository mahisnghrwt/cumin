import IssueItemDetailed from "../issueItem/IssueItemDetailed";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFolderOpen } from "@fortawesome/free-regular-svg-icons";

const Board = ({title, issues = [], patchIssueStatus, issueEditHandler}) => {
	const dragOverHandler = e => {
		e.preventDefault();
		e.stopPropagation();
	}

	const drophandler = e => {
		e.preventDefault();
		e.stopPropagation();

		const issueJsonString = e.dataTransfer.getData("issue");
		const issue = JSON.parse(issueJsonString);

		// no need to patch picked and dropped on same board
		if (issue.oldStatus === title) return;

		patchIssueStatus(issue.id, issue.oldStatus, title);
	}

	return (
		<div className="Box mx-1 flex-1" onDragOver={dragOverHandler} onDrop={drophandler}>
			<div className="Box-header">
				{title}
			</div>
			{ issues.length === 0 ?
				<div className="blankslate">
					<div className="h1 mb-1">
						<FontAwesomeIcon icon={faFolderOpen} />
					</div>
				</div>
		  	:
				issues.map(issue => <IssueItemDetailed issue={issue} forPage="board" omit={{status: true}}  editHandler={ issueEditHandler } />)
			}
		</div>
	);
}

export default Board;