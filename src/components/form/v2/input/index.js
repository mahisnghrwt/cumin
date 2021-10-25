import React from "react";
import connect from "../group/connect";
const Input = React.forwardRef((props, ref) => <input ref={ ref } { ...props } />)
export default connect(Input);