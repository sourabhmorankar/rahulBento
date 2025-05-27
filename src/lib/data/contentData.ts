import type { 
  BlogArticleContent,
  CaseStudyContent,
  TestimonialContent
} from '../thumbnails';

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
  },
  {
    title: "Mastering TypeScript",
    excerpt: "Advanced TypeScript patterns and techniques for building robust applications.",
    publishDate: "2024-01-05",
    readTime: 12,
    featuredImage: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2?w=400&h=200&fit=crop",
    tags: ["TypeScript", "JavaScript", "Development"],
    author: "John Doe",
    category: "Frontend",
    isPublished: true
  }
];
export const sampleCaseStudies: CaseStudyContent[] = [
  {
    title: "E-commerce Platform Redesign",
    client: "ShopFlow Inc",
    year: 2023,
    category: "Web Development",
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=300&fit=crop",
    results: ["40% increase in conversions", "60% faster page load times"],
    technologies: ["React", "Node.js", "PostgreSQL", "AWS"],
    duration: "6 months",
    role: "Lead Full-Stack Developer",
    description: "Complete redesign and rebuild of e-commerce platform"
  },
  {
    title: "Mobile Banking App",
    client: "FinTech Solutions",
    year: 2023,
    category: "Mobile Development",
    thumbnail: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?w=400&h=300&fit=crop",
    results: ["50% increase in user engagement", "4.8-star app store rating"],
    technologies: ["React Native", "Node.js", "MongoDB"],
    duration: "8 months",
    role: "Mobile Lead Developer",
    description: "Built secure mobile banking application from scratch"
  }
];

export const sampleTestimonials: TestimonialContent[] = [
  {
    quote: "John delivered exceptional work on our e-commerce platform. His attention to detail and technical expertise resulted in a 40% increase in our conversion rates.",
    author: "Sarah Johnson",
    company: "ShopFlow Inc",
    position: "CTO",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616c96c1177?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    date: "2023-12-15",
    verified: true,
    projectContext: "E-commerce Platform Redesign"
  },
  {
    quote: "Working with John was a game-changer for our startup. He helped us build a scalable architecture that could grow with our business.",
    author: "Michael Chen",
    company: "TechStart",
    position: "Founder & CEO",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    date: "2023-11-20",
    verified: true,
    projectContext: "Startup MVP Development"
  },
  {
    quote: "John's expertise in both frontend and backend development made him invaluable to our team. Highly recommended!",
    author: "Emily Rodriguez",
    company: "FinTech Solutions",
    position: "Product Manager",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    rating: 5,
    date: "2023-10-10",
    verified: true,
    projectContext: "Mobile Banking App"
  }
];