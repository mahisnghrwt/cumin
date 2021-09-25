import React, { useContext } from "react";
import Global from "../../GlobalContext";
import settings from "../../settings";
import Helper from "../../Helper";
import ToggleContainer from "../toggleContainer/ToggleContainer";
import ToggleHeader from "../toggleContainer/ToggleHeader";
import ToggleBody from "../toggleContainer/ToggleBody";
import Form from "../form/Form";
import InputItem from "../form/InputItem";
import formItemSize from "../form/formItemSize";
import Button from "../form/Button";

const CreateSprintForm = (props) => {
	const [global,,] = useContext(Global);

	const createSprint = async (formValues) => {
		const POST_SPRINT_URL = `${settings.API_ROOT}/project/${global.project.id}/sprint`;
		const token = localStorage.getItem("token");
		const sprint = {...formValues, projectId: global.project.id};
		try {
			await Helper.http.request(POST_SPRINT_URL, "POST", token, sprint, false);
		} catch (e) {
			console.error(e);
		}
	}

	if (global.project === undefined || global.project.id === undefined) {
		return (
			<pre>You must select a Project to work on.</pre>
		)
	}

	const formFields = ["title"];

	const titleValidator = title => {
		if (title.length < 1)
			return "Title cannot be empty."

		return null;
	}

	return (
		<ToggleContainer enabled={false}>
			<ToggleHeader>
				<h3>Create Sprint</h3>
			</ToggleHeader>
			<ToggleBody>
				<Form formFields={formFields}>
					<div className="form-row" style={{alignItems: "flex-end"}}>
						<InputItem kKey="title" label="Title" size={formItemSize.SMALL} validator={titleValidator} />
						<Button kKey="create" label="Create" doesSubmit={true} onClick={createSprint} />
					</div>
				</Form>
			</ToggleBody>
		</ToggleContainer>
	);
}

export default CreateSprintForm;