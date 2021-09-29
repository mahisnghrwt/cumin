import { ButtonWithPlaceholder } from "../Button";
import {epicColor} from "./epicColor"

const ColorPalette = ({selectedColor, selectColor, disabled}) => {
	return <span className="color-palette">
		{Object.values(epicColor).map(color => {
			const isSelected = selectedColor === color;
			return <ButtonWithPlaceholder 
				disabled={disabled} 
				className={"color-dip" + (isSelected ? " color-dip-selected" : "")}
				style={{backgroundColor: color}}
				onClick={_ => selectColor(color)}
			/>
		})}
	</span>
};

export default ColorPalette;