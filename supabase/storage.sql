-- Portfolio Supabase Storage
-- Run this in the Supabase SQL Editor AFTER schema.sql (can run before or after seed.sql).

-- ============================================================
-- Bucket: portfolio-media (public read)
-- Folders: avatar/, resume/, projects/{projectId}/, blog/{postId}/
-- ============================================================

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'portfolio-media',
  'portfolio-media',
  true,
  10485760, -- 10 MB
  array[
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/svg+xml',
    'application/pdf'
  ]
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- ============================================================
-- Storage RLS policies
-- Public can read; authenticated admin can write/update/delete.
-- ============================================================

drop policy if exists "portfolio-media public read" on storage.objects;
drop policy if exists "portfolio-media admin insert" on storage.objects;
drop policy if exists "portfolio-media admin update" on storage.objects;
drop policy if exists "portfolio-media admin delete" on storage.objects;

create policy "portfolio-media public read"
  on storage.objects for select
  using (bucket_id = 'portfolio-media');

create policy "portfolio-media admin insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio-media');

create policy "portfolio-media admin update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio-media')
  with check (bucket_id = 'portfolio-media');

create policy "portfolio-media admin delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio-media');
