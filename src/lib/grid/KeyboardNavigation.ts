import { GRID_CONFIG } from './config'

export type KeyboardNavigationCallbacks = {
  onScroll: (deltaX: number, deltaY: number) => void
  onFocusItem?: (itemId: string | null) => void
}

export class KeyboardNavigation {
  private element: HTMLElement
  private callbacks: KeyboardNavigationCallbacks
  private enabled: boolean
  private keyState: Map<string, boolean>
  private animationFrame: number | null
  private scrollSpeed: number
  private focusedItemId: string | null
  private gridItems: Map<string, { gridX: number, gridY: number, spanX: number, spanY: number }>
  
  constructor(element: HTMLElement, callbacks: KeyboardNavigationCallbacks) {
    this.element = element
    this.callbacks = callbacks
    this.enabled = true
    this.keyState = new Map()
    this.animationFrame = null
    this.scrollSpeed = 10
    this.focusedItemId = null
    this.gridItems = new Map()
    
    this.bindEvents()
    this.startAnimation()
  }
  
  enable() {
    this.enabled = true
    if (!this.animationFrame) {
      this.startAnimation()
    }
  }
  
  disable() {
    this.enabled = false
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }
  
  updateGridItems(items: Array<{ id: string, gridX: number, gridY: number, spanX: number, spanY: number }>) {
    this.gridItems.clear()
    items.forEach(item => {
      this.gridItems.set(item.id, {
        gridX: item.gridX,
        gridY: item.gridY,
        spanX: item.spanX,
        spanY: item.spanY
      })
    })
  }
  
  focusItem(itemId: string | null) {
    this.focusedItemId = itemId
    if (this.callbacks.onFocusItem) {
      this.callbacks.onFocusItem(itemId)
    }
  }
  
  getFocusedItem() {
    return this.focusedItemId
  }
  
  private bindEvents() {
    window.addEventListener('keydown', this.handleKeyDown.bind(this))
    window.addEventListener('keyup', this.handleKeyUp.bind(this))
    window.addEventListener('blur', this.handleWindowBlur.bind(this))
  }
  
  private handleKeyDown(event: KeyboardEvent) {
    if (!this.enabled) return
    
    // Skip if user is typing in an input field
    if (
      event.target instanceof HTMLInputElement || 
      event.target instanceof HTMLTextAreaElement ||
      event.target instanceof HTMLSelectElement
    ) {
      return
    }
    
    this.keyState.set(event.key, true)
    
    // Handle tab navigation between items
    if (event.key === 'Tab') {
      event.preventDefault()
      this.navigateToNextItem(event.shiftKey)
    }
    
    // Handle enter key to "click" the focused item
    if (event.key === 'Enter' && this.focusedItemId) {
      event.preventDefault()
      this.triggerItemActivation(this.focusedItemId)
    }
  }
  
  private handleKeyUp(event: KeyboardEvent) {
    this.keyState.set(event.key, false)
  }
  
  private handleWindowBlur() {
    this.keyState.clear()
  }
  
  private startAnimation() {
    const animate = () => {
      if (!this.enabled) return
      
      let deltaX = 0
      let deltaY = 0
      
      // Arrow key navigation
      if (this.keyState.get('ArrowLeft')) deltaX -= this.scrollSpeed
      if (this.keyState.get('ArrowRight')) deltaX += this.scrollSpeed
      if (this.keyState.get('ArrowUp')) deltaY -= this.scrollSpeed
      if (this.keyState.get('ArrowDown')) deltaY += this.scrollSpeed
      
      // WASD navigation
      if (this.keyState.get('a') || this.keyState.get('A')) deltaX -= this.scrollSpeed
      if (this.keyState.get('d') || this.keyState.get('D')) deltaX += this.scrollSpeed
      if (this.keyState.get('w') || this.keyState.get('W')) deltaY -= this.scrollSpeed
      if (this.keyState.get('s') || this.keyState.get('S')) deltaY += this.scrollSpeed
      
      // Page Up/Down for faster vertical navigation
      if (this.keyState.get('PageUp')) deltaY -= this.scrollSpeed * 3
      if (this.keyState.get('PageDown')) deltaY += this.scrollSpeed * 3
      
      // Home/End for faster horizontal navigation
      if (this.keyState.get('Home')) deltaX -= this.scrollSpeed * 3
      if (this.keyState.get('End')) deltaX += this.scrollSpeed * 3
      
      if (deltaX !== 0 || deltaY !== 0) {
        this.callbacks.onScroll(deltaX, deltaY)
      }
      
      this.animationFrame = requestAnimationFrame(animate)
    }
    
    this.animationFrame = requestAnimationFrame(animate)
  }
  
  private navigateToNextItem(reverse = false) {
    if (this.gridItems.size === 0) return
    
    const itemIds = Array.from(this.gridItems.keys())
    
    if (!this.focusedItemId) {
      // Focus first or last item
      this.focusItem(reverse ? itemIds[itemIds.length - 1] : itemIds[0])
      return
    }
    
    const currentIndex = itemIds.indexOf(this.focusedItemId)
    if (currentIndex === -1) {
      this.focusItem(reverse ? itemIds[itemIds.length - 1] : itemIds[0])
      return
    }
    
    // Calculate next index with wrapping
    const nextIndex = reverse
      ? (currentIndex - 1 + itemIds.length) % itemIds.length
      : (currentIndex + 1) % itemIds.length
    
    this.focusItem(itemIds[nextIndex])
  }
  
  private triggerItemActivation(itemId: string) {
    // Find the element with the matching item ID and trigger a click
    const itemElement = document.querySelector(`[data-item-id="${itemId}"]`)
    if (itemElement instanceof HTMLElement) {
      itemElement.click()
    }
  }
  
  destroy() {
    this.disable()
    window.removeEventListener('keydown', this.handleKeyDown.bind(this))
    window.removeEventListener('keyup', this.handleKeyUp.bind(this))
    window.removeEventListener('blur', this.handleWindowBlur.bind(this))
  }
}
