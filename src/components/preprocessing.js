export const sprintPreprocessing = sprint => {
	const {createdAt, startDate, endDate, ...restProps} = sprint;
	return {
		...restProps,
		createdAt: new Date(createdAt),
		startDate: new Date(startDate),
		endDate: new Date(endDate)
	}
}