/**
 * @desc Right now, children are expected to be buttons. "x-sm-2" class for perfect small button.
 */
const CanvasToolbar = ({children}) => {
	return (
		<div className="canvas-toolbar">
			{children}
		</div>
	);
}

export default CanvasToolbar;