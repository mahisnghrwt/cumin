import { useEffect, useRef } from "react";

const usePixelToGrid = (canvasDimensions, totalGrids) => {
	let pixelToGrid = useRef(null);

	useEffect(() => {
		pixelToGrid.current = pos => {
			const x = (pos.x / canvasDimensions.width) * totalGrids.x;
			const y = (pos.y / canvasDimensions.height) * totalGrids.y;

			return {
				x: Number.parseInt(x),
				y: Number.parseInt(y)
			}
		}
	}, [canvasDimensions, totalGrids])

	return pixelToGrid;
}

export default usePixelToGrid;