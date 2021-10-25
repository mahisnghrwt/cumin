import DependencyCompact from "./DependencyCompact";
import { faHeartBroken } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const DependencyList = ({dependencies}) => {
	return (		
		<div className="Box Box--condensed color-bg-subtle p-2 border-0 mb-4">
			<h4 className="h4 mb-2">Dependencies</h4>
			{(!dependencies || (Array.isArray(dependencies) && dependencies.length === 0))
			?	<div class="blankslate">
					<FontAwesomeIcon className="h4" icon={faHeartBroken} />
					<p>Great no dependencies.</p>
				</div>
			:	<div className="Box mb-4">
					{dependencies.map(epic => <DependencyCompact epic={epic} />)}
				</div>
			}
		</div>
	)
}

export default DependencyList;