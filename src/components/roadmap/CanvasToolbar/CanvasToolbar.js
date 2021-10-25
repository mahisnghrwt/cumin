import ColorPalette from "../ColorPalette";
import canvasTool from "./canvasTool";

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
		<div className="Box d-flex border-0 flex-row color-bg-subtle p-1 px-2 mb-2">
			<button 
				disabled={!isToolEnabled(canvasTool.EDIT_EPIC_BUTTON)}
				className="btn btn-sm btn-outline mr-2"
				{...getProps(canvasTool.EDIT_EPIC_BUTTON)}
			>
				Edit Epic
			</button>

			<button 
				disabled={!isToolEnabled(canvasTool.DELETE_EPIC_BUTTON)}
				className="btn btn-sm btn-danger"
				{...getProps(canvasTool.DELETE_EPIC_BUTTON)}
			>
				Delete Epic
			</button>

			<span className="color-fg-subtle text-bold mx-3">|</span>

			<ColorPalette {...getProps(canvasTool.COLOR_PALETTE)} disabled={!isToolEnabled(canvasTool.COLOR_PALETTE)} />

			<span className="color-fg-subtle text-bold mx-3">|</span>

			<button 
				className="btn btn-sm btn-danger" 
				disabled={!isToolEnabled(canvasTool.DELETE_PATH_BUTTON)} 
				{...getProps(canvasTool.DELETE_PATH_BUTTON)}
			>
				Delete Path
			</button>
		</div>
	)
}

export default CanvasToolbar;


