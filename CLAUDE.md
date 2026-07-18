# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
ng serve                # dev server at localhost:4200, auto-reload
ng build                # production build -> dist/portfolio/browser/
ng test                 # Karma + Jasmine, headless Chrome
ng lint                 # angular-eslint via @angular-eslint/builder
ng generate component path/name --standalone   # always pass --standalone
```

Run a single spec file with Karma by narrowing via `--include`, e.g.:
```bash
ng test --include='**/theme.service.spec.ts'
```

### Deployment (GitHub Pages)
```bash
npm run github-build    # ng build --configuration production --base-href https://zakariabijoy.github.io/
npm run github-publish  # npx angular-cli-ghpages --dir=dist/portfolio/browser --no-silent
npm run github-deploy   # github-build then github-publish; pushes to gh-pages branch
```
`base-href` must match the GitHub Pages URL exactly.

## Architecture

Angular 20.3.x portfolio, standalone components, **zoneless change detection** (`provideZonelessChangeDetection()` in [app.config.ts](src/app/app.config.ts)). Page-based structure, no NgModules. **Supabase backend** for dynamic content (see `supabase/README.md` for setup; schema + seed SQL live in `supabase/`).

- **Root shell**: [app.ts](src/app/app.ts) (class `App`), `app.html`, `app.scss` — shortened filenames, no `.component.` infix (this is the one exception; everything under `pages/` and `layout/` uses the full `.component.ts` naming). Header + footer are both mounted in `app.html`.
- **Pages** (`src/app/pages/`): `home`, `work`, `resume`, `contact`, `blog` (list/detail), plus a guarded `admin/` area — lazy-loaded in [app.routes.ts](src/app/app.routes.ts) (`loadComponent` for pages, `loadChildren` for admin). No separate "sections" components; content is embedded directly in each page template.
- **Blog**: Supabase tables in [`supabase/blog.sql`](supabase/blog.sql); public pages under `src/app/pages/blog/`; admin editor at `/admin/posts` (PrimeNG Editor/Quill) and moderation at `/admin/comments`. Guest comments go through the `submit-blog-comment` Edge Function. HTML is sanitized with DOMPurify ([blog-utils.ts](src/app/core/blog-utils.ts)). Build scripts [`scripts/generate-blog-seo.mjs`](scripts/generate-blog-seo.mjs) write `sitemap.xml` / `prerender-routes.txt` (anon key only) and copy `404.html` for GitHub Pages deep links.
- **Data layer** (`src/app/core/`): [portfolio-data.service.ts](src/app/core/portfolio-data.service.ts) exposes signals (`profile`, `socialLinks`, `projects`, `experience`, `education`, `skills`) that initialize with fallback content from [fallback-content.ts](src/app/core/fallback-content.ts) and are overwritten once when the Supabase fetch succeeds. **Fallback must be kept in sync with `supabase/seed.sql`.** The Supabase client ([supabase.client.ts](src/app/core/supabase.client.ts)) is loaded via *dynamic import* from this service to keep supabase-js out of the initial bundle — do not import it statically from eagerly-loaded code. Credentials live in [environment.ts](src/environments/environment.ts) (anon key is public by design; RLS is the security boundary).
- **Admin** (`src/app/pages/admin/`): Supabase Auth (email+password, signups disabled — single user created in dashboard), functional `authGuard`, generic [admin-crud.component.ts](src/app/pages/admin/shared/admin-crud.component.ts) configured per table via route `data.config` from [crud-config.ts](src/app/pages/admin/shared/crud-config.ts). Admin components use inline templates + Tailwind only (no component SCSS — avoids the 4kB `anyComponentStyle` budget).
- **Contact form**: Reactive Forms → `ContactService.send()` → `contact_messages` table (anon INSERT-only RLS). Read via the admin Messages inbox.
- **Shared** (`src/app/shared/`): `bg-layer/` component, `scroll-reveal.directive.ts` (`appScrollReveal` — IntersectionObserver-based scroll-in animation, respects `prefers-reduced-motion`).
- **Core** (`src/app/core/`): [theme.service.ts](src/app/core/theme.service.ts) — signal-based dark/light mode with `localStorage` persistence, applied by toggling a `dark` class on `document.documentElement`. `theme.init()` is called from `App.ngOnInit()`.
- **PrimeNG v20** (Aura preset) bootstrapped once in [main.ts](src/main.ts) via `useTheme({ preset: Aura, options: { darkModeSelector: 'class', ... } })` + `updatePrimaryPalette('#10b981')`, *before* `bootstrapApplication`. Import PrimeNG modules per-component from `primeng/*` (e.g. `ButtonModule`, `Ripple`).

### Component conventions
- `ChangeDetectionStrategy.OnPush` on every page/layout component **except** `ContactComponent` and root `App`.
- DI via `inject()` (e.g. `private readonly theme = inject(ThemeService)`) is the convention for all new code — do not add constructor DI params. `HomeComponent`'s `constructor(private elementRef: ElementRef)` is a deliberate legacy exception, not a pattern to copy.
- Signal-based local state throughout, e.g. `index = signal(0)` in `WorkComponent`, `activeTab` in `ResumeComponent`.
- Selector prefix is `app` for both components (kebab-case elements) and directives (camelCase attributes) — enforced by eslint rules in [eslint.config.js](eslint.config.js).

### Styling
- SCSS per component; Tailwind utility classes in templates.
- Theme via CSS custom properties defined in [styles.scss](src/styles.scss): `--brand-*`, `--bg`, `--fg`, `--muted`, `--surface`, `--border`. Never hardcode colors — use these vars (Tailwind's `brand.*` palette in [tailwind.config.js](tailwind.config.js) maps straight to `--brand-50..900`).
- Dark mode is class-based (`dark` on `:root`), driven by `ThemeService`.
- Global `.container` and `.section-title` utility classes live in `styles.scss` — reuse them instead of duplicating layout/typography rules.
