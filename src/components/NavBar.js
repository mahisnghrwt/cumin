import {NavItem, LOGGED_IN, LOGGED_OUT, ALWAYS} from "../components/classes/NavItem";
import { useHistory } from "react-router";

const items_ = [
	new NavItem("CUMIN", "/", false, ALWAYS),
	new NavItem("Roadmap", "/roadmap", false, LOGGED_IN),
	new NavItem("Board", "/board", false, LOGGED_IN),
	new NavItem("Backlog", "/backlog", false, LOGGED_IN),
	new NavItem("Account", "/account", true, LOGGED_IN),
	new NavItem("Logout", "/logout", true, LOGGED_IN),
	new NavItem("Login", "/login", true, LOGGED_OUT),
	new NavItem("Register", "/register", true, LOGGED_OUT)
];


const NavBar = ({loggedIn, activePage, extraItems}) => {
	const history_ = useHistory();
	const sortAndFilter = items => {
		let left = [];
		let right = [];

		const isNeeded = x => {
			if (x.displayWhen === ALWAYS) {
				return true;
			}
			else if (x.displayWhen === LOGGED_IN && loggedIn) {
				return true;
			}
			else if (x.displayWhen === LOGGED_OUT && !loggedIn) {
				return true;
			}
			return false;
		}

		for (let i = 0; i < items.length; i++) {
			if (isNeeded(items[i])) {
				if (items[i].isRightAligned) {
					right.push(items[i]);
				}
				else {
					left.push(items[i]);
				}
			}
		}

		return {
			left,
			right
		}
	}

	const itemsWithExtra = [].concat((Array.isArray(extraItems) ? extraItems : []), items_)
	const sortedItems = sortAndFilter([].concat(itemsWithExtra, ));

	return (
		<div className="navbar">
			<div className="left-nav-item-group">
				{sortedItems.left.map(x => {
					return <a 
						href={x.link} 
						className={x.text === activePage ? "nav-link active-nav-link" : "nav-link"}
						onClick={e => {e.preventDefault(); history_.push(x.link)}}>
							{x.text}
						</a>
				})}
			</div>
			<div className="right-nav-item-group">
				{sortedItems.right.map(x => {
					return <a 
						href={x.link} 
						className={x.text === activePage ? "nav-link active-nav-link" : "nav-link"}
						onClick={e => {e.preventDefault(); history_.push(x.link)}}>
							{x.text}
						</a>
				})}
			</div>
		</div>
	);
}


export default NavBar;