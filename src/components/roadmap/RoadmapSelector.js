import { useState } from "react"

const RoadmapSelector = ({roadmap, notifyChange, defaultRoadmapId}) => {
	const [selectedRoadmap, setSelectedRoadmap] = useState(defaultRoadmapId);

	const selectChangeHandler = e => {
		const roadmapId = parseInt(e.target.value);
		setSelectedRoadmap(roadmapId);
		notifyChange(roadmapId);
	}

	return (
		<select value={ selectedRoadmap } onChange={ selectChangeHandler } style={{marginLeft: "auto"}}>
			{Object.values(roadmap).map(r => {
				return <option value={ r.id }>{ r.title }</option>
			})}
		</select>
	)
}

export default RoadmapSelector;