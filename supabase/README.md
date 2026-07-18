# Supabase Setup

One-time setup for the portfolio backend. Total time: ~10 minutes.

## 1. Create the project

1. Go to [supabase.com](https://supabase.com) → sign in → **New project**.
2. Name: `zakaria-portfolio`. Region: **Southeast Asia (Singapore)**. Free tier is fine.
3. Wait for provisioning, then go to **Settings → API** and copy:
   - **Project URL** (e.g. `https://xxxx.supabase.co`)
   - **anon / public key**
4. Paste both into `src/environments/environment.ts`.

> The anon key is safe to commit — it is public by design. Row Level Security
> (RLS) policies in `schema.sql` are what protect the data.

## 2. Lock down auth

1. **Authentication → Sign In / Up** → turn **off** "Allow new users to sign up".
2. **Authentication → Users → Add user**:
   - Email: `zakaria.bijoy@live.com`
   - A strong password (this is your `/admin` login)
   - Check **Auto Confirm User**.

With signups disabled and a single manually created user, `authenticated` in
the RLS policies effectively means "the admin".

## 3. Create schema + seed data

1. **SQL Editor → New query** → paste the contents of [`schema.sql`](schema.sql) → **Run**.
2. New query → paste [`seed.sql`](seed.sql) → **Run**.
   - `seed.sql` is idempotent for content tables (it truncates them first), so
     it can be re-run to reset content. It does **not** touch `contact_messages`.
3. New query → paste [`blog.sql`](blog.sql) → **Run** (blog posts, tags, comments, reactions).
4. Optional sample posts: paste [`blog-seed.sql`](blog-seed.sql) → **Run**.

## 4. Create Storage bucket

1. **SQL Editor → New query** → paste the contents of [`storage.sql`](storage.sql) → **Run**.
2. Confirm under **Storage** that the public bucket `portfolio-media` exists.

Folder convention (enforced by the admin upload UI):

| Path | Purpose |
|---|---|
| `avatar/` | Profile picture |
| `resume/` | Resume PDF |
| `projects/{projectId}/` | Project / work images |
| `blog/{postId}/` | Blog cover / inline images |

Policies: anonymous **read**; authenticated admin **insert / update / delete**.

After this step, open `/admin` → Profile / Projects / Posts and upload files. Public pages prefer Storage URLs; local `/assets/...` remains the offline fallback.

## 4b. Deploy blog comment Edge Function

Guest comments are inserted as `pending` through a validated Edge Function
(rate-limited, honeypot, no direct anon INSERT on `blog_comments`).

```bash
# From the portfolio folder, with the Supabase CLI logged in:
supabase functions deploy submit-blog-comment --no-verify-jwt
```

Source: [`functions/submit-blog-comment/index.ts`](functions/submit-blog-comment/index.ts).
The function uses `SUPABASE_SERVICE_ROLE_KEY` (injected automatically by Supabase).

## 5. Production URL config

**Authentication → URL Configuration** → set Site URL to
`https://zakariabijoy.github.io` (safe default, even though the app uses
password auth without redirects).

## Blog SEO build variables

`scripts/generate-blog-seo.mjs` (run via `npm run blog-seo` / `github-build`) reads the
**public** anon key from `src/environments/environment.ts`, or optionally:

| Variable | Required | Notes |
|---|---|---|
| `SUPABASE_URL` | optional override | Same as Project URL |
| `SUPABASE_ANON_KEY` | optional override | Public anon / publishable key |

Never pass `SUPABASE_SERVICE_ROLE_KEY` into Angular or this script — it must stay
server-side (Edge Functions only).

## Verify

In the SQL Editor:

```sql
select count(*) from projects;      -- 3
select count(*) from experience;    -- 6
select count(*) from skills;        -- 40+
```

Anonymous access (replace URL/key):

```bash
# Should return rows (public read):
curl "https://xxxx.supabase.co/rest/v1/projects?select=title" -H "apikey: <anon-key>"

# Should return an empty array / permission error (write-only for anon):
curl "https://xxxx.supabase.co/rest/v1/contact_messages?select=*" -H "apikey: <anon-key>"
```

## Tables

| Table | Purpose | Anon access |
|---|---|---|
| `profile` | Single row — name, headline, bio, contact info, stats | read |
| `social_links` | Social/profile URLs with primeicons | read |
| `projects` | Portfolio projects | read |
| `experience` | Work history | read |
| `education` | Degrees, certifications, courses, training | read |
| `skills` | Skills grouped by category | read |
| `contact_messages` | Contact form submissions | insert only |
| `blog_posts` | Rich-text blog articles | read published only |
| `blog_tags` / `blog_post_tags` | Post taxonomy | read |
| `blog_comments` | Guest comments (moderated) | read approved only |
| `blog_reactions` | Per-visitor reactions | read + insert/delete own |
| `blog_comment_rate_limits` | Edge Function rate limits | none (service role) |

## Storage

| Bucket | Purpose | Anon access |
|---|---|---|
| `portfolio-media` | Resume PDF, avatar, project/blog images | read (public URLs) |
