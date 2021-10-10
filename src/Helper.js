const http = {
	/**
	 * if Response body is requested, the promise will itself resolve into the result (as Object)
	 * @param {string} url 
	 * @param {string} method 
	 * @param {string} token 
	 * @param {object} body 
	 * @param {boolean} getResponseBody 
	 * @returns 
	 */
	request: async (url, method, token, body, getResponseBody) => {
		let fetchOptions = {
			mode: "cors",
			headers: {
				"Content-Type": "application/json"
			}
		};

		if (typeof url !== "string" || typeof method !== "string") {
			throw new Error("url and body must be string.");
		}

		fetchOptions.method = method;

		if (typeof body === "object" && body != null) {
			fetchOptions.body = JSON.stringify(body)
		}

		if (typeof token === "string") {
			fetchOptions.credentials = "include";
			fetchOptions.headers.Authorization = "Bearer " + token;
		}

		const response = await fetch(url, fetchOptions);

		if (!response.ok) {
			response.text()
			.then(e => {
				throw new Error(e)
			})
			
		}

		let responseBody = null;
		try {
			responseBody = await response.json();
		}
		catch {
			if (getResponseBody) {
				throw new Error("No response body as requested.");
			}
		}

		return responseBody;
	}
}

const css = {
	successBg: "bg-green",
	dangerBg: "bg-red",
	alertBg: "bg-yellow" 
}

const Helper = {
	logHttpResponseError: (response) => {
		console.log(`~ Status: ${response.status}, ${response.statusText}`)
	},
	getFetchOptions: () => {
		return {
			method: "GET",
			mode: "cors",
			credentials: "include",
			headers: {
				"Authorization": "Bearer " + localStorage.getItem("token"),
				"Content-Type": "application/json"
			},
			body: null
		}
	},
	httpRequest: async (url, method, body) => {
		const options = Helper.getFetchOptions();
		options.method = method;		

		const VerbsWithBody = {
			"POST": 1,
			"PUT": 1,
			"PATCH": 1
		}

		if (body != null) {
			if (VerbsWithBody[method] != undefined)
				options.body = body;
		}

		const response = await fetch(url, options);
		if (response.ok) {
			return response.json();
		}
		else {
			throw new Error("http error: " + response.status + " -> " + response.statusText);
		}
	},
	http: http,
	css: css,
	dateToInputString: (date) => {
		// Date.getMonth() returns 0 indexed month.
		let m = (date.getMonth() + 1).toString();
		let d = date.getDate().toString();
	  
		if (m.length < 2)
		  m = "0" + m;
	  
		if (d.length < 2)
		  d = "0" + d;
		return `${date.getFullYear()}-${m}-${d}`
	  },
	  fetch: async (url, method, body, getResponseBody, token = localStorage.getItem("token")) => {
		let fetchOptions = {
			mode: "cors",
			headers: {
				"Content-Type": "application/json"
			}
		};

		if (typeof url !== "string" || typeof method !== "string") {
			throw new Error("url and body must be string.");
		}

		fetchOptions.method = method;

		if (typeof body === "object" && body != null) {
			fetchOptions.body = JSON.stringify(body)
		}

		if (typeof token === "string") {
			fetchOptions.credentials = "include";
			fetchOptions.headers.Authorization = "Bearer " + token;
		}

		const response = await fetch(url, fetchOptions);

		if (!response.ok) {
			response.text()
			.then(e => {
				throw new Error(e)
			})
			
		}

		let responseBody = null;
		try {
			responseBody = await response.json();
		}
		catch {
			if (getResponseBody) {
				throw new Error("No response body as requested.");
			}
		}

		return responseBody;
	}
}



export default Helper;