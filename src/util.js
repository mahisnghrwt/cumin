const util = {
	httpRequest: async (url, method, body) => {
		const options = {
			method: "GET",
			mode: "cors",
			credentials: "include",
			headers: {
				"Authorization": "Bearer " + localStorage.getItem("token"),
				"Content-Type": "application/json"
			},
			body: null
		};
		options.method = method;		

		if (body !== undefined) {
			options.body = body;
		}

		const response = await fetch(url, options);

		return response
	}
}

export default util;