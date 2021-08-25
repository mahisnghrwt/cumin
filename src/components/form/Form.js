import { startOfMinute } from "date-fns";
import { useCallback, useEffect, useReducer, useState } from "react";
import FormContext from "./FormContext";
import formErrorType from "./formErrorType";

const fieldsToState = fields => {
	let state = {__LOG__: null};

	fields.map(field => {
		state[field] = {
			value: "",
			error: null
		}
	})

	return state;
}

const mergeErrorsToState = (state, errors) => {
	const statePatched = {...state};

	Object.keys(errors).map(field => {
		const hasFieldError = statePatched[field].error !== null && statePatched[field].error !== undefined;
		if (!hasFieldError || statePatched[field].error.type !== formErrorType.LOCAL) {
			statePatched[field] = {
				...statePatched[field],
				error: {
					...errors[field]
				}
			}
		}
	})

	return statePatched;
}

const isStateValid = formState => {
	let invalid = Object.values(formState).some(field => {
		if (field === null) return false;
		return field.error !== null;
	})

	return !invalid;
}

/**
 * PATCH_FIELD		field, patch
 * MERGE_ERRORS		errors
 * REPLACE			state
 * SET_LOG			log
 */

const reducer = (state, action) => {
	switch(action.type) {
		case "PATCH_FIELD":
			return {
				...state,
				[action.field]: {
					...state[action.field],
					...action.patch
				},
				__LOG__: null
			};
		case "SET_LOG":
			return {
				...state,
				__LOG__: action.log
			}
		case "MERGE_ERRORS":
			return mergeErrorsToState(state, action.errors);
		case "REPLACE":
			return action.state;
	}
}

const reducerWrapper = (state, action) => {
	let actions = action;
	if (Array.isArray(action) === false)
		actions = [action]

	const finalState = actions.reduce(reducer, state);

	return finalState;
}

const Form = ({formFields = [], formValidators = {}, children}) => {
	const defaultState = fieldsToState(formFields);
	const [formState, setFormState] = useReducer(reducerWrapper, defaultState);

	const validateForm = () => {
		let errors = {};

		Object.keys(formValidators).map(field => {
			const err = formValidators[field](formState);
			errors[field] = null;
			if (err !== null) {
				errors[field] = {
					value: err,
					type: formErrorType.GLOBAL
				}
			}
		});

		setFormState({type: "MERGE_ERRORS", errors});
	};

	return (
		<FormContext.Provider value={{formState, setFormState, validateForm, isStateValid, defaultState}}>
			<form onSubmit={e => e.preventDefault()}>
				{children}
			</form>
		</FormContext.Provider>
	)
}

export default Form;