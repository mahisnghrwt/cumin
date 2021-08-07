const AlertBar = ({messageJsx, alertType}) => {
	return (
		<div className={"alert-bar " + alertType}>
			{ messageJsx }
		</div>
	);
};

export default AlertBar;