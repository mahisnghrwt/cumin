const reducer = (state, action) => {
	switch(action.type) {
		case "PATCH": {
			let state_ = {...state};
			Object.keys(action.patch).map(key => {
				state_[key] = {
					...action.patch[key]
				}
			})
			return state_
		}
		case "ADD_EPIC":
			return {
				...state,
				epics: {
					...state.epics,
					[action.epic.id]: {...action.epic}
				}
			}
		case "UPDATE_EPIC":
			const targetEpic = state.epics[action.id];
			if (targetEpic === undefined)
				return state;
			const patchedEpic = {
				...targetEpic, ...action.patch
			}
			return {
				...state,
				epics: {
					...state.epics,
					[action.id]: patchedEpic
				}
			}
		case "CREATE_INTERMEDIATE_PATH":
			return {
				...state,
				intermediate: {
					...state.intermediate,
					path: {
						...action.path
					}
				}
			}
		case "PATCH_INTERMEDIATE_PATH":
			return {
				...state,
				intermediate: {
					...state.intermediate,
					path: {
						...state.intermediate.path,
						[state.intermediate.path.rawEndpoint]: {
							...action.patch
						}
					}
				}
			}
		case "REMOVE_INTERMEDIATE_PATH":
			return {
				...state,
				intermediate: { }
			}

		case "CREATE_NEW_PATH":
			return {
				...state,
				intermediate: {},
				paths: {
					...state.paths,
					[action.path.id]: {
						...action.path
					}
				}
			}
		case "UPDATE_CANVAS":
			return {
				...state,
				canvas: {
					...state.canvas,
					...action.patch
				}
			}
		case "UPDATE_INTERMEDIATE_EPIC":
			if (action.epic === null) {
				let state_ = {
					...state,
					intermediate: {
						...state.intermediate,
						epic: {
							...state.intermediate.epic
						}
					}
				};

				delete state_.intermediate.epic;
				return state_;
			}

			return {
				...state,
				intermediate: {
					...state.intermediate,
					epic: {
						...action.epic
					}
				}
			}
		default:
			throw new Error(`Unknown case: ${action.type}`);
	}
}

export default reducer;