import { useContext, useCallback } from "react";
import FormContext from "./FormContext";
import FormItem from "./FormItem";
import formErrorType from "./formErrorType";

const InputItem = ({kKey: key, label, size, validator, ...rest}) => {

	debugger;
	const {formState, setFormState} = useContext(FormContext);
	const {[key]: {value}} = formState;

	const validate = (val) => {
		if (typeof validator !== 'function')
			return null;

		const err = validator(val);
		if (err === null)
			return err;
		
		return {value: err, type: formErrorType.LOCAL};
	}

	const valueChangeHandler = val => {
		const err = validate(val);
		const patch = {value: val, error: err};
		setFormState({type: "PATCH_FIELD", field: key, patch});
	}

	return (
		<FormItem kKey={key} label={label} size={size}>
			<input value={value} onChange={e => valueChangeHandler(e.target.value)} {...rest} />
		</FormItem>
	)
}

export default InputItem;