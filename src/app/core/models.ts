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

export type BlogPostStatus = 'draft' | 'published' | 'scheduled';
export type BlogCommentStatus = 'pending' | 'approved' | 'rejected';
export type BlogReactionType = 'like' | 'insightful' | 'celebrate';

export interface BlogTag {
  id?: string;
  name: string;
  slug: string;
  created_at?: string;
}

export interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content_html: string;
  cover_image_url: string | null;
  status: BlogPostStatus;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  reading_time_minutes: number;
  created_at?: string;
  updated_at?: string;
  /** Populated by joins / client enrichment — not a DB column. */
  tags?: BlogTag[];
}

export interface BlogComment {
  id?: string;
  post_id: string;
  author_name: string;
  author_email: string;
  body: string;
  status: BlogCommentStatus;
  created_at?: string;
  /** Joined from blog_posts for admin moderation UI — not a DB column. */
  post_title?: string | null;
  post_slug?: string | null;
}

export interface BlogReaction {
  id?: string;
  post_id: string;
  reaction_type: BlogReactionType;
  visitor_key: string;
  created_at?: string;
}

export interface BlogReactionSummary {
  like: number;
  insightful: number;
  celebrate: number;
  mine: BlogReactionType[];
}

export interface BlogPostListResult {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
}
