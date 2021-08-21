const VerticalScale = ({style, epics, unit, rows}) => {
	const getLabelDiv = (key, label, isPlaceholder = false) => {
		return (
			<div 
				key={key}
				className={isPlaceholder ? "vertical-scale-label placeholder-label" : "vertical-scale-label" }
				style={{height: unit.height}}>
					{label}
			</div>
		)
	}

	/**
	 * @desc Including indexRow and lastRow
	 */
	const getPlaceholderLabels = (indexRow, lastRow) => {
		let labelDivs = [];
	
		for (let row = indexRow; row <= lastRow; row++) {
			labelDivs.push(getLabelDiv(row, "empty", true));
		}
	
		return labelDivs;
	}
	
	const getLabelsWithPlaceholder = (epics) => {
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
			labels = labels.concat(getPlaceholderLabels(lastRow + 1, epic.row - 1));
			labels.push(getLabelDiv(epic.key, epic.title));
			lastRow = epic.row;
		});

		if (lastRow >= rows)
			throw new Error("Labels exceed the number of rows!");

		labels = labels.concat(getPlaceholderLabels(lastRow + 1, rows - 1));
	
	
		return labels;
	}

	const labels = getLabelsWithPlaceholder(epics);

	return (
		<div className="vertical-scale" style={{...style}}>
			{labels.map(label => label)}
		</div>
	)
}

export default VerticalScale;