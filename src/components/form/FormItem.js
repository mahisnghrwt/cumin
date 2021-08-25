import { useContext } from "react";
import FormContext from "./FormContext";

const FormItem = ({kKey: key, label, size, children}) => {
	const {formState} = useContext(FormContext);
	const {[key]: {error}} = formState;

	return (
		<div className={"form-item " + size}>
			<label>{label}</label>
			{children}
			{error && <span class="form-item-error">{error.value}</span>}
		</div>
	)
}

export default FormItem;