import { useEffect, useRef } from "react";
import {EPIC_FACE} from "./canvasEnums";

const useEpicResizer = (state, dispatchCallback) => {
	const resizeEpicRef = useRef(null);

	useEffect(() => {
		const resizeEpic = (epicId, face, targetDate) => {
			let epic = state.epics[epicId];
			if (epicId === "intermediate")
				epic = state.intermediate.epic;
	
			if (targetDate.isEqual(epic.startDate) || targetDate.isEqual(epic.endDate)) {
				return;
			}
	
			// if (shouldExtendCanvas(targetDate, state.canvas.endDate)) {
			// 	increaseCanvasSizeBy(1);
			// }
	
			let action = {type: "UPDATE_EPIC", id: epic.id, patch: {
				startDate: face === EPIC_FACE.START ? targetDate : epic.startDate,
				endDate: face === EPIC_FACE.END ? targetDate : epic.endDate
			}};

			if (epicId === "intermediate") {
				dispatchCallback({type: "UPDATE_INTERMEDIATE_EPIC", epic: {...action.patch}});
			}
			else {
				dispatchCallback(action);
			}
		}

		resizeEpicRef.current = resizeEpic;

	}, [state, dispatchCallback])
	

	return resizeEpicRef;
}

export default useEpicResizer;