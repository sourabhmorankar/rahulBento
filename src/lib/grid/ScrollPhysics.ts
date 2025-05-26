import { GRID_CONFIG } from './config'

export class ScrollPhysics {
  velocity: { x: number, y: number }
  friction: number
  minVelocity: number
  maxVelocity: number
  lastTimestamp: number
  
  constructor() {
    this.velocity = { x: 0, y: 0 }
    this.friction = GRID_CONFIG.friction
    this.minVelocity = GRID_CONFIG.minVelocity
    this.maxVelocity = GRID_CONFIG.maxVelocity
    this.lastTimestamp = 0
  }
  
  update(timestamp: number) {
    if (!this.lastTimestamp) {
      this.lastTimestamp = timestamp
      return { x: 0, y: 0 }
    }
    
    const deltaTime = (timestamp - this.lastTimestamp) / 16 // Normalize to 60fps
    this.lastTimestamp = timestamp
    
    // Apply friction
    this.velocity.x *= Math.pow(this.friction, deltaTime)
    this.velocity.y *= Math.pow(this.friction, deltaTime)
    
    // Stop if velocity is too small
    if (Math.abs(this.velocity.x) < this.minVelocity) this.velocity.x = 0
    if (Math.abs(this.velocity.y) < this.minVelocity) this.velocity.y = 0
    
    return {
      x: this.velocity.x * deltaTime,
      y: this.velocity.y * deltaTime
    }
  }
  
  addImpulse(x: number, y: number) {
    this.velocity.x = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.velocity.x + x))
    this.velocity.y = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.velocity.y + y))
  }
  
  stop() {
    this.velocity = { x: 0, y: 0 }
  }
  
  isMoving() {
    return Math.abs(this.velocity.x) > this.minVelocity || Math.abs(this.velocity.y) > this.minVelocity
  }
  
  getVelocity() {
    return { ...this.velocity }
  }
}

export class VelocityTracker {
  points: Array<{ x: number, y: number, timestamp: number }>
  maxPoints: number
  
  constructor(maxPoints = 5) {
    this.points = []
    this.maxPoints = maxPoints
  }
  
  addPoint(x: number, y: number, timestamp: number) {
    this.points.push({ x, y, timestamp })
    
    if (this.points.length > this.maxPoints) {
      this.points.shift()
    }
  }
  
  reset() {
    this.points = []
  }
  
  getVelocity() {
    if (this.points.length < 2) {
      return { x: 0, y: 0, speed: 0 }
    }
    
    const newest = this.points[this.points.length - 1]
    const oldest = this.points[0]
    
    const timeDelta = newest.timestamp - oldest.timestamp
    
    if (timeDelta === 0) {
      return { x: 0, y: 0, speed: 0 }
    }
    
    // Calculate average velocity over the tracked points
    let totalX = 0
    let totalY = 0
    
    for (let i = 1; i < this.points.length; i++) {
      const current = this.points[i]
      const previous = this.points[i - 1]
      
      totalX += current.x
      totalY += current.y
    }
    
    const avgX = totalX / (this.points.length - 1)
    const avgY = totalY / (this.points.length - 1)
    
    // Calculate velocity in pixels per millisecond
    const velocityX = avgX / timeDelta * 16.67 // Convert to pixels per frame at 60fps
    const velocityY = avgY / timeDelta * 16.67
    
    const speed = Math.sqrt(velocityX * velocityX + velocityY * velocityY)
    
    return {
      x: velocityX,
      y: velocityY,
      speed
    }
  }
}
