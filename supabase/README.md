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

## 4. Production URL config

**Authentication → URL Configuration** → set Site URL to
`https://zakariabijoy.github.io` (safe default, even though the app uses
password auth without redirects).

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
