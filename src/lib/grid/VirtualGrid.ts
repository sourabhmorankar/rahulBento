import { GRID_CONFIG, calculateViewportGridCells, gridToPixel } from './config'

export interface GridItem {
  id: string
  gridX: number
  gridY: number
  spanX: number
  spanY: number
  isVisible?: boolean
  isLoaded?: boolean
  priority?: number
}

export interface Viewport {
  width: number
  height: number
}

export class VirtualGrid {
  private viewport: Viewport
  private items: Map<string, GridItem>
  private visibleItems: Set<string>
  private scrollPosition: { x: number, y: number }
  
  constructor(viewport: Viewport, items: GridItem[] = []) {
    this.viewport = viewport
    this.items = new Map()
    this.visibleItems = new Set()
    this.scrollPosition = { x: 0, y: 0 }
    
    items.forEach(item => this.addItem(item))
  }
  
  addItem(item: GridItem) {
    this.items.set(item.id, {
      ...item,
      isVisible: false,
      isLoaded: false,
      priority: this.calculateItemPriority(item)
    })
  }
  
  removeItem(id: string) {
    this.items.delete(id)
    this.visibleItems.delete(id)
  }
  
  getItem(id: string) {
    return this.items.get(id)
  }
  
  getAllItems() {
    return Array.from(this.items.values())
  }
  
  getVisibleItems() {
    return Array.from(this.visibleItems)
      .map(id => this.items.get(id))
      .filter((item): item is GridItem => item !== undefined)
  }
  
  updateViewport(width: number, height: number) {
    this.viewport = { width, height }
    this.updateVisibleItems()
  }
  
  updateScrollPosition(x: number, y: number) {
    this.scrollPosition = { x, y }
    this.updateVisibleItems()
  }
  
  getItemsToRender() {
    return this.getVisibleItems().sort((a, b) => (b.priority || 0) - (a.priority || 0))
  }
  
  private updateVisibleItems() {
    const { startX, endX, startY, endY } = calculateViewportGridCells(
      this.viewport.width,
      this.viewport.height,
      this.scrollPosition.x,
      this.scrollPosition.y
    )
    
    this.visibleItems.clear()
    
    this.items.forEach((item, id) => {
      const itemEndX = item.gridX + item.spanX - 1
      const itemEndY = item.gridY + item.spanY - 1
      
      const isVisible = 
        item.gridX <= endX && itemEndX >= startX &&
        item.gridY <= endY && itemEndY >= startY
      
      this.items.set(id, { ...item, isVisible })
      
      if (isVisible) {
        this.visibleItems.add(id)
      }
    })
  }
  
  private calculateItemPriority(item: GridItem) {
    const distance = Math.sqrt(
      Math.pow(item.gridX - GRID_CONFIG.origin.x, 2) + 
      Math.pow(item.gridY - GRID_CONFIG.origin.y, 2)
    )
    
    return Math.max(0, 100 - distance)
  }
  
  getItemPixelPosition(id: string) {
    const item = this.items.get(id)
    if (!item) return null
    
    const { x, y } = gridToPixel(item.gridX, item.gridY)
    
    return {
      x,
      y,
      width: item.spanX * GRID_CONFIG.cellSize + (item.spanX - 1) * GRID_CONFIG.gap,
      height: item.spanY * GRID_CONFIG.cellSize + (item.spanY - 1) * GRID_CONFIG.gap
    }
  }
}
