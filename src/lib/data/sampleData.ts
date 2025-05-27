import type { 
  BioContent,
  SkillsContent,
  ExperienceContent,
  PhotoBoothContent,
  JourneyContent,
  BlogArticleContent,
  CaseStudyContent,
  TestimonialContent,
  ThumbnailConfig
} from '../thumbnails';

export const sampleBioData: BioContent = {
  name: "John Doe",
  title: "Senior Full-Stack Developer",
  description: "Passionate developer with 8+ years of experience building scalable web applications using modern technologies.",
  profileImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
  location: "San Francisco, CA",
  availability: "available",
  lastUpdated: Date.now() - (2 * 24 * 60 * 60 * 1000),
  email: "john@example.com",
  website: "https://johndoe.dev"
};

export const sampleSkillsData: SkillsContent = {
  skills: [
    { name: "React", level: 5, category: "Frontend", years: 6 },
    { name: "TypeScript", level: 5, category: "Frontend", years: 5 },
    { name: "Svelte", level: 4, category: "Frontend", years: 2 },
    { name: "Node.js", level: 5, category: "Backend", years: 7 },
    { name: "Python", level: 4, category: "Backend", years: 4 },
    { name: "PostgreSQL", level: 4, category: "Database", years: 6 },
    { name: "MongoDB", level: 3, category: "Database", years: 3 },
    { name: "AWS", level: 4, category: "DevOps", years: 5 },
    { name: "Docker", level: 4, category: "DevOps", years: 4 },
  ],
  categories: ["Frontend", "Backend", "Database", "DevOps"]
};
export const sampleExperienceData: ExperienceContent = {
  totalYears: 8,
  experiences: [
    {
      id: "1",
      company: "Tech Corp",
      position: "Senior Full-Stack Developer",
      startDate: "2021-01-01",
      description: "Lead development of microservices architecture",
      technologies: ["React", "Node.js", "PostgreSQL", "AWS"],
      type: "fulltime"
    },
    {
      id: "2", 
      company: "StartupXYZ",
      position: "Full-Stack Developer",
      startDate: "2018-06-01",
      endDate: "2020-12-31",
      description: "Built scalable web applications from scratch",
      technologies: ["Vue.js", "Python", "MongoDB"],
      type: "fulltime"
    }
  ]
};

export const samplePhotoBoothData: PhotoBoothContent = {
  title: "Life in Pictures",
  photos: [
    {
      id: "1",
      url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&h=300&fit=crop&crop=face",
      alt: "Casual portrait",
      caption: "Weekend vibes"
    },
    {
      id: "2",
      url: "https://images.unsplash.com/photo-1556157382-97eda2d62296?w=300&h=300&fit=crop",
      alt: "Workspace setup",
      caption: "My favorite coding spot"
    }
  ]
};
export const sampleJourneyData: JourneyContent = {
  title: "My Journey",
  milestones: [
    {
      id: "1",
      title: "Computer Science Degree",
      date: "2015-05-01",
      description: "Graduated with honors from UC Berkeley",
      type: "education",
      icon: "🎓"
    },
    {
      id: "2",
      title: "First Developer Job",
      date: "2015-07-01", 
      description: "Started as Junior Developer at TechStart",
      type: "career",
      icon: "💼"
    },
    {
      id: "3",
      title: "Open Source Contributor",
      date: "2019-03-01",
      description: "Became maintainer of popular React library",
      type: "achievement",
      icon: "🏆"
    }
  ]
};

export const sampleBlogArticles: BlogArticleContent[] = [
  {
    title: "Building Scalable React Applications",
    excerpt: "Learn the best practices for building React apps that can grow with your team and user base.",
    publishDate: "2024-01-15",
    readTime: 8,
    featuredImage: "https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=200&fit=crop",
    tags: ["React", "JavaScript", "Architecture"],
    author: "John Doe",
    category: "Frontend",
    isPublished: true
  },
  {
    title: "The Future of Web Development",
    excerpt: "Exploring emerging trends and technologies shaping the web development landscape.",
    publishDate: "2024-01-10",
    readTime: 6,
    tags: ["WebDev", "Trends", "Technology"],
    author: "John Doe",
    category: "Technology",
    isPublished: true
  }
];