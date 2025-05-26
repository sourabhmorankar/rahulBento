import { TouchHandler } from './TouchHandler'
import { WheelHandler } from './WheelHandler'
import { ScrollPhysics } from './ScrollPhysics'

export type InputManagerCallbacks = {
  onScroll: (deltaX: number, deltaY: number) => void
  onZoom?: (scale: number) => void
}

export class InputManager {
  private element: HTMLElement
  private touchHandler: TouchHandler
  private wheelHandler: WheelHandler
  private physics: ScrollPhysics
  private callbacks: InputManagerCallbacks
  private enabled: boolean
  private animationFrame: number | null
  private lastTimestamp: number
  
  constructor(element: HTMLElement, callbacks: InputManagerCallbacks) {
    this.element = element
    this.callbacks = callbacks
    this.physics = new ScrollPhysics()
    this.enabled = true
    this.animationFrame = null
    this.lastTimestamp = 0
    
    this.touchHandler = new TouchHandler(element, {
      onScroll: this.handleScroll.bind(this),
      onImpulse: this.handleImpulse.bind(this)
    })
    
    this.wheelHandler = new WheelHandler(element, {
      onScroll: this.handleScroll.bind(this)
    })
    
    if (callbacks.onZoom) {
      this.touchHandler.setZoomCallback(callbacks.onZoom)
    }
    
    this.startAnimation()
  }
  
  enable() {
    this.enabled = true
    this.touchHandler.enable()
    this.wheelHandler.enable()
    
    if (!this.animationFrame) {
      this.startAnimation()
    }
  }
  
  disable() {
    this.enabled = false
    this.touchHandler.disable()
    this.wheelHandler.disable()
    this.physics.stop()
    
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }
  
  private handleScroll(deltaX: number, deltaY: number) {
    if (!this.enabled) return
    
    this.physics.stop()
    this.callbacks.onScroll(deltaX, deltaY)
  }
  
  private handleImpulse(velocityX: number, velocityY: number) {
    if (!this.enabled) return
    
    this.physics.addImpulse(velocityX, velocityY)
  }
  
  private startAnimation() {
    const animate = (timestamp: number) => {
      if (!this.enabled) return
      
      if (this.physics.isMoving()) {
        const delta = this.physics.update(timestamp)
        this.callbacks.onScroll(delta.x, delta.y)
      }
      
      this.animationFrame = requestAnimationFrame(animate)
    }
    
    this.animationFrame = requestAnimationFrame(animate)
  }
  
  destroy() {
    this.disable()
    this.touchHandler.destroy()
    this.wheelHandler.destroy()
  }
}
