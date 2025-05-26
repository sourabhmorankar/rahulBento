export type WheelHandlerCallbacks = {
  onScroll: (deltaX: number, deltaY: number) => void
}

export class WheelHandler {
  private element: HTMLElement
  private callbacks: WheelHandlerCallbacks
  private enabled: boolean
  private wheelDelta: { x: number, y: number }
  private wheelTimeout: number | null
  private acceleration: number
  private maxAcceleration: number
  
  constructor(element: HTMLElement, callbacks: WheelHandlerCallbacks) {
    this.element = element
    this.callbacks = callbacks
    this.enabled = true
    this.wheelDelta = { x: 0, y: 0 }
    this.wheelTimeout = null
    this.acceleration = 1.2
    this.maxAcceleration = 3.0
    
    this.bindEvents()
  }
  
  enable() {
    this.enabled = true
  }
  
  disable() {
    this.enabled = false
    this.wheelDelta = { x: 0, y: 0 }
    if (this.wheelTimeout !== null) {
      window.clearTimeout(this.wheelTimeout)
      this.wheelTimeout = null
    }
  }
  
  private bindEvents() {
    this.element.addEventListener('wheel', this.handleWheel.bind(this), { passive: false })
  }
  
  private handleWheel(event: WheelEvent) {
    if (!this.enabled) return
    
    event.preventDefault()
    
    // Detect wheel acceleration
    if (this.wheelTimeout !== null) {
      window.clearTimeout(this.wheelTimeout)
    }
    
    this.acceleration = Math.min(this.acceleration * 1.1, this.maxAcceleration)
    
    // Apply acceleration to delta
    const deltaX = event.deltaX * this.acceleration
    const deltaY = event.deltaY * this.acceleration
    
    // Handle different wheel modes
    let finalDeltaX = deltaX
    let finalDeltaY = deltaY
    
    // Handle trackpad pinch zoom (Ctrl + wheel)
    if (event.ctrlKey) {
      // Implement zoom behavior if needed
      return
    }
    
    // Handle horizontal scrolling with Shift key
    if (event.shiftKey && Math.abs(deltaY) > Math.abs(deltaX)) {
      finalDeltaX = deltaY
      finalDeltaY = 0
    }
    
    this.callbacks.onScroll(finalDeltaX, finalDeltaY)
    
    // Reset acceleration after wheel stops
    this.wheelTimeout = window.setTimeout(() => {
      this.acceleration = 1.2
      this.wheelTimeout = null
    }, 150)
  }
  
  destroy() {
    this.element.removeEventListener('wheel', this.handleWheel.bind(this))
    if (this.wheelTimeout !== null) {
      window.clearTimeout(this.wheelTimeout)
    }
  }
}
