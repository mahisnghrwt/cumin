import ProjectItem from "./ProjectItem";

const ProjectList = ({projects, selectProject}) => {
	return (
		<div className="project-list">
			{projects.map(project => <ProjectItem project={project} selectProject={selectProject} />)}
		</div>
	)
}

export default ProjectList;