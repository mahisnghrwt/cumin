import React from "react";
import Placeholder from "../Placeholder";
import DraggableIssueLabel from "./DraggableIssueLabel";

const FreeIssuesContainer = ({issues, dropIssuePropagate}) => {

	if (Array.isArray(issues) === false)
		return null;

	const dropIssue = ev => {
		ev.preventDefault();
		const data = JSON.parse(ev.dataTransfer.getData("data"));
		dropIssuePropagate(parseInt(data.issueId), parseInt(data.sprintId), -1);
	}

	return (
		<>
			<h3>Unassiged Issues</h3>
			<div 
				className="list"
				onDragOver={ev => ev.preventDefault()}
				onDrop={dropIssue}
			>
				{issues.length === 0
				? <Placeholder><span style={{color: "white"}}>&#128516; All issues assigned to sprints.</span></Placeholder>
				:issues.map(x => <DraggableIssueLabel issue={x} />)}
			</div>
		</>
	);
}

export default FreeIssuesContainer;