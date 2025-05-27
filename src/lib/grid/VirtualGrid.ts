import { GRID_CONFIG, calculateViewportGridCells, gridToPixel } from './config'
import type { Thumbnail } from '../thumbnails/Thumbnail'

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

export type GridEntity = GridItem | Thumbnail

export interface Viewport {
  width: number
  height: number
}

export class VirtualGrid {
  private viewport: Viewport
  private entities: Map<string, GridEntity>
  private visibleEntities: Set<string>
  private scrollPosition: { x: number, y: number }
  
  constructor(viewport: Viewport, entities: GridEntity[] = []) {
    this.viewport = viewport
    this.entities = new Map()
    this.visibleEntities = new Set()
    this.scrollPosition = { x: 0, y: 0 }
    
    entities.forEach(entity => this.addEntity(entity))
  }
  
  addEntity(entity: GridEntity) {
    if (this.isThumbnail(entity)) {
      this.entities.set(entity.id, entity)
      entity.setVisibility(false)
    } else {
      this.entities.set(entity.id, {
        ...entity,
        isVisible: false,
        isLoaded: false,
        priority: this.calculateEntityPriority(entity)
      })
    }
  }
  
  removeEntity(id: string) {
    const entity = this.entities.get(id)
    if (entity && this.isThumbnail(entity)) {
      entity.setVisibility(false)
    }
    this.entities.delete(id)
    this.visibleEntities.delete(id)
  }
  
  getEntity(id: string) {
    return this.entities.get(id)
  }
  
  getAllEntities() {
    return Array.from(this.entities.values())
  }
  
  getVisibleEntities() {
    return Array.from(this.visibleEntities)
      .map(id => this.entities.get(id))
      .filter((entity): entity is GridEntity => entity !== undefined)
  }

  // Legacy methods for backward compatibility
  addItem(item: GridItem) {
    this.addEntity(item)
  }
  
  removeItem(id: string) {
    this.removeEntity(id)
  }
  
  getItem(id: string) {
    return this.getEntity(id)
  }
  
  getAllItems() {
    return this.getAllEntities()
  }
  
  getVisibleItems() {
    return this.getVisibleEntities()
  }
  
  updateViewport(width: number, height: number) {
    this.viewport = { width, height }
    this.updateVisibleEntities()
  }
  
  updateScrollPosition(x: number, y: number) {
    this.scrollPosition = { x, y }
    this.updateVisibleEntities()
  }
  
  getEntitiesToRender() {
    return this.getVisibleEntities().sort((a, b) => this.getPriority(b) - this.getPriority(a))
  }

  // Legacy method for backward compatibility
  getItemsToRender() {
    return this.getEntitiesToRender()
  }
  
  private updateVisibleEntities() {
    const { startX, endX, startY, endY } = calculateViewportGridCells(
      this.viewport.width,
      this.viewport.height,
      this.scrollPosition.x,
      this.scrollPosition.y
    )
    
    this.visibleEntities.clear()
    
    this.entities.forEach((entity, id) => {
      const itemEndX = entity.gridX + entity.spanX - 1
      const itemEndY = entity.gridY + entity.spanY - 1
      
      const isVisible = 
        entity.gridX <= endX && itemEndX >= startX &&
        entity.gridY <= endY && itemEndY >= startY
      
      if (this.isThumbnail(entity)) {
        entity.setVisibility(isVisible)
      } else {
        this.entities.set(id, { ...entity, isVisible })
      }
      
      if (isVisible) {
        this.visibleEntities.add(id)
      }
    })
  }
  
  private calculateEntityPriority(entity: GridEntity) {
    if (this.isThumbnail(entity)) {
      return entity.priority
    }
    
    const distance = Math.sqrt(
      Math.pow(entity.gridX - GRID_CONFIG.origin.x, 2) + 
      Math.pow(entity.gridY - GRID_CONFIG.origin.y, 2)
    )
    
    return Math.max(0, 100 - distance)
  }

  // Legacy method for backward compatibility  
  private calculateItemPriority(item: GridItem) {
    return this.calculateEntityPriority(item)
  }

  private isThumbnail(entity: GridEntity): entity is Thumbnail {
    return 'render' in entity && typeof entity.render === 'function'
  }

  private getPriority(entity: GridEntity): number {
    return this.isThumbnail(entity) ? entity.priority : (entity.priority || 0)
  }
  
  getEntityPixelPosition(id: string) {
    const entity = this.entities.get(id)
    if (!entity) return null
    
    const { x, y } = gridToPixel(entity.gridX, entity.gridY);
    
    return {
      x,
      y,
      width: entity.spanX * GRID_CONFIG.cellSize + (entity.spanX - 1) * GRID_CONFIG.gap,
      height: entity.spanY * GRID_CONFIG.cellSize + (entity.spanY - 1) * GRID_CONFIG.gap
    }
  }

  // Legacy method for backward compatibility
  getItemPixelPosition(id: string) {
    return this.getEntityPixelPosition(id)
  }
}
