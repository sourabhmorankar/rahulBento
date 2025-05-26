# Infinite Bento Grid Portfolio - Comprehensive Project Specification

## Project Overview

### Vision Statement
Create a revolutionary portfolio website featuring an infinite scrollable bento grid that serves as an interactive canvas for showcasing personal and professional content. The platform should feel like a living, breathing digital space where each thumbnail tells a story and the overall experience feels intuitive, performant, and delightful across all devices.

### Core Philosophy
- **Content-First**: Every design decision prioritizes content discovery and consumption
- **Performance-Obsessed**: Sub-second interactions with buttery-smooth 60fps animations
- **Accessibility-Inclusive**: WCAG 2.1 AAA compliance where possible, minimum AA
- **Mobile-Native**: Touch-first design with desktop enhancements
- **Future-Proof**: Modular architecture supporting easy content type additions

## Technical Architecture

### System Requirements
- **Browser Support**: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Device Support**: iOS 14+, Android 10+, Windows 10+, macOS 10.15+
- **Screen Sizes**: 320px (iPhone SE) to 5120px (5K displays)
- **Performance Targets**: 
  - First Contentful Paint: < 1.2s
  - Largest Contentful Paint: < 2.5s
  - Cumulative Layout Shift: < 0.1
  - First Input Delay: < 100ms

### Technology Stack

#### Frontend Framework
**SvelteKit 2.0+**
- **Reasoning**: Superior performance, smaller bundle sizes, excellent TypeScript support
- **Build Target**: ES2022 with Vite bundler
- **Code Splitting**: Route-based + component-based lazy loading
- **SSR Strategy**: Hybrid rendering (static for marketing pages, dynamic for grid)

#### Styling Architecture
**Custom CSS with Modern Features**
```css
/* CSS Custom Properties for theming */
:root {
  --grid-cell-size: clamp(80px, 8vw, 120px);
  --grid-gap: clamp(8px, 1vw, 16px);
  --animation-duration: 350ms;
  --animation-easing: cubic-bezier(0.4, 0, 0.2, 1);
}

/* Container Queries for responsive thumbnails */
@container thumbnail (min-width: 200px) {
  .thumbnail-content { font-size: 1.2rem; }
}
```

**CSS Architecture**:
- **Methodology**: BEM with CSS Custom Properties
- **Layout**: CSS Grid + Flexbox hybrid approach
- **Responsive**: Container queries + media queries
- **Animations**: CSS transforms + Web Animations API
- **Theming**: CSS custom properties with automatic dark mode detection

#### Animation System
**Anime.js v4.0+ Integration**
```javascript
// Global animation configuration
const ANIMATION_CONFIG = {
  duration: 350,
  easing: 'cubicBezier(.4,0,.2,1)',
  delay: (el, i) => i * 50, // Stagger animations
}

// Thumbnail expansion animation timeline
const expandThumbnail = anime.timeline({
  easing: 'easeOutCubic',
  duration: 400,
})
.add({
  targets: '.thumbnail',
  scale: [1, 1.05],
  duration: 100,
})
.add({
  targets: '.thumbnail',
  scale: [1.05, 1],
  borderRadius: ['12px', '0px'],
  width: '100vw',
  height: '100vh',
  duration: 300,
}, '-=50')
```

## Infinite Grid System

### Grid Mathematics & Positioning

#### Coordinate System
```javascript
// Grid coordinate system
const GRID_CONFIG = {
  cellSize: 120, // Base cell size in pixels
  gap: 16, // Gap between cells
  origin: { x: 0, y: 0 }, // Bio card center position
  maxDistance: 50, // Maximum cells from origin (prevents infinite scroll)
  snapThreshold: 0.3, // Snap to grid when within 30% of cell size
}

// Convert grid coordinates to pixel positions
function gridToPixel(gridX, gridY) {
  return {
    x: gridX * (GRID_CONFIG.cellSize + GRID_CONFIG.gap),
    y: gridY * (GRID_CONFIG.cellSize + GRID_CONFIG.gap)
  }
}

// Convert pixel position to grid coordinates
function pixelToGrid(pixelX, pixelY) {
  return {
    x: Math.round(pixelX / (GRID_CONFIG.cellSize + GRID_CONFIG.gap)),
    y: Math.round(pixelY / (GRID_CONFIG.cellSize + GRID_CONFIG.gap))
  }
}
```

#### Virtual Scrolling Implementation
```javascript
// Efficient rendering of visible thumbnails only
class VirtualGrid {
  constructor(viewport, thumbnails) {
    this.viewport = viewport
    this.thumbnails = thumbnails
    this.visibleThumbnails = new Set()
    this.renderBuffer = 2 // Render 2 cells beyond viewport
  }

  updateVisibleThumbnails(scrollX, scrollY) {
    const startX = Math.floor((scrollX - this.renderBuffer * GRID_CONFIG.cellSize) / GRID_CONFIG.cellSize)
    const endX = Math.ceil((scrollX + this.viewport.width + this.renderBuffer * GRID_CONFIG.cellSize) / GRID_CONFIG.cellSize)
    const startY = Math.floor((scrollY - this.renderBuffer * GRID_CONFIG.cellSize) / GRID_CONFIG.cellSize)
    const endY = Math.ceil((scrollY + this.viewport.height + this.renderBuffer * GRID_CONFIG.cellSize) / GRID_CONFIG.cellSize)

    // Update visible set
    this.visibleThumbnails.clear()
    for (let x = startX; x <= endX; x++) {
      for (let y = startY; y <= endY; y++) {
        const thumbnail = this.getThumbnailAt(x, y)
        if (thumbnail) this.visibleThumbnails.add(thumbnail)
      }
    }
  }
}
```

#### Smooth Scrolling & Physics
```javascript
// Momentum-based scrolling with friction
class ScrollPhysics {
  constructor() {
    this.velocity = { x: 0, y: 0 }
    this.friction = 0.92
    this.minVelocity = 0.1
    this.maxVelocity = 50
  }

  update(deltaTime) {
    // Apply friction
    this.velocity.x *= this.friction
    this.velocity.y *= this.friction

    // Stop if velocity is too small
    if (Math.abs(this.velocity.x) < this.minVelocity) this.velocity.x = 0
    if (Math.abs(this.velocity.y) < this.minVelocity) this.velocity.y = 0

    return {
      x: this.velocity.x * deltaTime,
      y: this.velocity.y * deltaTime
    }
  }

  addImpulse(x, y) {
    this.velocity.x = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.velocity.x + x))
    this.velocity.y = Math.max(-this.maxVelocity, Math.min(this.maxVelocity, this.velocity.y + y))
  }
}
```

### Touch & Mouse Interaction

#### Multi-Touch Support
```javascript
// Handle touch gestures with momentum
class TouchHandler {
  constructor(element) {
    this.element = element
    this.touches = new Map()
    this.lastTouchTime = 0
    this.velocityTracker = new VelocityTracker()
    
    this.bindEvents()
  }

  handleTouchStart(event) {
    event.preventDefault()
    for (const touch of event.changedTouches) {
      this.touches.set(touch.identifier, {
        startX: touch.clientX,
        startY: touch.clientY,
        currentX: touch.clientX,
        currentY: touch.clientY,
        timestamp: Date.now()
      })
    }
    this.velocityTracker.reset()
  }

  handleTouchMove(event) {
    event.preventDefault()
    for (const touch of event.changedTouches) {
      if (this.touches.has(touch.identifier)) {
        const touchData = this.touches.get(touch.identifier)
        const deltaX = touch.clientX - touchData.currentX
        const deltaY = touch.clientY - touchData.currentY
        
        touchData.currentX = touch.clientX
        touchData.currentY = touch.clientY
        
        this.velocityTracker.addPoint(deltaX, deltaY, Date.now())
        this.scrollBy(-deltaX, -deltaY)
      }
    }
  }

  handleTouchEnd(event) {
    const velocity = this.velocityTracker.getVelocity()
    if (velocity.speed > 0.5) {
      this.physics.addImpulse(velocity.x * 0.1, velocity.y * 0.1)
    }
    
    for (const touch of event.changedTouches) {
      this.touches.delete(touch.identifier)
    }
  }
}
```

#### Mouse Wheel & Trackpad Support
```javascript
// Smooth mouse wheel handling with acceleration
class WheelHandler {
  constructor() {
    this.wheelDelta = { x: 0, y: 0 }
    this.wheelTimeout = null
    this.acceleration = 1.2
    this.maxAcceleration = 3.0
  }

  handleWheel(event) {
    event.preventDefault()
    
    // Detect wheel acceleration
    clearTimeout(this.wheelTimeout)
    this.acceleration = Math.min(this.acceleration * 1.1, this.maxAcceleration)
    
    // Apply acceleration to delta
    const deltaX = event.deltaX * this.acceleration
    const deltaY = event.deltaY * this.acceleration
    
    this.scrollBy(deltaX, deltaY)
    
    // Reset acceleration after wheel stops
    this.wheelTimeout = setTimeout(() => {
      this.acceleration = 1.2
    }, 150)
  }
}
```

### Grid Boundaries & Limits
```javascript
// Prevent infinite scrolling into empty space
class BoundaryManager {
  constructor(thumbnails) {
    this.thumbnails = thumbnails
    this.bounds = this.calculateBounds()
    this.elasticLimit = 200 // Pixels beyond boundary before elastic effect
  }

  calculateBounds() {
    let minX = Infinity, maxX = -Infinity
    let minY = Infinity, maxY = -Infinity
    
    for (const thumbnail of this.thumbnails) {
      minX = Math.min(minX, thumbnail.gridX)
      maxX = Math.max(maxX, thumbnail.gridX + thumbnail.spanX - 1)
      minY = Math.min(minY, thumbnail.gridY)
      maxY = Math.max(maxY, thumbnail.gridY + thumbnail.spanY - 1)
    }
    
    // Add padding around content
    return {
      minX: minX - 5,
      maxX: maxX + 5,
      minY: minY - 5,
      maxY: maxY + 5
    }
  }

  constrainPosition(x, y) {
    const pixelBounds = {
      minX: this.bounds.minX * (GRID_CONFIG.cellSize + GRID_CONFIG.gap),
      maxX: this.bounds.maxX * (GRID_CONFIG.cellSize + GRID_CONFIG.gap),
      minY: this.bounds.minY * (GRID_CONFIG.cellSize + GRID_CONFIG.gap),
      maxY: this.bounds.maxY * (GRID_CONFIG.cellSize + GRID_CONFIG.gap)
    }

    // Elastic boundary effect
    if (x < pixelBounds.minX - this.elasticLimit) {
      x = pixelBounds.minX - this.elasticLimit + (x - pixelBounds.minX + this.elasticLimit) * 0.3
    }
    if (x > pixelBounds.maxX + this.elasticLimit) {
      x = pixelBounds.maxX + this.elasticLimit + (x - pixelBounds.maxX - this.elasticLimit) * 0.3
    }
    if (y < pixelBounds.minY - this.elasticLimit) {
      y = pixelBounds.minY - this.elasticLimit + (y - pixelBounds.minY + this.elasticLimit) * 0.3
    }
    if (y > pixelBounds.maxY + this.elasticLimit) {
      y = pixelBounds.maxY + this.elasticLimit + (y - pixelBounds.maxY - this.elasticLimit) * 0.3
    }

    return { x, y }
  }
}
```

## Thumbnail System

### Thumbnail Architecture

#### Base Thumbnail Class
```javascript
class Thumbnail {
  constructor({
    id,
    type,
    gridX,
    gridY,
    spanX = 1,
    spanY = 1,
    content,
    metadata = {}
  }) {
    this.id = id
    this.type = type
    this.gridX = gridX
    this.gridY = gridY
    this.spanX = spanX
    this.spanY = spanY
    this.content = content
    this.metadata = metadata
    this.isVisible = false
    this.isLoaded = false
    this.priority = this.calculatePriority()
  }

  calculatePriority() {
    // Distance from origin determines loading priority
    const distance = Math.sqrt(this.gridX ** 2 + this.gridY ** 2)
    return Math.max(0, 100 - distance)
  }

  async load() {
    if (this.isLoaded) return
    
    try {
      await this.loadContent()
      await this.loadAssets()
      this.isLoaded = true
    } catch (error) {
      console.error(`Failed to load thumbnail ${this.id}:`, error)
      this.showErrorState()
    }
  }

  async loadContent() {
    // Override in subclasses
  }

  async loadAssets() {
    // Load images, videos, etc.
  }
}
```

#### Bio Cluster Specifications

