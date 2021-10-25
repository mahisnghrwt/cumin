import Helper from "../../Helper";
import Form, {SubmitButton, Input, Textarea} from "../form/v2/Form";
import settings from "../../settings"
import { useContext } from "react";
import Global from "../../GlobalContext";
import { add, isValid } from "date-fns";

const EditSprintForm = ({sprint, successCallback}) => {
	const [global,,] = useContext(Global);

	const formFields = {
		"title":{
			value: sprint ? sprint.title : "",
			validate: title => {
				if(!title || title.trim().length === 0)
					return "Title is required.";
			}
		},
		"startDate": {
			value: sprint ? Helper.dateToInputString(sprint.startDate) : Helper.dateToInputString(new Date())
		}, 
		"endDate": {
			value: sprint ? Helper.dateToInputString(sprint.endDate) : Helper.dateToInputString(add(new Date(), {days: 1}))
		},
		"description": {
			value: sprint ? sprint.description : ""
		}
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
		<>
			<Form formFields={formFields}>
				<Input label="Title" kKey="title" key="title" type="text" />
				<Input label="Start Date" kKey="startDate" key="startDate" type="date" classNameAppend="width-auto" />
				<Input label="End Date" kKey="endDate" key="endDate" type="date" classNameAppend="width-auto" />
				<Textarea label="Description" kKey="description" key="description" />
				<div class="form-actions">
					<SubmitButton label={sprint ? "Update" : "Create"} onClick={sprint ? patchSprint : createSprint} />
				</div>
			</Form>
		</>
	)
}

export default EditSprintForm;