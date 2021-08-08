import { useEffect } from "react";

const resizeEpic = (epicId, face, targetDate) => {
	const epic = state.epics[epicId];

	if (targetDate.isEqual(epic.startDate) || targetDate.isEqual(epic.endDate)) {
		return;
	}

	if (shouldExtendCanvas(targetDate, state.canvas.endDate)) {
		increaseCanvasSizeBy(1);
	}

	dispatch({type: "UPDATE_EPIC", id: epic.id, patch: {
		startDate: face === EPIC_FACE.START ? targetDate : epic.startDate,
		endDate: face === EPIC_FACE.END ? targetDate : epic.endDate
	}})
}

/*
 *	This callback is the dispatch function which will be called
 * 	Returns a function that must be called.
 * 	Also takes state as argument
 */
export const useEpicResizer = (state, callback) => {
	const [localState, setLocalState] = useState({resizeEpic: null});

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

		setLocalState({resizeEpic});
	}, [state])
	
	return localState.resizeEpic;
}