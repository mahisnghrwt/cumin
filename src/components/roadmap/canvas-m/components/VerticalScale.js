const VerticalScale = ({style, labels, unit}) => {
	return (
		<div className="vertical-scale" style={{...style}}>
			{labels.map(x => {
				return <div className="vertical-scale-label" style={{height: unit.height}}>{x}</div>
			})}
		</div>
	)
}

export default VerticalScale;