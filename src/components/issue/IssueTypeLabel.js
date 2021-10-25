import issueType from "./issueType"
import { faBug, faBullseye } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default ({type, className}) => {
	let label = {};
	if (type === issueType.BUG) {
		label.classNameAppend = "color-bg-danger-emphasis";
		label.icon = faBug;
	}
	else if(type === issueType.TODO) {
		label.classNameAppend = "color-bg-attention-emphasis";
		label.icon = faBullseye;
	}
	else { }

	return (
		<span className={"IssueLabel color-fg-on-emphasis " + label.classNameAppend + ` ${className}`}>
			<FontAwesomeIcon className="text-small" icon={label.icon} />
		</span>
	)
}