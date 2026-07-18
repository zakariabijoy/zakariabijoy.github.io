export type CrudFieldType = 'text' | 'textarea' | 'number' | 'toggle' | 'select' | 'lines' | 'images';

export interface CrudField {
  key: string;
  label: string;
  type: CrudFieldType;
  required?: boolean;
  /** options for type 'select' */
  options?: string[];
  /** helper text under the input */
  hint?: string;
}

export interface CrudConfig {
  table: string;
  title: string;
  /** columns shown in the list table */
  listColumns: { key: string; label: string }[];
  fields: CrudField[];
}

export const PROJECTS_CRUD: CrudConfig = {
  table: 'projects',
  title: 'Projects',
  listColumns: [
    { key: 'sort_order', label: '#' },
    { key: 'title', label: 'Title' },
    { key: 'subtitle', label: 'Subtitle' },
    { key: 'is_published', label: 'Published' },
  ],
  fields: [
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'subtitle', label: 'Subtitle', type: 'text' },
    { key: 'description', label: 'Description', type: 'textarea' },
    { key: 'tech', label: 'Technologies', type: 'lines', hint: 'One per line' },
    {
      key: 'images',
      label: 'Images',
      type: 'images',
      hint: 'Upload to Supabase Storage, or paste URLs (one per line). Local /assets/... paths still work as fallbacks.',
    },
    { key: 'live_url', label: 'Live URL', type: 'text' },
    { key: 'github_url', label: 'GitHub URL', type: 'text' },
    { key: 'sort_order', label: 'Sort order', type: 'number' },
    { key: 'is_published', label: 'Published', type: 'toggle' },
  ],
};

export const EXPERIENCE_CRUD: CrudConfig = {
  table: 'experience',
  title: 'Experience',
  listColumns: [
    { key: 'sort_order', label: '#' },
    { key: 'title', label: 'Title' },
    { key: 'company', label: 'Company' },
    { key: 'date_label', label: 'Dates' },
  ],
  fields: [
    { key: 'title', label: 'Job title', type: 'text', required: true },
    { key: 'company', label: 'Company', type: 'text', required: true },
    { key: 'date_label', label: 'Date label', type: 'text', required: true, hint: 'e.g. Oct 2025 - Present' },
    { key: 'bullets', label: 'Bullets', type: 'lines', hint: 'One per line' },
    { key: 'sort_order', label: 'Sort order', type: 'number' },
  ],
};

export const EDUCATION_CRUD: CrudConfig = {
  table: 'education',
  title: 'Education',
  listColumns: [
    { key: 'sort_order', label: '#' },
    { key: 'title', label: 'Title' },
    { key: 'institution', label: 'Institution' },
    { key: 'category', label: 'Category' },
  ],
  fields: [
    { key: 'title', label: 'Title', type: 'text', required: true },
    { key: 'institution', label: 'Institution', type: 'text', required: true },
    { key: 'category', label: 'Category', type: 'select', required: true, options: ['degrees', 'certifications', 'courses', 'training'] },
    { key: 'date_label', label: 'Date label', type: 'text' },
    { key: 'bullets', label: 'Bullets', type: 'lines', hint: 'One per line' },
    { key: 'sort_order', label: 'Sort order', type: 'number' },
  ],
};

export const SKILLS_CRUD: CrudConfig = {
  table: 'skills',
  title: 'Skills',
  listColumns: [
    { key: 'sort_order', label: '#' },
    { key: 'name', label: 'Name' },
    { key: 'category', label: 'Category' },
  ],
  fields: [
    { key: 'name', label: 'Name', type: 'text', required: true },
    { key: 'category', label: 'Category', type: 'select', required: true, options: ['languages', 'frameworks', 'databases', 'cloud', 'ai_llm', 'tools', 'methodologies'] },
    { key: 'sort_order', label: 'Sort order', type: 'number' },
  ],
};

export const SOCIAL_LINKS_CRUD: CrudConfig = {
  table: 'social_links',
  title: 'Social Links',
  listColumns: [
    { key: 'sort_order', label: '#' },
    { key: 'label', label: 'Label' },
    { key: 'url', label: 'URL' },
    { key: 'is_active', label: 'Active' },
  ],
  fields: [
    { key: 'label', label: 'Label', type: 'text', required: true },
    { key: 'url', label: 'URL', type: 'text', required: true },
    { key: 'icon', label: 'Icon', type: 'text', required: true, hint: 'PrimeIcons class, e.g. pi pi-github' },
    { key: 'sort_order', label: 'Sort order', type: 'number' },
    { key: 'is_active', label: 'Active', type: 'toggle' },
  ],
};
