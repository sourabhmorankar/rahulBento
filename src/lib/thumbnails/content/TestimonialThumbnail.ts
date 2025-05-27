import { Thumbnail, type ThumbnailConfig, type ThumbnailContent } from '../Thumbnail';

export interface TestimonialContent extends ThumbnailContent {
  quote: string;
  author: string;
  company: string;
  position: string;
  avatar?: string;
  rating?: number;
  date: string;
  verified: boolean;
  projectContext?: string;
}

export class TestimonialThumbnail extends Thumbnail {
  declare content: TestimonialContent;

  constructor(config: ThumbnailConfig) {
    super({
      ...config,
      type: 'testimonial',
      spanX: 1,
      spanY: 2,
    });
  }

  render(): string {
    const { quote, author, company, position, avatar, rating, verified } = this.content;
    
    return `
      <div class="testimonial-thumbnail">
        <div class="testimonial-thumbnail__content">
          <blockquote class="testimonial-thumbnail__quote">
            "${this.truncateText(quote, 150)}"
          </blockquote>
          ${rating ? `
            <div class="testimonial-thumbnail__rating">
              ${Array.from({ length: 5 }, (_, i) => 
                `<span class="star ${i < rating ? 'filled' : ''}">★</span>`
              ).join('')}
            </div>
          ` : ''}
        </div>
        <div class="testimonial-thumbnail__author">
          ${avatar ? `<img class="testimonial-thumbnail__avatar" src="${avatar}" alt="${author}" loading="lazy">` : ''}
          <div class="testimonial-thumbnail__info">
            <h4 class="testimonial-thumbnail__name">${author}</h4>
            <p class="testimonial-thumbnail__title">${position} at ${company}</p>
            ${verified ? '<span class="testimonial-thumbnail__verified">✓ Verified</span>' : ''}
          </div>
        </div>
      </div>
    `;
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substr(0, maxLength).trim() + '...';
  }

  async loadAssets(): Promise<void> {
    if (this.content.avatar) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load testimonial avatar'));
        img.src = this.content.avatar!;
      });
    }
  }
}