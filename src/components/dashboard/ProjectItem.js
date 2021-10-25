import { useContext } from "react";
import Global from "../../GlobalContext";
import Helper from "../../Helper";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay } from "@fortawesome/free-solid-svg-icons";

const ProjectItem = ({project, selectProject}) => {
	const [global,,] = useContext(Global);
	const isActive = global.project && global.project.id === project.id;

	return (
		<div className="Box p-3 mr-1">
			<div className="d-flex flex-row flex-item-center mb-1">
				<strong className="mr-1">{ project.name }</strong>
				{ isActive
					? <div className="Label Label--success">Active</div>
					: <button className="btn-octicon" type="button" onClick={ ()=> selectProject(project.id) }>
						<FontAwesomeIcon icon={ faPlay } />
					</button>
				}
			</div>
			<div className="text-small color-fg-subtle">
				Created on { Helper.dateToInputString(project.createdAt) }
			</div>
		</div>
	)
}

export default ProjectItem;