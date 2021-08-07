const ErrorLog = ({errors, clearLog}) => {
	if (errors.length === 0)
		return null;

	return (
		<pre className="danger-background custom-background">
			<a href="#" onClick={clearLog}>[x]</a>
			<ul>
			{errors.map(x => {
				return <li>{x}</li>
			})}
			</ul>
		</pre>
	)
}

export default ErrorLog;