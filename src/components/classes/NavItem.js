class NavItem {
	constructor(text, link, isRightAligned, displayWhen) {
		this.text = text;
		this.link = link;
		this.isRightAligned = isRightAligned;
		this.displayWhen = displayWhen;
	}
}

const LOGGED_IN = "loggedIn";
const LOGGED_OUT = "loggedOut";
const ALWAYS = "always";

const loginStatus = {
	LOGGED_IN: "loggedIn",
	LOGGED_OUT: "loggedOut",
	ALWAYS: "always",
}

export { NavItem , LOGGED_IN, LOGGED_OUT, ALWAYS, loginStatus};