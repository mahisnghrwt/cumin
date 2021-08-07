import React, { useContext, useRef, useState } from 'react';
import NavBar from './NavBar';
import Global from "../GlobalContext"
import CreateIssueForm from './issue/CreateIssueForm';
import CreateSprintForm from './sprint/CreateSprintForm';
import SprintWrapper from './sprint/SprintWrapper';

const ACTIVE_PAGE = "Backlog";

const BacklogPage = (props) => {
	const [global, globalDispatch] = useContext(Global);

	if (global.project == null || global.project == undefined)
		return null;

	return (
	<>
		<NavBar loggedIn={true} activePage={ACTIVE_PAGE} />
		<div className="content">
			<h1>Backlog</h1>

			<h2>Sprints</h2>
			<SprintWrapper />
		</div>
		<div className="right-sidebar">
			<CreateIssueForm />
			<CreateSprintForm />
		</div>
	</>
	);
};

export default BacklogPage;