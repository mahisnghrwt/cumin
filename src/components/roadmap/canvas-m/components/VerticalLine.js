const VerticalLine = ({pos, height}) => {
	const color = "#e67e22";
	const width = "4"; // px

	const style = {
		width: width + "px",
		left: (pos.x - width / 2) + "px",
		height,
		backgroundColor: color
	}

	const tooltipMsg = "Today's date " + new Date().toDateString();

	return (
		<div title={tooltipMsg} className="vertical-line" style={style}></div>
	)	
}

export default VerticalLine;