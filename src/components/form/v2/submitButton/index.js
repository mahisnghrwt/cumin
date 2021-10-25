import FormContext from "../FormContext";
import { useContext, useRef, useEffect } from "react";
import formLogType from "../logType";

export default ({kKey, label, onClick: submit, ...rest}) => {
	const {formState, setFormState, cleanState} = useContext(FormContext);
	const ref = useRef(null);

	const validateUntouchedFields = () => {
		let valid = true;
		let actions = [];

		for (const field in formState.field) {
			if (!formState.field[field].touched) {
				const err = formState.field[field].validate(formState.field[field].value)
				if (err) {
					valid = false;
					actions.push({type: "patchField", field, patch: {error: err, touched: true}});
				}
			}
		}

		if (actions.length > 0)
			setFormState(actions);

		return valid;
	}

	const isFormValid = () => {
		let valid = true;
		for (const field in formState.field) {
			if (formState.field[field].error) {
				valid = false;
				break;
			}
		}

		return valid;
	}

	const activateForm = () => {
		setFormState({type: "setIsSubmitting", isSubmitting: false});
	}
	
	const buttonClickHandler = e => {
		let formValues = {};
		Object.keys(formState.field).map(field => {
			formValues[field] = formState.field[field].value;
		})
		
		setFormState({type: "setIsSubmitting", isSubmitting: true});


		if (!validateUntouchedFields() || !isFormValid()) {
			activateForm();
			return;
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
		if (formState.isSubmitting)
			ref.current.disabled = true;
		else
			ref.current.disabled = false;

	}, [formState.isSubmitting])

	return (
		<button ref={ ref } type="submit" className="btn btn-primary"  onClick={ buttonClickHandler } { ...rest }>
			{ label }
			{formState.isSubmitting && <span class="AnimatedEllipsis" />}
		</button>
	)
}