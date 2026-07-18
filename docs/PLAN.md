# Portfolio Backend + CMS — Implementation Plan

Status snapshot as of 2026-07-18. This tracks what shipped, what's outstanding, and who built what — the project was worked on by both Claude Code and Cursor in parallel, and this doc exists to keep both sessions (and future ones) oriented.

**Deployed.** Live at https://zakariabijoy.github.io/ as of commit `47482c9` via `npm run github-deploy`.

## 1. Original scope (Claude Code, this session) — DONE

Supabase backend to replace hardcoded portfolio content, plus an admin CMS.

- **Schema & seed** — [`supabase/schema.sql`](../supabase/schema.sql), [`supabase/seed.sql`](../supabase/seed.sql): `profile`, `social_links`, `projects`, `experience`, `education`, `skills`, `contact_messages`. RLS: public read on content tables, `authenticated`-only writes, insert-only for `contact_messages`.
- **Data layer** — [`portfolio-data.service.ts`](../src/app/core/portfolio-data.service.ts): signals seeded with fallback content ([`fallback-content.ts`](../src/app/core/fallback-content.ts)), overwritten once Supabase responds. Site never renders empty.
- **Public pages wired to Supabase** — Home, Work, Resume, Footer all consume the service instead of hardcoded arrays.
- **Contact form** — Reactive Forms → [`contact.service.ts`](../src/app/core/contact.service.ts) → `contact_messages` table.
- **Admin auth** — [`auth.service.ts`](../src/app/core/auth.service.ts) + [`auth.guard.ts`](../src/app/core/auth.guard.ts), Supabase Auth email+password, signups disabled, single manually-created user.
- **Content refresh** — resume content updated (Senior Software Engineer @ Kaz Software, new LinkedIn, new skills), new resume PDF, SEO meta tags, footer mounted, dead links fixed.

## 2. Extended scope (built via Cursor) — DONE

Built in a separate tool due to a Claude Code session limitation at the time. Landed via commits `54b366a` → `b6aada5`.

- **Media uploads** — [`media.service.ts`](../src/app/core/media.service.ts): Supabase Storage-backed image/PDF upload, wired into Profile Editor (avatar, resume) and the generic CRUD form (project images).
- **Admin UI redesign** — new shared design language (`.card-panel`, `.admin-form`, `.admin-table`, `.admin-dialog`, `.btn-send`, `.form-input` etc., all in [`styles.scss`](../src/styles.scss)) applied across Login, Admin Layout, Messages, Profile Editor, and the generic CRUD component. Same visual system as the public Contact form.
- **Blog feature** — full CMS:
  - Schema: [`supabase/blog.sql`](../supabase/blog.sql) (posts, tags, comments, reactions, rate limiting), [`supabase/blog-seed.sql`](../supabase/blog-seed.sql), [`supabase/storage.sql`](../supabase/storage.sql).
  - Public: [`blog-list.component`](../src/app/pages/blog/blog-list.component.ts), [`blog-detail.component`](../src/app/pages/blog/blog-detail.component.ts), routed at `/blog`, `/blog/:slug`, `/blog/tag/:slug`.
  - Admin: [`blog-posts.component`](../src/app/pages/admin/blog-posts/blog-posts.component.ts) + [`blog-post-editor.component`](../src/app/pages/admin/blog-post-editor/blog-post-editor.component.ts) (PrimeNG Editor/Quill rich text) at `/admin/posts`, [`blog-comments.component`](../src/app/pages/admin/blog-comments/blog-comments.component.ts) moderation at `/admin/comments`.
  - Guest comments go through the `submit-blog-comment` Supabase Edge Function ([`supabase/functions/submit-blog-comment`](../supabase/functions/submit-blog-comment)) rather than a direct table write.
  - HTML sanitized via DOMPurify ([`blog-utils.ts`](../src/app/core/blog-utils.ts)).
  - SEO: [`seo.service.ts`](../src/app/core/seo.service.ts), [`scripts/generate-blog-seo.mjs`](../scripts/generate-blog-seo.mjs) writes `sitemap.xml` / `prerender-routes.txt` at build time (wired into `prebuild`/`postbuild` npm scripts) and copies `404.html` for GitHub Pages deep-link support.

