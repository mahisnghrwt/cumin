import Helper from "../../Helper";
import settings from "../../settings"
import { useContext } from "react";
import Global from "../../GlobalContext"
import Form, {SubmitButton, Input} from "../form/v2/Form";

const InviteForm = () => {
	const [{project: {id: projectId}},,] = useContext(Global);

	const sendInvitation = async formValues => {
		try {
			let body = {
				username: formValues.username,
			};

			const url = settings.getInvitationUrl(projectId);
			await Helper.fetch(url, "POST", body, false);
		} catch (e) {
			throw e;
		}
	}	

	const formFields = {
		username: {
			value: "",
			validate: (username) => {
				if (!username)
					return "Username is required.";
			}
		}
	}

	return (
		<>
			<Form formFields={formFields}>
				<Input label="Username" kKey="username" key="username" type="text" />
				<div class="form-actions">
					<SubmitButton label="Invite" onClick={sendInvitation} />
				</div>
			</Form>
		</>
	)
}

export default InviteForm;