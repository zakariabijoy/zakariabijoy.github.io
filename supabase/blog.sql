-- Blog feature schema (rich-text posts, tags, comments, reactions)
-- Run AFTER schema.sql (and preferably after seed.sql of portfolio content).
-- Safe to re-run: drops blog objects first.

-- ============================================================
-- Cleanup (idempotent)
-- ============================================================

drop table if exists public.blog_comment_rate_limits cascade;
drop table if exists public.blog_reactions cascade;
drop table if exists public.blog_comments cascade;
drop table if exists public.blog_post_tags cascade;
drop table if exists public.blog_tags cascade;
drop table if exists public.blog_posts cascade;
drop function if exists public.set_updated_at() cascade;
drop function if exists public.blog_post_is_public(uuid) cascade;

-- ============================================================
-- Helpers
-- ============================================================

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- Tables
-- ============================================================

create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content_html text not null default '',
  cover_image_url text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'scheduled')),
  published_at timestamptz,
  seo_title text,
  seo_description text,
  reading_time_minutes int not null default 1
    check (reading_time_minutes >= 1),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index blog_posts_status_published_at_idx
  on public.blog_posts (status, published_at desc nulls last);

create index blog_posts_slug_idx on public.blog_posts (slug);

create trigger blog_posts_set_updated_at
  before update on public.blog_posts
  for each row execute function public.set_updated_at();

create table public.blog_tags (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.blog_post_tags (
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  tag_id uuid not null references public.blog_tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

create index blog_post_tags_tag_id_idx on public.blog_post_tags (tag_id);

create table public.blog_comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  author_name text not null,
  author_email text not null,
  body text not null,
  status text not null default 'pending'
    check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz not null default now()
);

create index blog_comments_post_status_idx
  on public.blog_comments (post_id, status, created_at desc);

create table public.blog_reactions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.blog_posts (id) on delete cascade,
  reaction_type text not null
    check (reaction_type in ('like', 'insightful', 'celebrate')),
  visitor_key text not null,
  created_at timestamptz not null default now(),
  unique (post_id, reaction_type, visitor_key)
);

create index blog_reactions_post_type_idx
  on public.blog_reactions (post_id, reaction_type);

-- Used by the submit-blog-comment Edge Function for rate limiting.
create table public.blog_comment_rate_limits (
  id uuid primary key default gen_random_uuid(),
  ip_hash text not null,
  email_hash text not null,
  created_at timestamptz not null default now()
);

create index blog_comment_rate_limits_ip_created_idx
  on public.blog_comment_rate_limits (ip_hash, created_at desc);

create index blog_comment_rate_limits_email_created_idx
  on public.blog_comment_rate_limits (email_hash, created_at desc);

-- True when a post is publicly readable (published and not in the future).
create or replace function public.blog_post_is_public(p_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.blog_posts p
    where p.id = p_id
      and p.status = 'published'
      and (p.published_at is null or p.published_at <= now())
  );
$$;

revoke all on function public.blog_post_is_public(uuid) from public;
grant execute on function public.blog_post_is_public(uuid) to anon, authenticated;

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.blog_posts enable row level security;
alter table public.blog_tags enable row level security;
alter table public.blog_post_tags enable row level security;
alter table public.blog_comments enable row level security;
alter table public.blog_reactions enable row level security;
alter table public.blog_comment_rate_limits enable row level security;

-- Posts: public may only read live published posts; admin full access.
create policy "public read published posts"
  on public.blog_posts for select
  using (
    status = 'published'
    and (published_at is null or published_at <= now())
  );

create policy "admin all posts"
  on public.blog_posts for all to authenticated
  using (true) with check (true);

-- Tags + join table: public read, admin write.
create policy "public read tags"
  on public.blog_tags for select using (true);

create policy "admin all tags"
  on public.blog_tags for all to authenticated
  using (true) with check (true);

create policy "public read post tags"
  on public.blog_post_tags for select using (true);

create policy "admin all post tags"
  on public.blog_post_tags for all to authenticated
  using (true) with check (true);

-- Comments: public read approved only. Inserts go through Edge Function (service role).
create policy "public read approved comments"
  on public.blog_comments for select
  using (status = 'approved');

create policy "admin all comments"
  on public.blog_comments for all to authenticated
  using (true) with check (true);

-- Reactions: public can read counts and insert/delete their own visitor_key row.
create policy "public read reactions"
  on public.blog_reactions for select using (true);

create policy "anon insert reactions"
  on public.blog_reactions for insert to anon, authenticated
  with check (
    char_length(visitor_key) between 8 and 128
    and public.blog_post_is_public(post_id)
  );

create policy "anon delete own reactions"
  on public.blog_reactions for delete to anon, authenticated
  using (char_length(visitor_key) between 8 and 128);

create policy "admin all reactions"
  on public.blog_reactions for all to authenticated
  using (true) with check (true);

-- Rate limits: no client access (Edge Function uses service role).
create policy "no client access rate limits"
  on public.blog_comment_rate_limits for all
  using (false) with check (false);
