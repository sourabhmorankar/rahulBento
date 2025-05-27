import { Thumbnail, type ThumbnailConfig, type ThumbnailContent } from '../Thumbnail';

export interface Milestone {
  id: string;
  title: string;
  date: string;
  description: string;
  icon?: string;
  type: 'education' | 'career' | 'achievement' | 'personal';
}

export interface JourneyContent extends ThumbnailContent {
  milestones: Milestone[];
  title: string;
}

export class JourneyThumbnail extends Thumbnail {
  declare content: JourneyContent;

  constructor(config: ThumbnailConfig) {
    super({
      ...config,
      type: 'journey',
      spanX: 2,
      spanY: 2,
    });
  }

  render(): string {
    const { milestones, title } = this.content;
    const recentMilestones = this.sortMilestonesByDate(milestones).slice(0, 3);
    
    return `
      <div class="journey-thumbnail">
        <div class="journey-thumbnail__header">
          <h3 class="journey-thumbnail__title">${title}</h3>
        </div>
        <div class="journey-thumbnail__timeline">
          ${recentMilestones.map(milestone => this.renderMilestone(milestone)).join('')}
        </div>
        ${milestones.length > 3 ? `<div class="journey-thumbnail__more">+${milestones.length - 3} more milestones</div>` : ''}
      </div>
    `;
  }
  private renderMilestone(milestone: Milestone): string {
    const { title, date, description, icon, type } = milestone;
    
    return `
      <div class="milestone milestone--${type}">
        <div class="milestone__marker">
          ${icon ? `<span class="milestone__icon">${icon}</span>` : `<div class="milestone__dot"></div>`}
        </div>
        <div class="milestone__content">
          <div class="milestone__header">
            <h4 class="milestone__title">${title}</h4>
            <span class="milestone__date">${this.formatDate(date)}</span>
          </div>
          <p class="milestone__description">${description}</p>
        </div>
      </div>
    `;
  }

  private sortMilestonesByDate(milestones: Milestone[]): Milestone[] {
    return [...milestones].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  private getMilestoneIcon(type: string): string {
    switch (type) {
      case 'education': return '🎓';
      case 'career': return '💼';
      case 'achievement': return '🏆';
      case 'personal': return '🌟';
      default: return '📌';
    }
  }
}