import { faPencilAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Helper from "../../Helper";
import IssueTypeLabel from "../issue/IssueTypeLabel";

const IssueItemDetailed = ({issue, forPage, omit = {}, editHandler = null}) => {	
	const dragStartHandler = e => {
		e.stopPropagation();
		let data = null;
		if (forPage === "board")
			data = JSON.stringify({id: issue.id, oldStatus: issue.status});
		else if (forPage === "backlog")
			data = JSON.stringify({issueId: issue.id, oldSprintId: issue.sprintId});

		e.dataTransfer.setData("issue", data);
	}

	return (
		<div className="Box-row" draggable onDragStart={dragStartHandler}>
			<span className="text-small text-italic mr-2">{issue.id}</span>
			<strong>{issue.title}</strong>
			<IssueTypeLabel className="ml-2" type={issue.type} />
			{ !omit['status'] && <span className="Label Label--info ml-2">{issue.status}</span> }
			<span class="Label ml-2 color-border-sponsors">{issue.epicId ? issue.epicId : "Not in epic"}</span>
			{ !omit['assignedToId'] && <span class="Label Label--info ml-2">{issue.assignedToId ? issue.assignedToId : "Not assigned"}</span> }
			<span className="float-right">
				{ editHandler 
				&& <button className="btn-octicon" type="button" onClick={ () => editHandler(issue.id) }><FontAwesomeIcon icon={faPencilAlt} /></button> }
			</span>
			<details class="details-overlay">
				<summary class="btn-link">More</summary>
				<div>
					{issue.description && <p className="color-fg-subtle">{issue.description}</p>}
					<p className="color-fg-subtle">
						Created on <span className="color-fg-default">{Helper.dateToInputString(new Date(issue.createdAt))}</span>
					</p>
				</div>
			</details>
		</div>
	)
  };

export default IssueItemDetailed;