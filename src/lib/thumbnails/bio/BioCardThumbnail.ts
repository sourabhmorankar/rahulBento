import { Thumbnail, type ThumbnailConfig, type ThumbnailContent } from '../Thumbnail';

export interface BioContent extends ThumbnailContent {
  name: string;
  title: string;
  description: string;
  profileImage: string;
  location: string;
  availability: 'available' | 'busy' | 'away';
  lastUpdated: number;
  email?: string;
  website?: string;
}

export class BioCardThumbnail extends Thumbnail {
  declare content: BioContent;

  constructor(config: ThumbnailConfig) {
    super({
      ...config,
      type: 'bio',
      spanX: 2,
      spanY: 3,
    });
  }

  render(): string {
    const { name, title, description, profileImage, location, availability, lastUpdated } = this.content;
    
    return `
      <div class="bio-card corporate-id">
        <div class="bio-card__header">
          <img class="bio-card__profile" src="${profileImage}" alt="${name}" loading="lazy">
          <div class="bio-card__status ${availability}" title="${this.getAvailabilityText(availability)}"></div>
        </div>
        <div class="bio-card__content">
          <h1 class="bio-card__name">${name}</h1>
          <h2 class="bio-card__title">${title}</h2>
          <p class="bio-card__description">${description}</p>
          <div class="bio-card__meta">
            <span class="bio-card__location">${location}</span>
            <span class="bio-card__updated">Updated ${this.formatRelativeTime(lastUpdated)}</span>
          </div>
        </div>
      </div>
    `;
  }
  private getAvailabilityText(availability: string): string {
    switch (availability) {
      case 'available':
        return 'Available for work';
      case 'busy':
        return 'Currently busy';
      case 'away':
        return 'Away';
      default:
        return 'Status unknown';
    }
  }

  async loadContent(): Promise<void> {
    if (!this.content.profileImage) {
      this.content.profileImage = '/default-avatar.png';
    }
  }

  async loadAssets(): Promise<void> {
    if (this.content.profileImage && this.content.profileImage !== '/default-avatar.png') {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('Failed to load profile image'));
        img.src = this.content.profileImage;
      });
    }
  }
}