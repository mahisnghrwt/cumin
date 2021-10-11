import { useContext } from "react";
import Global from "../../GlobalContext";
import Helper from "../../Helper";

const ProjectItem = ({project, selectProject}) => {
	const [global,,] = useContext(Global);
	const isActive = global.project.id === project.id;

	return (
		<div className="project-item">
			<div className="project-item-title">{project.name}</div>
			{isActive 
			? <div className="project-item-active-tag success-background">Active</div>
			: <button className="std-button sm-button std-background" onClick={e => selectProject(project.id)}>Activate</button>
			}
			<div className="project-item-tag">Created on {Helper.dateToInputString(project.createdAt)}</div>
		</div>
	)
}

export default ProjectItem;