**Bio Card (Primary - Center Position)**
```javascript
class BioCardThumbnail extends Thumbnail {
  constructor() {
    super({
      id: 'bio-card',
      type: 'bio',
      gridX: 0,
      gridY: 0,
      spanX: 2,
      spanY: 3,
      content: {
        name: '',
        title: '',
        description: '',
        profileImage: '',
        location: '',
        availability: 'available', // available, busy, away
        lastUpdated: Date.now()
      }
    })
  }

  render() {
    return `
      <div class="bio-card corporate-id">
        <div class="bio-card__header">
          <img class="bio-card__profile" src="${this.content.profileImage}" alt="${this.content.name}">
          <div class="bio-card__status ${this.content.availability}"></div>
        </div>
        <div class="bio-card__content">
          <h1 class="bio-card__name">${this.content.name}</h1>
          <h2 class="bio-card__title">${this.content.title}</h2>
          <p class="bio-card__description">${this.content.description}</p>
          <div class="bio-card__meta">
            <span class="bio-card__location">${this.content.location}</span>
            <span class="bio-card__updated">Updated ${this.formatDate(this.content.lastUpdated)}</span>
          </div>
        </div>
      </div>
    `
  }
}
```

**Bio Cluster Layout Configuration**
```javascript
const BIO_CLUSTER_LAYOUT = {
  // Quarter cell margin around entire cluster
  margin: 0.25,
  
  // Positions relative to bio card center (0,0)
  thumbnails: {
    'bio-card': { x: 0, y: 0, spanX: 2, spanY: 3 },
    'skills': { x: -3, y: -2, spanX: 2, spanY: 2 },
    'experience': { x: 3, y: -1, spanX: 2, spanY: 3 },
    'highlights': { x: -1, y: -4, spanX: 3, spanY: 1 },
    'journey': { x: -3, y: 1, spanX: 2, spanY: 2 },
    'photoBooth': { x: 3, y: 3, spanX: 2, spanY: 2 },
    'ask': { x: -1, y: 4, spanX: 1, spanY: 1 },
    'mood': { x: 1, y: 4, spanX: 1, spanY: 1 },
    'featuredTestimonials': { x: -4, y: -1, spanX: 1, spanY: 2 },
    'featuredBlogArticle': { x: 4, y: -3, spanX: 2, spanY: 2 },
    'featuredSocialEmbed': { x: -2, y: 2, spanX: 1, spanY: 1 },
    'socialTray': { x: 0, y: -5, spanX: 2, spanY: 1 },
    'sayHi': { x: 2, y: 2, spanX: 1, spanY: 1 },
    'contactInfo': { x: -1, y: 5, spanX: 3, spanY: 1 },
    'downloadResume': { x: 1, y: 3, spanX: 1, spanY: 1 }
  }
}
```

#### Extended Content Thumbnails

**Blog Article Thumbnail**
```javascript
class BlogArticleThumbnail extends Thumbnail {
  constructor(article) {
    super({
      id: `blog-${article.id}`,
      type: 'blogArticle',
      spanX: Math.random() > 0.7 ? 2 : 1,
      spanY: Math.random() > 0.5 ? 2 : 1,
      content: article
    })
  }

  render() {
    const { title, excerpt, publishDate, readTime, featuredImage, tags } = this.content
    
    return `
      <article class="blog-thumbnail">
        ${featuredImage ? `<img class="blog-thumbnail__image" src="${featuredImage}" alt="${title}">` : ''}
        <div class="blog-thumbnail__content">
          <div class="blog-thumbnail__meta">
            <time datetime="${publishDate}">${this.formatDate(publishDate)}</time>
            <span class="blog-thumbnail__read-time">${readTime} min read</span>
          </div>
          <h3 class="blog-thumbnail__title">${title}</h3>
          <p class="blog-thumbnail__excerpt">${excerpt}</p>
          <div class="blog-thumbnail__tags">
            ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
      </article>
    `
  }
}
```

**Case Study Thumbnail**
```javascript
class CaseStudyThumbnail extends Thumbnail {
  constructor(caseStudy) {
    super({
      id: `case-study-${caseStudy.id}`,
      type: 'caseStudy',
      spanX: 2,
      spanY: 2,
      content: caseStudy
    })
  }

  render() {
    const { title, client, year, category, thumbnail, results } = this.content
    
    return `
      <div class="case-study-thumbnail">
        <div class="case-study-thumbnail__image" style="background-image: url(${thumbnail})"></div>
        <div class="case-study-thumbnail__overlay">
          <div class="case-study-thumbnail__meta">
            <span class="case-study-thumbnail__client">${client}</span>
            <span class="case-study-thumbnail__year">${year}</span>
            <span class="case-study-thumbnail__category">${category}</span>
          </div>
          <h3 class="case-study-thumbnail__title">${title}</h3>
          <div class="case-study-thumbnail__results">
            ${results.map(result => `<div class="result">${result}</div>`).join('')}
          </div>
        </div>
      </div>
    `
  }
}
```

### Thumbnail Interactions

#### Hover Effects
```css
.thumbnail {
  transition: all var(--animation-duration) var(--animation-easing);
  transform-origin: center;
}

.thumbnail:hover {
  transform: translateZ(0) scale(1.02);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  z-index: 10;
}

.thumbnail:hover .thumbnail__content {
  opacity: 1;
  transform: translateY(0);
}

/* Stagger hover effects for adjacent thumbnails */
.thumbnail:hover + .thumbnail,
.thumbnail:has(+ .thumbnail:hover) {
  transform: translateZ(0) scale(0.98);
  opacity: 0.8;
}
```

#### Click-to-Expand Animation
```javascript
class ThumbnailExpansion {
  constructor(thumbnail, container) {
    this.thumbnail = thumbnail
    this.container = container
    this.overlay = null
    this.isExpanded = false
  }

  async expand() {
    if (this.isExpanded) return
    
    // Prevent scroll during expansion
    document.body.style.overflow = 'hidden'
    
    // Create overlay
    this.overlay = document.createElement('div')
    this.overlay.className = 'thumbnail-overlay'
    document.body.appendChild(this.overlay)
    
    // Get thumbnail bounds
    const thumbnailRect = this.thumbnail.getBoundingClientRect()
    
    // Clone thumbnail for animation
    const clone = this.thumbnail.cloneNode(true)
    clone.style.position = 'fixed'
    clone.style.top = `${thumbnailRect.top}px`
    clone.style.left = `${thumbnailRect.left}px`
    clone.style.width = `${thumbnailRect.width}px`
    clone.style.height = `${thumbnailRect.height}px`
    clone.style.zIndex = '1000'
    
    this.overlay.appendChild(clone)
    
    // Hide original thumbnail
    this.thumbnail.style.opacity = '0'
    
    // Animate clone to fullscreen
    await anime({
      targets: clone,
      top: 0,
      left: 0,
      width: '100vw',
      height: '100vh',
      borderRadius: 0,
      duration: 400,
      easing: 'easeOutCubic'
    }).finished
    
    // Load full content
    await this.loadFullContent(clone)
    
    this.isExpanded = true
  }

  async collapse() {
    if (!this.isExpanded) return
    
    const clone = this.overlay.querySelector('.thumbnail')
    const thumbnailRect = this.thumbnail.getBoundingClientRect()
    
    // Animate back to thumbnail position
    await anime({
      targets: clone,
      top: `${thumbnailRect.top}px`,
      left: `${thumbnailRect.left}px`,
      width: `${thumbnailRect.width}px`,
      height: `${thumbnailRect.height}px`,
      borderRadius: '12px',
      duration: 300,
      easing: 'easeInCubic'
    }).finished
    
    // Show original thumbnail
    this.thumbnail.style.opacity = '1'
    
    // Remove overlay
    document.body.removeChild(this.overlay)
    document.body.style.overflow = ''
    
    this.isExpanded = false
  }

  async loadFullContent(container) {
    // Show loading state
    const loader = document.createElement('div')
    loader.className = 'content-loader'
    container.appendChild(loader)
    
    try {
      // Fetch full content based on thumbnail type
      const content = await this.fetchFullContent()
      
      // Remove loader
      container.removeChild(loader)
      
      // Render full content
      container.innerHTML = this.renderFullContent(content)
      
      // Fade in content
      anime({
        targets: container.children,
        opacity: [0, 1],
        translateY: [20, 0],
        duration: 300,
        delay: anime.stagger(50),
        easing: 'easeOutQuart'
      })
      
    } catch (error) {
      console.error('Failed to load full content:', error)
      this.showErrorContent(container)
    }
  }
}
```

### Content Generation Strategy

#### Thumbnail Distribution Algorithm
```javascript
class ThumbnailDistribution {
  constructor(bioCluster, contentThumbnails) {
    this.bioCluster = bioCluster
    this.contentThumbnails = contentThumbnails
    this.occupiedCells = new Set()
    this.spiralPattern = this.generateSpiralPattern()
  }

  distributeContent() {
    // Mark bio cluster cells as occupied
    for (const [id, config] of Object.entries(this.bioCluster.thumbnails)) {
      this.markCellsOccupied(config.x, config.y, config.spanX, config.spanY)
    }

    // Add margin around bio cluster
    this.addBioClusterMargin()

    // Distribute content thumbnails in spiral pattern
    let spiralIndex = 0
    for (const thumbnail of this.contentThumbnails) {
      const position = this.findNextAvailablePosition(thumbnail, spiralIndex)
      if (position) {
        thumbnail.gridX = position.x
        thumbnail.gridY = position.y
        this.markCellsOccupied(position.x, position.y, thumbnail.spanX, thumbnail.spanY)
        spiralIndex = position.spiralIndex + 1
      }
    }
  }

  generateSpiralPattern() {
    // Generate spiral coordinates starting from bio cluster edge
    const spiral = []
    const maxRadius = 30
    
    for (let radius = 8; radius <= maxRadius; radius++) {
      // Top edge
      for (let x = -radius; x <= radius; x++) {
        spiral.push({ x, y: -radius })
      }
      // Right edge
      for (let y = -radius + 1; y <= radius; y++) {
        spiral.push({ x: radius, y })
      }
      // Bottom edge
      for (let x = radius - 1; x >= -radius; x--) {
        spiral.push({ x, y: radius })
      }
      // Left edge
      for (let y = radius - 1; y > -radius; y--) {
        spiral.push({ x: -radius, y })
      }
    }
    
    return spiral
  }

  findNextAvailablePosition(thumbnail, startIndex) {
    for (let i = startIndex; i < this.spiralPattern.length; i++) {
      const candidate = this.spiralPattern[i]
      
      if (this.canPlaceThumbnail(candidate.x, candidate.y, thumbnail.spanX, thumbnail.spanY)) {
        return { ...candidate, spiralIndex: i }
      }
    }
    return null
  }

  canPlaceThumbnail(x, y, spanX, spanY) {
    for (let dx = 0; dx < spanX; dx++) {
      for (let dy = 0; dy < spanY; dy++) {
        if (this.occupiedCells.has(`${x + dx},${y + dy}`)) {
          return false
        }
      }
    }
    return true
  }

  markCellsOccupied(x, y, spanX, spanY) {
    for (let dx = 0; dx < spanX; dx++) {
      for (let dy = 0; dy < spanY; dy++) {
        this.occupiedCells.add(`${x + dx},${y + dy}`)
      }
    }
  }
}
```

## Full-Screen Content Experience

### Content Rendering System

#### Content Type Handlers
```javascript
class ContentRenderer {
  static renderers = new Map([
    ['blog', BlogContentRenderer],
    ['caseStudy', CaseStudyContentRenderer],
    ['testimonial', TestimonialContentRenderer],
    ['social', SocialContentRenderer],
    ['bio', BioContentRenderer]
  ])

  static async render(thumbnail) {
    const RendererClass = this.renderers.get(thumbnail.type)
    if (!RendererClass) {
      throw new Error(`No renderer found for type: ${thumbnail.type}`)
    }

    const renderer = new RendererClass(thumbnail)
    return await renderer.render()
  }
}

class BlogContentRenderer {
  constructor(thumbnail) {
    this.thumbnail = thumbnail
    this.content = thumbnail.content
  }

  async render() {
    const { title, content, publishDate, author, tags, readTime } = this.content
    
    // Process markdown content
    const processedContent = await this.processMarkdown(content)
    
    return `
      <article class="blog-full-content">
        <header class="blog-header">
          <div class="blog-meta">
            <time datetime="${publishDate}">${this.formatDate(publishDate)}</time>
            <span class="read-time">${readTime} min read</span>
            <span class="author">By ${author}</span>
          </div>
          <h1 class="blog-title">${title}</h1>
          <div class="blog-tags">
            ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </header>
        
        <div class="blog-content">
          ${processedContent}
        </div>
        
        <footer class="blog-footer">
          <div class="blog-share">
            <button class="share-button" data-platform="twitter">Share on Twitter</button>
            <button class="share-button" data-platform="linkedin">Share on LinkedIn</button>
            <button class="copy-link">Copy Link</button>
          </div>
          
          <div class="blog-navigation">
            <button class="nav-button prev" data-action="previous">Previous Article</button>
            <button class="nav-button next" data-action="next">Next Article</button>
          </div>
        </footer>
      </article>
    `
  }

  async processMarkdown(markdown) {
    // Use mdsvex to process markdown with syntax highlighting
    const { compile } = await import('mdsvex')
    const processed = await compile(markdown, {
      highlight: {
        highlighter: this.syntaxHighlighter
      },
      remarkPlugins: [
        'remark-gfm',
        'remark-math'
      ],
      rehypePlugins: [
        'rehype-katex',
        'rehype-slug',
        'rehype-autolink-headings'
      ]
    })
    
    return processed.code
  }
}
```

