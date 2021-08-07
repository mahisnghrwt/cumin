import Global from "../GlobalContext";
import NavBar from "./NavBar";
import { useContext } from "react";
import CreateEpicForm from "./roadmap/CreateEpicForm";

const ACTIVE_PAGE = "Roadmap";

const RoadmapPage = () => {
	const [global, globalDispatch] = useContext(Global);

	return (
		<>
			<NavBar loggedIn={true} activePage={ACTIVE_PAGE} extraItems={[]} />
			<div className="content">
				<div className="right-sidebar">
					<CreateEpicForm />
				</div>
				<h1>Roadmap</h1>
			</div>
		</>
	)

}

export default RoadmapPage;