import React from "react";
import settings from "../../settings";
import DraggableIssueLabel from "../issue/DraggableIssueLabel";
import Helper from "../../Helper";
import Placeholder from "../Placeholder";
// import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {faCircle, faCheckCircle, faTrashAlt} from "@fortawesome/free-regular-svg-icons";

const deleteSprint__ = async (id) => {
	const URL = settings.API_ROOT + "/sprint/" + id;

	const response = await fetch(URL, {
		method: "DELETE",
		mode: "cors",
		credentials: "include",
		headers: {
			"Authorization": "Bearer " + localStorage.getItem("token")
		}
	})

	return response.ok;
}

const Sprint = ({sprint, dropIssuePropagate}) => {

	const dropIssue = ev => {
		ev.preventDefault();
		const data = JSON.parse(ev.dataTransfer.getData("data"));
		dropIssuePropagate(parseInt(data.issueId), parseInt(data.sprintId), parseInt(sprint.id));
	}

	const deleteSprint = (e) => {
		e.preventDefault();

		if (!deleteSprint__(sprint.id)) {
			console.error("Could not delete the sprint");
		}
	}

	const activateSprint = (e) => {
		e.preventDefault();

		const URL = settings.API_ROOT + "/project/" + sprint.projectId + "/active-sprint/" + sprint.id;
		Helper.httpRequest(URL, "PUT", null)
		.then(activeSprint => console.log(activeSprint))
		.catch(e => console.error(e));
	}

	return (
		<>
			<div className="list"
				onDragOver={ev => ev.preventDefault()}
				onDrop={dropIssue}
			>
				<div className="list-header">
					<div className="list-title">{sprint.title}</div>
					<div className="list-item-buttons">
						<a href="" onClick={deleteSprint}>Delete</a>  
						{
							sprint.active !== undefined 
							? "Active"
							: <a href="" onClick={activateSprint}>Activate</a> 
						}
					</div>
				</div>
				{!Array.isArray(sprint.issues) || sprint.issues.length === 0 
					? <Placeholder><span style={{color: "white"}}>&#128528; No issues yet.</span></Placeholder>
					: sprint.issues.map(x => <DraggableIssueLabel issue={x} />)
				}
			</div>
		</>
	)
}

export default Sprint;