#### Navigation Between Content
```javascript
class ContentNavigation {
  constructor(thumbnails) {
    this.thumbnails = thumbnails
    this.currentIndex = -1
    this.history = []
  }

  navigate(direction) {
    const currentThumbnail = this.getCurrentThumbnail()
    if (!currentThumbnail) return

    const candidates = this.findNavigationCandidates(currentThumbnail, direction)
    if (candidates.length === 0) return

    // Choose best candidate based on relevance and position
    const nextThumbnail = this.selectBestCandidate(candidates, direction)
    this.navigateTo(nextThumbnail)
  }

  findNavigationCandidates(current, direction) {
    const sameType = this.thumbnails.filter(t => t.type === current.type && t.id !== current.id)
    
    if (direction === 'next') {
      // Find content published after current
      return sameType.filter(t => t.content.publishDate > current.content.publishDate)
        .sort((a, b) => a.content.publishDate - b.content.publishDate)
    } else {
      // Find content published before current
      return sameType.filter(t => t.content.publishDate < current.content.publishDate)
        .sort((a, b) => b.content.publishDate - a.content.publishDate)
    }
  }

  async navigateTo(thumbnail) {
    if (this.currentIndex >= 0) {
      this.history.push(this.currentIndex)
    }

    // Smooth transition between content
    await this.transitionContent(thumbnail)
    this.currentIndex = this.thumbnails.indexOf(thumbnail)
  }

  async transitionContent(newThumbnail) {
    const currentContent = document.querySelector('.full-content')
    const newContent = await ContentRenderer.render(newThumbnail)
    
    // Slide out current content
    await anime({
      targets: currentContent,
      translateX: '-100%',
      opacity: 0,
      duration: 300,
      easing: 'easeInQuart'
    }).finished

    // Replace content
    currentContent.innerHTML = newContent
    currentContent.style.transform = 'translateX(100%)'
    currentContent.style.opacity = '0'

    // Slide in new content
    await anime({
      targets: currentContent,
      translateX: '0%',
      opacity: 1,
      duration: 300,
      easing: 'easeOutQuart'
    }).finished
  }
}
```

### Accessibility Features

#### Keyboard Navigation
```javascript
class AccessibilityManager {
  constructor() {
    this.focusOrder = []
    this.currentFocusIndex = -1
    this.isFullScreen = false
    this.setupKeyboardHandlers()
  }

  setupKeyboardHandlers() {
    document.addEventListener('keydown', (event) => {
      if (this.isFullScreen) {
        this.handleFullScreenKeys(event)
      } else {
        this.handleGridKeys(event)
      }
    })
  }

  handleGridKeys(event) {
    switch (event.key) {
      case 'Tab':
        event.preventDefault()
        this.navigateFocus(event.shiftKey ? -1 : 1)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        this.activateCurrentThumbnail()
        break
      case 'ArrowUp':
      case 'ArrowDown':
      case 'ArrowLeft':
      case 'ArrowRight':
        event.preventDefault()
        this.navigateGrid(event.key)
        break
      case 'Home':
        event.preventDefault()
        this.navigateToOrigin()
        break
    }
  }

  handleFullScreenKeys(event) {
    switch (event.key) {
      case 'Escape':
        event.preventDefault()
        this.exitFullScreen()
        break
      case 'ArrowLeft':
        event.preventDefault()
        this.navigateContent('previous')
        break
      case 'ArrowRight':
        event.preventDefault()
        this.navigateContent('next')
        break
    }
  }

  updateFocusOrder(visibleThumbnails) {
    // Sort thumbnails by reading order (left-to-right, top-to-bottom)
    this.focusOrder = Array.from(visibleThumbnails)
      .sort((a, b) => {
        const aTop = a.gridY
        const bTop = b.gridY
        if (Math.abs(aTop - bTop) < 0.5) {
          return a.gridX - b.gridX
        }
        return aTop - bTop
      })
  }

  announceToScreenReader(message) {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', 'polite')
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }
}
```

#### Screen Reader Support
```html
<!-- Semantic HTML structure for screen readers -->
<main role="main" aria-label="Portfolio Grid">
  <section class="bio-cluster" aria-labelledby="bio-heading">
    <h2 id="bio-heading" class="sr-only">About Me</h2>
    
    <article class="bio-card" tabindex="0" 
             aria-label="Bio card: John Doe, Senior Developer"
             role="button"
             aria-describedby="bio-description">
      <div id="bio-description" class="sr-only">
        Click or press Enter to view detailed biography
      </div>
    </article>
    
    <article class="skills-thumbnail" tabindex="0"
             aria-label="Skills and expertise"
             role="button">
    </article>
  </section>
  
  <section class="content-grid" aria-label="Portfolio Content">
    <article class="blog-thumbnail" tabindex="0"
             aria-label="Blog post: How to build accessible web apps"
             role="button"
             aria-describedby="blog-meta-1">
      <div id="blog-meta-1" class="sr-only">
        Published March 15, 2024. 5 minute read. Topics: accessibility, web development.
      </div>
    </article>
  </section>
</main>

<!-- Live region for dynamic announcements -->
<div id="live-region" aria-live="polite" aria-atomic="true" class="sr-only"></div>

<!-- Skip links for keyboard navigation -->
<nav class="skip-links">
  <a href="#bio-card" class="skip-link">Skip to bio</a>
  <a href="#content-grid" class="skip-link">Skip to content</a>
  <a href="#minimap" class="skip-link">Skip to navigation</a>
</nav>
```

## Mini-Map Navigation

### Implementation Architecture

```javascript
class MiniMap {
  constructor(container, grid) {
    this.container = container
    this.grid = grid
    this.canvas = null
    this.ctx = null
    this.scale = 0.02 // 1 grid cell = 2px on minimap
    this.viewportIndicator = null
    
    this.init()
  }

  init() {
    this.canvas = document.createElement('canvas')
    this.canvas.width = 300
    this.canvas.height = 200
    this.canvas.className = 'minimap-canvas'
    
    this.ctx = this.canvas.getContext('2d')
    this.container.appendChild(this.canvas)
    
    this.createViewportIndicator()
    this.bindEvents()
    this.render()
  }

  createViewportIndicator() {
    this.viewportIndicator = document.createElement('div')
    this.viewportIndicator.className = 'minimap-viewport'
    this.container.appendChild(this.viewportIndicator)
  }

  render() {
    this.clearCanvas()
    this.renderThumbnails()
    this.renderBioCluster()
    this.updateViewportIndicator()
  }

  renderThumbnails() {
    this.ctx.fillStyle = 'rgba(100, 100, 100, 0.6)'
    
    for (const thumbnail of this.grid.thumbnails) {
      const x = (thumbnail.gridX * this.scale) + this.canvas.width / 2
      const y = (thumbnail.gridY * this.scale) + this.canvas.height / 2
      const width = thumbnail.spanX * this.scale
      const height = thumbnail.spanY * this.scale
      
      this.ctx.fillRect(x, y, width, height)
    }
  }

  renderBioCluster() {
    this.ctx.fillStyle = 'rgba(66, 165, 245, 0.8)'
    
    // Highlight bio cluster area
    const bioThumbnails = this.grid.thumbnails.filter(t => t.type.startsWith('bio'))
    for (const thumbnail of bioThumbnails) {
      const x = (thumbnail.gridX * this.scale) + this.canvas.width / 2
      const y = (thumbnail.gridY * this.scale) + this.canvas.height / 2
      const width = thumbnail.spanX * this.scale
      const height = thumbnail.spanY * this.scale
      
      this.ctx.fillRect(x, y, width, height)
    }
  }

  updateViewportIndicator() {
    const viewport = this.grid.getViewport()
    const x = (viewport.x * this.scale) + this.canvas.width / 2
    const y = (viewport.y * this.scale) + this.canvas.height / 2
    const width = viewport.width * this.scale
    const height = viewport.height * this.scale
    
    this.viewportIndicator.style.left = `${x}px`
    this.viewportIndicator.style.top = `${y}px`
    this.viewportIndicator.style.width = `${width}px`
    this.viewportIndicator.style.height = `${height}px`
  }

  bindEvents() {
    this.canvas.addEventListener('click', (event) => {
      const rect = this.canvas.getBoundingClientRect()
      const clickX = event.clientX - rect.left
      const clickY = event.clientY - rect.top
      
      // Convert minimap coordinates to grid coordinates
      const gridX = (clickX - this.canvas.width / 2) / this.scale
      const gridY = (clickY - this.canvas.height / 2) / this.scale
      
      // Navigate to clicked position
      this.grid.navigateTo(gridX, gridY)
    })

    // Update minimap when grid moves
    this.grid.addEventListener('scroll', () => {
      this.updateViewportIndicator()
    })

    this.grid.addEventListener('thumbnailsChanged', () => {
      this.render()
    })
  }
}
```

### Minimap Styling
```css
.minimap {
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 300px;
  height: 200px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 100;
  transition: opacity 0.3s ease;
}

.minimap:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.95);
}

.minimap-canvas {
  width: 100%;
  height: 100%;
  cursor: pointer;
  border-radius: 8px;
}

.minimap-viewport {
  position: absolute;
  border: 2px solid #2196F3;
  background: rgba(33, 150, 243, 0.1);
  border-radius: 4px;
  pointer-events: none;
  transition: all 0.1s ease;
}

@media (max-width: 768px) {
  .minimap {
    width: 200px;
    height: 133px;
    bottom: 10px;
    left: 10px;
  }
}
```

## User Interface Elements

### Fixed Controls System

#### Theme Toggle Implementation
```javascript
class ThemeManager {
  constructor() {
    this.currentTheme = this.detectPreferredTheme()
    this.themeKey = 'portfolio-theme'
    this.transitionDuration = 300
    
    this.init()
  }

  detectPreferredTheme() {
    // Check saved preference first
    const saved = localStorage.getItem(this.themeKey)
    if (saved) return saved

    // Check system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  init() {
    this.applyTheme(this.currentTheme, false)
    this.setupSystemThemeListener()
    this.setupToggleButton()
  }

  setupToggleButton() {
    const button = document.querySelector('.theme-toggle')
    button.addEventListener('click', () => {
      this.toggle()
    })

    // Update button state
    this.updateButtonState(button)
  }

  toggle() {
    const newTheme = this.currentTheme === 'light' ? 'dark' : 'light'
    this.applyTheme(newTheme, true)
  }

  applyTheme(theme, animate = true) {
    if (animate) {
      // Add transition class
      document.documentElement.classList.add('theme-transitioning')
      
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning')
      }, this.transitionDuration)
    }

    // Update theme
    document.documentElement.setAttribute('data-theme', theme)
    this.currentTheme = theme
    
    // Save preference
    localStorage.setItem(this.themeKey, theme)
    
    // Update button
    this.updateButtonState(document.querySelector('.theme-toggle'))
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent('themeChanged', { 
      detail: { theme } 
    }))
  }

  updateButtonState(button) {
    const icon = button.querySelector('.theme-icon')
    const label = button.querySelector('.sr-only')
    
    if (this.currentTheme === 'dark') {
      icon.innerHTML = '☀️' // Sun for light mode
      label.textContent = 'Switch to light mode'
      button.setAttribute('aria-label', 'Switch to light mode')
    } else {
      icon.innerHTML = '🌙' // Moon for dark mode
      label.textContent = 'Switch to dark mode'
      button.setAttribute('aria-label', 'Switch to dark mode')
    }
  }

  setupSystemThemeListener() {
    window.matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        // Only auto-switch if user hasn't set a preference
        if (!localStorage.getItem(this.themeKey)) {
          this.applyTheme(e.matches ? 'dark' : 'light', true)
        }
      })
  }
}
```

#### Theme CSS Variables
```css
:root {
  /* Light theme (default) */
  --bg-primary: #ffffff;
  --bg-secondary: #f8f9fa;
  --bg-tertiary: #e9ecef;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-tertiary: #adb5bd;
  --accent-primary: #2196F3;
  --accent-secondary: #1976D2;
  --border-color: #dee2e6;
  --shadow-light: rgba(0, 0, 0, 0.05);
  --shadow-medium: rgba(0, 0, 0, 0.1);
  --shadow-heavy: rgba(0, 0, 0, 0.15);
}

[data-theme="dark"] {
  /* Dark theme overrides */
  --bg-primary: #121212;
  --bg-secondary: #1e1e1e;
  --bg-tertiary: #2d2d2d;
  --text-primary: #ffffff;
  --text-secondary: #b3b3b3;
  --text-tertiary: #8a8a8a;
  --accent-primary: #64B5F6;
  --accent-secondary: #42A5F5;
  --border-color: #404040;
  --shadow-light: rgba(0, 0, 0, 0.2);
  --shadow-medium: rgba(0, 0, 0, 0.3);
  --shadow-heavy: rgba(0, 0, 0, 0.4);
}

/* Smooth transitions during theme changes */
.theme-transitioning,
.theme-transitioning * {
  transition: background-color 300ms ease,
              color 300ms ease,
              border-color 300ms ease,
              box-shadow 300ms ease !important;
}

/* Theme-aware components */
.thumbnail {
  background: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  box-shadow: 0 2px 8px var(--shadow-light);
}

.thumbnail:hover {
  box-shadow: 0 8px 32px var(--shadow-medium);
}
```

