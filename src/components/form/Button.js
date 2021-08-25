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

		// perform action
		submit(formState)
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
		<button onClick={buttonClickHandler} {...rest}>{label}</button>
	)
}

export default Button;