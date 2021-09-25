const ToggleHeader = ({children, className=""}) => {
	return (
		<div className={"toggle-header " + className}>
			{children}
		</div>
	);
}

export default ToggleHeader;