import disableable from "./HOCs/disableable";

const Button = (props) => {
	return <button {...props} />
}

const ButtonWithPlaceholder = disableable(Button);

export {Button, ButtonWithPlaceholder};