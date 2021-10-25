import { differenceInCalendarDays } from "date-fns";
import Helper from "../../Helper";

const EpicInfoCard = ({ epic }) => {
	return (
		<div className="Box Box--condensed color-bg-subtle p-2 border-0 mb-4">
			<span className="text-italic text-small color-fg-muted mr-2">{ epic.id }</span><h4 className="h4 d-inline-block mb-2">{ epic.title }</h4>
			<span className="Progress d-inline-flex" style={{width: "100%"}}>
				<span className="Progress-item color-bg-success-emphasis" style={{width: "25%"}}></span>
			</span>
			<div className="mt-2">
				<span className="color-fg-subtle mr-2">Duration:</span>
				<span>{Helper.dateToInputString(epic.startDate)} to { Helper.dateToInputString(epic.endDate) } ({ differenceInCalendarDays(epic.endDate, epic.startDate )} Days)</span>
			</div>
		</div>
	)
}

export default EpicInfoCard;