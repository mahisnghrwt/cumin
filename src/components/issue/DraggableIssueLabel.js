const DraggableIssueLabel = ({issue}) => {
	const dragStartHandler = (ev, issueId) => {
		const data = {
			issueId,
			sprintId: issue.sprintId == null ? -1 : issue.sprintId
		}
		ev.dataTransfer.setData("data", JSON.stringify(data));
	}

	return (
		<div 
			className="list-item" 
			key={issue.id} 
			draggable
			onDragStart={(ev) => dragStartHandler(ev, issue.id)} 
		>
			{issue.title}
			<span className="list-item-sublabel">{new Date(issue.createdAt).toDateString()}</span>
			<span className="list-item-buttons">
				<a href="">Edit</a>
				<a href="">Delete</a>
			</span>
		</div>
	)
}

export default DraggableIssueLabel;