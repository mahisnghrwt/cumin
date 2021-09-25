import "./progressBar.css";
// theme = "light" or "dark"
const ProgressBar = ({progress, theme = "light"}) => {
	return (
		<span className={theme === "light" ? "progress-bar-light" : "progress-bar-dark"}>
			<span className="progress" style={{width: progress + "%"}} />
		</span>
	)
}

export default ProgressBar;