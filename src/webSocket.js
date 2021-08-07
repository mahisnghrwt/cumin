class Socket {
	constructor() {
		// bind the connect function, so it could use "listeners" and "socket"
		// this.connect = this.connect.bind(this);
		this.listeners = {};
		this.socket = null;

		// bind the handleMessage func
		this.handleMessage = this.handleMessage.bind(this);
	}

	addListener(key, subKey, func) {
		if (typeof this.listeners[key] === "undefined")
			this.listeners[key] = {};
		this.listeners[key][subKey] = func;
	}

	removeListener(key, subKey = "") {
		if (typeof this.listeners[key] === "undefined") {
			return;
		}
		
		if (subKey === "") {
			this.listeners[key] = undefined;
			return;
		}

		this.listeners[key][subKey] = undefined;
	}

	// where do we handle errors for this??
	handleMessage(e) {
		let data = null;

		try {
			data = JSON.parse(e.data);
		} catch (e) {
			if (e instanceof SyntaxError) {
				console.error(e);
			}
			else {
				throw e;
			}
		}

		if (typeof this.listeners[data.eventName] === "undefined") {
			console.error("Not listening to websocket event: " + data.eventName);
			return;
		}

		Object.values(this.listeners[data.eventName]).forEach(func => {
			if (typeof func === "function") {
				func(data.payload)
			}
			else {
				// throw error maybe
			}
		});
	}

	connect(url, body, clearListeners = false) {
		this.socket = new WebSocket(url);

		this.socket.addEventListener("open", () => {
			this.socket.send(JSON.stringify(body));
			console.log(`Websocket open: ${this.isOpen()}`);
		});

		// what if I do not bind this func here, when called would it not be able to access class properties? sinces its
		// this would point to.....
		// actually depends how socket.message event calls it
		this.socket.addEventListener("message", this.handleMessage);
				
		this.socket.addEventListener("close", () => {
			console.log(`Websocket status: ${this.isOpen()}`);
		});

		if (clearListeners)
			this.listeners = {};
	}

	close() {
		if (this.isOpen() !== -1)
			this.socket.close();
	}

	isOpen() {
		if (!(this.socket instanceof WebSocket))
			return -1;
		return this.socket.OPEN;
	}
};

export default new Socket();