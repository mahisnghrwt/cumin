import Helper from "../../Helper";
import Form from "../form/Form";
import InputItem from "../form/InputItem";
import LogItem from "../form/LogItem";
import formItemSize from "../form/formItemSize";
import Button from "../form/Button";
import settings from "../../settings"

const CreateProjectForm = ({successCallback}) => {
	const formFields = ["name"];

	const createProject = async formValues => {
		const name = formValues.name.trim();
		if (name.length === 0)
			throw new Error("Name is required!");

		const body = { name };
		const url = `${settings.API_ROOT}/project`;
		const project = await Helper.fetch(url, "POST", body, true);

		successCallback(project);
	}

	return (
		<div className="form-wrapper" style={{width: "600px"}}>
			<Form formFields={formFields}>
				<div className="form-row" style={{alignItems: "flex-end"}}>
					<InputItem kKey="name" label="Name" size={formItemSize.SMALL} required />
					<Button kKey="save" label="Create" onClick={createProject} doesSubmit={true} style={{margin: "0"}} />
				</div>
				<div className="form-row">
					<LogItem />
				</div>
			</Form>
		</div>
	)
}

export default CreateProjectForm;