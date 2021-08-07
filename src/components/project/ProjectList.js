import React, { useContext } from "react";
import Global from "../../GlobalContext";

const ProjectList = ({projects}) => {
	const [global, dispatchGlobal] = useContext(Global);

	const selectProject = (project) => {
		console.log(project);
		dispatchGlobal({type: "UPDATE_PROJECT", value: project});
	}

	if (projects == null || typeof projects !== "object")
		return null;

	return (
		<>
			<h3>My Projects</h3>
			<div className="list">
				{projects.map(project => {
					return (
						<div className="list-item" key={project.id}>
							{project.name}
							<span className="list-item-sublabel">{new Date(project.startDate).toDateString()}</span>
							<span className="list-item-buttons">
								<a href="" onClick={e => {e.preventDefault(); selectProject(project) }}>Select</a>

								<a href="">Edit [placeholder]</a>
								<a href="">Delete [placeholder]</a>
							</span>
						</div>
					)
				})}
				
			</div>
		</>
	);
};

export default ProjectList;