import { Thumbnail, type ThumbnailConfig, type ThumbnailContent } from '../Thumbnail';

export interface Skill {
  name: string;
  level: number; // 1-5 proficiency level
  category: string;
  years?: number;
}

export interface SkillsContent extends ThumbnailContent {
  skills: Skill[];
  categories: string[];
}

export class SkillsThumbnail extends Thumbnail {
  declare content: SkillsContent;

  constructor(config: ThumbnailConfig) {
    super({
      ...config,
      type: 'skills',
      spanX: 2,
      spanY: 2,
    });
  }

  render(): string {
    const { skills, categories } = this.content;
    const skillsByCategory = this.groupSkillsByCategory(skills, categories);
    
    return `
      <div class="skills-thumbnail">
        <div class="skills-thumbnail__header">
          <h3 class="skills-thumbnail__title">Skills & Expertise</h3>
        </div>
        <div class="skills-thumbnail__content">
          ${categories.slice(0, 3).map(category => this.renderSkillCategory(category, skillsByCategory[category] || [])).join('')}
        </div>
        ${categories.length > 3 ? `<div class="skills-thumbnail__more">+${categories.length - 3} more categories</div>` : ''}
      </div>
    `;
  }
  private groupSkillsByCategory(skills: Skill[], categories: string[]): Record<string, Skill[]> {
    const grouped: Record<string, Skill[]> = {};
    
    categories.forEach(category => {
      grouped[category] = skills.filter(skill => skill.category === category);
    });
    
    return grouped;
  }

  private renderSkillCategory(category: string, skills: Skill[]): string {
    const topSkills = skills.slice(0, 4);
    
    return `
      <div class="skill-category">
        <h4 class="skill-category__name">${category}</h4>
        <div class="skill-category__skills">
          ${topSkills.map(skill => this.renderSkill(skill)).join('')}
        </div>
      </div>
    `;
  }

  private renderSkill(skill: Skill): string {
    return `
      <div class="skill" title="${skill.name} - Level ${skill.level}/5${skill.years ? ` (${skill.years} years)` : ''}">
        <span class="skill__name">${skill.name}</span>
        <div class="skill__level">
          ${Array.from({ length: 5 }, (_, i) => 
            `<div class="skill__dot ${i < skill.level ? 'active' : ''}"></div>`
          ).join('')}
        </div>
      </div>
    `;
  }
}