Architecture details for all of the above are documented in [CLAUDE.md](../CLAUDE.md) — this plan tracks status, CLAUDE.md tracks how it's built.

See also [`FULL-BLOG-FEATURE-PLAN.md`](FULL-BLOG-FEATURE-PLAN.md) for the original blog feature plan (Cursor).

## 3. Outstanding items

| Item | Status | Notes |
|---|---|---|
| `main.ts` PrimeNG theme config | **Fixed & committed** (`08458dd`) | `darkModeSelector: 'class'` → `'.dark'`, `updatePrimaryPalette('#10b981')` → `palette('#10b981')`. Bug predated both sessions — without it, PrimeNG dark-mode tokens and the primary color ramp never populate, breaking `p-table`/`p-dialog`/`p-select` overlay theming. Confirmed via source-level trace of `@primeuix/styled`: `'class'` doesn't match any selector-resolution rule and falls through to a broken `custom` type, emitting CSS scoped to a nonexistent `<class>` element. |
| Resume page grid layout | **Verified fine, not a bug** | Re-tested at 768px/1024px/1400px viewports: correctly stacks below `lg`, sits side-by-side above it, math checks out exactly (1152px = 352px sidebar + 48px gap + 752px content). Whatever was originally seen is no longer reproducible — no code change made. |
| Lint: 5 pre-existing errors | **Fixed & committed** (`b5f70b5`) | `ignoreRestSiblings: true` added to `no-unused-vars` for the intentional `post: _join` destructure; the 4 `label-has-associated-control` errors fixed by swapping group-heading `<label>`s (over composite widgets, not single controls) to `<span>`. |
| CLAUDE.md staleness | **Fixed & committed** (`10f67c2`) | Was documenting the broken `main.ts` snippet as correct — a future session could have "fixed" the real config back to broken. Added the admin design-system note and `MediaService` mention. |
| Working-tree hygiene | **Resolved** | An earlier turn overwrote the committed (Cursor) `admin-crud.component.ts` with a simpler version, losing image-upload support. Restored via `git checkout HEAD -- <file>`. **Lesson: check `git log`/`git diff` against HEAD before rewriting any file that might have been touched by another tool/session.** |
| `p-select` overlay clipping | **Fixed & committed** (`e60ce55`, `cb6a43f`) | Every `p-select` in the codebase lacked `appendTo="body"`, so its dropdown overlay rendered inline in the DOM instead of portaling to `<body>`. Inside `admin-crud.component.ts`'s dialog, options falling outside the dialog's stacking boundary hit-tested to the modal's semi-transparent backdrop mask instead of the option row — visually, sibling form-field text bled through the dropdown list. The same root cause also hit `blog-post-editor.component.ts`'s Status select (no dialog involved — an in-flow textarea below it painted over the third option) and `blog-comments.component.ts`'s filter select. Found by logging into the live admin panel and testing every `p-select`, not just the one inside a dialog; confirmed via `elementFromPoint` hit-testing on each option before/after. |

## 4. Verification status (last checked 2026-07-18)

- `ng build` — clean, no errors.
- `ng test` — 14/14 passing.
- `ng lint` — clean, no errors.
- Supabase live data — verified end-to-end (anon read on content tables, RLS blocks anon read on `contact_messages`, contact form insert confirmed working against production Supabase project).
- Admin panel — **fully visually verified** (logged in): Messages, Projects (incl. edit dialog, image upload, number/toggle/select fields), Education (incl. category dropdown), Experience, Skills, Social Links, Profile, Blog Posts (incl. Quill rich-text editor), Comments moderation. Zero console errors across every screen.

## 5. Next steps

1. ~~Deploy via `npm run github-deploy`.~~ Done — live at https://zakariabijoy.github.io/.
