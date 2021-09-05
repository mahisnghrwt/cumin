import { useEffect, useRef } from "react";

const usePixelToGrid = (canvasDimensions, gridSize) => {
	let pixelToGrid = useRef(null);

	useEffect(() => {
		pixelToGrid.current = pos => {
			const x = (pos.x / canvasDimensions.width) * gridSize.x;
			const y = (pos.y / canvasDimensions.height) * gridSize.y;

			return {
				x: Number.parseInt(x),
				y: Number.parseInt(y)
			}
		}
	}, [canvasDimensions, gridSize])

	return pixelToGrid;
}

export default usePixelToGrid;