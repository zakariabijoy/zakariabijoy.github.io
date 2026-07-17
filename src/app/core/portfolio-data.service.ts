import { Injectable, WritableSignal, signal } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  EducationItem,
  ExperienceItem,
  Profile,
  Project,
  Skill,
  SocialLink,
} from './models';
import {
  FALLBACK_EDUCATION,
  FALLBACK_EXPERIENCE,
  FALLBACK_PROFILE,
  FALLBACK_PROJECTS,
  FALLBACK_SKILLS,
  FALLBACK_SOCIAL_LINKS,
} from './fallback-content';

/**
 * Public read-only content. Signals initialize with fallback content and are
 * overwritten once when the Supabase fetch succeeds — the site never renders
 * empty, needs no spinners, and works fine when Supabase is unreachable.
 */
@Injectable({ providedIn: 'root' })
export class PortfolioDataService {
  readonly profile = signal<Profile>(FALLBACK_PROFILE);
  readonly socialLinks = signal<SocialLink[]>(FALLBACK_SOCIAL_LINKS);
  readonly projects = signal<Project[]>(FALLBACK_PROJECTS);
  readonly experience = signal<ExperienceItem[]>(FALLBACK_EXPERIENCE);
  readonly education = signal<EducationItem[]>(FALLBACK_EDUCATION);
  readonly skills = signal<Skill[]>(FALLBACK_SKILLS);

  constructor() {
    // Dynamic import keeps supabase-js out of the initial bundle; the page
    // paints with fallback content immediately and hydrates when data arrives.
    import('./supabase.client')
      .then(({ supabase }) => this.loadAll(supabase))
      .catch(() => { /* keep fallback content */ });
  }

  private loadAll(supabase: SupabaseClient) {
    supabase
      .from('profile')
      .select('*')
      .eq('id', 1)
      .maybeSingle()
      .then(({ data, error }) => {
        if (!error && data) this.profile.set(data as Profile);
      });

    const loadList = <T>(
      sig: WritableSignal<T[]>,
      table: string,
      filterCol?: string,
    ) => {
      let query = supabase.from(table).select('*').order('sort_order', { ascending: true });
      if (filterCol) query = query.eq(filterCol, true);
      query.then(({ data, error }) => {
        if (!error && data?.length) sig.set(data as T[]);
      });
    };

    loadList<SocialLink>(this.socialLinks, 'social_links', 'is_active');
    loadList<Project>(this.projects, 'projects', 'is_published');
    loadList<ExperienceItem>(this.experience, 'experience');
    loadList<EducationItem>(this.education, 'education');
    loadList<Skill>(this.skills, 'skills');
  }
}
