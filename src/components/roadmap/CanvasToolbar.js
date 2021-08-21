/**
 * @param buttons - [object] where object = {label: string ~ button label, action: function ~ button action}
 */
const CanvasToolbar = ({buttons}) => {
	return (
		<div className="canvas-toolbar">
			{buttons.map(button => {
				return (
					<button 
					className="x-sm-2"
					onClick={button.action}>
						{button.label}
					</button>
				);
			})}
		</div>
	);
}

export default CanvasToolbar;