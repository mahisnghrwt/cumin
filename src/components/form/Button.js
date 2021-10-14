import { useContext, useEffect, useRef } from "react";
import Loader from "../loader/Loader";
import FormContext from "./FormContext";
import formLogType from "./formLogType";

const Button = ({kKey, label, onClick: submit, doesSubmit = false, ...rest}) => {
	const {formState, setFormState, validateForm, cleanState} = useContext(FormContext);
	const ref = useRef(null);
	
	const buttonClickHandler = e => {
		let formValues = {};
		Object.keys(formState.field).map(field => {
			formValues[field] = formState.field[field].value;
		})
		
		if (doesSubmit) {
			setFormState({type: "setIsSubmitting", isSubmitting: true});
			const error = validateForm(formValues);
			if (error !== null) {
				setFormState({type: "setIsSubmitting", isSubmitting: false});
				setFormState({type: "setLog", log: {
					message: error,
					type: formLogType.error
				}});
				return;
			}
		}	

		// perform action
		submit(formValues)
		.then(message => {
			const actions = [
				{
					type: "replace",
					state: cleanState
				},
				{
					type: "setLog",
					log: {
						message: message === undefined ? "Success!" : message,
						type: formLogType.success
					}
				}
			]
			setFormState(actions);
		})
		.catch(e => {
			setFormState({type: "setLog", log: {
				message: e.message,
				type: formLogType.error
			}});
			console.error(e)
		})
		.finally(() => {
			setFormState({type: "setIsSubmitting", isSubmitting: false});
		});
	}

	useEffect(() => {
		if (doesSubmit === false) return;
		if (formState.isSubmitting) {
			ref.current.disabled = true;
		}
		else {
			ref.current.disabled = false;
		}
	}, [formState.isSubmitting])

	return (
		<button ref={ref} className="std-button" onClick={buttonClickHandler} {...rest}>
			{(doesSubmit && formState.isSubmitting) 
			? <>{label} <Loader /></>
			: label}
		</button>
	)
}

export default Button;