// Interfaces mirror the Supabase tables (snake_case columns, no mappers).

export interface Profile {
  id: number;
  full_name: string;
  headline: string;
  bio: string | null;
  email: string;
  phone: string | null;
  phone_alt: string | null;
  location: string | null;
  date_of_birth: string | null;
  nationality: string | null;
  blood_group: string | null;
  freelance_status: string | null;
  years_experience: number;
  projects_count: number;
  companies_count: number;
  resume_url: string | null;
  avatar_url: string | null;
}

export interface SocialLink {
  id?: string;
  label: string;
  url: string;
  icon: string;
  sort_order: number;
  is_active: boolean;
}

export interface Project {
  id?: string;
  title: string;
  subtitle: string | null;
  description: string | null;
  tech: string[];
  images: string[];
  live_url: string | null;
  github_url: string | null;
  sort_order: number;
  is_published: boolean;
}

export interface ExperienceItem {
  id?: string;
  title: string;
  company: string;
  date_label: string;
  bullets: string[];
  sort_order: number;
}

export type EducationCategory = 'degrees' | 'certifications' | 'courses' | 'training';

export interface EducationItem {
  id?: string;
  title: string;
  institution: string;
  category: EducationCategory;
  date_label: string | null;
  bullets: string[];
  sort_order: number;
}

export type SkillCategory =
  | 'languages'
  | 'frameworks'
  | 'databases'
  | 'tools'
  | 'methodologies'
  | 'ai_llm'
  | 'cloud';

export interface Skill {
  id?: string;
  name: string;
  category: SkillCategory;
  sort_order: number;
}

export interface ContactMessage {
  id?: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone: string | null;
  message: string;
  is_read?: boolean;
  created_at?: string;
}
