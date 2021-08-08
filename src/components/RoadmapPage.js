import NavBar from "./NavBar";
import CreateEpicForm from "./roadmap/CreateEpicForm";
import Canvas from "./roadmap/canvas-m/Canvas";
import { useRef, useState } from "react";
import AlertBar from "./AlertBar";

const ACTIVE_PAGE = "Roadmap";

const RoadmapPage = () => {

	const [alert, setAlert_] = useState(null);
	const canDropEpic = useRef(false);

	const setAlert = (messageJsx, type) => {
		if (messageJsx === null) {
			setAlert_(null);
			return;
		}

		setAlert_({message: messageJsx, type});
	}

	return (
		<>
			<NavBar loggedIn={true} activePage={ACTIVE_PAGE} extraItems={[]} />
			{alert !== null && <AlertBar messageJsx={alert.message} alertType={alert.type} />}
			<div className="content">
				<div className="right-sidebar">
					<CreateEpicForm canDropEpic={canDropEpic}/>
				</div>
				<h1>Roadmap</h1>
				<div className="canvas-wrapper">
					<Canvas setAlert={setAlert} canDropEpic={canDropEpic} />
				</div>
			</div>
		</>
	)

}

export default RoadmapPage;