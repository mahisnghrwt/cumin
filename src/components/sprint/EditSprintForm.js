import Helper from "../../Helper";
import Form from "../form/Form";
import InputItem from "../form/InputItem";
import LogItem from "../form/LogItem";
import formItemSize from "../form/formItemSize";
import Button from "../form/Button";
import settings from "../../settings"
import { useContext } from "react";
import Global from "../../GlobalContext";
import { add, isValid } from "date-fns";

const EditSprintForm = ({sprint, successCallback}) => {
	const [global,,] = useContext(Global);

	const formFields = {
		"title": sprint ? sprint.title : "",
		"startDate": sprint ? Helper.dateToInputString(sprint.startDate) : Helper.dateToInputString(new Date()), 
		"endDate": sprint ? Helper.dateToInputString(sprint.endDate) : Helper.dateToInputString(add(new Date(), {days: 1})),
		"description": sprint ? sprint.description : ""
	};

	const patchSprint = async formValues => {
		try {
			let body = {};
			body = {
				...(sprint.title !== formValues.title && {title: formValues.title}),
				...(Helper.dateToInputString(sprint.startDate) !== formValues.startDate && {startDate: new Date(formValues.startDate)}),
				...(Helper.dateToInputString(sprint.endDate) !== formValues.endDate && {endDate: new Date(formValues.endDate)}),
				...(sprint.description !== formValues.description && {description: formValues.description}),
			}
			const url = `${settings.API_ROOT}/project/${global.project.id}/sprint/${sprint.id}`;
			const patchedSprint = await Helper.fetch(url, "PATCH", body, true);
			successCallback(patchedSprint, true);
		} catch (e) {
			throw e;
		}
	}

	const createSprint = async formValues => {
		try {
			let body = {};
			body = {
				title: formValues.title,
				description: formValues.description
			};
			const startDate = new Date(formValues.startDate);
			const endDate = new Date(formValues.endDate);

			if (isValid(startDate))
				body.startDate = startDate;

			if (isValid(endDate))
				body.endDate = endDate;

			const url = `${settings.API_ROOT}/project/${global.project.id}/sprint`;
			const sprint_ = await Helper.fetch(url, "POST", body, true);
			successCallback(sprint_, false);
		} catch (e) {
			throw e;
		}
	}

	return (
		<div className="form-wrapper" style={{width: "600px"}}>
			<Form formFields={formFields}>
				<div className="form-row">
					<InputItem kKey="title" label="Title" size={formItemSize.SMALL} />
				</div>
				<div className="form-row">
					<InputItem kKey="startDate" label="Start date" size={formItemSize.SMALL} type="date" />
					<InputItem kKey="endDate" label="End date" size={formItemSize.SMALL} type="date" />
				</div>
				<div className="form-row">
					<InputItem kKey="description" label="Description" size={formItemSize.SMALL} type="text" />
				</div>
				<div className="form-row">
					<Button kKey="save" label="Save Changes" onClick={sprint ? patchSprint : createSprint} doesSubmit={true} />
					<LogItem />
				</div>
			</Form>
		</div>
	)
}

export default EditSprintForm;