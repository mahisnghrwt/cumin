class FieldConstraint {
	constructor(type, isRequired, specialCases) {
		this.type = type;
		this.isRequired = isRequired;
		this.specialCases = specialCases;
	}

	validate(val) {
		let valid = true;
		if (typeof val !== this.type)
			return false;

		if ((val === null || val === undefined) && this.isRequired) {
			return false;
		}

		if (Array.isArray(this.specialCases)) {
			for(let x of this.specialCases) {
				if (val === x) {
					valid = false;
					break;
				}
			}
		}

		return valid;
	}
}

export default FieldConstraint;