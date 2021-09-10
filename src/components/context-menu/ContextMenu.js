import "./contextMenu.css";

const ContextMenu = ({items, pos}) => {
	if (!Array.isArray(items) || items.length === 0)
		return null;


	const style = {
		left: pos.x,
		top: pos.y
	}

	return (
		<div className="context-menu" style={style}>
			{items.map(item => item.getItem())}
		</div>
	)
};

export default ContextMenu;