export type Education = {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startYear: string;
  endYear: string;
};

export type Portfolio = {
  headline: string;
  location: string;
  about: string;
  education: Education[];
  hobbies: string[];
  githubUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
};

export type Skill = {
  name: string;
  level: number;
  type?: "PREDEFINED" | "CUSTOM";
};

/* ---------- RESUME ---------- */

export type Experience = {
  company: string;
  position: string;
  location: string;
  startDate: string; // YYYY-MM
  endDate: string; // YYYY-MM
  current: boolean;
  description: string; // one bullet per line
};

export type Project = {
  name: string;
  description: string; // one bullet per line
  technologies: string; // comma separated while editing
  githubUrl: string;
  liveUrl: string;
};

export type Certification = {
  name: string;
  organization: string;
  year: string;
};

export type ResumeTemplate = "modern" | "classic" | "compact";

export type ResumeData = {
  name: string;
  email: string;
  phone: string;
  headline: string;
  location: string;
  about: string;
  githubUrl: string;
  linkedinUrl: string;
  websiteUrl: string;
  education: Education[];
  experience: Experience[];
  projects: Project[];
  certifications: Certification[];
  template: ResumeTemplate;
  accent: string;
};
