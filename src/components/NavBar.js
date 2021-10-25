import { useContext, useState } from "react";
import InviteForm from "./InviteForm";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import {Dialog} from "@primer/components";
import Global from "../GlobalContext";
import { useHistory } from "react-router";
import { Link } from "react-router-dom";

const NavBar = () => {
	const history = useHistory();
	const [isOpen, setIsOpen] = useState(false);
	const [global, globalDispatch] = useContext(Global);
	const loggedIn = (global && global.user) ? true : false;

	const logout = () => {
		// delete the token from localstorage to logout :)
		localStorage.removeItem("token");
		debugger;
		globalDispatch({type: "update", update: {user: null, isPm: global.isPm}});

		// redirect the user back to login page
		history.push('/login');
	}

	return (
		<>
			<div className="Header mb-4">
				<div className="Header-item f4">
					<Link className="Header-link" to="/">Cumin</Link>
				</div>
				{loggedIn && <div class="Header-item">
					<Link className="Header-link" to="/roadmap">Roadmap</Link>
				</div>}
				{loggedIn && <div class="Header-item">
					<Link className="Header-link" to="/board">Board</Link>
				</div>}
				{loggedIn && <div class="Header-item">
					<Link className="Header-link" to="/backlog">Backlog</Link>
				</div>}
				<div className="Header-item Header-item--full" />
				{loggedIn && <div class="Header-item">
					<button className="btn-octicon color-fg-on-emphasis" type="button" onClick={() => setIsOpen(true)}>
						<FontAwesomeIcon icon={faUserPlus} />
					</button>
				</div>}
				{loggedIn && <div class="Header-item">
					<button className="btn-link Header-link" type="button" onClick={logout}>
						Logout
					</button>
				</div>}
				{/* {loggedIn && <div class="Header-item">
					<a className="Header-link" href="/logout">Logout</a>
				</div>} */}
				{!loggedIn && <div class="Header-item">
					<Link className="Header-link" to="/login">Login</Link>
				</div>}
				{!loggedIn && <div class="Header-item">
					<Link className="Header-link" to="/register">Register</Link>
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