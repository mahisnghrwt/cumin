import React, {useContext, useEffect, useReducer, useRef, useState} from 'react';
import Global from '../GlobalContext';
import {NavItem, LOGGED_IN} from './classes/NavItem';
import NavBar from './NavBar';
import ProjectWrapper from "./project/ProjectWrapper";

const ACTIVE_PAGE = "Dashboard";

const DashboardPage = (props) => {
	const [global, globalDispatch] = useContext(Global);

	let projectNavItem = null;
	if (typeof global.project === "object" && global.project != null) {
		projectNavItem = new NavItem(global.project.name, "", true, LOGGED_IN);
	}

	return (
		<>
			<NavBar loggedIn={true} activePage={ACTIVE_PAGE} extraItems={projectNavItem == null ? [] : [projectNavItem]} />
			<div className="content">
				<h1>Dasboard</h1>
				<ProjectWrapper />
			</div>
		</>
	);
};

export default DashboardPage;