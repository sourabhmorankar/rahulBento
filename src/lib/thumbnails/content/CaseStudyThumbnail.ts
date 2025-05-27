import { Thumbnail, type ThumbnailConfig, type ThumbnailContent } from '../Thumbnail';

export interface CaseStudyContent extends ThumbnailContent {
  title: string;
  client: string;
  year: number;
  category: string;
  thumbnail: string;
  results: string[];
  technologies: string[];
  duration: string;
  role: string;
  description: string;
}

export class CaseStudyThumbnail extends Thumbnail {
  declare content: CaseStudyContent;

  constructor(config: ThumbnailConfig) {
    super({
      ...config,
      type: 'caseStudy',
      spanX: 2,
      spanY: 2,
    });
  }

  render(): string {
    const { title, client, year, category, thumbnail, results, role } = this.content;
    
    return `
      <div class="case-study-thumbnail">
        <div class="case-study-thumbnail__image" style="background-image: url(${thumbnail})">
          <div class="case-study-thumbnail__overlay">
            <div class="case-study-thumbnail__meta">
              <span class="case-study-thumbnail__client">${client}</span>
              <span class="case-study-thumbnail__year">${year}</span>
              <span class="case-study-thumbnail__category">${category}</span>
            </div>
            <h3 class="case-study-thumbnail__title">${title}</h3>
            <p class="case-study-thumbnail__role">${role}</p>
            <div class="case-study-thumbnail__results">
              ${results.slice(0, 2).map(result => `<div class="result">${result}</div>`).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }
  async loadAssets(): Promise<void> {
    if (this.content.thumbnail) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load case study thumbnail'));
        img.src = this.content.thumbnail;
      });
    }
  }

  calculatePriority(): number {
    const basePriority = super.calculatePriority();
    const currentYear = new Date().getFullYear();
    const recencyBonus = Math.max(0, 5 - (currentYear - this.content.year));
    
    return basePriority + recencyBonus;
  }
}