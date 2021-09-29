import { ButtonWithPlaceholder } from "../../Button";
import ColorPalette from "../ColorPalette";
import canvasTool from "./canvasTool";

/**
 * @desc Right now, children are expected to be buttons. "sm"-button class for perfect small button.
 */
const CanvasToolbar = ({tools}) => {

	const isToolEnabled = tool => {
		return tools[tool] && tools[tool].enabled;
	}

	const getProps = tool => {
		return tools[tool] ? 
			tools[tool].props
			: {}
	}

	return (
		<div
		 className="canvas-toolbar">
			<ButtonWithPlaceholder 
				disabled={!isToolEnabled(canvasTool.DELETE_PATH_BUTTON)}
				className="std-button sm-button danger-background"
				{...getProps(canvasTool.DELETE_PATH_BUTTON)}
			>
				Delete Path
			</ButtonWithPlaceholder>
			<ButtonWithPlaceholder 
				disabled={!isToolEnabled(canvasTool.DELETE_EPIC_BUTTON)}
				className="std-button sm-button danger-background"
				{...getProps(canvasTool.DELETE_EPIC_BUTTON)}
			>
				Delete Epic
			</ButtonWithPlaceholder>
			<span>|</span>
			<ColorPalette {...getProps(canvasTool.COLOR_PALETTE)} disabled={!isToolEnabled(canvasTool.COLOR_PALETTE)} />
		</div>
	);
}

export default CanvasToolbar;


