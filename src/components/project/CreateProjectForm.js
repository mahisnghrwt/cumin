import {useState} from 'react';
import settings from "../../settings";
import Helper from '../../Helper';

const CreateProjectForm = ({addProject}) => {
	const [state, setState] = useState({name: ""});

	const create = async () => {
		const CREATE_PROJECT_URL = settings.API_ROOT + "/project";

		try {
			const project = await Helper.http.request(CREATE_PROJECT_URL, 
							"POST", 
							localStorage.getItem("token"), 
							{name: state.name}, 
							true);

			addProject(project);
			// clear the name field
			setState({name: ""});
		} catch (e) {
			console.error(e);
		}
	}

	return (
		<>
			<h3>Create Project</h3>
			<form onSubmit={e => e.preventDefault()}>
				<div className="form-row">
					<div className="form-item sm">
						<label>Name: </label>
						<input type="text" value={state.name} onChange={e => setState({name: e.target.value})}></input>
					</div>
					<button className="x-sm" onClick={create}>Create</button>
				</div>	
			</form>
		</>
	);
};

export default CreateProjectForm;