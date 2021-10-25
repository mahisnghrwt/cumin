import { useReducer } from "react";
import FormContext from "./FormContext";
import Input from "./input/index";
import Textarea from "./textarea/index";
import Select from "./select/index";
import SubmitButton from "./submitButton/index";
import logType from "./logType";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faTimesCircle} from "@fortawesome/free-regular-svg-icons"

/**
 * @param fields [...fieldKey] or {fieldKey: defaultValue}
 */
const fieldsToState = (fields, getClean) => {
	let state = {
		log: null,
		isSubmitting: false,
		field: {}
	};
	let hasDefaultValues = fields && Array.isArray(fields) === false;
	let fieldKeys = hasDefaultValues ? Object.keys(fields) : fields;

	fieldKeys.map(field => {
		state.field[field] = {
			value: hasDefaultValues && !getClean ? fields[field].value : "",
			validate: hasDefaultValues && fields[field].validate ? fields[field].validate : () => {},
			error: null,
			touched: false
		}
	})

	return state;
}

const reducer = (state, action) => {
	switch(action.type) {
		case "patchField":
			return {
				...state,
				field: {
					...state.field,
					[action.field]: {
						...state.field[action.field],
						...action.patch
					}	
				}
			};
		case "setLog":
			return {
				...state,
				...(!action.log && {log: null}),
				...(action.log && {log: action.log})
			}
		case "setIsSubmitting":
			return {
				...state,
				isSubmitting: action.isSubmitting
			}
		case "replace":
			return {
				...action.state
			};
	}
}

const reducerWrapper = (state, action) => {
	let actions = action;
	if (Array.isArray(action) === false)
		actions = [action]

	const finalState = actions.reduce(reducer, state);

	return finalState;
}

const Form = ({formFields = [], children}) => {
	const defaultState = fieldsToState(formFields, false);
	const cleanState = fieldsToState(formFields, true);
	const [formState, setFormState] = useReducer(reducerWrapper, defaultState);

	return (
		<FormContext.Provider value={{formState, setFormState, cleanState}}>
			{formState.log && 
			(<div class={"flash p-2 " + (formState.log.type === logType.success ? "flash-success" : "flash-error")}>
				{formState.log.message}
				<button class="flash-close js-flash-close" type="button" onClick={() => setFormState({type: "setLog", log: null})}>
					<FontAwesomeIcon icon={faTimesCircle} className="color-fg-danger" />
				</button>
			</div>)}

			<form onSubmit={e => e.preventDefault()}>
				{children}
			</form>
		</FormContext.Provider>
	)
}

export {
	Input, SubmitButton, Select, Textarea
}
export default Form;