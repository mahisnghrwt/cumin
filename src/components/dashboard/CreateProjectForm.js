import Helper from "../../Helper";
import settings from "../../settings"
import Form, { Input, SubmitButton } from "../form/v2/Form";

const CreateProjectForm = ({ successCallback }) => {
	const formFields = {
		name: {
			value: "",
			validate: name => {
				if (!name || name.trim().length === 0)
					return "Name is required!";
			}
		}
	}

	const createProject = async formValues => {
		const body = { name: formValues.name };
		const url = settings.getProjectUrl();
		const project = await Helper.fetch(url, "POST", body, true);
		successCallback(project);
	}

	return (
		<Form formFields={formFields}>
			<Input label="Name" kKey="name" key="name" type="text" />
			<div class="form-actions">
				<SubmitButton label="Create" onClick={createProject} />
			</div>
		</Form>
	);
}

export default CreateProjectForm;