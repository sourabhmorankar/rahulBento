import { VelocityTracker } from './ScrollPhysics'

export type TouchHandlerCallbacks = {
  onScroll: (deltaX: number, deltaY: number) => void
  onImpulse: (velocityX: number, velocityY: number) => void
}

export class TouchHandler {
  private element: HTMLElement
  private touches: Map<number, {
    startX: number
    startY: number
    currentX: number
    currentY: number
    timestamp: number
  }>
  private velocityTracker: VelocityTracker
  private callbacks: TouchHandlerCallbacks
  private enabled: boolean
  private multiTouchDistance: number | null
  private initialMultiTouchDistance: number | null
  private onZoom: ((scale: number) => void) | null
  
  constructor(element: HTMLElement, callbacks: TouchHandlerCallbacks) {
    this.element = element
    this.touches = new Map()
    this.velocityTracker = new VelocityTracker()
    this.callbacks = callbacks
    this.enabled = true
    this.multiTouchDistance = null
    this.initialMultiTouchDistance = null
    this.onZoom = null
    
    this.bindEvents()
  }
  
  setZoomCallback(callback: (scale: number) => void) {
    this.onZoom = callback
  }
  
  enable() {
    this.enabled = true
  }
  
  disable() {
    this.enabled = false
    this.touches.clear()
    this.velocityTracker.reset()
  }
  
  private bindEvents() {
    this.element.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false })
    this.element.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false })
    this.element.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false })
    this.element.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false })
  }
  
  private handleTouchStart(event: TouchEvent) {
    if (!this.enabled) return
    
    event.preventDefault()
    
    for (const touch of Array.from(event.changedTouches)) {
      this.touches.set(touch.identifier, {
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        timestamp: Date.now()
      })
    }
    
    this.velocityTracker.reset()
    
    if (event.touches.length === 2) {
      this.handlePinchStart(event)
    }
  }
  
  private handleTouchMove(event: TouchEvent) {
    if (!this.enabled) return
    
    event.preventDefault()
    
    if (event.touches.length === 2) {
      this.handlePinchMove(event)
      return
    }
    
    for (const touch of Array.from(event.changedTouches)) {
      if (this.touches.has(touch.identifier)) {
        const touchData = this.touches.get(touch.identifier)!
        
        const deltaX = touch.clientX - touchData.currentX
        const deltaY = touch.clientY - touchData.currentY
        
        touchData.currentX = touch.clientX
        touchData.currentY = touch.clientY
        
        this.velocityTracker.addPoint(deltaX, deltaY, Date.now())
        this.callbacks.onScroll(-deltaX, -deltaY)
      }
    }
  }
  
  private handleTouchEnd(event: TouchEvent) {
    if (!this.enabled) return
    
    const velocity = this.velocityTracker.getVelocity()
    
    if (velocity.speed > 0.5) {
      this.callbacks.onImpulse(-velocity.x, -velocity.y)
    }
    
    for (const touch of Array.from(event.changedTouches)) {
      this.touches.delete(touch.identifier)
    }
    
    if (event.touches.length < 2) {
      this.multiTouchDistance = null
      this.initialMultiTouchDistance = null
    }
  }
  
  private handlePinchStart(event: TouchEvent) {
    if (event.touches.length !== 2) return
    
    const touch1 = event.touches[0]
    const touch2 = event.touches[1]
    
    this.multiTouchDistance = this.getDistance(
      touch1.clientX, touch1.clientY,
      touch2.clientX, touch2.clientY
    )
    
    this.initialMultiTouchDistance = this.multiTouchDistance
  }
  
  private handlePinchMove(event: TouchEvent) {
    if (event.touches.length !== 2 || !this.initialMultiTouchDistance || !this.onZoom) return
    
    const touch1 = event.touches[0]
    const touch2 = event.touches[1]
    
    const currentDistance = this.getDistance(
      touch1.clientX, touch1.clientY,
      touch2.clientX, touch2.clientY
    )
    
    const scale = currentDistance / this.initialMultiTouchDistance
    
    this.onZoom(scale)
    this.multiTouchDistance = currentDistance
  }
  
  private getDistance(x1: number, y1: number, x2: number, y2: number) {
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
  }
  
  destroy() {
    this.element.removeEventListener('touchstart', this.handleTouchStart.bind(this))
    this.element.removeEventListener('touchmove', this.handleTouchMove.bind(this))
    this.element.removeEventListener('touchend', this.handleTouchEnd.bind(this))
    this.element.removeEventListener('touchcancel', this.handleTouchEnd.bind(this))
  }
}
