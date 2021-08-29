import { useEffect } from "react";
import webSocket from "../../webSocket";

const useSocketEvent = (componentId, socketEvent, callback) => {
	useEffect(() => {
		webSocket.addListener(socketEvent, componentId, callback);

		return () => webSocket.removeListener(socketEvent, componentId);
	}, [callback])
}

export default useSocketEvent;