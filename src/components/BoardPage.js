import { useContext, useEffect, useReducer, useState } from "react";
import NavBar from "./NavBar";
import Global from "../GlobalContext";
import Helper from "../Helper";
import settings from "../settings";
import _ from "lodash";
import { issuePreprocessing, sprintPreprocessing } from "./roadmap/canvas-m/canvasHelper";
import Board from "./board/Board";
import { faHeartBroken } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Dialog } from "@primer/components";
import CreateIssueForm from "./issue/CreateIssueForm";
import { faTrashAlt } from "@fortawesome/free-regular-svg-icons";
import connectToModels, { model } from "./hoc/connectToModels";

const status = ["Todo", "In Progress", "Done"];

const getStatusObject = status => {
	let defaultState = {};
	status.forEach(status_ => {
		defaultState[status_] = {};
	})
	return defaultState;
}

const sortIssueByStatus = (status, issues) => {
	let sorted = getStatusObject(status);

	issues.forEach(issue => {
		// filter in status that are in status array
		if (sorted[issue.status]) {
			sorted[issue.status][issue.id] = issue;
		}
	})

	return sorted;
}

const reducer = (state, action) => {
	switch(action.type) {
		case "update":
			return _.cloneDeep(action.state);
		case "patchIssueStatus":
			const nextState = _.cloneDeep(state);
			// so we can attach this issue to new status
			const issue = {...nextState.sortedIssues[action.oldStatus][action.issueId]};
			issue.status = action.status;
			// remove from old status
			delete nextState.sortedIssues[action.oldStatus][action.issueId];
			nextState.sortedIssues[action.status][action.issueId] = issue;
			return nextState;
		case "patchIssue":
			return {
				...state,
				sortedIssues: {
					...state.sortedIssues,
					[action.issueStatus]: {
						...state.sortedIssues[action.issueStatus],
						[action.issueId]: {
							...state.sortedIssues[action.issueStatus][action.issueId],
							...action.patch
						}
					}
				}
			}
		case "deleteIssue": {
			const nextState = {
				...state,
				sortedIssues: {
					...state.sortedIssues,
					[action.issueStatus]: {
						...state.sortedIssues[action.issueStatus]
					}
				}
			}
			delete nextState.sortedIssues[action.issueStatus][action.issueId];
			return nextState;
		}
		default:
			throw new Error(`Unknown case ${action.type}!`)
	}
}

const BoardPage = ({data, dataDispatch}) => {
	const [global,,] = useContext(Global);
	const [state, dispatch] = useReducer(reducer, null);
	const [modal, setModal] = useState(null);


	const fetchActiveSprint = async () => {
		const url = settings.API_ROOT + "/project/" + global.project.id + "/active-sprint";
		const activeSprint = await Helper.http.request(url, "GET", localStorage.getItem("token"), null, true);
		return activeSprint;
	}

	const patchIssueStatus = async (issueId, oldStatus, status) => {
		const patch = {status};
		const url = settings.API_ROOT + "/project/" + global.project.id + "/issue/" + issueId;
		try {
			await Helper.http.request(url, "PATCH", localStorage.getItem("token"), patch, false);
			dispatch({type: "patchIssueStatus", issueId, status, oldStatus});
		} catch (e) {
			throw e;
		}
	}

	const updateIssue = (staleIssue, issue) => {
		const issue_ = issuePreprocessing(issue);
		if (issue_.status !== staleIssue.status)
			dispatch({type: "patchIssueStatus", oldStatus: staleIssue.status, status: issue_.status, issueId: issue_.id});
		dispatch({type: "patchIssue", issueStatus: issue_.status, issueId: issue_.id, patch: issue_});
	}

	const deleteIssue = async (issueId, issueStatus) => {
		const url = `${settings.API_ROOT}/project/${global.project.id}/issue/${issueId}`;
		try {
			await Helper.fetch(url, "DELETE", null, false);
			dispatch({type: "deleteIssue", issueId, issueStatus});
		} catch (e) {
			throw e;
		}
	}

	useEffect(() => {
		if (!global.project) return;

		void async function() {
			try {
				const activeSprint = await fetchActiveSprint();
				const activeSprintProcessed = sprintPreprocessing(activeSprint);
				const sortedIssues = sortIssueByStatus(status, activeSprintProcessed.issues);
				dispatch({type: "update", state: {...activeSprintProcessed, issues: undefined, sortedIssues}});
			} catch (e) {
				console.error(e);
			}
		}()
	}, [])

	return (
		<>
			<NavBar />
			<div className="Layout container-xl">
				<div className="Layout-main">
					<h1 className="h1 mb-4">Board</h1>
					{!global.project ?
						<div className="Box">
							<div class="blankslate">
								<FontAwesomeIcon className="f1" icon={faHeartBroken} />
								<h3 className="mb-1">You don’t seem to have any active sprint.</h3>
								<p>Select a project <span>&#8594;</span> Start a sprint to continue.</p>
								<a className="btn btn-primary my-3" href="/backlog">Go to Backlog</a>
							</div>
						</div>
					:
						<div className="d-flex flex-row flex-nowrap flex-justify-between flex-items-start">
							{Object.keys(state.sortedIssues).map(statusType => {
								return <Board 
									title={statusType} 
									issues={Object.values(state.sortedIssues[statusType])}
									patchIssueStatus={patchIssueStatus} 
									issueEditHandler={(issueId) => 
										setModal({title: state.sortedIssues[statusType][issueId].title, body: 
											<CreateIssueForm 
												sprints={data.SPRINT} 
												epics={data.EPIC} 
												members={data.MEMBER} 
												successCallback={updateIssue} 
												originalIssue={state.sortedIssues[statusType][issueId]} 
											/>,
											actions: 
											<button className="btn btn-sm btn-danger ml-2" onClick={() => deleteIssue(issueId, statusType)} type="button">
												<FontAwesomeIcon icon={faTrashAlt} />
											</button>
										})
									}
								/>
							})}
						</div>
					}
				</div>
			</div>
			<Dialog isOpen={modal !== null} onDismiss={() => setModal(null)}>
				{modal && 
				<><Dialog.Header>
					<div className="d-flex flex-items-center">
						<span>{modal.title}</span>
						{modal.actions}
					</div>
				</Dialog.Header>
				<div className="Box p-3 border-0">
					{modal.body}
				</div></>}
			</Dialog>
		</>
	)
}

const BoardPageWithModels = connectToModels(BoardPage, [model.SPRINT, model.EPIC, model.MEMBER]);
BoardPageWithModels.displayName = "BoardPageWithModels";

export default BoardPageWithModels;