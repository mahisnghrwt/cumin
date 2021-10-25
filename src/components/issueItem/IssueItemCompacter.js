import IssueTypeLabel from "../issue/IssueTypeLabel";

const IssueItemCompacter = ({issue}) => {
	return (
		<div className="Box-row Box--condensed p-3">
			<strong className="ml-1">{issue.title}</strong>
			<span className="Label Label--info ml-2 mr-2">{issue.status}</span>
			<IssueTypeLabel type={issue.type} />
		</div>
	)
  };

export default IssueItemCompacter;