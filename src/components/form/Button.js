import { useContext } from "react";
import FormContext from "./FormContext";

const Button = ({kKey, label, onClick: submit, doesSubmit = false, ...rest}) => {
	const {formState, setFormState, validateForm, isStateValid, defaultState} = useContext(FormContext);
	
	const buttonClickHandler = e => {
		
		if (doesSubmit) {
			validateForm();
			if (isStateValid(formState) === false)
				return;
		}


		let formValues = {};
		Object.keys(formState).map(field => {
			if (field !== "__LOG__")
				formValues[field] = formState[field].value;
		})

		// perform action
		submit(formValues)
		.then(message => {
			const actions = [
				{
					type: "REPLACE",
					state: defaultState
				},
				{
					type: "SET_LOG",
					log: message
				}
			]
			setFormState(actions);
		})
		.catch(e => console.error(e));
	}

	return (
		<button className="std-button" onClick={buttonClickHandler} {...rest}>{label}</button>
	)
}

export default Button;