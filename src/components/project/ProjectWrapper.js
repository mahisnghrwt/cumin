import React, { useCallback, useEffect, useReducer } from "react"
import settings from "../../settings";
import Helper from "../../Helper";
import CreateProjectForm from "./CreateProjectForm";
import ProjectList from "./ProjectList";
import InvitationList from "./InvitationList";

// URL
const URL_GET_PROJECTS = settings.API_ROOT + "/project";

const projectReducer_ = (state, action) => {
	switch(action.type) {
		case "NEW":
			return action.projects;
		case "ADD":
			return [...state, action.project];
		default:
			console.log(`~ Unknown action type: ${action.type}`);
	}
}

const ProjectWrapper = (props) => {
	const [projects, projectDispatch] = useReducer(projectReducer_, []);

	useEffect(() => {
		// load the list of projects
		Helper.http.request(URL_GET_PROJECTS, "GET", localStorage.getItem("token"), null, true)
		.then(projects => projectDispatch({type: "NEW", projects}))
		.catch(e => console.error(e));
	}, [])

	return (
		<>
			<div className="right-sidebar">
				<CreateProjectForm addProject={(project) => projectDispatch({type: "ADD", project})} />
			</div>
			<ProjectList projects={projects} />
		</>
	);
}

export default ProjectWrapper;