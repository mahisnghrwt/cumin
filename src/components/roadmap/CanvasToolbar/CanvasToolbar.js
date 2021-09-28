import ColorPalette from "../ColorPalette";
import canvasTool from "./canvasTool";

/**
 * @desc Right now, children are expected to be buttons. "sm"-button class for perfect small button.
 */
const CanvasToolbar = ({tools}) => {

	const isToolEnabled = tool => {
		return tools[tool] && tools[tool].enabled;
	}

	return (
		<div
		 className="canvas-toolbar">
			 {isToolEnabled(canvasTool.DELETE_PATH_BUTTON) && 
				<button {...tools[canvasTool.DELETE_PATH_BUTTON].props} className="std-button sm-button danger-background">
					Delete Path
				</button>
			}
			{isToolEnabled(canvasTool.DELETE_EPIC_BUTTON) && 
				<button {...tools[canvasTool.DELETE_EPIC_BUTTON].props} className="std-button sm-button danger-background">
					Delete Epic
				</button>
			}
			{(isToolEnabled(canvasTool.COLOR_PALETTE) && 
			(isToolEnabled(canvasTool.DELETE_EPIC_BUTTON) || isToolEnabled(canvasTool.DELETE_PATH_BUTTON)))
			&& <span>|</span>}
			{isToolEnabled(canvasTool.COLOR_PALETTE) && <ColorPalette {...tools[canvasTool.COLOR_PALETTE].props} />}
		</div>
	);
}

export default CanvasToolbar;


