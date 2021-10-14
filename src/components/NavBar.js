import {NavItem, LOGGED_IN, LOGGED_OUT, ALWAYS} from "../components/classes/NavItem";
import { useHistory } from "react-router";
import { useState } from "react";
import Modal from "./modal/Modal";
import InviteForm from "./inviteForm/InviteForm";

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


const NavBar = ({loggedIn, activePage, extraItems = []}) => {
	const history_ = useHistory();
	const [modal, setModal] = useState(null);

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

	const enableInvitationForm = e => {
		e.preventDefault();
		setModal({title: "Invite", body: <InviteForm />})
	}

	return (
		<>
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
					<a 
						key={"invite"}
						href=""
						className={"nav-link"}
						onClick={enableInvitationForm}>
							+ Member
						</a>
					{sortedItems.right.map(x => {
						return <a 
							key={x.text}
							href={x.link} 
							className={x.text === activePage ? "nav-link active-nav-link" : "nav-link"}
							onClick={e => {e.preventDefault(); history_.push(x.link)}}>
								{x.text}
							</a>
					})}
				</div>
				
			</div>
			{modal && <Modal title={modal.title} close={_ => setModal(null)}>
				{modal.body}
			</Modal>}
		</>
	);
}


export default NavBar;