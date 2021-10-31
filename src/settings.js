const settings = {
	API_ROOT: process.env.NODE_ENV === 'production' ? 'https://echobash.com/api/v1' : "https://localhost:44370/api/v1",
	SIGNAL_R_URL: process.env.NODE_ENV === 'production' ? 'https://echobash.com/notification' : "https://localhost:44370/notification",
	getProjectUrl: function(projectId) {
		if (!projectId) return this.API_ROOT + "/project"
		return `${settings.API_ROOT}/project/${projectId}`;
	}
}

Object.freeze(settings);

export default settings;