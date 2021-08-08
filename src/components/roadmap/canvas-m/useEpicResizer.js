import { useEffect, useRef } from "react";
import {EPIC_FACE} from "./canvasEnums";

const useEpicResizer = (state, callback) => {
	const resizeEpicRef = useRef(null);

	useEffect(() => {
		const resizeEpic = (epicId, face, targetDate) => {
			const epic = state.epics[epicId];
	
			if (targetDate.isEqual(epic.startDate) || targetDate.isEqual(epic.endDate)) {
				return;
			}
	
			// if (shouldExtendCanvas(targetDate, state.canvas.endDate)) {
			// 	increaseCanvasSizeBy(1);
			// }
	
			callback({type: "UPDATE_EPIC", id: epic.id, patch: {
				startDate: face === EPIC_FACE.START ? targetDate : epic.startDate,
				endDate: face === EPIC_FACE.END ? targetDate : epic.endDate
			}})
		}

		resizeEpicRef.current = resizeEpic;

	}, [state, callback])
	

	return resizeEpicRef;
}

export default useEpicResizer;