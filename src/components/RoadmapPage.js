import NavBar from "./NavBar";
import CreateEpicForm from "./roadmap/CreateEpicForm";
import Canvas from "./roadmap/canvas-m/Canvas";

const ACTIVE_PAGE = "Roadmap";

const RoadmapPage = () => {

	return (
		<>
			<NavBar loggedIn={true} activePage={ACTIVE_PAGE} extraItems={[]} />
			<div className="content">
				<div className="right-sidebar">
					<CreateEpicForm />
				</div>
				<h1>Roadmap</h1>
				<div className="canvas-wrapper">
					<Canvas />
				</div>
			</div>
		</>
	)

}

export default RoadmapPage;