#### Authentication Modal
```javascript
class AuthenticationModal {
  constructor() {
    this.modal = null
    this.isOpen = false
    this.authService = new FirebaseAuthService()
    
    this.init()
  }

  init() {
    this.createModal()
    this.setupEventListeners()
  }

  createModal() {
    this.modal = document.createElement('div')
    this.modal.className = 'auth-modal'
    this.modal.innerHTML = `
      <div class="auth-modal__backdrop" tabindex="-1"></div>
      <div class="auth-modal__content" role="dialog" aria-labelledby="auth-title" aria-modal="true">
        <header class="auth-modal__header">
          <h2 id="auth-title" class="auth-modal__title">Sign In</h2>
          <button class="auth-modal__close" aria-label="Close modal">×</button>
        </header>
        
        <div class="auth-modal__body">
          <!-- Email/Password Form -->
          <form class="auth-form auth-form--signin" id="signin-form">
            <div class="form-group">
              <label for="signin-email">Email</label>
              <input type="email" id="signin-email" required autocomplete="email">
            </div>
            <div class="form-group">
              <label for="signin-password">Password</label>
              <input type="password" id="signin-password" required autocomplete="current-password">
            </div>
            <button type="submit" class="btn btn--primary">Sign In</button>
          </form>
          
          <!-- Divider -->
          <div class="auth-divider">
            <span>or</span>
          </div>
          
          <!-- Social Login -->
          <div class="auth-social">
            <button class="btn btn--social btn--google" data-provider="google">
              <svg class="btn__icon"><!-- Google icon --></svg>
              Continue with Google
            </button>
            <button class="btn btn--social btn--github" data-provider="github">
              <svg class="btn__icon"><!-- GitHub icon --></svg>
              Continue with GitHub
            </button>
          </div>
          
          <!-- Register Toggle -->
          <div class="auth-toggle">
            <p>Don't have an account? <button class="link-button" id="show-register">Sign up</button></p>
          </div>
        </div>
      </div>
    `
    
    document.body.appendChild(this.modal)
  }

  setupEventListeners() {
    // Close modal
    this.modal.querySelector('.auth-modal__close').addEventListener('click', () => {
      this.close()
    })
    
    this.modal.querySelector('.auth-modal__backdrop').addEventListener('click', () => {
      this.close()
    })

    // Form submission
    this.modal.querySelector('#signin-form').addEventListener('submit', (e) => {
      this.handleEmailSignIn(e)
    })

    // Social login
    this.modal.querySelectorAll('.btn--social').forEach(btn => {
      btn.addEventListener('click', (e) => {
        this.handleSocialSignIn(e.target.dataset.provider)
      })
    })

    // Toggle between signin/signup
    this.modal.querySelector('#show-register').addEventListener('click', () => {
      this.toggleFormMode()
    })

    // Keyboard handling
    document.addEventListener('keydown', (e) => {
      if (this.isOpen && e.key === 'Escape') {
        this.close()
      }
    })
  }

  open() {
    if (this.isOpen) return
    
    this.isOpen = true
    this.modal.classList.add('auth-modal--open')
    document.body.style.overflow = 'hidden'
    
    // Focus first input
    setTimeout(() => {
      this.modal.querySelector('input').focus()
    }, 100)

    // Announce to screen readers
    this.announceToScreenReader('Authentication modal opened')
  }

  close() {
    if (!this.isOpen) return
    
    this.isOpen = false
    this.modal.classList.remove('auth-modal--open')
    document.body.style.overflow = ''
    
    // Return focus to trigger button
    document.querySelector('.user-toggle').focus()
    
    this.announceToScreenReader('Authentication modal closed')
  }

  async handleEmailSignIn(event) {
    event.preventDefault()
    
    const form = event.target
    const email = form.querySelector('#signin-email').value
    const password = form.querySelector('#signin-password').value
    
    try {
      this.showLoading(true)
      await this.authService.signInWithEmail(email, password)
      this.close()
      this.showSuccessMessage('Successfully signed in!')
    } catch (error) {
      this.showErrorMessage(error.message)
    } finally {
      this.showLoading(false)
    }
  }

  async handleSocialSignIn(provider) {
    try {
      this.showLoading(true)
      await this.authService.signInWithProvider(provider)
      this.close()
      this.showSuccessMessage(`Successfully signed in with ${provider}!`)
    } catch (error) {
      this.showErrorMessage(error.message)
    } finally {
      this.showLoading(false)
    }
  }
}
```

#### Legal Modal
```javascript
class LegalModal {
  constructor() {
    this.modal = null
    this.currentSection = 'terms'
    this.init()
  }

  createModal() {
    this.modal = document.createElement('div')
    this.modal.className = 'legal-modal'
    this.modal.innerHTML = `
      <div class="legal-modal__backdrop"></div>
      <div class="legal-modal__content" role="dialog" aria-labelledby="legal-title">
        <header class="legal-modal__header">
          <nav class="legal-nav">
            <button class="legal-nav__tab active" data-section="terms">Terms & Conditions</button>
            <button class="legal-nav__tab" data-section="privacy">Privacy Policy</button>
            <button class="legal-nav__tab" data-section="cookies">Cookie Policy</button>
          </nav>
          <button class="legal-modal__close" aria-label="Close legal information">×</button>
        </header>
        
        <div class="legal-modal__body">
          <div class="legal-content" id="legal-content">
            <!-- Content loaded dynamically -->
          </div>
        </div>
        
        <footer class="legal-modal__footer">
          <p>Last updated: <time datetime="2024-03-15">March 15, 2024</time></p>
        </footer>
      </div>
    `
    
    document.body.appendChild(this.modal)
  }

  async loadLegalContent(section) {
    const content = document.getElementById('legal-content')
    content.innerHTML = '<div class="loading">Loading...</div>'
    
    try {
      // Load from Firestore or static files
      const legalContent = await this.fetchLegalContent(section)
      content.innerHTML = this.renderLegalContent(legalContent)
    } catch (error) {
      content.innerHTML = '<div class="error">Failed to load content</div>'
    }
  }

  renderLegalContent(content) {
    return `
      <div class="legal-document">
        <h1>${content.title}</h1>
        <div class="legal-text">
          ${content.body}
        </div>
      </div>
    `
  }
}
```

## Database Schema (Firestore)

### Collection Structure

```javascript
// Firestore database structure
const FIRESTORE_SCHEMA = {
  // User profiles
  users: {
    [userId]: {
      email: 'string',
      displayName: 'string',
      photoURL: 'string',
      role: 'admin | editor | viewer',
      createdAt: 'timestamp',
      lastLoginAt: 'timestamp',
      preferences: {
        theme: 'light | dark | auto',
        language: 'string',
        notifications: 'boolean'
      }
    }
  },

  // Bio cluster content
  bioContent: {
    bioCard: {
      name: 'string',
      title: 'string',
      description: 'string',
      profileImage: 'string',
      location: 'string',
      availability: 'available | busy | away',
      lastUpdated: 'timestamp'
    },
    skills: {
      categories: [{
        name: 'string',
        skills: [{
          name: 'string',
          level: 'number', // 1-5
          experience: 'string',
          highlighted: 'boolean'
        }]
      }],
      lastUpdated: 'timestamp'
    },
    experience: {
      positions: [{
        id: 'string',
        company: 'string',
        title: 'string',
        location: 'string',
        startDate: 'timestamp',
        endDate: 'timestamp | null',
        description: 'string',
        achievements: ['string'],
        technologies: ['string'],
        companyLogo: 'string'
      }],
      lastUpdated: 'timestamp'
    },
    // ... other bio sections
  },

  // Blog articles
  blogArticles: {
    [articleId]: {
      title: 'string',
      slug: 'string',
      excerpt: 'string',
      content: 'string', // Markdown
      publishDate: 'timestamp',
      lastModified: 'timestamp',
      author: {
        name: 'string',
        avatar: 'string'
      },
      featuredImage: 'string',
      tags: ['string'],
      category: 'string',
      readTime: 'number', // minutes
      status: 'draft | published | archived',
      seo: {
        metaTitle: 'string',
        metaDescription: 'string',
        keywords: ['string']
      },
      analytics: {
        views: 'number',
        shares: 'number',
        averageReadTime: 'number'
      }
    }
  },

  // Case studies
  caseStudies: {
    [studyId]: {
      title: 'string',
      slug: 'string',
      client: 'string',
      year: 'number',
      category: 'string',
      description: 'string',
      thumbnail: 'string',
      images: ['string'],
      technologies: ['string'],
      challenge: 'string',
      solution: 'string',
      results: [{
        metric: 'string',
        value: 'string',
        improvement: 'string'
      }],
      testimonial: {
        quote: 'string',
        author: 'string',
        position: 'string',
        company: 'string',
        avatar: 'string'
      },
      projectUrl: 'string',
      githubUrl: 'string',
      status: 'draft | published | featured',
      createdAt: 'timestamp',
      lastModified: 'timestamp'
    }
  },

  // Client testimonials
  testimonials: {
    [testimonialId]: {
      quote: 'string',
      author: 'string',
      position: 'string',
      company: 'string',
      avatar: 'string',
      rating: 'number', // 1-5
      projectId: 'string', // Reference to case study
      featured: 'boolean',
      createdAt: 'timestamp',
      approved: 'boolean'
    }
  },

  // Social media embeds
  socialEmbeds: {
    [embedId]: {
      platform: 'twitter | linkedin | instagram | youtube',
      embedCode: 'string',
      url: 'string',
      title: 'string',
      description: 'string',
      thumbnail: 'string',
      publishDate: 'timestamp',
      featured: 'boolean',
      analytics: {
        clicks: 'number',
        impressions: 'number'
      }
    }
  },

  // Grid layout configuration
  gridLayout: {
    bioCluster: {
      thumbnails: {
        [thumbnailType]: {
          gridX: 'number',
          gridY: 'number',
          spanX: 'number',
          spanY: 'number',
          visible: 'boolean'
        }
      }
    },
    contentThumbnails: [{
      id: 'string',
      type: 'string',
      contentId: 'string',
      gridX: 'number',
      gridY: 'number',
      spanX: 'number',
      spanY: 'number',
      priority: 'number'
    }],
    lastGenerated: 'timestamp'
  },

  // Site settings
  siteSettings: {
    general: {
      siteName: 'string',
      siteDescription: 'string',
      contactEmail: 'string',
      socialLinks: {
        twitter: 'string',
        linkedin: 'string',
        github: 'string',
        instagram: 'string'
      }
    },
    seo: {
      defaultTitle: 'string',
      defaultDescription: 'string',
      keywords: ['string'],
      ogImage: 'string'
    },
    analytics: {
      googleAnalyticsId: 'string',
      enableTracking: 'boolean'
    }
  },

  // Legal documents
  legalDocuments: {
    terms: {
      title: 'string',
      content: 'string', // HTML
      lastUpdated: 'timestamp',
      version: 'string'
    },
    privacy: {
      title: 'string',
      content: 'string', // HTML
      lastUpdated: 'timestamp',
      version: 'string'
    },
    cookies: {
      title: 'string',
      content: 'string', // HTML
      lastUpdated: 'timestamp',
      version: 'string'
    }
  }
}
```

### Firestore Security Rules

```javascript
// firestore.rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Public read access to published content
    match /blogArticles/{articleId} {
      allow read: if resource.data.status == 'published';
      allow write: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'editor'];
    }

    match /caseStudies/{studyId} {
      allow read: if resource.data.status in ['published', 'featured'];
      allow write: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'editor'];
    }

    match /testimonials/{testimonialId} {
      allow read: if resource.data.approved == true;
      allow write: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role in ['admin', 'editor'];
    }

    match /bioContent/{document=**} {
      allow read: if true; // Public read access
      allow write: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if request.auth != null && 
                     get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /siteSettings/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }

    match /legalDocuments/{document=**} {
      allow read: if true;
      allow write: if request.auth != null && 
                       get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```

## Admin Panel Architecture

### Admin Dashboard Components

