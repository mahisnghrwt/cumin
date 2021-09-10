class ContextMenuItem {
	constructor(content, action) {
		this.content = content;
		this.action = action;
	}

	getItem() {
		return (
			<button className="context-menu-button light-theme" onClick={this.action}>{this.content}</button>
		)
	}
}

export default ContextMenuItem;