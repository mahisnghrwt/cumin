import React from "react";
import connect from "../group/connect";
const Textarea = React.forwardRef((props, ref) => <textarea ref={ ref } { ...props } />)
export default connect(Textarea);