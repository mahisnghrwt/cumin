import { useContext } from "react";
import FormContext from "./FormContext";
import formLogType from "./formLogType";

const LogItem = (props) => {
	const {formState: {log}} = useContext(FormContext);

	if (log === null || log === undefined)
		return null;

	return (
		<div className={"form-item-alert"
		+ (log.type === formLogType.success
			? " success-background"
			: (log.type === formLogType.warning
				? " warning-background"
				: " danger-background"))}>
			{log.message}
		</div>
	)
}

export default LogItem;