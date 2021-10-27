import React, {useContext, useEffect, useReducer, useState} from 'react';
import Global from '../GlobalContext';
import NavBar from './NavBar';
import SidebarWrapper from "./sidebar2/SidebarWrapper";
import Sidebar from "./sidebar2/Sidebar";
import ProjectList from './dashboard/ProjectList';
import settings from "../settings";
import Helper from '../Helper';
import IssueItemCompacter from './issueItem/IssueItemCompacter';
import issueStatus from "./issue/issueStatus";
import CreateProjectForm from './dashboard/CreateProjectForm';
import { Dialog } from '@primer/components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartBroken } from '@fortawesome/free-solid-svg-icons';

const ACTIVE_PAGE = "CUMIN"
const reducer = (state, action) => {
	switch(action.type) {
		case "updateState":
			return {
				...action.state
			}
		case "addProject": {
			if (state === null)
				return {
					projects: [action.project]
				}
			return {
				...state,
				projects: [...state.projects, action.project]
			}
		}
		case "deleteProject":
			const projects = [...state.projects];
			const index = projects.findIndex(x => x.id === action.projectId);
			projects.splice(index);
			return {
				...state,
				projects
			}
		default:
			console.error("Unexpected case: " + action.type);
	}
}

const fetchProjects = async () => {
	const url = settings.API_ROOT + "/project";
	try {
		return await Helper.fetch(url, "GET", null, true);
	}
	catch (e) {
		console.error(e);
		return [];
	}
}

const fetchIssues = async (projectId) => {
	if (!projectId) return [];

	const url = settings.API_ROOT + "/project/" + projectId + "/issue?detailed=true";
	try {
		return await Helper.fetch(url, "GET", null, true);
	}
	catch (e) {
		console.error(e);
		return [];
	}
}

const DashboardPage = () => {
	const [global, globalDispatch] = useContext(Global);
	const [state, dispatch] = useReducer(reducer, null);
	const [isOpen, setIsOpen] = useState(false);

	useEffect(() => {
		const sort = (result, issue) => {
			// ignore if issue already 'DONE'
			if (issue.status === issueStatus.DONE.value)
				return result;

			if (!issue.assignedTo) {
				// open issues
				return {
					...result,
					openIssues: [...result.openIssues, issue]
				}
			}
			else if (issue.assignedTo.id === global.user.id) {
				// issues assigned to user
				if (issue.status === issueStatus.IN_PROGRESS.value) {
					return {
						...result,
						inProgress: [...result.inProgress, issue]
					}
				}
				else if (issue.status === issueStatus.TODO.value) {
					// issues user is working on
					return {
						...result,
						todo: [...result.todo, issue]
					}
				}
			}

			return result;
		}
		void async function() {
			try {
				const [projects, issues] = await Promise.all([fetchProjects(), fetchIssues(global.project ? global.project.id : null)]);

				let nextState = {};
				nextState.projects = projects.map(project => Helper.projectPreprocessing(project));

				const issuesProcessed = issues.map(issue => Helper.detailedIssuePreprocessing(issue));
				nextState = {
					...nextState,
					...(issuesProcessed.reduce(sort, {todo: [], inProgress: [], openIssues: []}))
				}
				
				dispatch({type: "updateState", state: nextState});
			} catch (e) {
				throw e;
			}
		}();
	}, [global.project])

	const addProject = project => {
		dispatch({type: "addProject", project: Helper.projectPreprocessing(project)});
	}

	const selectProject = async projectId => {
		const project = state.projects.find(x => x.id === projectId);
		if (!project)
			throw new Error(`Project with id: ${projectId} not found!`);

		const url = settings.API_ROOT + "/project/" + projectId + "/active-project";
		await Helper.fetch(url, "PATCH", null);

		globalDispatch({ type: "UPDATE_PROJECT", project });
	}

	const deleteProject = async projectId => {
		const url = settings.API_ROOT + "/project/" + projectId;
		await Helper.fetch(url, "DELETE", null, false);

		dispatch({ type: "deleteProject", projectId });
		if (global.project && global.project.id === projectId)
			globalDispatch({type: "updateProject", update: null});
	}

	const leaveProject = async projectId => {
		const url = settings.API_ROOT + "/project/" + projectId + "/user";
		await Helper.fetch(url, "DELETE", null, false);

		dispatch({ type: "deleteProject", projectId });
		if (global.project && global.project.id === projectId)
			globalDispatch({type: "updateProject", update: null});
	}

	return (
		<>
			<NavBar loggedIn={true} />
			<div className="Layout container-lg">
				<div className="Layout-main">
					<SidebarWrapper>
						<h1 className="h1">Dashboard</h1>
						<div class="Subhead Subhead--spacious">
							<div class="Subhead-heading">Projects</div>
							<div class="Subhead-actions">
								<button className="btn btn-sm btn-primary" onClick={() => setIsOpen(true)}>+ project</button>
							</div>
						</div>
						{(state && state.projects) && <ProjectList projects={state.projects} selectProject={selectProject} />}
						{!global.project 
						? <div className="Box">
							<div class="blankslate">
								<FontAwesomeIcon className="f1" icon={faHeartBroken} />
								<h3 className="mb-1">You don’t seem to have any active project.</h3>
								<p>Select a project to see insight.</p>
							</div>
						</div> 
						: <>
							<div class="Subhead Subhead--spacious">
								<div class="Subhead-heading">
									<strong>{global.project.name} </strong>
									<span>Overview</span>
								</div>
								<div class="Subhead-actions">
									{ global.project 
									&& <>
										<button className="btn btn-sm btn-danger mr-2" onClick={ () => leaveProject(global.project.id) } type="button">Leave Project</button>
										{ global.isPm() 
										&& <button className="btn btn-sm btn-danger" onClick={ () => deleteProject(global.project.id) } type="button">Delete Project</button> }
									</>}	
								</div>
							</div>
							{((state && Array.isArray(state.inProgress)) && state.inProgress.length > 0) &&
							<>
								<div className="f3 mb-2">Continue where you left</div>
								<div className="Box mb-4">
									{state.inProgress.map(issue => <IssueItemCompacter issue={issue} />)}
								</div>
							</>}

							{((state && Array.isArray(state.todo)) && state.todo.length > 0) &&
							<>
								<div className="f3 mb-2">More to do</div>
								<div className="Box mb-4">
									{state.todo.map(issue => <IssueItemCompacter issue={issue} />)}
								</div>
							</>}

							{((state && Array.isArray(state.openIssues)) && state.openIssues.length > 0) &&
							<>
								<div className="f3 mb-2">Help your team with</div>
								<div className="Box mb-4">
									{state.openIssues.map(issue => <IssueItemCompacter issue={issue} />)}
								</div>
							</>}
						</>}

						<Sidebar />
					</SidebarWrapper>
				</div>
				<Dialog isOpen={isOpen} onDismiss={() => setIsOpen(false)}>
					<Dialog.Header>Create Project</Dialog.Header>
					<div className="Box p-3 border-0">
						<CreateProjectForm successCallback={addProject} />
					</div>
				</Dialog>
			</div>
		</>
		);
};

export default DashboardPage;