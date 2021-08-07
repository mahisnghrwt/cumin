const BoardIssueLabel = ({issue}) => {
	return (
		<li 
			draggable={true} 
			onDragStart={(ev) => ev.dataTransfer.setData("issueId", issue.id)} 
			key={issue.id}>
			title: {issue.title} &hArr; id: {issue.id} &hArr; type: {issue.type}
		</li>
	)
}

export default BoardIssueLabel;