import React from "react";
import connect from "../group/connect";

const Select = React.forwardRef(({children, ...rest}, ref) => {
	return (
		<select ref={ref} {...rest}>{children}</select>
	)
})

export default connect(Select, true);