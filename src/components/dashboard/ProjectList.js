import ProjectItem from "./ProjectItem";

const ProjectList = ({ projects, selectProject }) => {
	return (
		<div className="d-flex flex-row flex-nowrap overflow-x-auto mb-4">
			{ projects.map(project => (
				<ProjectItem project={ project } selectProject={ selectProject } />))
			}
		</div>
	)
}

export default ProjectList;