/**
 * for alertTypes refer to  enums.ALERT_TYPE
 */

const AlertBar = ({messageJsx, alertType}) => {
	return (
		<div className={"alert-bar " + alertType}>
			{ messageJsx }
		</div>
	);
};

export default AlertBar;