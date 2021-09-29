import Helper from "../../Helper";
import Form from "../form/Form";
import InputItem from "../form/InputItem";
import LogItem from "../form/LogItem";
import formItemSize from "../form/formItemSize";
import Button from "../form/Button";
import settings from "../../settings"
import { useContext } from "react";
import Global from "../../GlobalContext";
import ToggleContainer from "../toggleContainer/ToggleContainer";
import ToggleHeader from "../toggleContainer/ToggleHeader";
import ToggleBody from "../toggleContainer/ToggleBody";
import ToggleButton from "../toggleContainer/ToggleButton";

const EditEpicForm = ({epic}) => {
	const [global,,] = useContext(Global);

	if (epic === null || epic === undefined)
		return null;

	const formFields = {
		"id": epic.id, 
		"title": epic.title,
		"startDate": Helper.dateToInputString(epic.startDate), 
		"endDate": Helper.dateToInputString(epic.endDate),
		"row": epic.row
	};

	const saveChanges = async (formValues) => {
		const reqBody = {startDate: formValues.startDate, endDate: formValues.endDate};
		const url = `${settings.API_ROOT}/project/${global.project.id}/epic/${epic.id}`;
		const token = localStorage.getItem("token");

		try {
			const patchedEpic = await Helper.http.request(url, "PATCH", token, reqBody, true);
			console.log(patchedEpic);
		} catch (e) {
			console.error(e);
		}
	}

	return (
		<ToggleContainer expanded={false}>
			<ToggleHeader className="flex-justify-start">
				<ToggleButton expandText={<>&#11166;</>} collapseText={<>&#11167;</>} className="border-button" style={{fontWeight: "bold", fontSize: "0.75rem"}} />
				<div className="sidebar-item-title">Edit Epic</div>
			</ToggleHeader>
			<ToggleBody>
				<Form formFields={formFields}>
					<div className="form-row">
						<InputItem kKey="title" label="Title" size={formItemSize.SMALL} required={true} />
					</div>
					<div className="form-row">
						<InputItem kKey="startDate" label="Start date" size={formItemSize.SMALL} required={true} type="date" />
						<InputItem kKey="endDate" label="End date" size={formItemSize.SMALL} required={true} type="date" />
					</div>
					<div className="form-row">
						<Button kKey="save" label="Save Changes" onClick={saveChanges} doesSubmit={true} />
						<LogItem />
					</div>
				</Form>
			</ToggleBody>
		</ToggleContainer>
	)
}

export default EditEpicForm;