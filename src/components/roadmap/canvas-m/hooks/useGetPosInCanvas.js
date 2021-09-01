import { useEffect, useRef } from "react";

const useGetPosInCanvas = (canvasRef) => {
	const getPosInCanvasRef = useRef(null);

	useEffect(() => {
		getPosInCanvasRef.current = (mouseEvent) => {
			if (!canvasRef.current.contains(mouseEvent.target)) return null;
			const pos = {x: mouseEvent.offsetX, y: mouseEvent.offsetY};
			let node = mouseEvent.target;
			
			while (node !== canvasRef.current) {
				pos.x += node.offsetLeft;
				pos.y += node.offsetTop;
				node = node.offsetParent;
			}

			return pos;
		}
	}, [canvasRef])

	return getPosInCanvasRef;
}

export default useGetPosInCanvas;