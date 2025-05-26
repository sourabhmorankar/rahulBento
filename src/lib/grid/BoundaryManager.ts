import { GRID_CONFIG, calculateGridBoundary } from './config'

export interface GridItemBounds {
  gridX: number
  gridY: number
  spanX: number
  spanY: number
}

export class BoundaryManager {
  private items: GridItemBounds[]
  private bounds: ReturnType<typeof calculateGridBoundary>
  private elasticLimit: number
  private viewportSize: { width: number, height: number }
  
  constructor(items: GridItemBounds[] = [], viewportSize = { width: 0, height: 0 }) {
    this.items = items
    this.bounds = calculateGridBoundary(items)
    this.elasticLimit = GRID_CONFIG.elasticLimit
    this.viewportSize = viewportSize
  }
  
  updateItems(items: GridItemBounds[]) {
    this.items = items
    this.bounds = calculateGridBoundary(items)
  }
  
  updateViewport(width: number, height: number) {
    this.viewportSize = { width, height }
  }
  
  constrainPosition(x: number, y: number): { x: number, y: number } {
    const { cellSize, gap } = GRID_CONFIG
    const cellSizeWithGap = cellSize + gap
    
    const pixelBounds = {
      minX: this.bounds.minX * cellSizeWithGap,
      maxX: this.bounds.maxX * cellSizeWithGap,
      minY: this.bounds.minY * cellSizeWithGap,
      maxY: this.bounds.maxY * cellSizeWithGap
    }
    
    // Calculate maximum scroll positions based on viewport size
    const maxScrollX = Math.max(0, pixelBounds.maxX + cellSize - this.viewportSize.width)
    const maxScrollY = Math.max(0, pixelBounds.maxY + cellSize - this.viewportSize.height)
    
    // Apply elastic boundary effect
    let constrainedX = x
    let constrainedY = y
    
    // Constrain X position
    if (x < pixelBounds.minX - this.elasticLimit) {
      constrainedX = pixelBounds.minX - this.elasticLimit + (x - pixelBounds.minX + this.elasticLimit) * 0.3
    } else if (x < pixelBounds.minX) {
      constrainedX = pixelBounds.minX + (x - pixelBounds.minX) * 0.5
    } else if (x > maxScrollX + this.elasticLimit) {
      constrainedX = maxScrollX + this.elasticLimit + (x - maxScrollX - this.elasticLimit) * 0.3
    } else if (x > maxScrollX) {
      constrainedX = maxScrollX + (x - maxScrollX) * 0.5
    }
    
    // Constrain Y position
    if (y < pixelBounds.minY - this.elasticLimit) {
      constrainedY = pixelBounds.minY - this.elasticLimit + (y - pixelBounds.minY + this.elasticLimit) * 0.3
    } else if (y < pixelBounds.minY) {
      constrainedY = pixelBounds.minY + (y - pixelBounds.minY) * 0.5
    } else if (y > maxScrollY + this.elasticLimit) {
      constrainedY = maxScrollY + this.elasticLimit + (y - maxScrollY - this.elasticLimit) * 0.3
    } else if (y > maxScrollY) {
      constrainedY = maxScrollY + (y - maxScrollY) * 0.5
    }
    
    return { x: constrainedX, y: constrainedY }
  }
  
  getBounds() {
    return { ...this.bounds }
  }
  
  getPixelBounds() {
    const { cellSize, gap } = GRID_CONFIG
    const cellSizeWithGap = cellSize + gap
    
    return {
      minX: this.bounds.minX * cellSizeWithGap,
      maxX: this.bounds.maxX * cellSizeWithGap,
      minY: this.bounds.minY * cellSizeWithGap,
      maxY: this.bounds.maxY * cellSizeWithGap
    }
  }
  
  isWithinBounds(x: number, y: number): boolean {
    const pixelBounds = this.getPixelBounds()
    const maxScrollX = Math.max(0, pixelBounds.maxX - this.viewportSize.width)
    const maxScrollY = Math.max(0, pixelBounds.maxY - this.viewportSize.height)
    
    return (
      x >= pixelBounds.minX && 
      x <= maxScrollX && 
      y >= pixelBounds.minY && 
      y <= maxScrollY
    )
  }
  
  getElasticForce(x: number, y: number): { x: number, y: number } {
    const pixelBounds = this.getPixelBounds()
    const maxScrollX = Math.max(0, pixelBounds.maxX - this.viewportSize.width)
    const maxScrollY = Math.max(0, pixelBounds.maxY - this.viewportSize.height)
    
    let forceX = 0
    let forceY = 0
    
    // Calculate elastic force for X axis
    if (x < pixelBounds.minX) {
      forceX = (pixelBounds.minX - x) * 0.1
    } else if (x > maxScrollX) {
      forceX = (maxScrollX - x) * 0.1
    }
    
    // Calculate elastic force for Y axis
    if (y < pixelBounds.minY) {
      forceY = (pixelBounds.minY - y) * 0.1
    } else if (y > maxScrollY) {
      forceY = (maxScrollY - y) * 0.1
    }
    
    return { x: forceX, y: forceY }
  }
}