#### Content Management Interface
```javascript
class AdminDashboard {
  constructor() {
    this.currentUser = null
    this.contentTypes = ['blog', 'caseStudy', 'testimonial', 'social']
    this.activeSection = 'overview'
    
    this.init()
  }

  init() {
    this.setupAuthentication()
    this.createInterface()
    this.setupRouting()
  }

  createInterface() {
    const dashboard = document.createElement('div')
    dashboard.className = 'admin-dashboard'
    dashboard.innerHTML = `
      <aside class="admin-sidebar">
        <div class="admin-logo">
          <h1>Portfolio Admin</h1>
        </div>
        
        <nav class="admin-nav">
          <ul>
            <li><a href="#overview" class="nav-link active">📊 Overview</a></li>
            <li><a href="#bio" class="nav-link">👤 Bio Content</a></li>
            <li><a href="#blog" class="nav-link">📝 Blog Posts</a></li>
            <li><a href="#cases" class="nav-link">💼 Case Studies</a></li>
            <li><a href="#testimonials" class="nav-link">💬 Testimonials</a></li>
            <li><a href="#social" class="nav-link">📱 Social Media</a></li>
            <li><a href="#grid" class="nav-link">🎯 Grid Layout</a></li>
            <li><a href="#analytics" class="nav-link">📈 Analytics</a></li>
            <li><a href="#settings" class="nav-link">⚙️ Settings</a></li>
          </ul>
        </nav>
        
        <div class="admin-user">
          <img src="${this.currentUser?.photoURL}" alt="Profile">
          <span>${this.currentUser?.displayName}</span>
          <button class="logout-btn">Logout</button>
        </div>
      </aside>
      
      <main class="admin-main">
        <header class="admin-header">
          <h2 id="section-title">Dashboard Overview</h2>
          <div class="admin-actions">
            <button class="btn btn--primary" id="add-content">+ Add Content</button>
            <button class="btn btn--secondary" id="preview-site">👁️ Preview Site</button>
          </div>
        </header>
        
        <div class="admin-content" id="admin-content">
          <!-- Dynamic content area -->
        </div>
      </main>
    `
    
    document.body.appendChild(dashboard)
  }
}
```

#### Blog Editor Component
```javascript
class BlogEditor {
  constructor() {
    this.editor = null
    this.currentArticle = null
    this.autoSaveInterval = null
    this.markdownProcessor = new MarkdownProcessor()
    
    this.init()
  }

  init() {
    this.createEditor()
    this.setupAutoSave()
    this.setupShortcuts()
  }

  createEditor() {
    const container = document.createElement('div')
    container.className = 'blog-editor'
    container.innerHTML = `
      <div class="editor-toolbar">
        <div class="toolbar-group">
          <button class="toolbar-btn" data-command="bold" title="Bold (Ctrl+B)">
            <strong>B</strong>
          </button>
          <button class="toolbar-btn" data-command="italic" title="Italic (Ctrl+I)">
            <em>I</em>
          </button>
          <button class="toolbar-btn" data-command="code" title="Code (Ctrl+`)">
            &lt;/&gt;
          </button>
        </div>
        
        <div class="toolbar-group">
          <button class="toolbar-btn" data-command="h1" title="Heading 1"># H1</button>
          <button class="toolbar-btn" data-command="h2" title="Heading 2">## H2</button>
          <button class="toolbar-btn" data-command="h3" title="Heading 3">### H3</button>
        </div>
        
        <div class="toolbar-group">
          <button class="toolbar-btn" data-command="link" title="Link (Ctrl+K)">🔗</button>
          <button class="toolbar-btn" data-command="image" title="Image">🖼️</button>
          <button class="toolbar-btn" data-command="table" title="Table">📋</button>
        </div>
        
        <div class="toolbar-group">
          <button class="view-toggle active" data-view="split">Split</button>
          <button class="view-toggle" data-view="write">Write</button>
          <button class="view-toggle" data-view="preview">Preview</button>
        </div>
      </div>
      
      <div class="editor-meta">
        <input type="text" class="title-input" placeholder="Article title...">
        <input type="text" class="slug-input" placeholder="article-slug">
        <textarea class="excerpt-input" placeholder="Brief excerpt..."></textarea>
        
        <div class="meta-fields">
          <div class="field-group">
            <label>Category</label>
            <select class="category-select">
              <option value="">Select category...</option>
              <option value="web-development">Web Development</option>
              <option value="design">Design</option>
              <option value="tutorials">Tutorials</option>
            </select>
          </div>
          
          <div class="field-group">
            <label>Tags</label>
            <input type="text" class="tags-input" placeholder="Add tags...">
            <div class="tags-list"></div>
          </div>
          
          <div class="field-group">
            <label>Featured Image</label>
            <input type="file" class="image-upload" accept="image/*">
            <div class="image-preview"></div>
          </div>
        </div>
      </div>
      
      <div class="editor-container">
        <div class="editor-pane editor-pane--write">
          <textarea class="markdown-editor" placeholder="Start writing your article..."></textarea>
        </div>
        
        <div class="editor-pane editor-pane--preview">
          <div class="preview-content"></div>
        </div>
      </div>
      
      <div class="editor-footer">
        <div class="editor-status">
          <span class="word-count">0 words</span>
          <span class="read-time">0 min read</span>
          <span class="save-status">Saved</span>
        </div>
        
        <div class="editor-actions">
          <button class="btn btn--secondary" id="save-draft">Save Draft</button>
          <button class="btn btn--primary" id="publish">Publish</button>
        </div>
      </div>
    `
    
    return container
  }

  setupAutoSave() {
    this.autoSaveInterval = setInterval(() => {
      if (this.hasUnsavedChanges()) {
        this.saveDraft()
      }
    }, 30000) // Auto-save every 30 seconds
  }

  async saveDraft() {
    const article = this.getArticleData()
    article.status = 'draft'
    article.lastModified = new Date()
    
    try {
      await this.saveToFirestore(article)
      this.updateSaveStatus('Saved')
    } catch (error) {
      this.updateSaveStatus('Error saving')
      console.error('Failed to save draft:', error)
    }
  }

  async publish() {
    const article = this.getArticleData()
    
    // Validate required fields
    if (!article.title || !article.content) {
      this.showError('Title and content are required')
      return
    }
    
    article.status = 'published'
    article.publishDate = new Date()
    article.lastModified = new Date()
    
    try {
      await this.saveToFirestore(article)
      
      // Regenerate grid layout with new content
      await this.regenerateGrid()
      
      this.showSuccess('Article published successfully!')
      
      // Redirect to articles list
      window.location.hash = '#blog'
      
    } catch (error) {
      this.showError('Failed to publish article')
      console.error('Publishing error:', error)
    }
  }

  getArticleData() {
    return {
      id: this.currentArticle?.id || this.generateId(),
      title: document.querySelector('.title-input').value,
      slug: document.querySelector('.slug-input').value || this.generateSlug(),
      excerpt: document.querySelector('.excerpt-input').value,
      content: document.querySelector('.markdown-editor').value,
      category: document.querySelector('.category-select').value,
      tags: this.getTags(),
      featuredImage: this.getFeaturedImage(),
      readTime: this.calculateReadTime(),
      author: {
        name: this.currentUser.displayName,
        avatar: this.currentUser.photoURL
      }
    }
  }

  calculateReadTime() {
    const content = document.querySelector('.markdown-editor').value
    const wordsPerMinute = 200
    const wordCount = content.split(/\s+/).length
    return Math.ceil(wordCount / wordsPerMinute)
  }
}
```

#### Grid Layout Manager
```javascript
class GridLayoutManager {
  constructor() {
    this.grid = null
    this.selectedThumbnail = null
    this.isDragging = false
    this.gridData = null
    
    this.init()
  }

  init() {
    this.loadGridData()
    this.createInterface()
    this.setupInteractions()
  }

  createInterface() {
    const container = document.createElement('div')
    container.className = 'grid-manager'
    container.innerHTML = `
      <div class="grid-manager__toolbar">
        <div class="toolbar-group">
          <button class="btn btn--primary" id="add-thumbnail">+ Add Thumbnail</button>
          <button class="btn btn--secondary" id="auto-layout">⚡ Auto Layout</button>
          <button class="btn btn--secondary" id="reset-grid">🔄 Reset Grid</button>
        </div>
        
        <div class="toolbar-group">
          <label>
            <input type="checkbox" id="show-grid"> Show Grid Lines
          </label>
          <label>
            <input type="checkbox" id="snap-to-grid" checked> Snap to Grid
          </label>
        </div>
        
        <div class="toolbar-group">
          <button class="btn btn--success" id="save-layout">💾 Save Layout</button>
        </div>
      </div>
      
      <div class="grid-manager__content">
        <div class="grid-canvas" id="grid-canvas">
          <!-- Grid thumbnails rendered here -->
        </div>
        
        <div class="thumbnail-properties" id="thumbnail-properties">
          <h3>Thumbnail Properties</h3>
          <div class="property-group">
            <label>Position X</label>
            <input type="number" id="pos-x">
          </div>
          <div class="property-group">
            <label>Position Y</label>
            <input type="number" id="pos-y">
          </div>
          <div class="property-group">
            <label>Width (cells)</label>
            <input type="number" id="span-x" min="1" max="4">
          </div>
          <div class="property-group">
            <label>Height (cells)</label>
            <input type="number" id="span-y" min="1" max="4">
          </div>
          <div class="property-group">
            <label>Content Type</label>
            <select id="content-type">
              <option value="blog">Blog Article</option>
              <option value="caseStudy">Case Study</option>
              <option value="testimonial">Testimonial</option>
              <option value="social">Social Media</option>
            </select>
          </div>
          <div class="property-group">
            <label>Content ID</label>
            <select id="content-id">
              <!-- Populated based on content type -->
            </select>
          </div>
        </div>
      </div>
    `
    
    return container
  }

  setupInteractions() {
    const canvas = document.getElementById('grid-canvas')
    
    // Drag and drop for thumbnails
    canvas.addEventListener('mousedown', (e) => {
      const thumbnail = e.target.closest('.grid-thumbnail')
      if (thumbnail) {
        this.startDrag(thumbnail, e)
      }
    })

    document.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        this.updateDrag(e)
      }
    })

    document.addEventListener('mouseup', () => {
      if (this.isDragging) {
        this.endDrag()
      }
    })

    // Auto-layout button
    document.getElementById('auto-layout').addEventListener('click', () => {
      this.generateAutoLayout()
    })

    // Save layout button
    document.getElementById('save-layout').addEventListener('click', () => {
      this.saveLayout()
    })
  }

  async generateAutoLayout() {
    try {
      // Get all content from Firestore
      const blogArticles = await this.fetchCollection('blogArticles')
      const caseStudies = await this.fetchCollection('caseStudies')
      const testimonials = await this.fetchCollection('testimonials')
      const socialEmbeds = await this.fetchCollection('socialEmbeds')

      // Create thumbnail objects
      const thumbnails = [
        ...blogArticles.map(article => this.createThumbnailConfig('blog', article)),
        ...caseStudies.map(study => this.createThumbnailConfig('caseStudy', study)),
        ...testimonials.map(testimonial => this.createThumbnailConfig('testimonial', testimonial)),
        ...socialEmbeds.map(embed => this.createThumbnailConfig('social', embed))
      ]

      // Use distribution algorithm
      const distributor = new ThumbnailDistribution(BIO_CLUSTER_LAYOUT, thumbnails)
      distributor.distributeContent()

      // Update grid display
      this.renderGrid(thumbnails)
      
      this.showSuccess('Auto-layout generated successfully!')
      
    } catch (error) {
      this.showError('Failed to generate auto-layout')
      console.error('Auto-layout error:', error)
    }
  }

  createThumbnailConfig(type, content) {
    // Determine thumbnail size based on content type and properties
    let spanX = 1, spanY = 1
    
    switch (type) {
      case 'blog':
        spanX = content.featured ? 2 : 1
        spanY = content.content.length > 1000 ? 2 : 1
        break
      case 'caseStudy':
        spanX = 2
        spanY = 2
        break
      case 'testimonial':
        spanX = Math.random() > 0.5 ? 2 : 1
        spanY = 1
        break
      case 'social':
        spanX = 1
        spanY = content.platform === 'youtube' ? 2 : 1
        break
    }

    return {
      id: `${type}-${content.id}`,
      type,
      contentId: content.id,
      spanX,
      spanY,
      priority: this.calculatePriority(type, content)
    }
  }

  calculatePriority(type, content) {
    let priority = 50 // Base priority
    
    // Boost priority for featured content
    if (content.featured) priority += 20
    
    // Boost priority for recent content
    const daysSincePublish = (Date.now() - content.publishDate) / (1000 * 60 * 60 * 24)
    if (daysSincePublish < 30) priority += 15
    
    // Boost priority based on engagement
    if (content.analytics?.views > 1000) priority += 10
    
    // Type-specific priority adjustments
    switch (type) {
      case 'caseStudy': priority += 10; break
      case 'blog': priority += 5; break
      case 'testimonial': priority += 3; break
      case 'social': priority += 1; break
    }
    
    return priority
  }

  async saveLayout() {
    const layoutData = this.getLayoutData()
    
    try {
      await db.collection('gridLayout').doc('current').set({
        bioCluster: BIO_CLUSTER_LAYOUT,
        contentThumbnails: layoutData,
        lastGenerated: new Date(),
        generatedBy: this.currentUser.uid
      })
      
      this.showSuccess('Layout saved successfully!')
      
    } catch (error) {
      this.showError('Failed to save layout')
      console.error('Save layout error:', error)
    }
  }
}
```

