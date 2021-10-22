import { useState } from "react";
import InviteForm from "./inviteForm/InviteForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import {Dialog} from "@primer/components";


const NavBar = ({loggedIn}) => {
	const [isOpen, setIsOpen] = useState(false);

	return (
		<>
			<div class="Header">
				<div class="Header-item f4">
					<a className="Header-link" href="/">Cumin</a>
				</div>
				{loggedIn && <div class="Header-item">
					<a className="Header-link" href="/roadmap">Roadmap</a>
				</div>}
				{loggedIn && <div class="Header-item">
					<a className="Header-link" href="/board">Board</a>
				</div>}
				{loggedIn && <div class="Header-item">
					<a className="Header-link" href="/backlog">Backlog</a>
				</div>}
				<div className="Header-item Header-item--full" />
				{loggedIn && <div class="Header-item">
					<button className="btn-octicon color-fg-on-emphasis" type="button" onClick={() => setIsOpen(true)}>
						<FontAwesomeIcon icon={faUserPlus} />
					</button>
				</div>}
				{loggedIn && <div class="Header-item">
					<a className="Header-link" href="/logout">Logout</a>
				</div>}
				{!loggedIn && <div class="Header-item">
					<a className="Header-link" href="/login">Login</a>
				</div>}
				{!loggedIn && <div class="Header-item">
					<a className="Header-link" href="/register">Register</a>
				</div>}
			</div>

			<Dialog isOpen={isOpen} onDismiss={() => setIsOpen(false)}>
				<Dialog.Header>Add Member</Dialog.Header>
				<div className="Box p-3 border-0">
					<InviteForm />
				</div>
			</Dialog>
		</>
	);
}


export default NavBar;