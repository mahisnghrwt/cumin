import Helper from "../../../Helper";
import settings from "../../../settings";

const ApiCalls = {
	patchEpicDuration: async (epic, projectId, token) => {
		const reqBody = {startDate: epic.startDate, endDate: epic.endDate};
		const url = settings.API_ROOT + "/project/" + projectId + "/epic/" + epic.id;

		try {
			const patchedEpic = await Helper.http.request(url, "PATCH", token, reqBody, true);
			console.log(patchedEpic);
		} catch (e) {
			console.error(e);
		}
	}
}

export default ApiCalls;