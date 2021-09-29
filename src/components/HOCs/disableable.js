// WrappedComponent must use disabled and className props.
// Works well with Buttons.
const disableable = WrappedComponent => {
	return ({children, disabled, className = "", ...restProps}) => {
		return (
			<WrappedComponent 
				disabled={disabled} 
				className={className + (disabled ? " disabled" : "")}
				{...restProps}
			>
				{children}
			</WrappedComponent>
		)
	}
}

export default disableable;