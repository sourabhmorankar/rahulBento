export const GRID_CONFIG = {
  cellSize: 120, // Base cell size in pixels
  gap: 16, // Gap between cells
  origin: { x: 0, y: 0 }, // Bio card center position
  maxDistance: 50, // Maximum cells from origin (prevents infinite scroll)
  snapThreshold: 0.3, // Snap to grid when within 30% of cell size
  renderBuffer: 2, // Number of cells to render beyond viewport
  elasticLimit: 200, // Pixels beyond boundary before elastic effect
  friction: 0.92, // Friction coefficient for momentum scrolling
  minVelocity: 0.1, // Minimum velocity before stopping
  maxVelocity: 50, // Maximum velocity cap
}

export function gridToPixel(gridX: number, gridY: number) {
  return {
    x: gridX * (GRID_CONFIG.cellSize + GRID_CONFIG.gap),
    y: gridY * (GRID_CONFIG.cellSize + GRID_CONFIG.gap)
  }
}

export function pixelToGrid(pixelX: number, pixelY: number) {
  return {
    x: Math.round(pixelX / (GRID_CONFIG.cellSize + GRID_CONFIG.gap)),
    y: Math.round(pixelY / (GRID_CONFIG.cellSize + GRID_CONFIG.gap))
  }
}

export function calculateGridBoundary(gridItems: Array<{ 
  gridX: number, 
  gridY: number, 
  spanX: number, 
  spanY: number 
}>) {
  let minX = Infinity, maxX = -Infinity
  let minY = Infinity, maxY = -Infinity
  
  for (const item of gridItems) {
    minX = Math.min(minX, item.gridX)
    maxX = Math.max(maxX, item.gridX + item.spanX - 1)
    minY = Math.min(minY, item.gridY)
    maxY = Math.max(maxY, item.gridY + item.spanY - 1)
  }
  
  // Add padding around content
  return {
    minX: minX - 5,
    maxX: maxX + 5,
    minY: minY - 5,
    maxY: maxY + 5
  }
}

export function calculateViewportGridCells(
  viewportWidth: number, 
  viewportHeight: number, 
  scrollX: number, 
  scrollY: number
) {
  const { cellSize, gap, renderBuffer } = GRID_CONFIG
  const cellSizeWithGap = cellSize + gap
  
  const startX = Math.floor((scrollX - renderBuffer * cellSize) / cellSizeWithGap)
  const endX = Math.ceil((scrollX + viewportWidth + renderBuffer * cellSize) / cellSizeWithGap)
  const startY = Math.floor((scrollY - renderBuffer * cellSize) / cellSizeWithGap)
  const endY = Math.ceil((scrollY + viewportHeight + renderBuffer * cellSize) / cellSizeWithGap)
  
  return { startX, endX, startY, endY }
}
