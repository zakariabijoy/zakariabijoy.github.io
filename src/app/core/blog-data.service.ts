import { Injectable, signal } from '@angular/core';
import type { SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import {
  BlogComment,
  BlogCommentStatus,
  BlogPost,
  BlogPostListResult,
  BlogPostStatus,
  BlogReactionSummary,
  BlogReactionType,
  BlogTag,
} from './models';
import {
  estimateReadingTimeMinutes,
  getVisitorKey,
  sanitizeBlogHtml,
  slugify,
} from './blog-utils';

export interface BlogListQuery {
  page?: number;
  pageSize?: number;
  search?: string;
  tagSlug?: string;
}

export interface BlogPostWrite {
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
  tagNames: string[];
}

const FALLBACK_POSTS: BlogPost[] = [
  {
    id: 'fallback-1',
    title: 'Building Clean APIs with .NET and CQRS',
    slug: 'building-clean-apis-with-dotnet-and-cqrs',
    excerpt:
      'Practical patterns for structuring maintainable ASP.NET Core APIs with CQRS and Clean Architecture boundaries.',
    content_html:
      '<h2 id="why-cqrs">Why CQRS</h2><p>Separating reads from writes keeps complex domains easier to evolve.</p>',
    cover_image_url: null,
    status: 'published',
    published_at: '2026-07-11T00:00:00.000Z',
    seo_title: null,
    seo_description: null,
    reading_time_minutes: 4,
    tags: [{ name: '.NET', slug: 'dotnet' }, { name: 'Architecture', slug: 'architecture' }],
  },
  {
    id: 'fallback-2',
    title: 'Angular Signals for Portfolio-Scale UIs',
    slug: 'angular-signals-for-portfolio-scale-uis',
    excerpt:
      'How signals and OnPush change detection keep a content-heavy Angular site snappy without NgRx.',
    content_html:
      '<h2 id="signals-first">Signals first</h2><p>For content sites, a few root services exposing signals often beat a full store.</p>',
    cover_image_url: null,
    status: 'published',
    published_at: '2026-07-16T00:00:00.000Z',
    seo_title: null,
    seo_description: null,
    reading_time_minutes: 3,
    tags: [{ name: 'Angular', slug: 'angular' }],
  },
];

@Injectable({ providedIn: 'root' })
export class BlogDataService {
  /** Latest published posts for home teaser — hydrated once when possible. */
  readonly latestPosts = signal<BlogPost[]>(FALLBACK_POSTS);

  private clientPromise: Promise<SupabaseClient> | null = null;

  constructor() {
    this.listPublished({ page: 1, pageSize: 3 })
      .then((result) => {
        if (result.posts.length) this.latestPosts.set(result.posts);
      })
      .catch(() => { /* keep fallback */ });
  }

  private client(): Promise<SupabaseClient> {
    if (!this.clientPromise) {
      this.clientPromise = import('./supabase.client').then((m) => m.supabase);
    }
    return this.clientPromise;
  }

  async listPublished(query: BlogListQuery = {}): Promise<BlogPostListResult> {
    const page = Math.max(1, query.page ?? 1);
    const pageSize = Math.min(50, Math.max(1, query.pageSize ?? 9));
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    try {
      const supabase = await this.client();
      let tagPostIds: string[] | null = null;

      if (query.tagSlug) {
        const { data: tag } = await supabase
          .from('blog_tags')
          .select('id')
          .eq('slug', query.tagSlug)
          .maybeSingle();

        if (!tag) {
          return { posts: [], total: 0, page, pageSize };
        }

        const { data: links } = await supabase
          .from('blog_post_tags')
          .select('post_id')
          .eq('tag_id', tag.id);

        tagPostIds = (links ?? []).map((l) => l.post_id as string);
        if (!tagPostIds.length) {
          return { posts: [], total: 0, page, pageSize };
        }
      }

      let q = supabase
        .from('blog_posts')
        .select('*', { count: 'exact' })
        .eq('status', 'published')
        .or(`published_at.is.null,published_at.lte.${new Date().toISOString()}`)
        .order('published_at', { ascending: false, nullsFirst: false });

      if (tagPostIds) {
        q = q.in('id', tagPostIds);
      }

      const search = query.search?.trim();
      if (search) {
        const escaped = search.replace(/[%_,]/g, '');
        q = q.or(`title.ilike.%${escaped}%,excerpt.ilike.%${escaped}%`);
      }

      const { data, error, count } = await q.range(from, to);
      if (error) throw error;

      const posts = await this.attachTags(supabase, (data ?? []) as BlogPost[]);
      return { posts, total: count ?? posts.length, page, pageSize };
    } catch {
      const filtered = this.filterFallback(query);
      const slice = filtered.slice(from, to + 1);
      return { posts: slice, total: filtered.length, page, pageSize };
    }
  }

  async getBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const supabase = await this.client();
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      const post = data as BlogPost;
      if (post.published_at && new Date(post.published_at).getTime() > Date.now()) {
        return null;
      }

      const [enriched] = await this.attachTags(supabase, [post]);
      return enriched;
    } catch {
      return FALLBACK_POSTS.find((p) => p.slug === slug) ?? null;
    }
  }

  async listRelated(post: BlogPost, limit = 3): Promise<BlogPost[]> {
    const tagIds = (post.tags ?? []).map((t) => t.id).filter(Boolean) as string[];
    if (!tagIds.length || !post.id) {
      const list = await this.listPublished({ page: 1, pageSize: limit + 1 });
      return list.posts.filter((p) => p.slug !== post.slug).slice(0, limit);
    }

    try {
      const supabase = await this.client();
      const { data: links } = await supabase
        .from('blog_post_tags')
        .select('post_id')
        .in('tag_id', tagIds);

      const ids = [...new Set((links ?? []).map((l) => l.post_id as string))]
        .filter((id) => id !== post.id)
        .slice(0, 20);

      if (!ids.length) return [];

      const { data } = await supabase
        .from('blog_posts')
        .select('*')
        .in('id', ids)
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit);

      return this.attachTags(supabase, (data ?? []) as BlogPost[]);
    } catch {
      return FALLBACK_POSTS.filter((p) => p.slug !== post.slug).slice(0, limit);
    }
  }

  async listTags(): Promise<BlogTag[]> {
    try {
      const supabase = await this.client();
      const { data, error } = await supabase
        .from('blog_tags')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return (data ?? []) as BlogTag[];
    } catch {
      const map = new Map<string, BlogTag>();
      for (const post of FALLBACK_POSTS) {
        for (const tag of post.tags ?? []) {
          map.set(tag.slug, tag);
        }
      }
      return [...map.values()];
    }
  }

  async listApprovedComments(postId: string): Promise<BlogComment[]> {
    if (postId.startsWith('fallback')) return [];
    try {
      const supabase = await this.client();
      const { data, error } = await supabase
        .from('blog_comments')
        .select('id, post_id, author_name, body, status, created_at')
        .eq('post_id', postId)
        .eq('status', 'approved')
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data ?? []).map((c) => ({
        ...(c as BlogComment),
        author_email: '',
      }));
    } catch {
      return [];
    }
  }

  async submitComment(input: {
    postId: string;
    authorName: string;
    authorEmail: string;
    body: string;
    website?: string;
  }): Promise<{ ok: boolean; message: string }> {
    const url = `${environment.supabaseUrl}/functions/v1/submit-blog-comment`;
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: environment.supabaseAnonKey,
          Authorization: `Bearer ${environment.supabaseAnonKey}`,
        },
        body: JSON.stringify({
          postId: input.postId,
          authorName: input.authorName,
          authorEmail: input.authorEmail,
          body: input.body,
          website: input.website ?? '',
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { ok: false, message: (json as { error?: string }).error || 'Failed to submit comment' };
      }
      return {
        ok: true,
        message:
          (json as { message?: string }).message ||
          'Comment submitted and awaiting moderation.',
      };
    } catch {
      return { ok: false, message: 'Could not reach the comment service.' };
    }
  }

  async getReactionSummary(postId: string): Promise<BlogReactionSummary> {
    const empty: BlogReactionSummary = { like: 0, insightful: 0, celebrate: 0, mine: [] };
    if (postId.startsWith('fallback')) return empty;

    try {
      const supabase = await this.client();
      const visitor = getVisitorKey();
      const { data, error } = await supabase
        .from('blog_reactions')
        .select('reaction_type, visitor_key')
        .eq('post_id', postId);
      if (error) throw error;

      const summary: BlogReactionSummary = { like: 0, insightful: 0, celebrate: 0, mine: [] };
      for (const row of data ?? []) {
        const type = row.reaction_type as BlogReactionType;
        summary[type] += 1;
        if (row.visitor_key === visitor) summary.mine.push(type);
      }
      return summary;
    } catch {
      return empty;
    }
  }

  async toggleReaction(postId: string, type: BlogReactionType): Promise<BlogReactionSummary> {
    const supabase = await this.client();
    const visitor = getVisitorKey();
    const { data: existing } = await supabase
      .from('blog_reactions')
      .select('id')
      .eq('post_id', postId)
      .eq('reaction_type', type)
      .eq('visitor_key', visitor)
      .maybeSingle();

    if (existing?.id) {
      await supabase.from('blog_reactions').delete().eq('id', existing.id);
    } else {
      await supabase.from('blog_reactions').insert({
        post_id: postId,
        reaction_type: type,
        visitor_key: visitor,
      });
    }

    return this.getReactionSummary(postId);
  }

  // ── Admin API ──────────────────────────────────────────────

  async adminListPosts(): Promise<BlogPost[]> {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return this.attachTags(supabase, (data ?? []) as BlogPost[]);
  }

  async adminGetPost(id: string): Promise<BlogPost | null> {
    const supabase = await this.client();
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const [post] = await this.attachTags(supabase, [data as BlogPost]);
    return post;
  }

  async adminSavePost(input: BlogPostWrite): Promise<BlogPost> {
    const supabase = await this.client();
    const id = input.id || crypto.randomUUID();
    const content = sanitizeBlogHtml(input.content_html);
    const slug = slugify(input.slug || input.title);
    const reading = estimateReadingTimeMinutes(content);

    let publishedAt = input.published_at;
    if (input.status === 'published' && !publishedAt) {
      publishedAt = new Date().toISOString();
    }
    if (input.status === 'draft') {
      // keep published_at as provided (may be null)
    }

    const row = {
      id,
      title: input.title.trim(),
      slug,
      excerpt: input.excerpt?.trim() || null,
      content_html: content,
      cover_image_url: input.cover_image_url,
      status: input.status,
      published_at: publishedAt,
      seo_title: input.seo_title?.trim() || null,
      seo_description: input.seo_description?.trim() || null,
      reading_time_minutes: reading,
    };

    const { error } = await supabase.from('blog_posts').upsert(row);
    if (error) throw error;

    await this.syncTags(supabase, id, input.tagNames);
    const saved = await this.adminGetPost(id);
    if (!saved) throw new Error('Post saved but could not be reloaded');
    return saved;
  }

  async adminDeletePost(id: string): Promise<void> {
    const supabase = await this.client();
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
  }

  async adminListComments(status?: BlogCommentStatus): Promise<BlogComment[]> {
    const supabase = await this.client();
    let q = supabase
      .from('blog_comments')
      .select('*, post:blog_posts(title, slug)')
      .order('created_at', { ascending: false });
    if (status) q = q.eq('status', status);
    const { data, error } = await q;
    if (error) throw error;

    return (data ?? []).map((row) => {
      const post = row.post as { title?: string; slug?: string } | { title?: string; slug?: string }[] | null;
      const resolved = Array.isArray(post) ? post[0] : post;
      const { post: _join, ...comment } = row as BlogComment & { post?: unknown };
      return {
        ...comment,
        post_title: resolved?.title ?? null,
        post_slug: resolved?.slug ?? null,
      };
    });
  }

  async adminUpdateCommentStatus(id: string, status: BlogCommentStatus): Promise<void> {
    const supabase = await this.client();
    const { error } = await supabase
      .from('blog_comments')
      .update({ status })
      .eq('id', id);
    if (error) throw error;
  }

  async adminDeleteComment(id: string): Promise<void> {
    const supabase = await this.client();
    const { error } = await supabase.from('blog_comments').delete().eq('id', id);
    if (error) throw error;
  }

  async listPublishedSlugs(): Promise<string[]> {
    try {
      const supabase = await this.client();
      const { data, error } = await supabase
        .from('blog_posts')
        .select('slug')
        .eq('status', 'published');
      if (error) throw error;
      return (data ?? []).map((r) => r.slug as string);
    } catch {
      return FALLBACK_POSTS.map((p) => p.slug);
    }
  }

  private async syncTags(
    supabase: SupabaseClient,
    postId: string,
    tagNames: string[],
  ): Promise<void> {
    const names = [...new Set(tagNames.map((n) => n.trim()).filter(Boolean))];
    await supabase.from('blog_post_tags').delete().eq('post_id', postId);

    if (!names.length) return;

    const tagIds: string[] = [];
    for (const name of names) {
      const slug = slugify(name);
      const { data: existing } = await supabase
        .from('blog_tags')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (existing?.id) {
        tagIds.push(existing.id);
      } else {
        const { data: created, error } = await supabase
          .from('blog_tags')
          .insert({ name, slug })
          .select('id')
          .single();
        if (error) throw error;
        tagIds.push(created.id);
      }
    }

    const { error } = await supabase
      .from('blog_post_tags')
      .insert(tagIds.map((tag_id) => ({ post_id: postId, tag_id })));
    if (error) throw error;
  }

  private async attachTags(
    supabase: SupabaseClient,
    posts: BlogPost[],
  ): Promise<BlogPost[]> {
    if (!posts.length) return posts;
    const ids = posts.map((p) => p.id).filter(Boolean) as string[];
    if (!ids.length) return posts;

    const { data: links } = await supabase
      .from('blog_post_tags')
      .select('post_id, tag:blog_tags(id, name, slug)')
      .in('post_id', ids);

    const byPost = new Map<string, BlogTag[]>();
    for (const link of links ?? []) {
      const postId = link.post_id as string;
      const tag = link.tag as unknown as BlogTag | BlogTag[] | null;
      const resolved = Array.isArray(tag) ? tag[0] : tag;
      if (!resolved) continue;
      const list = byPost.get(postId) ?? [];
      list.push(resolved);
      byPost.set(postId, list);
    }

    return posts.map((p) => ({
      ...p,
      tags: (p.id && byPost.get(p.id)) || p.tags || [],
    }));
  }

  private filterFallback(query: BlogListQuery): BlogPost[] {
    let posts = [...FALLBACK_POSTS].sort((a, b) =>
      (b.published_at || '').localeCompare(a.published_at || ''),
    );

    if (query.tagSlug) {
      posts = posts.filter((p) => p.tags?.some((t) => t.slug === query.tagSlug));
    }

    const search = query.search?.trim().toLowerCase();
    if (search) {
      posts = posts.filter(
        (p) =>
          p.title.toLowerCase().includes(search) ||
          (p.excerpt || '').toLowerCase().includes(search),
      );
    }

    return posts;
  }
}
