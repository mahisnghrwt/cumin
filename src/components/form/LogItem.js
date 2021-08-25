import { useContext } from "react";
import FormContext from "./FormContext";

const LogItem = (props) => {
	const {formState} = useContext(FormContext);
	const {__LOG__: log} = formState;

	if (log === null || log === undefined)
		return null;

	return (
		<div className={"form-item-alert bg-green"}>{log}</div>
	)
}

export default LogItem;