import BoardIssueLabel from "./BoardIssueLabel";

const BoardIssueContainer = ({status, issues, onDropNotifyParent}) => {
	const onDropIssue = e => {
		e.preventDefault();
		const issueId = parseInt(e.dataTransfer.getData("issueId"));
		onDropNotifyParent(issueId, status);
	}
	return (
		<pre onDragOver={e => e.preventDefault()} onDrop={onDropIssue}>
			<h5>{status}</h5>
			{issues.map(x => {
				return <BoardIssueLabel issue={x} />
			})}
		</pre>
	)
}
export default BoardIssueContainer;