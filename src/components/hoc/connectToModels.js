import { useContext, useEffect, useReducer } from "react"
import Global from "../../GlobalContext"
import Helper from "../../Helper"
import settings from "../../settings"
import { epicPreprocessing, issuePreprocessing, sprintPreprocessing } from "../roadmap/canvas-m/canvasHelper"

const fetchSprints = async projectId => {
	const url = settings.API_ROOT + "/project/" + projectId + "/sprint";
	return await Helper.fetch(url, "GET", null, true);
}

const fetchEpics = async projectId => {
	const url = settings.API_ROOT + "/project/" + projectId + "/epic";
	return await Helper.fetch(url, "GET", null, true);
}

const fetchIssues = async projectId => {
	const url = settings.API_ROOT + "/project/" + projectId + "/issue";
	return await Helper.fetch(url, "GET", null, true);
}

const fetchMembers = async projectId => {
	const url = settings.API_ROOT + "/project/" + projectId + "/member";
	return await Helper.fetch(url, "GET", null, true);
}

export const model = {
	SPRINT: {
		key: "SPRINT",
		fetch: fetchSprints,
		pipeline: [sprintPreprocessing]
	},
	EPIC: {
		key: "EPIC",
		fetch: fetchEpics,
		pipeline: [epicPreprocessing]
	},
	ISSUE: {
		key: "ISSUE",
		fetch: fetchIssues,
		pipeline: [issuePreprocessing]
	},
	MEMBER: {
		key: "MEMBER",
		fetch: fetchMembers,
		pipeline: []
	}
}

const reducer = (state, action) => {
	switch(action.type) {
		case "update": {
			return {
				...action.update
			}
		}
		default:
			throw new Error(`Unknown case ${action.type}!`);
	}
}

export default (ComposedComponent, models) => {
	return (props) => {
		const [data, dataDispatch] = useReducer(reducer, null);
		const [global,,] = useContext(Global);

		useEffect(() => {
			if (!global.project) return;

			void async function() {
				const results = await Promise.allSettled(Object.values(models).map(x => x.fetch(global.project.id)));

				let nextState = {};
				// so we can map results' index to the model
				const modelsRequested = Object.values(models).map(x => x.key);
				let i = 0;
				for (const result of results) {
					const key = modelsRequested[i];
					const modelValues = (result.status === "rejected" ? [] : result.value).map(x => {
						return model[key].pipeline.reduce((acc, current) => current(acc), x)
					});

					nextState[key] = modelValues;

					i++;
				}

				dataDispatch({type: "update", update: nextState});
			}();
		}, [])

		return (
			<ComposedComponent {...props} data={data} dataDispatch={dataDispatch} />
		)
	}
}