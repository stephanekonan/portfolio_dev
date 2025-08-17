export interface SiteConfig extends HeaderProps {
  title: string;
  description: string;
  lang: 'fr' | 'en'; 
  author: string;
  socialLinks: { text: string; href: string }[];
}

export interface SiteContent {
  hero: HeroProps;
  techStack: TechStackProps[];
  experience: ExperienceProps[];
  projects: ProjectProps[];
  about: AboutProps;
}

export interface HeroProps {
  name: string;
  specialty: string;
  summary: string;
  email: string;
  lang: 'fr' | 'en';
}

export interface TechStackProps {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  lang: 'fr' | 'en';
}

export interface ExperienceProps {
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  summary: string[];
}

export interface ProjectProps {
  name: string;
  summary: string;
  image: string;
  linkPreview?: string;
  linkSource?: string;
  index?: number;
  lang: 'fr' | 'en';
}

export interface AboutProps {
  description: string;
  title: string;
  image: string;
  lang: 'fr' | 'en';
}

export interface HeaderProps {
  siteLogo: string;
  navLinks: { text: string; href: string }[];
  lang: 'fr' | 'en';
}

export interface FooterProps {
  socialHref: string;
  socialText: string;
  description: string;
  lang: 'fr' | 'en';
}