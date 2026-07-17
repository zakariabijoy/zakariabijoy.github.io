-- Portfolio Supabase schema
-- Run this in the Supabase SQL Editor BEFORE seed.sql.

-- ============================================================
-- Tables
-- ============================================================

create table public.profile (
  id int primary key default 1 check (id = 1),
  full_name text not null,
  headline text not null,
  bio text,
  email text not null,
  phone text,
  phone_alt text,
  location text,
  date_of_birth date,
  nationality text,
  blood_group text,
  freelance_status text default 'Available',
  years_experience int not null default 5,
  projects_count int not null default 15,
  companies_count int not null default 4,
  resume_url text,
  avatar_url text,
  updated_at timestamptz not null default now()
);

create table public.social_links (
  id uuid primary key default gen_random_uuid(),
  label text not null,
  url text not null,
  icon text not null, -- primeicons class, e.g. 'pi pi-github'
  sort_order int not null default 0,
  is_active boolean not null default true
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  description text,
  tech text[] not null default '{}',
  images text[] not null default '{}',
  live_url text,
  github_url text,
  sort_order int not null default 0,
  is_published boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.experience (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  company text not null,
  date_label text not null, -- display string, e.g. 'Oct 2025 - Present'
  bullets text[] not null default '{}',
  sort_order int not null default 0
);

create table public.education (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  institution text not null,
  category text not null check (category in ('degrees','certifications','courses','training')),
  date_label text,
  bullets text[] not null default '{}',
  sort_order int not null default 0
);

create table public.skills (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  category text not null check (category in ('languages','frameworks','databases','tools','methodologies','ai_llm','cloud')),
  sort_order int not null default 0
);

create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  first_name text not null,
  last_name text,
  email text not null,
  phone text,
  message text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table public.profile enable row level security;
alter table public.social_links enable row level security;
alter table public.projects enable row level security;
alter table public.experience enable row level security;
alter table public.education enable row level security;
alter table public.skills enable row level security;
alter table public.contact_messages enable row level security;

-- Content tables: public read, authenticated (admin) full access.
-- Public signups are disabled in the dashboard, so 'authenticated' == the one admin user.

create policy "public read" on public.profile for select using (true);
create policy "admin all" on public.profile for all to authenticated using (true) with check (true);

create policy "public read" on public.social_links for select using (true);
create policy "admin all" on public.social_links for all to authenticated using (true) with check (true);

create policy "public read" on public.projects for select using (true);
create policy "admin all" on public.projects for all to authenticated using (true) with check (true);

create policy "public read" on public.experience for select using (true);
create policy "admin all" on public.experience for all to authenticated using (true) with check (true);

create policy "public read" on public.education for select using (true);
create policy "admin all" on public.education for all to authenticated using (true) with check (true);

create policy "public read" on public.skills for select using (true);
create policy "admin all" on public.skills for all to authenticated using (true) with check (true);

-- Contact messages: anyone may insert; only admin may read/manage.
create policy "anyone can insert" on public.contact_messages for insert to anon, authenticated with check (true);
create policy "admin read" on public.contact_messages for select to authenticated using (true);
create policy "admin update" on public.contact_messages for update to authenticated using (true) with check (true);
create policy "admin delete" on public.contact_messages for delete to authenticated using (true);
