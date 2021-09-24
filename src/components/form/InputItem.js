import { useContext, useCallback, useRef, useEffect } from "react";
import FormContext from "./FormContext";
import FormItem from "./FormItem";
import formErrorType from "./formErrorType";

const InputItem = ({kKey: key, label, size, validator = null, ...rest}) => {
	const {formState, setFormState} = useContext(FormContext);
	const {field: {[key]: {value}}} = formState;

	const ref = useRef(null);

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
		setFormState({type: "patchField", field: key, patch});
	}

	useEffect(() => {
		if (rest["disabled"]) return;
		if (formState.isSubmitting) {
			ref.current.disabled = true;
		}
		else {
			ref.current.disabled = false;
		}
	}, [formState.isSubmitting])

	return (
		<FormItem kKey={key} label={label} size={size}>
			<input ref={ref} value={value} onChange={e => valueChangeHandler(e.target.value)} {...rest} />
		</FormItem>
	)
}

export default InputItem;