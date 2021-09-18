import { useContext, useEffect, useReducer } from "react";
import IssueItemDetailed from "./IssueItemDetailed"
import Helper from "../../Helper";
import settings from "../../settings";
import Global from "../../GlobalContext";
import sidebarContext from "../sidebar/sidebarContext";
import EditIssueForm from "../issue/EditIssueForm";

const defaultState = {issuesByEpic: {}};

const reducer = (state, action) => {
	switch(action.type) {
		case "NEW":
			return {
				...action.state
			}
	}
}

const groupByEpic = issues => {
	let grouped = {};

	for(let i = 0; i < issues.length; i++) {
		const epicId = issues[i].epicId;
		if (epicId === null) continue;
		if (grouped[epicId] === undefined)
			grouped[epicId] = [];

		grouped[epicId] = [...grouped[epicId], issues[i]]
	}

	return grouped;
}

const findIssueFromState = (state, issueId) => {
	let issue = {};
	debugger;
	Object.values(state.issuesByEpic).map(issues => issues.map(issue_ => {
		if (issue_.id === issueId) {
			issue = {...issue_};
		}
	}))

	return issue;
}

const IssueItemList = ({selectedEpic = null}) => {
	const [state, dispatch] = useReducer(reducer, defaultState);
	const [global,,] = useContext(Global);

	const actions = {
		Edit: issueId => {
			// find the epic
			const issue = findIssueFromState(state, issueId);

			{/* <SidebarTabContent kKey={sidebarTabs.editEpic}>
							{issue !== null && <EditIssueForm issue={issue} />}
						</SidebarTabContent> */}
			// addTab("editEpic", "Edit Epic", <EditIssueForm issue={issue} />);
			// switchTab("editEpic");
			// update
			// editIssue(issue);
		},
		Delete: issueId => {

		}
	};

	const fetchIssues = async () => {
		const url = `${settings.API_ROOT}/project/${global.project.id}/issue`;
		const token = localStorage.getItem("token");

		try {
			const issues = await Helper.http.request(url, "GET", token, null, true);
			return issues;
		} catch (e) {
			console.error(e);
		}

		return null;
	}

	useEffect(() => {
		fetchIssues()
		.then(issues => {
			const groupedIssues = groupByEpic(issues);
			dispatch({type: "NEW", state: {issuesByEpic: groupedIssues}})
		})
		.catch(e => console.error(e));
	}, []);

	if (selectedEpic === null || selectedEpic === undefined) return null;

	return (
		<div className="issue-item-list">
			<h4>Issues in this Epic</h4>
			{	state.issuesByEpic[selectedEpic] === undefined &&
				<p>No issues under this epic.</p>
			}
			{
				state.issuesByEpic[selectedEpic] !== undefined &&
				state.issuesByEpic[selectedEpic].map(issue => <IssueItemDetailed issue={issue} actions={actions} />)
			}
		</div>
	) 
}

export default IssueItemList;