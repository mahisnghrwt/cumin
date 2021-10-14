import Helper from "../../Helper";
import Form from "../form/Form";
import InputItem from "../form/InputItem";
import LogItem from "../form/LogItem";
import formItemSize from "../form/formItemSize";
import Button from "../form/Button";
import settings from "../../settings"
import { useContext } from "react";
import Global from "../../GlobalContext"

const InviteForm = (props) => {
	const [global,,] = useContext(Global);

	const formFields = ["username"];

	const sendInvitation = async formValues => {
		try {
			let body = {
				username: formValues.username,
			};

			const url = `${settings.API_ROOT}/project/${global.project.id}/invitation`;
			await Helper.fetch(url, "POST", body, false);
		} catch (e) {
			throw e;
		}
	}

	return (
		<div className="form-wrapper" style={{width: "600px"}}>
			<Form formFields={formFields}>
				<div className="form-row">
					<InputItem kKey="username" label="Username" size={formItemSize.SMALL} />
				</div>
				<div className="form-row">
					<Button kKey="save" label="Invite" onClick={sendInvitation} doesSubmit={true} />
					<LogItem />
				</div>
			</Form>
		</div>
	)
}

export default InviteForm;