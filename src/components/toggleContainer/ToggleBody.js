import { useContext } from "react";
import toggleContext from "./toggleContext";

const ToggleBody = ({children}) => {
	const {isExpanded} = useContext(toggleContext);

	if (isExpanded === false) return null;

	return <>{children}</>;
}

export default ToggleBody;