## Performance Optimization

### Loading Strategies

#### Progressive Enhancement
```javascript
class ProgressiveLoader {
  constructor() {
    this.loadingQueue = new PriorityQueue()
    this.loadedResources = new Set()
    this.observer = null
    this.preloadEnabled = true
    
    this.init()
  }

  init() {
    this.setupIntersectionObserver()
    this.preloadCriticalResources()
    this.setupPrefetching()
  }

  setupIntersectionObserver() {
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadThumbnail(entry.target)
        }
      })
    }, {
      root: null,
      rootMargin: '200px', // Load 200px before entering viewport
      threshold: 0.1
    })
  }

  preloadCriticalResources() {
    // Load bio cluster first
    const bioThumbnails = document.querySelectorAll('.bio-thumbnail')
    bioThumbnails.forEach(thumbnail => {
      this.loadingQueue.enqueue(thumbnail, 100) // Highest priority
    })

    // Load visible thumbnails
    const visibleThumbnails = this.getVisibleThumbnails()
    visibleThumbnails.forEach(thumbnail => {
      this.loadingQueue.enqueue(thumbnail, 80)
    })

    this.processLoadingQueue()
  }

  async loadThumbnail(thumbnailElement) {
    const thumbnailId = thumbnailElement.dataset.thumbnailId
    
    if (this.loadedResources.has(thumbnailId)) {
      return
    }

    try {
      // Show skeleton loading state
      this.showSkeletonLoader(thumbnailElement)
      
      // Load thumbnail data
      const thumbnailData = await this.fetchThumbnailData(thumbnailId)
      
      // Load associated media
      await this.loadThumbnailMedia(thumbnailData)
      
      // Render thumbnail content
      await this.renderThumbnailContent(thumbnailElement, thumbnailData)
      
      // Mark as loaded
      this.loadedResources.add(thumbnailId)
      
      // Remove skeleton loader
      this.hideSkeletonLoader(thumbnailElement)
      
    } catch (error) {
      console.error(`Failed to load thumbnail ${thumbnailId}:`, error)
      this.showErrorState(thumbnailElement)
    }
  }

  async loadThumbnailMedia(thumbnailData) {
    const mediaPromises = []
    
    // Load images
    if (thumbnailData.images) {
      thumbnailData.images.forEach(imageUrl => {
        mediaPromises.push(this.preloadImage(imageUrl))
      })
    }

    // Load videos (poster frames only)
    if (thumbnailData.videos) {
      thumbnailData.videos.forEach(video => {
        if (video.poster) {
          mediaPromises.push(this.preloadImage(video.poster))
        }
      })
    }

    await Promise.allSettled(mediaPromises)
  }

  preloadImage(url) {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = resolve
      img.onerror = reject
      img.src = url
    })
  }

  showSkeletonLoader(element) {
    element.classList.add('loading')
    element.innerHTML = `
      <div class="skeleton-loader">
        <div class="skeleton-header"></div>
        <div class="skeleton-content">
          <div class="skeleton-line"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    `
  }
}
```

#### Image Optimization
```javascript
class ImageOptimizer {
  constructor() {
    this.supportedFormats = this.detectSupportedFormats()
    this.lazyLoadingObserver = null
    this.imageCache = new Map()
    
    this.init()
  }

  detectSupportedFormats() {
    const formats = {
      webp: false,
      avif: false,
      jpegXL: false
    }

    // Test WebP support
    const webpCanvas = document.createElement('canvas')
    formats.webp = webpCanvas.toDataURL('image/webp').indexOf('data:image/webp') === 0

    // Test AVIF support (modern browsers)
    if (window.CSS && CSS.supports) {
      formats.avif = CSS.supports('(background-image: url("data:image/avif;base64,"))')
    }

    return formats
  }

  generateResponsiveImageUrl(baseUrl, width, height = null, quality = 85) {
    // Use a service like Cloudinary or implement server-side resizing
    const params = new URLSearchParams({
      w: width,
      q: quality,
      f: this.getBestFormat(),
      dpr: window.devicePixelRatio || 1
    })

    if (height) {
      params.set('h', height)
      params.set('c', 'fill') // Crop to exact dimensions
    }

    return `${baseUrl}?${params.toString()}`
  }

  getBestFormat() {
    if (this.supportedFormats.avif) return 'avif'
    if (this.supportedFormats.webp) return 'webp'
    return 'auto' // Let service decide
  }

  createResponsiveImage(src, alt, sizes = '100vw') {
    const img = document.createElement('img')
    
    // Generate srcset for different screen sizes
    const srcset = [
      `${this.generateResponsiveImageUrl(src, 400)} 400w`,
      `${this.generateResponsiveImageUrl(src, 800)} 800w`,
      `${this.generateResponsiveImageUrl(src, 1200)} 1200w`,
      `${this.generateResponsiveImageUrl(src, 1600)} 1600w`
    ].join(', ')

    img.srcset = srcset
    img.src = this.generateResponsiveImageUrl(src, 800) // Fallback
    img.sizes = sizes
    img.alt = alt
    img.loading = 'lazy'
    img.decoding = 'async'

    return img
  }

  async preloadCriticalImages() {
    // Preload bio card profile image and other critical visuals
    const criticalImages = [
      document.querySelector('.bio-card img')?.src,
      document.querySelector('.hero-image')?.src
    ].filter(Boolean)

    const preloadPromises = criticalImages.map(src => {
      const link = document.createElement('link')
      link.rel = 'preload'
      link.as = 'image'
      link.href = this.generateResponsiveImageUrl(src, 400)
      document.head.appendChild(link)

      return this.preloadImage(src)
    })

    await Promise.allSettled(preloadPromises)
  }
}
```

#### Code Splitting & Bundle Optimization
```javascript
// vite.config.js
export default {
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunks
          'vendor-core': ['svelte', '@sveltejs/kit'],
          'vendor-ui': ['anime.js'],
          'vendor-firebase': ['firebase/app', 'firebase/firestore', 'firebase/auth'],
          
          // Feature chunks
          'admin': ['./src/lib/admin/index.js'],
          'blog': ['./src/lib/blog/index.js'],
          'grid': ['./src/lib/grid/index.js']
        }
      }
    },
    target: 'es2022',
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  optimizeDeps: {
    include: ['anime.js', 'firebase/app']
  }
}

// Dynamic imports for admin panel
async function loadAdminPanel() {
  const { AdminDashboard } = await import('./admin/dashboard.js')
  const { BlogEditor } = await import('./admin/blog-editor.js')
  const { GridManager } = await import('./admin/grid-manager.js')
  
  return { AdminDashboard, BlogEditor, GridManager }
}

// Dynamic imports for content renderers
const contentRenderers = {
  async blog() {
    const { BlogContentRenderer } = await import('./content/blog-renderer.js')
    return BlogContentRenderer
  },
  
  async caseStudy() {
    const { CaseStudyRenderer } = await import('./content/case-study-renderer.js')
    return CaseStudyRenderer
  }
}
```

### Memory Management

#### Cleanup Strategies
```javascript
class MemoryManager {
  constructor() {
    this.activeComponents = new WeakMap()
    this.observers = new Set()
    this.intervals = new Set()
    this.eventListeners = new Map()
    
    this.init()
  }

  init() {
    this.setupMemoryMonitoring()
    this.setupCleanupOnUnload()
    this.setupPeriodicCleanup()
  }

  registerComponent(component, cleanupFn) {
    this.activeComponents.set(component, cleanupFn)
  }

  registerObserver(observer) {
    this.observers.add(observer)
  }

  registerInterval(intervalId) {
    this.intervals.add(intervalId)
  }

  registerEventListener(element, event, handler) {
    const key = `${element}:${event}`
    if (!this.eventListeners.has(key)) {
      this.eventListeners.set(key, new Set())
    }
    this.eventListeners.get(key).add(handler)
  }

  cleanup() {
    // Disconnect all observers
    this.observers.forEach(observer => {
      if (observer.disconnect) {
        observer.disconnect()
      }
    })
    this.observers.clear()

    // Clear all intervals
    this.intervals.forEach(intervalId => {
      clearInterval(intervalId)
    })
    this.intervals.clear()

    // Remove all event listeners
    this.eventListeners.forEach((handlers, key) => {
      const [element, event] = key.split(':')
      handlers.forEach(handler => {
        element.removeEventListener(event, handler)
      })
    })
    this.eventListeners.clear()

    // Cleanup components
    this.activeComponents.forEach((cleanupFn, component) => {
      try {
        cleanupFn()
      } catch (error) {
        console.error('Error during component cleanup:', error)
      }
    })

    // Force garbage collection if available (development only)
    if (window.gc && process.env.NODE_ENV === 'development') {
      window.gc()
    }
  }

  setupMemoryMonitoring() {
    if ('memory' in performance) {
      const checkMemory = () => {
        const memory = performance.memory
        const memoryUsage = memory.usedJSHeapSize / memory.jsHeapSizeLimit
        
        if (memoryUsage > 0.8) {
          console.warn('High memory usage detected:', memoryUsage)
          this.performEmergencyCleanup()
        }
      }

      this.registerInterval(setInterval(checkMemory, 30000)) // Check every 30s
    }
  }

  setupPeriodicCleanup() {
    // Clean up unused thumbnails every 2 minutes
    this.registerInterval(setInterval(() => {
      this.cleanupInvisibleThumbnails()
    }, 120000))
  }

  cleanupInvisibleThumbnails() {
    const invisibleThumbnails = document.querySelectorAll('.thumbnail:not(.visible)')
    
    invisibleThumbnails.forEach(thumbnail => {
      // Remove heavy content like videos and large images
      const videos = thumbnail.querySelectorAll('video')
      videos.forEach(video => {
        video.pause()
        video.removeAttribute('src')
        video.load()
      })

      const largeImages = thumbnail.querySelectorAll('img[data-large]')
      largeImages.forEach(img => {
        img.src = img.dataset.placeholder || ''
      })
    })
  }

  performEmergencyCleanup() {
    // Remove all off-screen content
    this.cleanupInvisibleThumbnails()
    
    // Clear image cache
    if (window.imageCache) {
      window.imageCache.clear()
    }
    
    // Clear animation cache
    if (window.animeCache) {
      window.animeCache.clear()
    }

    console.log('Emergency cleanup performed')
  }
}
```

## SEO & Social Media Optimization

