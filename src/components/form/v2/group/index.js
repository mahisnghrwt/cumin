export default ({ variant, note, label, inputId, children }) => {
	return (
		<div class={ "form-group" + (variant && variant.formGroup) }>
			<div class="form-group-header">
				<label for={ inputId }>{ label }</label>
			</div>
			<div class="form-group-body">
				{ children }
			</div>
			{note
			&& <p class={ "note" + variant.note }>{ note }</p>}
		</div>
	)
}