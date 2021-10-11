import React, {useContext, useEffect, useReducer, useState} from 'react';
import Global from '../GlobalContext';
import NavBar from './NavBar';
import Modal from "./modal/Modal";
import SidebarWrapper from "./sidebar2/SidebarWrapper";
import Sidebar from "./sidebar2/Sidebar";
import "./dashboard/dashboard.css";
import ProjectList from './dashboard/ProjectList';
import settings from "../settings";
import Helper from '../Helper';
import IssueItemCompacter from './issueItem/IssueItemCompacter';
import issueStatus from "./issue/issueStatus";
import CreateProjectForm from './dashboard/CreateProjectForm';

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
	const url = settings.API_ROOT + "/project/" + projectId + "/issue?detailed=true";
	try {
		return await Helper.fetch(url, "GET", null, true);
	}
	catch (e) {
		console.error(e);
		return [];
	}
}

const DashboardPage = (props) => {
	const [global,,] = useContext(Global);
	const [state, dispatch] = useReducer(reducer, null);
	const [modal, setModal] = useState(null);

	useEffect(() => {
		const sort = (result, issue) => {
			if (!issue.assignedTo) {
				return {
					...result,
					openIssues: [...result.openIssues, issue]
				}
			}
			else if (issue.assignedTo.id === global.user.id) {
				if (issue.status === issueStatus.IN_PROGRESS.value) {
					return {
						...result,
						inProgress: [...result.inProgress, issue]
					}
				}
				else if (issue.status === issueStatus.TODO.value) {
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
				const [projects, issues] = await Promise.all([fetchProjects(), fetchIssues(global.project.id)]);

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
	}, [])

	const addProject = project => {
		dispatch({type: "addProject", project: Helper.projectPreprocessing(project)});
	}

	const toggleCreateProjectModal = e => {
		setModal({title: "Create Project", body: <CreateProjectForm successCallback={addProject}/>})
	}

	return (
		<>
			<NavBar loggedIn={true} activePage={ACTIVE_PAGE} />
			<div className="container">
				<SidebarWrapper>
					<div className="content">
						<h1>Dashboard</h1>
						<div className="header">
							<h2 style={{display: "inlineBlock"}}>
								Projects
							</h2>
							<button onClick={toggleCreateProjectModal} className="std-button sm-button" style={{margin: "0"}}>+ project</button>
						</div>
						{(state && state.projects) && <ProjectList projects={state.projects} />}

						<h2>{global.project.name} overview</h2>
							{((state && Array.isArray(state.inProgress)) && state.inProgress.length > 0) &&
							<>
								<h3>Continue where you left</h3>
								<div className="dashboard-issue-list">
									{state.inProgress.map(issue => <IssueItemCompacter issue={issue} />)}
								</div>
							</>}
							{((state && Array.isArray(state.todo)) && state.todo.length > 0) &&
							<>
								<h3>More to do</h3>
								<div className="dashboard-issue-list">
									{state.todo.map(issue => <IssueItemCompacter issue={issue} />)}
								</div>
							</>}
							{((state && Array.isArray(state.openIssues)) && state.openIssues.length > 0) &&
							<>
								<h3>Help your team with</h3>
								<div className="dashboard-issue-list">
									{state.openIssues.map(issue => <IssueItemCompacter issue={issue} />)}
								</div>
							</>}
					</div>
					<Sidebar />
				</SidebarWrapper>
				{modal && <Modal title={modal.title} close={_ => setModal(null)}>
					{modal.body}
				</Modal>}
			</div>
		</>
		);
};

export default DashboardPage;