### Meta Tag Management
```javascript
class SEOManager {
  constructor() {
    this.defaultMeta = {
      title: 'Portfolio | Your Name',
      description: 'Explore my creative portfolio showcasing innovative projects and professional work.',
      keywords: ['portfolio', 'web development', 'design', 'creative'],
      author: 'Your Name',
      ogImage: '/images/og-default.jpg',
      twitterCard: 'summary_large_image'
    }
    
    this.init()
  }

  updatePageMeta(content) {
    const meta = { ...this.defaultMeta, ...content }
    
    // Update title
    document.title = meta.title
    
    // Update meta tags
    this.updateMetaTag('description', meta.description)
    this.updateMetaTag('keywords', meta.keywords.join(', '))
    this.updateMetaTag('author', meta.author)
    
    // Update Open Graph tags
    this.updateMetaProperty('og:title', meta.title)
    this.updateMetaProperty('og:description', meta.description)
    this.updateMetaProperty('og:image', meta.ogImage)
    this.updateMetaProperty('og:url', window.location.href)
    this.updateMetaProperty('og:type', meta.type || 'website')
    
    // Update Twitter Card tags
    this.updateMetaName('twitter:card', meta.twitterCard)
    this.updateMetaName('twitter:title', meta.title)
    this.updateMetaName('twitter:description', meta.description)
    this.updateMetaName('twitter:image', meta.ogImage)
    
    // Update canonical URL
    this.updateCanonicalUrl(window.location.href)
  }

  updateMetaTag(name, content) {
    let meta = document.querySelector(`meta[name="${name}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = name
      document.head.appendChild(meta)
    }
    meta.content = content
  }

  updateMetaProperty(property, content) {
    let meta = document.querySelector(`meta[property="${property}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      meta.setAttribute('property', property)
      document.head.appendChild(meta)
    }
    meta.content = content
  }

  updateMetaName(name, content) {
    let meta = document.querySelector(`meta[name="${name}"]`)
    if (!meta) {
      meta = document.createElement('meta')
      meta.name = name
      document.head.appendChild(meta)
    }
    meta.content = content
  }

  updateCanonicalUrl(url) {
    let canonical = document.querySelector('link[rel="canonical"]')
    if (!canonical) {
      canonical = document.createElement('link')
      canonical.rel = 'canonical'
      document.head.appendChild(canonical)
    }
    canonical.href = url
  }

  generateStructuredData(content) {
    const structuredData = {
      '@context': 'https://schema.org',
      '@type': 'Person',
      'name': content.name,
      'jobTitle': content.title,
      'description': content.description,
      'url': window.location.origin,
      'image': content.profileImage,
      'sameAs': content.socialLinks || [],
      'worksFor': {
        '@type': 'Organization',
        'name': content.company
      }
    }

    // Add to page
    let script = document.querySelector('script[type="application/ld+json"]')
    if (!script) {
      script = document.createElement('script')
      script.type = 'application/ld+json'
      document.head.appendChild(script)
    }
    script.textContent = JSON.stringify(structuredData)
  }
}
```

### Analytics Implementation
```javascript
class AnalyticsManager {
  constructor() {
    this.events = []
    this.sessionStart = Date.now()
    this.pageViews = new Map()
    this.userInteractions = new Map()
    
    this.init()
  }

  init() {
    this.setupGoogleAnalytics()
    this.setupCustomTracking()
    this.trackPageView()
  }

  setupGoogleAnalytics() {
    // Google Analytics 4
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    function gtag() { dataLayer.push(arguments) }
    window.gtag = gtag

    gtag('js', new Date())
    gtag('config', GA_MEASUREMENT_ID, {
      page_title: document.title,
      page_location: window.location.href
    })
  }

  setupCustomTracking() {
    // Track thumbnail interactions
    document.addEventListener('click', (event) => {
      const thumbnail = event.target.closest('.thumbnail')
      if (thumbnail) {
        this.trackThumbnailClick(thumbnail)
      }
    })

    // Track scroll depth
    this.setupScrollTracking()
    
    // Track time on page
    this.setupTimeTracking()
    
    // Track user engagement
    this.setupEngagementTracking()
  }

  trackThumbnailClick(thumbnail) {
    const thumbnailData = {
      thumbnail_id: thumbnail.dataset.thumbnailId,
      thumbnail_type: thumbnail.dataset.thumbnailType,
      position_x: thumbnail.dataset.gridX,
      position_y: thumbnail.dataset.gridY,
      timestamp: Date.now()
    }

    // Send to Google Analytics
    gtag('event', 'thumbnail_click', {
      custom_map: { dimension1: thumbnailData.thumbnail_type },
      ...thumbnailData
    })

    // Store for custom analytics
    this.trackCustomEvent('thumbnail_click', thumbnailData)
  }

  setupScrollTracking() {
    let maxScroll = 0
    const trackScroll = throttle(() => {
      const scrollPercent = Math.round(
        (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100
      )
      
      if (scrollPercent > maxScroll) {
        maxScroll = scrollPercent
        
        // Track scroll milestones
        if ([25, 50, 75, 90].includes(scrollPercent)) {
          gtag('event', 'scroll', {
            scroll_depth: scrollPercent
          })
        }
      }
    }, 250)

    window.addEventListener('scroll', trackScroll)
  }

  setupTimeTracking() {
    const intervals = [30, 60, 120, 300] // seconds
    
    intervals.forEach(interval => {
      setTimeout(() => {
        gtag('event', 'timing_complete', {
          name: 'page_engagement',
          value: interval
        })
      }, interval * 1000)
    })
  }

  trackCustomEvent(eventName, data) {
    this.events.push({
      event: eventName,
      timestamp: Date.now(),
      data
    })

    // Send to custom analytics endpoint
    this.sendToCustomAnalytics(eventName, data)
  }

  async sendToCustomAnalytics(eventName, data) {
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: eventName,
          data,
          session_id: this.getSessionId(),
          user_agent: navigator.userAgent,
          timestamp: Date.now()
        })
      })
    } catch (error) {
      console.error('Analytics error:', error)
    }
  }

  getSessionId() {
    let sessionId = sessionStorage.getItem('analytics_session_id')
    if (!sessionId) {
      sessionId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('analytics_session_id', sessionId)
    }
    return sessionId
  }
}

// Utility function for throttling
function throttle(func, limit) {
  let inThrottle
  return function() {
    const args = arguments
    const context = this
    if (!inThrottle) {
      func.apply(context, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, limit)
    }
  }
}
```

## Accessibility Implementation

### WCAG 2.1 AAA Compliance
```javascript
class AccessibilityEnforcer {
  constructor() {
    this.focusVisible = new FocusVisiblePolyfill()
    this.colorContrast = new ColorContrastChecker()
    this.announcements = new AnnouncementQueue()
    
    this.init()
  }

  init() {
    this.enforceKeyboardNavigation()
    this.enforceColorContrast()
    this.enforceMotionPreferences()
    this.enforceTextScaling()
    this.setupAriaLiveRegions()
  }

  enforceKeyboardNavigation() {
    // Ensure all interactive elements are keyboard accessible
    const interactiveElements = document.querySelectorAll(
      'button, [role="button"], a, input, select, textarea, [tabindex]'
    )

    interactiveElements.forEach(element => {
      if (!element.hasAttribute('tabindex') && !this.isNaturallyFocusable(element)) {
        element.tabIndex = 0
      }

      // Add keyboard event handlers if missing
      if (!element.onkeydown) {
        element.addEventListener('keydown', this.handleKeyboardActivation)
      }
    })
  }

  handleKeyboardActivation(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      event.target.click()
    }
  }

  enforceColorContrast() {
    // Check and fix color contrast issues
    const textElements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, button')
    
    textElements.forEach(element => {
      const styles = getComputedStyle(element)
      const textColor = styles.color
      const backgroundColor = this.getBackgroundColor(element)
      
      const contrast = this.colorContrast.getContrast(textColor, backgroundColor)
      const requiredContrast = this.getRequiredContrast(element)
      
      if (contrast < requiredContrast) {
        this.fixContrastIssue(element, textColor, backgroundColor, requiredContrast)
      }
    })
  }

  getRequiredContrast(element) {
    const fontSize = parseFloat(getComputedStyle(element).fontSize)
    const fontWeight = getComputedStyle(element).fontWeight
    
    // WCAG AAA requirements
    if (fontSize >= 18 || (fontSize >= 14 && parseInt(fontWeight) >= 700)) {
      return 7 // Large text AAA
    }
    return 7 // Normal text AAA
  }

  enforceMotionPreferences() {
    // Respect prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    
    if (prefersReducedMotion) {
      // Disable animations
      document.documentElement.style.setProperty('--animation-duration', '0.01ms')
      document.documentElement.style.setProperty('--transition-duration', '0.01ms')
      
      // Override anime.js animations
      if (window.anime) {
        const originalAnime = window.anime
        window.anime = function(config) {
          return originalAnime({
            ...config,
            duration: 1,
            delay: 0
          })
        }
      }
    }
  }

  enforceTextScaling() {
    // Support 200% text scaling
    const observer = new ResizeObserver(entries => {
      entries.forEach(entry => {
        const element = entry.target
        if (element.scrollWidth > element.clientWidth) {
          element.style.overflow = 'auto'
        }
      })
    })

    document.querySelectorAll('.thumbnail, .content-area').forEach(el => {
      observer.observe(el)
    })
  }

  setupAriaLiveRegions() {
    // Create polite announcement region
    const politeRegion = document.createElement('div')
    politeRegion.id = 'aria-live-polite'
    politeRegion.setAttribute('aria-live', 'polite')
    politeRegion.setAttribute('aria-atomic', 'true')
    politeRegion.className = 'sr-only'
    document.body.appendChild(politeRegion)

    // Create assertive announcement region
    const assertiveRegion = document.createElement('div')
    assertiveRegion.id = 'aria-live-assertive'
    assertiveRegion.setAttribute('aria-live', 'assertive')
    assertiveRegion.setAttribute('aria-atomic', 'true')
    assertiveRegion.className = 'sr-only'
    document.body.appendChild(assertiveRegion)
  }

  announce(message, priority = 'polite') {
    const region = document.getElementById(`aria-live-${priority}`)
    region.textContent = message
    
    // Clear after announcement
    setTimeout(() => {
      region.textContent = ''
    }, 1000)
  }
}
```

### Screen Reader Optimization
```css
/* Screen reader only styles */
.sr-only {
  position: absolute !important;
  width: 1px !important;
  height: 1px !important;
  padding: 0 !important;
  margin: -1px !important;
  overflow: hidden !important;
  clip: rect(0, 0, 0, 0) !important;
  white-space: nowrap !important;
  border: 0 !important;
}

/* Focus indicators */
.focus-visible {
  outline: 3px solid var(--accent-primary) !important;
  outline-offset: 2px !important;
  box-shadow: 0 0 0 5px rgba(33, 150, 243, 0.3) !important;
}

/* High contrast mode support */
@media (prefers-contrast: high) {
  :root {
    --text-primary: #000000;
    --bg-primary: #ffffff;
    --accent-primary: #0000ff;
    --border-color: #000000;
  }
  
  .thumbnail {
    border: 2px solid var(--border-color) !important;
  }
  
  .thumbnail:hover {
    background: #ffff00 !important;
    color: #000000 !important;
  }
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Support for 200% text scaling */
@media (min-resolution: 2dppx) and (max-width: 1200px) {
  .thumbnail {
    min-height: 200px;
    padding: 20px;
  }
  
  .thumbnail__title {
    font-size: 1.5rem;
    line-height: 1.4;
  }
}
```

## Testing Strategy

### Unit Testing
```javascript
// tests/thumbnail.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { Thumbnail } from '../src/lib/grid/thumbnail.js'

describe('Thumbnail', () => {
  let thumbnail

  beforeEach(() => {
    thumbnail = new Thumbnail({
      id: 'test-thumbnail',
      type: 'blog',
      gridX: 0,
      gridY: 0,
      spanX: 1,
      spanY: 1,
      content: {
        title: 'Test Article',
        excerpt: 'Test excerpt'
      }
    })
  })

  it('should initialize with correct properties', () => {
    expect(thumbnail.id).toBe('test-thumbnail')
    expect(thumbnail.type).toBe('blog')
    expect(thumbnail.gridX).toBe(0)
    expect(thumbnail.gridY).toBe(0)
  })

  it('should calculate priority based on distance from origin', () => {
    const farThumbnail = new Thumbnail({
      id: 'far-thumbnail',
      type: 'blog',
      gridX: 10,
      gridY: 10,
      spanX: 1,
      spanY: 1,
      content: {}
    })

    expect(thumbnail.priority).toBeGreaterThan(farThumbnail.priority)
  })

  it('should handle loading states correctly', async () => {
    expect(thumbnail.isLoaded).toBe(false)
    
    await thumbnail.load()
    
    expect(thumbnail.isLoaded).toBe(true)
  })
})
```

### Integration Testing
```javascript
// tests/grid-integration.test.js
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, fireEvent, waitFor } from '@testing-library/svelte'
import GridComponent from '../src/lib/components/Grid.svelte'

describe('Grid Integration', () => {
  let component

  beforeEach(() => {
    component = render(GridComponent, {
      thumbnails: [
        {
          id: 'bio-card',
          type: 'bio',
          gridX: 0,
          gridY: 0,
          spanX: 2,
          spanY: 3
        }
      ]
    })
  })

  it('should render bio card at center position', () => {
    const bioCard = component.getByTestId('bio-card')
    expect(bioCard).toBeInTheDocument()
    
    const styles = getComputedStyle(bioCard)
    expect(styles.transform).toContain('translate(0px, 0px)')
  })

  it('should handle touch interactions', async () => {
    const grid = component.getByTestId('grid-container')
    
    await fireEvent.touchStart(grid, {
      touches: [{ clientX: 100, clientY: 100 }]
    })
    
    await fireEvent.touchMove(grid, {
      touches: [{ clientX: 50, clientY: 50 }]
    })
    
    await fireEvent.touchEnd(grid)
    
    await waitFor(() => {
      // Grid should have moved
      expect(grid.style.transform).toContain('translate')
    })
  })

  it('should expand thumbnail on click', async () => {
    const thumbnail = component.getByTestId('bio-card')
    
    await fireEvent.click(thumbnail)
    
    await waitFor(() => {
      const overlay = document.querySelector('.thumbnail-overlay')
      expect(overlay).toBeInTheDocument()
    })
  })
})
```

### Accessibility Testing
```javascript
// tests/accessibility.test.js
import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/svelte'
import { axe, toHaveNoViolations } from 'jest-axe'
import GridComponent from '../src/lib/components/Grid.svelte'

expect.extend(toHaveNoViolations)

describe('Accessibility Tests', () => {
  it('should have no accessibility violations', async () => {
    const { container } = render(GridComponent, {
      thumbnails: mockThumbnails
    })
    
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })

  it('should support keyboard navigation', async () => {
    const { getByTestId } = render(GridComponent, {
      thumbnails: mockThumbnails
    })
    
    const firstThumbnail = getByTestId('bio-card')
    firstThumbnail.focus()
    
    expect(document.activeElement).toBe(firstThumbnail)
    
    // Test Tab navigation
    await fireEvent.keyDown(firstThumbnail, { key: 'Tab' })
    expect(document.activeElement).not.toBe(firstThumbnail)
  })

  it('should announce changes to screen readers', async () => {
    const { getByTestId } = render(GridComponent)
    
    const liveRegion = document.getElementById('aria-live-polite')
    expect(liveRegion).toBeInTheDocument()
    
    const thumbnail = getByTestId('bio-card')
    await fireEvent.click(thumbnail)
    
    expect(liveRegion.textContent).toContain('expanded')
  })
})
```

### Performance Testing
```javascript
// tests/performance.test.js
import { describe, it, expect } from 'vitest'
import { render, waitFor } from '@testing-library/svelte'
import GridComponent from '../src/lib/components/Grid.svelte'

describe('Performance Tests', () => {
  it('should render within performance budget', async () => {
    const startTime = performance.now()
    
    render(GridComponent, {
      thumbnails: generateManyThumbnails(100) // 100 thumbnails
    })
    
    await waitFor(() => {
      const endTime = performance.now()
      const renderTime = endTime - startTime
      
      // Should render in under 100ms
      expect(renderTime).toBeLessThan(100)
    })
  })

  it('should handle scrolling at 60fps', async () => {
    const { container } = render(GridComponent, {
      thumbnails: generateManyThumbnails(200)
    })
    
    const grid = container.querySelector('.grid-container')
    const frames = []
    
    // Simulate rapid scrolling
    for (let i = 0; i < 60; i++) {
      const frameStart = performance.now()
      
      await fireEvent.scroll(grid, {
        target: { scrollTop: i * 10 }
      })
      
      const frameEnd = performance.now()
      frames.push(frameEnd - frameStart)
    }
    
    const averageFrameTime = frames.reduce((a, b) => a + b) / frames.length
    
    // Should maintain 60fps (16.67ms per frame)
    expect(averageFrameTime).toBeLessThan(16.67)
  })

  it('should not cause memory leaks', async () => {
    const initialMemory = performance.memory?.usedJSHeapSize || 0
    
    // Render and destroy multiple instances
    for (let i = 0; i < 10; i++) {
      const { unmount } = render(GridComponent, {
        thumbnails: generateManyThumbnails(50)
      })
      
      unmount()
    }
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc()
    }
    
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const finalMemory = performance.memory?.usedJSHeapSize || 0
    const memoryIncrease = finalMemory - initialMemory
    
    // Memory increase should be minimal (less than 10MB)
    expect(memoryIncrease).toBeLessThan(10 * 1024 * 1024)
  })
})
```

## Deployment Configuration

### Firebase Hosting Setup
```json
// firebase.json
{
  "hosting": {
    "public": "build",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|woff2|woff|ttf|eot)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "**/*.@(jpg|jpeg|png|webp|avif|gif|svg)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=2592000"
          }
        ]
      },
      {
        "source": "/",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=3600"
          },
          {
            "key": "X-Content-Type-Options",
            "value": "nosniff"
          },
          {
            "key": "X-Frame-Options",
            "value": "DENY"
          },
          {
            "key": "X-XSS-Protection",
            "value": "1; mode=block"
          },
          {
            "key": "Referrer-Policy",
            "value": "strict-origin-when-cross-origin"
          }
        ]
      }
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### Build Optimization
```javascript
// svelte.config.js
import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/kit/vite'
import { mdsvex } from 'mdsvex'

const config = {
  extensions: ['.svelte', '.md'],
  
  preprocess: [
    vitePreprocess(),
    mdsvex({
      extensions: ['.md'],
      highlight: {
        highlighter: async (code, lang = 'text') => {
          const { getHighlighter } = await import('shiki')
          const highlighter = await getHighlighter({
            themes: ['github-dark', 'github-light'],
            langs: ['javascript', 'typescript', 'css', 'html', 'svelte']
          })
          
          const html = highlighter.codeToHtml(code, {
            lang,
            themes: {
              light: 'github-light',
              dark: 'github-dark'
            }
          })
          
          return `{@html \`${html}\`}`
        }
      }
    })
  ],

  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: 'index.html',
      precompress: true,
      strict: true
    }),
    
    prerender: {
      handleHttpError: 'warn',
      handleMissingId: 'warn'
    },
    
    serviceWorker: {
      register: true,
      files: (filepath) => !/\.DS_Store/.test(filepath)
    }
  }
}

