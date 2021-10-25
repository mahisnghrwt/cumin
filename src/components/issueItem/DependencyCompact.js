import { differenceInCalendarDays } from "date-fns";

const DependencyCompact = ({epic}) => {
	return (
		<div className="Box-row Box--condensed p-2 color-bg-subtle">
			<strong className="ml-1">{epic.title}</strong>
			<span className="Progress d-inline-flex ml-2" style={{width: "30%"}}>
				<span className="Progress-item color-bg-success-emphasis" style={{width: "25%"}}></span>
			</span>
			<span className="float-right color-fg-muted">
				Due in {differenceInCalendarDays(new Date(), epic.endDate) + " days"}
			</span>
		</div>
	)
  };

export default DependencyCompact;