const settings = {
	WEBSOCKET_HOST: "wss://localhost:44370",
	// API_ROOT: "http://localhost:80/api/v1",
	__API_ROOT: "https://localhost:443/api/v1",
	API_ROOT: process.env.NODE_ENV === 'production' ? 'https://143.198.208.237:44343/api/v1' : "https://localhost:44370/api/v1",
	SIGNAL_R_URL: process.env.NODE_ENV === 'production' ? 'https://143.198.208.237:44343/notification' : "https://localhost:44343/notification",
	getProjectUrl: function(projectId) {
		if (!projectId) return this.API_ROOT + "/project"
		return `${settings.API_ROOT}/project/${projectId}`;
	}
}

Object.freeze(settings);

export default settings;