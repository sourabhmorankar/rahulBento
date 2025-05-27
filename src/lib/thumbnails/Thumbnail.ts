export interface ThumbnailMetadata {
  [key: string]: any;
}

export interface ThumbnailContent {
  [key: string]: any;
}

export interface ThumbnailConfig {
  id: string;
  type: string;
  gridX: number;
  gridY: number;
  spanX?: number;
  spanY?: number;
  content: ThumbnailContent;
  metadata?: ThumbnailMetadata;
}

export abstract class Thumbnail {
  public readonly id: string;
  public readonly type: string;
  public gridX: number;
  public gridY: number;
  public spanX: number;
  public spanY: number;
  public content: ThumbnailContent;
  public metadata: ThumbnailMetadata;
  public isVisible: boolean = false;
  public isLoaded: boolean = false;
  public priority: number;
  public element: HTMLElement | null = null;

  constructor(config: ThumbnailConfig) {
    this.id = config.id;
    this.type = config.type;
    this.gridX = config.gridX;
    this.gridY = config.gridY;
    this.spanX = config.spanX || 1;
    this.spanY = config.spanY || 1;
    this.content = config.content;
    this.metadata = config.metadata || {};
    this.priority = this.calculatePriority();
  }

  calculatePriority(): number {
    const distance = Math.sqrt(this.gridX ** 2 + this.gridY ** 2);
    return Math.max(0, 100 - distance);
  }
  async load(): Promise<void> {
    if (this.isLoaded) return;
    
    try {
      await this.loadContent();
      await this.loadAssets();
      this.isLoaded = true;
    } catch (error) {
      console.error(`Failed to load thumbnail ${this.id}:`, error);
      this.showErrorState();
    }
  }

  abstract render(): string;

  async loadContent(): Promise<void> {
    // Override in subclasses for specific content loading
  }

  async loadAssets(): Promise<void> {
    // Override in subclasses for asset loading (images, videos, etc.)
  }

  showErrorState(): void {
    if (this.element) {
      this.element.classList.add('thumbnail-error');
      this.element.innerHTML = this.renderErrorState();
    }
  }

  renderErrorState(): string {
    return `
      <div class="thumbnail-error-content">
        <div class="error-icon">⚠️</div>
        <p>Failed to load content</p>
        <button onclick="this.closest('.thumbnail').dispatchEvent(new CustomEvent('retry'))">
          Retry
        </button>
      </div>
    `;
  }

  formatDate(timestamp: number | string | Date): string {
    const date = new Date(timestamp);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(date);
  }
  formatRelativeTime(timestamp: number | string | Date): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const weeks = Math.floor(days / 7);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    if (years > 0) return `${years} year${years > 1 ? 's' : ''} ago`;
    if (months > 0) return `${months} month${months > 1 ? 's' : ''} ago`;
    if (weeks > 0) return `${weeks} week${weeks > 1 ? 's' : ''} ago`;
    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  setPosition(gridX: number, gridY: number): void {
    this.gridX = gridX;
    this.gridY = gridY;
    this.priority = this.calculatePriority();
  }

  setSize(spanX: number, spanY: number): void {
    this.spanX = spanX;
    this.spanY = spanY;
  }
  updateContent(content: Partial<ThumbnailContent>): void {
    this.content = { ...this.content, ...content };
    if (this.element && this.isLoaded) {
      this.element.innerHTML = this.render();
    }
  }

  setVisibility(visible: boolean): void {
    this.isVisible = visible;
    if (this.element) {
      this.element.style.display = visible ? 'block' : 'none';
    }
  }

  bindElement(element: HTMLElement): void {
    this.element = element;
    this.element.setAttribute('data-thumbnail-id', this.id);
    this.element.setAttribute('data-thumbnail-type', this.type);
    this.element.classList.add('thumbnail', `thumbnail-${this.type}`);
  }

  unbindElement(): void {
    this.element = null;
  }

  destroy(): void {
    this.unbindElement();
    this.isVisible = false;
    this.isLoaded = false;
  }
}