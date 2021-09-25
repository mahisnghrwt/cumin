import { differenceInCalendarDays } from "date-fns";
import ProgressBar from "../progressBar/ProgressBar";
import "./epicInfoCard.css";
import Helper from "../../Helper";

const EpicInfoCard = ({epic}) => {
	return (
		<div className="epic-info-card">
			<div className="row">
				<span className="id">{epic.id}</span>
				<span className="title">{epic.title}</span>
			</div>
			<div className="row">
				<ProgressBar progress={epic.progress ? epic.progress : 20} theme="dark" />
			</div>
			<div className="row">
				<span className="info">
					<span className="info-key">Duration:</span>
					<span className="info-value">{Helper.dateToInputString(epic.startDate)} to {Helper.dateToInputString(epic.endDate)} ({differenceInCalendarDays(epic.endDate, epic.startDate)} Days)</span>
				</span>
			</div>
		</div>
	)
}

export default EpicInfoCard;