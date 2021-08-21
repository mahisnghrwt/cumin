import { useEffect, useRef, useState } from "react";

const getLabelDiv = (key, label, unit, isPlaceholder = false) => {
	return (
		<div 
			key={key}
			className={isPlaceholder ? "vertical-scale-label placeholder-label" : "vertical-scale-label" }
			style={{height: unit.height}}>
				{label}
		</div>
	)
}

const getPlaceholderLabels = (epic, lastRow_, unit) => {
	let labelDivs = [];

	for (let lastRow = lastRow_ + 1; lastRow < epic.row; lastRow++) {
		labelDivs.push(getLabelDiv(lastRow, "empty", unit, true));
	}

	return labelDivs;
}

const getLabelsWithPlaceholder = (epics, unit) => {
	const sortedEpics = epics.sort((epicA, epicB) => {
		if (epicA.row < epicB.row)
			return -1;
		if (epicA.row > epicB.row)
			return 1;
		return 0;
	})

	let labels = [];
	let lastRow = -1;
	sortedEpics.map(epic => {
		labels = labels.concat(getPlaceholderLabels(epic, lastRow, unit));
		labels.push(getLabelDiv(epic.key, epic.title, unit));
		lastRow = epic.row;
	})


	return labels;
}

const VerticalScale = ({style, epics, unit}) => {
	const [labels, setLabels] = useState([]);

	useEffect(() => {
		if (!Array.isArray(epics) || epics.length === 0)
			return;
		
		const labels_ = getLabelsWithPlaceholder(epics, unit);
		setLabels(labels_);
	}, [epics])

	// const labels = addPlaceholderLabels();

	return (
		<div className="vertical-scale" style={{...style}}>
			{labels.map(label => label)}
		</div>
	)
}

export default VerticalScale;