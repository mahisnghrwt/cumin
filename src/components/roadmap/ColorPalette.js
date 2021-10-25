import { epicColor } from "./epicColor"

const ColorPalette = ({selectedColor, selectColor, disabled}) => {
	return <span className="d-flex">
		{Object.values(epicColor).map(color => {
			const isSelected = selectedColor === color;
			return <button 
				disabled={disabled} 
				className={"mr-1 rounded mt-1" + (isSelected ? " border color-border-attention" : "")}
				style={{backgroundColor: color, width: "1.25rem", height: "1.25rem"}}
				onClick={_ => selectColor(color)}
			/>
		})}
	</span>
};

export default ColorPalette;