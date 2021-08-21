import { useEffect, useRef } from "react";
import { getLastRow } from "../canvasHelper";

const useAddRowsToFitEpic = (state, dispatchCallback) => {
	const addRowsToFitEpic = useRef(null);
	
	useEffect(() => {
		addRowsToFitEpic.current = (epic) => {
			const lastRow = getLastRow(state.canvas.rows, epic)
			if (lastRow === state.canvas.rows)	
				return;

			dispatchCallback({type: "UPDATE_CANVAS", patch: {rows: lastRow + 1}});
		}
	}, [dispatchCallback, state.canvas.rows]);

	return addRowsToFitEpic;
}

export default useAddRowsToFitEpic;