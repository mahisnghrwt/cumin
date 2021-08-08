export const SOCKET_EVENT =  {
	NEW_USER_JOINED: 0,
	INVITATION_RECEIVED: 1,
	INVITATION_REJECTED: 2,
	SPRINT_CREATED: 3,
	SPRINT_DELETED: 4,
	ISSUE_CREATED: 5,
	ISSUE_UPDATED: 6,
	ISSUE_DELETED: 7,
	ACTIVE_SPRINT_UPDATED: 8,
	EPIC_CREATED: 9,
	EPIC_UPDATED: 10,
	EPIC_DELETED: 11,
	PATH_CREATED: 12,
	PATH_DELETED: 13
};

export const ISSUE_TYPES = ["BUG", "TODO"];

export const ISSUE_STATUS = {
	todo: "Todo", 
	inProgress: "In Progress", 
	complete: "Complete"
};

export const ISSUE_STATUS_TO_ENUM = (normalStr) => {
	let result = "";
	Object.entries(ISSUE_STATUS).forEach(([key, val]) => {
		if (val === normalStr) {
			result = key;
			return;
		}
	})
	return result;
}

export const ALERT_TYPE = {
	danger: "bg-red",
	success: "bg-green"
}