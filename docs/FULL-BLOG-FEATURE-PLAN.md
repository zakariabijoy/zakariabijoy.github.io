# Full Blog Feature Plan

Status: Implemented  
Purpose: Preserve the original implementation plan as a reference for future blog improvements.

## 1. Define the blog data and security model

- Extend `supabase/schema.sql` with `blog_posts`, `blog_tags`, `blog_post_tags`, `blog_comments`, and `blog_reactions`, including unique slugs, sanitized rich-text HTML, draft/published/scheduled states, cover metadata, timestamps, indexes, and update triggers.
- Add RLS so anonymous visitors can read only published posts and approved comments, submit reactions, and send comments through a validated Supabase Edge Function; authenticated admin users retain full moderation and publishing access.
- Add a comment-submission Edge Function with validation, honeypot/CAPTCHA-ready checks, per-IP/email rate limiting, and pending-by-default moderation.
- Add representative seed content and setup notes in `supabase/seed.sql` and `supabase/README.md`.

## 2. Add typed blog services and safe rich-text rendering

- Add post, tag, comment, and reaction types to `src/app/core/models.ts`.
- Create a focused blog data service rather than expanding the eager portfolio loader in `src/app/core/portfolio-data.service.ts`; support published listing, slug lookup, tags, related posts, pagination, search, comments, reactions, and admin mutations.
- Store editor output as sanitized HTML, enforce an explicit element/attribute allowlist before persistence and again before rendering, and derive plain-text reading time and stable heading anchors. Keep draft content inaccessible through public queries.

## 3. Build the public blog experience

- Add lazy `/blog`, `/blog/tag/:slug`, and `/blog/:slug` routes in `src/app/app.routes.ts`.
- Build responsive list/detail pages under `src/app/pages/blog/` using the existing glass/bento styling: featured post, search, tag filters, pagination, cover images, article metadata, table of contents, safely rendered rich text, share links, related posts, empty/error/loading states, and accessible keyboard/focus behavior.
- Add moderated guest comments and reaction controls with clear pending/success/error feedback and privacy-conscious email handling.
- Add Blog to both desktop and mobile navigation in `src/app/layout/header/header.component.html`, and add a latest-post teaser to the home bento layout.

## 4. Add a dedicated admin publishing workflow

- Add `/admin/posts` and `/admin/comments` routes in `src/app/pages/admin/admin.routes.ts` and navigation entries in the admin layout.
- Build a dedicated WYSIWYG post editor using PrimeNG Editor/Quill, with title-to-slug generation, excerpt, cover upload, inline media, tags, draft/publish/schedule controls, SEO fields, HTML sanitization, validation, and unsaved-change protection.
- Reuse existing Supabase storage/image patterns rather than forcing long-form posts into the generic CRUD dialog.
- Build comment moderation with approve/reject/delete, filtering, and counts; keep simple tag management integrated into the post editor.

## 5. Make article URLs discoverable and deployable

- Add per-route title, description, canonical, Open Graph, and Twitter metadata plus BlogPosting/Breadcrumb JSON-LD for article pages.
- Add `robots.txt`, a Supabase-backed sitemap generator, and Angular build-time route generation for published slugs.
- Add GitHub Pages `404.html` deep-link fallback handling to the deployment workflow.
- Document required public Supabase build variables and ensure secrets such as the service-role key never enter the client bundle.

## 6. Verify behavior and safety

- Add unit tests for slugging, rich-text sanitization, reading time, service query rules, metadata, comment validation, and core list/detail/admin components.
- Verify draft isolation, RLS permissions, XSS resistance, duplicate reactions, comment rate limiting, responsive layouts, keyboard accessibility, direct article refreshes, production build, and generated metadata/sitemap output.

## Future improvement checklist

- Add CAPTCHA verification when comment volume justifies it.
- Add server-rendering or true per-post prerendering if crawler requirements exceed GitHub Pages SPA capabilities.
- Add full-text PostgreSQL search and ranking when the post count grows.
- Add revision history and autosave for the post editor.
- Add image optimization, responsive variants, and media cleanup for deleted posts.
- Add comment notifications and moderation audit history.
- Add analytics for post views, search terms, and reactions.
- Add end-to-end tests for public publishing and admin moderation workflows.
