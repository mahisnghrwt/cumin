import FormGroup from "./index";
import { useEffect, useRef, useContext } from "react";
import formGroupVariant from "./variant";
import FormContext from "../FormContext";

export default (ComposedComponent, isSelect = false) => {
	return (
		({ kKey: key, label, classNameAppend, children, ...rest }) => {
			const { formState, setFormState } = useContext(FormContext);
			const { field: {[ key ]: { value, validate, error }}} = formState;
		
			const ref = useRef(null);
		
			const valueChangeHandler = val => {
				const err = validate(val);
				const patch = {value: val, error: err, touched: true};
				setFormState({type: "patchField", field: key, patch});
			}
		
			useEffect(() => {
				if (rest["disabled"]) return;

				// disable input when form submitting, so the user does not changes value
				if (formState.isSubmitting) {
					ref.current.disabled = true;
				}
				else {
					ref.current.disabled = false;
				}
			}, [formState.isSubmitting])
		
			return (
				<FormGroup inputId={ key } label={ label } note={ error } variant={ error ? formGroupVariant.ERROR : formGroupVariant.SUCCESS }>
					<ComposedComponent 
						className={ (isSelect ? "form-select" : "form-control") + (classNameAppend ? " " + classNameAppend : "") } 
						ref={ ref } 
						value={ value } 
						onChange={ e => valueChangeHandler(e.target.value) } 
					{ ...rest }>
						{ children }
					</ComposedComponent>
				</FormGroup>
			)
		}
	)
}