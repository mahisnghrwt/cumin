import { useState } from "react";

const AlertBar = ({uid = 1, message}) => {
	const [disabledUid, setDisabledUid] = useState(-1);

	const close = _ => {
		setDisabledUid(uid);
	}

	if (uid === disabledUid) return null;


	return (
		<div className="alert-bar bg-red">
			{ message }
			<button className="light-button" onClick={close}>Close</button>
		</div>
	);
};

export default AlertBar;