import { useState } from "react";

const AlertBar = ({uid = 1, message, transparentBackground = false}) => {
	const [disabledUid, setDisabledUid] = useState(-1);

	const close = _ => {
		setDisabledUid(uid);
	}

	if (uid === disabledUid) return null;

	let className = "alert-bar bg-red";
	className += transparentBackground ? " skeleton" : "";

	return (
		<div className={className}>
			{ message }
			<button className={"light-button"} onClick={close}>Close</button>
		</div>
	);
};

export default AlertBar;