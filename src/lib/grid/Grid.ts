import { GRID_CONFIG } from './config'
import { VirtualGrid } from './VirtualGrid'
import type { GridItem, Viewport } from './VirtualGrid'
import { InputManager } from './InputManager'
import { BoundaryManager } from './BoundaryManager'
import { KeyboardNavigation } from './KeyboardNavigation'

export interface GridOptions {
  element: HTMLElement
  items?: GridItem[]
  initialPosition?: { x: number, y: number }
  enableKeyboardNavigation?: boolean
  onItemVisibilityChange?: (visibleItems: GridItem[]) => void
  onPositionChange?: (position: { x: number, y: number }) => void
  onItemFocus?: (itemId: string | null) => void
  onItemActivate?: (itemId: string) => void
}

export class Grid {
  private element: HTMLElement
  private virtualGrid: VirtualGrid
  private inputManager: InputManager
  private boundaryManager: BoundaryManager
  private keyboardNavigation: KeyboardNavigation | null
  private position: { x: number, y: number }
  private viewport: Viewport
  private scale: number
  private options: GridOptions
  
  constructor(options: GridOptions) {
    this.element = options.element
    this.options = options
    this.position = options.initialPosition || { x: 0, y: 0 }
    this.scale = 1
    this.viewport = {
      width: this.element.clientWidth,
      height: this.element.clientHeight
    }
    
    this.virtualGrid = new VirtualGrid(this.viewport, options.items || [])
    
    this.boundaryManager = new BoundaryManager(
      options.items || [],
      this.viewport
    )
    
    this.inputManager = new InputManager(this.element, {
      onScroll: this.handleScroll.bind(this),
      onZoom: this.handleZoom.bind(this)
    })
    
    this.keyboardNavigation = options.enableKeyboardNavigation !== false
      ? new KeyboardNavigation(this.element, {
          onScroll: this.handleScroll.bind(this),
          onFocusItem: this.handleItemFocus.bind(this)
        })
      : null
    
    if (this.keyboardNavigation && options.items) {
      this.keyboardNavigation.updateGridItems(options.items)
    }
    
    this.bindEvents()
    this.updateVisibleItems()
  }
  
  private bindEvents() {
    window.addEventListener('resize', this.handleResize.bind(this))
  }
  
  private handleResize() {
    this.viewport = {
      width: this.element.clientWidth,
      height: this.element.clientHeight
    }
    
    this.virtualGrid.updateViewport(this.viewport.width, this.viewport.height)
    this.boundaryManager.updateViewport(this.viewport.width, this.viewport.height)
    this.updateVisibleItems()
  }
  
  private handleScroll(deltaX: number, deltaY: number) {
    this.position.x += deltaX
    this.position.y += deltaY
    
    // Apply boundary constraints
    const constrained = this.boundaryManager.constrainPosition(this.position.x, this.position.y)
    this.position = constrained
    
    this.updateScrollPosition()
    
    if (this.options.onPositionChange) {
      this.options.onPositionChange({ ...this.position })
    }
  }
  
  private handleZoom(scale: number) {
    // Implement zoom functionality if needed
    this.scale = scale
  }
  
  private handleItemFocus(itemId: string | null) {
    if (this.options.onItemFocus) {
      this.options.onItemFocus(itemId)
    }
  }
  
  private updateScrollPosition() {
    this.virtualGrid.updateScrollPosition(this.position.x, this.position.y)
    this.updateVisibleItems()
  }
  
  private updateVisibleItems() {
    const visibleItems = this.virtualGrid.getVisibleItems()
    
    if (this.options.onItemVisibilityChange) {
      this.options.onItemVisibilityChange(visibleItems)
    }
  }
  
  addItem(item: GridItem) {
    this.virtualGrid.addItem(item)
    
    // Update boundary manager with new items
    this.boundaryManager.updateItems(this.getAllItems())
    
    // Update keyboard navigation
    if (this.keyboardNavigation) {
      this.keyboardNavigation.updateGridItems(this.getAllItems())
    }
    
    this.updateVisibleItems()
  }
  
  removeItem(id: string) {
    this.virtualGrid.removeItem(id)
    
    // Update boundary manager with remaining items
    this.boundaryManager.updateItems(this.getAllItems())
    
    // Update keyboard navigation
    if (this.keyboardNavigation) {
      this.keyboardNavigation.updateGridItems(this.getAllItems())
    }
    
    this.updateVisibleItems()
  }
  
  getItem(id: string) {
    return this.virtualGrid.getItem(id)
  }
  
  getAllItems(): GridItem[] {
    return this.virtualGrid.getAllItems()
  }
  
  getVisibleItems() {
    return this.virtualGrid.getVisibleItems()
  }
  
  getPosition() {
    return { ...this.position }
  }
  
  setPosition(x: number, y: number, animate = false) {
    if (animate) {
      this.animateToPosition(x, y)
    } else {
      this.position = { x, y }
      
      // Apply boundary constraints
      const constrained = this.boundaryManager.constrainPosition(this.position.x, this.position.y)
      this.position = constrained
      
      this.updateScrollPosition()
      
      if (this.options.onPositionChange) {
        this.options.onPositionChange({ ...this.position })
      }
    }
  }
  
  navigateToItem(id: string, animate = true) {
    const item = this.virtualGrid.getItem(id)
    if (!item) return
    
    const itemPosition = this.virtualGrid.getItemPixelPosition(id)
    if (!itemPosition) return
    
    // Center the item in the viewport
    const targetX = itemPosition.x - (this.viewport.width - itemPosition.width) / 2
    const targetY = itemPosition.y - (this.viewport.height - itemPosition.height) / 2
    
    this.setPosition(targetX, targetY, animate)
    
    // Focus the item for keyboard navigation
    if (this.keyboardNavigation) {
      this.keyboardNavigation.focusItem(id)
    }
  }
  
  private animateToPosition(targetX: number, targetY: number) {
    const startX = this.position.x
    const startY = this.position.y
    const startTime = performance.now()
    const duration = 500 // ms
    
    const animate = (time: number) => {
      const elapsed = time - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Ease out cubic: progress = 1 - Math.pow(1 - progress, 3)
      const easeProgress = 1 - Math.pow(1 - progress, 3)
      
      const x = startX + (targetX - startX) * easeProgress
      const y = startY + (targetY - startY) * easeProgress
      
      // Apply boundary constraints
      const constrained = this.boundaryManager.constrainPosition(x, y)
      this.position = constrained
      
      this.updateScrollPosition()
      
      if (this.options.onPositionChange) {
        this.options.onPositionChange({ ...this.position })
      }
      
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    
    requestAnimationFrame(animate)
  }
  
  destroy() {
    window.removeEventListener('resize', this.handleResize.bind(this))
    this.inputManager.destroy()
    
    if (this.keyboardNavigation) {
      this.keyboardNavigation.destroy()
    }
  }
}
