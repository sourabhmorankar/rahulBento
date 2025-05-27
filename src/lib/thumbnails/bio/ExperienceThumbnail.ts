import { Thumbnail, type ThumbnailConfig, type ThumbnailContent } from '../Thumbnail';

export interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate?: string;
  description: string;
  technologies: string[];
  logo?: string;
  type: 'fulltime' | 'contract' | 'freelance' | 'internship';
}

export interface ExperienceContent extends ThumbnailContent {
  experiences: Experience[];
  totalYears: number;
}

export class ExperienceThumbnail extends Thumbnail {
  declare content: ExperienceContent;

  constructor(config: ThumbnailConfig) {
    super({
      ...config,
      type: 'experience',
      spanX: 2,
      spanY: 3,
    });
  }

  render(): string {
    const { experiences, totalYears } = this.content;
    const recentExperiences = experiences.slice(0, 3);
    
    return `
      <div class="experience-thumbnail">
        <div class="experience-thumbnail__header">
          <h3 class="experience-thumbnail__title">Experience</h3>
          <span class="experience-thumbnail__years">${totalYears}+ years</span>
        </div>
        <div class="experience-thumbnail__timeline">
          ${recentExperiences.map(exp => this.renderExperience(exp)).join('')}
        </div>
        ${experiences.length > 3 ? `<div class="experience-thumbnail__more">+${experiences.length - 3} more positions</div>` : ''}
      </div>
    `;
  }
  private renderExperience(experience: Experience): string {
    const { company, position, startDate, endDate, logo, type } = experience;
    const duration = this.calculateDuration(startDate, endDate);
    
    return `
      <div class="experience-item">
        <div class="experience-item__header">
          ${logo ? `<img class="experience-item__logo" src="${logo}" alt="${company} logo" loading="lazy">` : ''}
          <div class="experience-item__info">
            <h4 class="experience-item__position">${position}</h4>
            <p class="experience-item__company">${company}</p>
            <span class="experience-item__type">${this.formatExperienceType(type)}</span>
          </div>
        </div>
        <div class="experience-item__meta">
          <span class="experience-item__duration">${duration}</span>
        </div>
      </div>
    `;
  }

  private calculateDuration(startDate: string, endDate?: string): string {
    const start = new Date(startDate);
    const end = endDate ? new Date(endDate) : new Date();
    
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
    
    if (diffMonths < 12) {
      return `${diffMonths} month${diffMonths > 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(diffMonths / 12);
      const months = diffMonths % 12;
      return `${years} year${years > 1 ? 's' : ''}${months > 0 ? ` ${months} month${months > 1 ? 's' : ''}` : ''}`;
    }
  }

  private formatExperienceType(type: string): string {
    switch (type) {
      case 'fulltime': return 'Full-time';
      case 'contract': return 'Contract';
      case 'freelance': return 'Freelance';
      case 'internship': return 'Internship';
      default: return type;
    }
  }
}