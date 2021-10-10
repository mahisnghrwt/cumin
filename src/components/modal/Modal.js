import { useEffect, useRef } from "react";
import ReactDOM from "react-dom"
import "./modal.css";

const Modal = ({title, close, children}) => {
	const modalRef = useRef(null);

	const closeHandler = e => {
		close();
	}

	useEffect(() => {
		const modalClickHandler = e => {
			if (modalRef.current && !modalRef.current.contains(e.target)) {
				close();
			}
		}

		document.addEventListener("click", modalClickHandler);

		return () => document.removeEventListener("click", modalClickHandler);
	}, []);

	return (
		ReactDOM.createPortal(
			<div className="modal-wrapper">
				<div className="modal" ref={modalRef}>
					<div className="modal-header">
						{title && <span className="modal-title">{title}</span>}
						<button onClick={closeHandler} 
							className="border-button sm-button modal-close-button">
							<>&#10006;</>
						</button>
					</div>
					<div className="modal-content">
						{children}
					</div>
				</div>
			</div>
		, document.getElementById("portal"))
	)
}

export default Modal;