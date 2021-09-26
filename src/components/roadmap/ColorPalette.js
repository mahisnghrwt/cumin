import {epicColor} from "./epicColor"
const ColorDip = ({color, isSelected, selectColor}) => {
	return <span 
		className={isSelected ? "color-dip-selected" : "color-dip"}
		onClick={e => selectColor(color)}
		style={{backgroundColor: color}} />
}

const ColorPalette = ({selectedColor, selectColor}) => {
	return <span className="color-palette">
		{Object.values(epicColor).map(color => {
			return <ColorDip color={color} isSelected={selectedColor === color} selectColor={selectColor} />
		})}
	</span>
};

export default ColorPalette;