export default config
```

### CI/CD Pipeline
```yaml
# .github/workflows/deploy.yml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run linting
      run: npm run lint
    
    - name: Run type checking
      run: npm run check
    
    - name: Run unit tests
      run: npm run test:unit
    
    - name: Run integration tests
      run: npm run test:integration
    
    - name: Run accessibility tests
      run: npm run test:a11y
    
    - name: Run performance tests
      run: npm run test:performance

  build:
    needs: test
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
      env:
        NODE_ENV: production
        VITE_FIREBASE_API_KEY: ${{ secrets.FIREBASE_API_KEY }}
        VITE_FIREBASE_AUTH_DOMAIN: ${{ secrets.FIREBASE_AUTH_DOMAIN }}
        VITE_FIREBASE_PROJECT_ID: ${{ secrets.FIREBASE_PROJECT_ID }}
    
    - name: Upload build artifacts
      uses: actions/upload-artifact@v3
      with:
        name: build-files
        path: build/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Download build artifacts
      uses: actions/download-artifact@v3
      with:
        name: build-files
        path: build/
    
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: '${{ secrets.GITHUB_TOKEN }}'
        firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
        projectId: '${{ secrets.FIREBASE_PROJECT_ID }}'
        channelId: live
```

## Security Implementation

### Content Security Policy
```javascript
// app.html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://apis.google.com https://www.googletagmanager.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https: blob:;
  media-src 'self' https:;
  connect-src 'self' https://*.firebaseio.com https://*.googleapis.com;
  frame-src 'self' https://www.youtube.com https://player.vimeo.com;
  worker-src 'self';
  manifest-src 'self';
">
```

### Input Sanitization
```javascript
class SecurityManager {
  constructor() {
    this.allowedTags = ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6']
    this.allowedAttributes = ['href', 'title', 'alt', 'src']
  }

  sanitizeHTML(html) {
    const div = document.createElement('div')
    div.innerHTML = html

    const walker = document.createTreeWalker(
      div,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node) => {
          if (this.allowedTags.includes(node.tagName.toLowerCase())) {
            return NodeFilter.FILTER_ACCEPT
          }
          return NodeFilter.FILTER_REJECT
        }
      }
    )

    const elementsToRemove = []
    let node
    
    while (node = walker.nextNode()) {
      // Remove disallowed attributes
      Array.from(node.attributes).forEach(attr => {
        if (!this.allowedAttributes.includes(attr.name)) {
          node.removeAttribute(attr.name)
        }
      })

      // Sanitize href attributes
      if (node.hasAttribute('href')) {
        const href = node.getAttribute('href')
        if (!this.isValidURL(href)) {
          node.removeAttribute('href')
        }
      }
    }

    return div.innerHTML
  }

  isValidURL(url) {
    try {
      const parsed = new URL(url)
      return ['http:', 'https:', 'mailto:'].includes(parsed.protocol)
    } catch {
      return false
    }
  }

  sanitizeText(text) {
    return text
      .replace(/[<>]/g, '')
      .replace(/javascript:/gi, '')
      .replace(/data:/gi, '')
      .trim()
  }

  validateFileUpload(file) {
    const allowedTypes = [
      'image/jpeg',
      'image/png',
      'image/webp',
      'image/gif',
      'application/pdf'
    ]

    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      throw new Error('File type not allowed')
    }

    if (file.size > maxSize) {
      throw new Error('File too large')
    }

    return true
  }
}
```

## Monitoring & Error Handling

### Error Tracking
```javascript
class ErrorTracker {
  constructor() {
    this.errors = []
    this.maxErrors = 100
    this.sentryEnabled = false
    
    this.init()
  }

  init() {
    this.setupGlobalErrorHandlers()
    this.setupUnhandledRejectionHandler()
    this.setupSentry()
  }

  setupGlobalErrorHandlers() {
    window.addEventListener('error', (event) => {
      this.logError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
        type: 'javascript'
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      this.logError({
        message: event.reason?.message || 'Unhandled Promise Rejection',
        error: event.reason,
        type: 'promise'
      })
    })
  }

  logError(errorInfo) {
    const errorData = {
      ...errorInfo,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
      sessionId: this.getSessionId()
    }

    this.errors.push(errorData)
    
    // Keep only recent errors
    if (this.errors.length > this.maxErrors) {
      this.errors.shift()
    }

    // Send to monitoring service
    this.sendToMonitoring(errorData)
    
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error tracked:', errorData)
    }
  }

  async sendToMonitoring(errorData) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(errorData)
      })
    } catch (error) {
      console.error('Failed to send error to monitoring:', error)
    }
  }

  setupSentry() {
    if (window.Sentry) {
      this.sentryEnabled = true
      window.Sentry.configureScope(scope => {
        scope.setTag('component', 'portfolio-grid')
        scope.setContext('device', {
          viewport: `${window.innerWidth}x${window.innerHeight}`,
          devicePixelRatio: window.devicePixelRatio
        })
      })
    }
  }
}
```

### Performance Monitoring
```javascript
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map()
    this.observer = null
    
    this.init()
  }

  init() {
    this.setupPerformanceObserver()
    this.trackCoreWebVitals()
    this.trackCustomMetrics()
  }

  setupPerformanceObserver() {
    if ('PerformanceObserver' in window) {
      this.observer = new PerformanceObserver((list) => {
        list.getEntries().forEach(entry => {
          this.processPerformanceEntry(entry)
        })
      })

      this.observer.observe({ entryTypes: ['navigation', 'paint', 'measure', 'largest-contentful-paint'] })
    }
  }

  trackCoreWebVitals() {
    // First Contentful Paint
    this.measureFCP()
    
    // Largest Contentful Paint
    this.measureLCP()
    
    // Cumulative Layout Shift
    this.measureCLS()
    
    // First Input Delay
    this.measureFID()
  }

  measureFCP() {
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('FCP', entry.startTime)
        }
      })
    }).observe({ entryTypes: ['paint'] })
  }

  measureLCP() {
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        this.recordMetric('LCP', entry.startTime)
      })
    }).observe({ entryTypes: ['largest-contentful-paint'] })
  }

  measureCLS() {
    let clsValue = 0
    
    new PerformanceObserver((list) => {
      list.getEntries().forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
          this.recordMetric('CLS', clsValue)
        }
      })
    }).observe({ entryTypes: ['layout-shift'] })
  }

  trackCustomMetrics() {
    // Time to interactive
    this.measureTimeToInteractive()
    
    // Grid render time
    this.measureGridRenderTime()
    
    // Thumbnail load time
    this.measureThumbnailLoadTime()
  }

  recordMetric(name, value) {
    this.metrics.set(name, {
      value,
      timestamp: Date.now()
    })

    // Send to analytics
    if (window.gtag) {
      gtag('event', 'timing_complete', {
        name: name.toLowerCase(),
        value: Math.round(value)
      })
    }
  }

  getMetrics() {
    return Object.fromEntries(this.metrics)
  }
}
```

## Success Criteria & KPIs

### Performance Benchmarks
- **Lighthouse Score**: 95+ across all metrics
- **First Contentful Paint**: < 1.2 seconds
- **Largest Contentful Paint**: < 2.5 seconds
- **Cumulative Layout Shift**: < 0.1
- **First Input Delay**: < 100ms
- **Time to Interactive**: < 3.5 seconds

### User Experience Metrics
- **Bounce Rate**: < 30%
- **Average Session Duration**: > 2 minutes
- **Pages per Session**: > 3
- **Mobile Performance**: Equivalent to desktop
- **Accessibility Score**: WCAG 2.1 AAA compliance

### Technical Requirements
- **Browser Support**: 95%+ of global browser usage
- **Device Compatibility**: iOS 14+, Android 10+
- **Network Resilience**: Works on 3G connections
- **Offline Functionality**: Core content viewable offline
- **Search Engine Optimization**: Rich snippets and structured data

### Business Objectives
- **Lead Generation**: Contact form conversions > 5%
- **Portfolio Engagement**: Case study completion rate > 60%
- **Social Sharing**: Share rate > 2% of visitors
- **Return Visitor Rate**: > 25%
- **Brand Recognition**: Memorable and unique experience

This comprehensive specification provides a detailed roadmap for building a cutting-edge infinite bento grid portfolio that prioritizes performance, accessibility, and user experience while maintaining flexibility for future enhancements and content management.