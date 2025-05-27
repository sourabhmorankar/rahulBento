export { Thumbnail, type ThumbnailConfig, type ThumbnailContent, type ThumbnailMetadata } from './Thumbnail';
export { ThumbnailFactory, type ThumbnailConstructor } from './ThumbnailFactory';
export { ThumbnailDistribution, type BioClusterConfig } from './ThumbnailDistribution';

export { BioCardThumbnail, type BioContent } from './bio/BioCardThumbnail';
export { SkillsThumbnail, type SkillsContent, type Skill } from './bio/SkillsThumbnail';
export { ExperienceThumbnail, type ExperienceContent, type Experience } from './bio/ExperienceThumbnail';
export { PhotoBoothThumbnail, type PhotoBoothContent, type Photo } from './bio/PhotoBoothThumbnail';
export { JourneyThumbnail, type JourneyContent, type Milestone } from './bio/JourneyThumbnail';

export { BlogArticleThumbnail, type BlogArticleContent } from './content/BlogArticleThumbnail';
export { CaseStudyThumbnail, type CaseStudyContent } from './content/CaseStudyThumbnail';
export { TestimonialThumbnail, type TestimonialContent } from './content/TestimonialThumbnail';

import { ThumbnailFactory } from './ThumbnailFactory';
import { type BioClusterConfig } from './ThumbnailDistribution';
import { BioCardThumbnail } from './bio/BioCardThumbnail';
import { SkillsThumbnail } from './bio/SkillsThumbnail';
import { ExperienceThumbnail } from './bio/ExperienceThumbnail';
import { PhotoBoothThumbnail } from './bio/PhotoBoothThumbnail';
import { JourneyThumbnail } from './bio/JourneyThumbnail';
import { BlogArticleThumbnail } from './content/BlogArticleThumbnail';
import { CaseStudyThumbnail } from './content/CaseStudyThumbnail';
import { TestimonialThumbnail } from './content/TestimonialThumbnail';

export const BIO_CLUSTER_LAYOUT: BioClusterConfig = {
  margin: 0.5, // Half grid margin around the entire cluster
  thumbnails: {
    'bio-card': { x: 0, y: 0, spanX: 2, spanY: 3 },
    'skills': { x: -2.2, y: -1.8, spanX: 2, spanY: 2 }, // Tighter positioning
    'experience': { x: 2.2, y: -0.8, spanX: 2, spanY: 3 }, // Closer to bio card
    'photoBooth': { x: 2.2, y: 2.4, spanX: 2, spanY: 2 }, // Reduced gap
    'journey': { x: -2.2, y: 0.4, spanX: 2, spanY: 2 }, // Tighter spacing
  }
};

export function registerThumbnailTypes(): void {
  ThumbnailFactory.registerThumbnailType('bio', BioCardThumbnail);
  ThumbnailFactory.registerThumbnailType('skills', SkillsThumbnail);
  ThumbnailFactory.registerThumbnailType('experience', ExperienceThumbnail);
  ThumbnailFactory.registerThumbnailType('photoBooth', PhotoBoothThumbnail);
  ThumbnailFactory.registerThumbnailType('journey', JourneyThumbnail);
  ThumbnailFactory.registerThumbnailType('blogArticle', BlogArticleThumbnail);
  ThumbnailFactory.registerThumbnailType('caseStudy', CaseStudyThumbnail);
  ThumbnailFactory.registerThumbnailType('testimonial', TestimonialThumbnail);
}