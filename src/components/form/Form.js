import { startOfMinute } from "date-fns";
import { useCallback, useEffect, useReducer, useState } from "react";
import FormContext from "./FormContext";
import formErrorType from "./formErrorType";

/**
 * @param fields [...fieldKey] or {fieldKey: defaultValue}
 */
const fieldsToState = (fields, getClean) => {
	let state = {
		log: null,
		isSubmitting: false,
		field: {}
	};
	let hasDefaultValues = fields !== null && Array.isArray(fields) === false;
	let fieldKeys = hasDefaultValues ? Object.keys(fields) : fields;

	fieldKeys.map(field => {
		state.field[field] = {
			value: hasDefaultValues && !getClean ? fields[field] : "",
			error: null
		}
	})

	return state;
}

const mergeErrorsToState = (state, errors) => {
	const statePatched = {...state};

	Object.keys(errors).map(field => {
		const hasFieldError = statePatched.field[field].error !== null && statePatched.field[field].error !== undefined;
		if (!hasFieldError || statePatched.field[field].error.type !== formErrorType.LOCAL) {
			statePatched.field[field] = {
				...statePatched.field[field],
				error: {
					...errors[field]
				}
			}
		}
	})

	return statePatched;
}

const isStateValid = formState => {
	let invalid = Object.values(formState.field).some(field => {
		if (field === null) return false;
		return field.error !== null;
	})

	return !invalid;
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
				log: {
					...action.log
				}
			}
		case "mergeErrors":
			return mergeErrorsToState(state, action.errors);
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

const Form = ({formFields = [], validator = null, children}) => {
	const defaultState = fieldsToState(formFields, false);
	const cleanState = fieldsToState(formFields, true);
	const [formState, setFormState] = useReducer(reducerWrapper, defaultState);

	const validateForm = (formValues) => {
		if (typeof validator === "function") {
			return validator(formValues);
		}
		return null;
	};

	return (
		<FormContext.Provider value={{formState, setFormState, validateForm, isStateValid, cleanState}}>
			<form onSubmit={e => e.preventDefault()}>
				{children}
			</form>
		</FormContext.Provider>
	)
}

export default Form;