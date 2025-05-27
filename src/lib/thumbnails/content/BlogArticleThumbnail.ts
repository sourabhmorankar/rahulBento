import { Thumbnail, type ThumbnailConfig, type ThumbnailContent } from '../Thumbnail';

export interface BlogArticleContent extends ThumbnailContent {
  title: string;
  excerpt: string;
  publishDate: string;
  readTime: number;
  featuredImage?: string;
  tags: string[];
  author: string;
  category: string;
  isPublished: boolean;
}

export class BlogArticleThumbnail extends Thumbnail {
  declare content: BlogArticleContent;

  constructor(config: ThumbnailConfig) {
    super({
      ...config,
      type: 'blogArticle',
      spanX: Math.random() > 0.7 ? 2 : 1,
      spanY: Math.random() > 0.5 ? 2 : 1,
    });
  }

  render(): string {
    const { title, excerpt, publishDate, readTime, featuredImage, tags, category } = this.content;
    
    return `
      <article class="blog-thumbnail">
        ${featuredImage ? `
          <div class="blog-thumbnail__image-container">
            <img class="blog-thumbnail__image" src="${featuredImage}" alt="${title}" loading="lazy">
          </div>
        ` : ''}
        <div class="blog-thumbnail__content">
          <div class="blog-thumbnail__meta">
            <span class="blog-thumbnail__category">${category}</span>
            <time class="blog-thumbnail__date" datetime="${publishDate}">${this.formatDate(publishDate)}</time>
            <span class="blog-thumbnail__read-time">${readTime} min read</span>
          </div>
          <h3 class="blog-thumbnail__title">${title}</h3>
          <p class="blog-thumbnail__excerpt">${this.truncateText(excerpt, 120)}</p>
          <div class="blog-thumbnail__tags">
            ${tags.slice(0, 3).map(tag => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
      </article>
    `;
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
  }

  async loadAssets(): Promise<void> {
    if (this.content.featuredImage) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load featured image'));
        img.src = this.content.featuredImage!;
      });
    }
  }

  calculatePriority(): number {
    const basePriority = super.calculatePriority();
    const publishDate = new Date(this.content.publishDate);
    const daysSincePublished = (Date.now() - publishDate.getTime()) / (1000 * 60 * 60 * 24);
    
    const recencyBonus = Math.max(0, 10 - (daysSincePublished / 7));
    return basePriority + recencyBonus;
  }
}