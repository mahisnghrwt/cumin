import { useContext } from "react";
import FormContext from "./FormContext";
import FormItem from "./FormItem";
import formErrorType from "./formErrorType";


const SelectItem = ({kKey: key, label, size, validator, children: selectOptions, ...rest}) => {
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
			<select value={value} onChange={e => valueChangeHandler(e.target.value)} {...rest}>
				{selectOptions}
			</select>
		</FormItem>
	)
}

export default SelectItem;