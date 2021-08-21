import NavBar from "./NavBar";
import CreateEpicForm from "./roadmap/CreateEpicForm";
import Canvas from "./roadmap/canvas-m/Canvas";
import { useRef, useState, useReducer } from "react";
import AlertBar from "./AlertBar";
import {add} from "date-fns"
import reducer from "./roadmap/canvas-m/canvasReducer";
import CanvasToolbar from "./roadmap/CanvasToolbar";

const ACTIVE_PAGE = "Roadmap";

const CANVAS_DEFAULT_LENGTH = 60;
const CANVAS_DEFAULT_ROWS = 0;

const RoadmapPage = () => {
	const [alert, setAlert_] = useState(null);
	const [state, dispatch] = useReducer(reducer, {epics: {}, paths: {}, intermediate: {}, canvas: {
		startDate: new Date(),
		endDate: add(new Date(), {days: CANVAS_DEFAULT_LENGTH}),
		rows: CANVAS_DEFAULT_ROWS
	}});

	const setAlert = (messageJsx, type) => {
		if (messageJsx === null) {
			setAlert_(null);
			return;
		}

		setAlert_({message: messageJsx, type});
	}

	const clearIntermediateEpic = () => {
		dispatch({type: "UPDATE_INTERMEDIATE_EPIC", epic: null});
	}

	const addRows = (rows) => {
		dispatch({type: "ADD_ROWS_TO_CANVAS", rows});
	}

	return (
		<>
			<NavBar loggedIn={true} activePage={ACTIVE_PAGE} extraItems={[]} />
			{alert !== null && <AlertBar messageJsx={alert.message} alertType={alert.type} />}
			<div className="roadmap-container">
				<div className="right-sidebar">
					<CreateEpicForm setAlert={setAlert} intermediateEpic={state.intermediate.epic} clearIntermediateEpic={clearIntermediateEpic} />
				</div>
				<h1>Roadmap</h1>
				<CanvasToolbar buttons={[{label: "Add Row +", action: () => addRows(1)}]}/>
				<div className="canvas-wrapper">
					<Canvas state={state} dispatch={dispatch} setAlert={setAlert} />
				</div>
			</div>
		</>
	)

}

export default RoadmapPage;