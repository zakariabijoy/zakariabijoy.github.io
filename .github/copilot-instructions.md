# Portfolio Project - AI Agent Guidelines

## Architecture Overview
This is an **Angular 20.3.x** portfolio website using standalone components with zoneless change detection. The app follows a page-based structure:

- **Root app**: `src/app/app.ts` (class `App`), `src/app/app.html`, `src/app/app.scss` — shortened filenames, no `.component.` infix
- **Pages** (`src/app/pages/`): Lazy-loaded route components (home, resume, work, contact) with content embedded directly in their templates
- **Layout** (`src/app/layout/`): `header/` and `footer/` components — only `app-header` is rendered in `app.html`; `FooterComponent` exists but is not currently wired into the shell
- **Shared** (`src/app/shared/`): `bg-layer/` component and `scroll-reveal.directive.ts`
- **Core** (`src/app/core/`): `ThemeService`

Key architectural decisions:
- Most components use `ChangeDetectionStrategy.OnPush`; root `App` and `ContactComponent` currently do not
- Theme service uses Angular signals for reactive dark/light mode switching with `localStorage` persistence
- Routing uses lazy loading via `loadComponent: () => import(...)` in `app.routes.ts`
- No separate "sections" components — content is embedded directly in page components
- **PrimeNG v20 (Aura preset)** initialized in `main.ts` via `useTheme()` with class-based dark mode and primary color set via `updatePrimaryPalette('#10b981')`

## Component Patterns
- **Standalone components** with explicit imports (e.g., `imports: [CommonModule, ButtonModule, Ripple]`)
- **Inline template** acceptable for simple components (see `bg-layer.component.ts`)
- **Hardcoded data** in component class arrays (e.g., projects in `WorkComponent`, experience/skills in `ResumeComponent`)
- **PrimeNG v20** for UI primitives — import modules explicitly from `primeng/*`
- **Tailwind CSS 3** with custom brand color variables (`--brand-50` to `--brand-900`)
- **Signal-based state** for reactive UI (e.g., `index = signal(0)` in `WorkComponent`, `activeTab` in `ResumeComponent`)
- **`ScrollRevealDirective`** (`appScrollReveal` attribute) — `IntersectionObserver`-based scroll-in animation; respects `prefers-reduced-motion`
- **`HomeComponent`** uses `constructor(private elementRef: ElementRef)` for DOM access and counter animations via `IntersectionObserver` — exception to the `inject()` rule

## Dependency Injection Convention
- Prefer `inject()` function for DI in all new components: `private readonly theme = inject(ThemeService)`
- `HomeComponent` is a legacy exception that still uses constructor injection for `ElementRef`
- Do **not** add constructor parameters for DI in new code

## Styling Conventions
- **SCSS** for all component styles; use Tailwind utility classes in templates
- **CSS custom properties** for theming — use `--brand-*`, `--bg`, `--fg`, `--muted`, `--surface`, `--border` (defined in `styles.scss`); do not hardcode color values
- **Class-based dark mode** — `dark` class added/removed on `:root` by `ThemeService`
- **Animations** via CSS keyframes (e.g., spinning background in `styles.scss`)
- **Responsive design** with Tailwind breakpoints (`md:grid-cols-2`)
- **Utility classes** `.container` and `.section-title` defined globally in `styles.scss` — use these instead of duplicating styles

## Development Workflow
- **Serve**: `ng serve` (localhost:4200, auto-reload)
- **Build**: `ng build` (outputs to `dist/portfolio/browser/`)
- **Test**: `ng test` (Karma + Jasmine, headless Chrome)
- **Lint**: `ng lint`
- **Generate**: `ng generate component path/name --standalone` (always use `--standalone`)
- **Theme initialization**: `theme.init()` called in `App.ngOnInit()` (`src/app/app.ts`)

## Deployment
Deployed to **GitHub Pages** via `angular-cli-ghpages`. Build output: `dist/portfolio/browser/`.

```bash
npm run github-build    # ng build --configuration production --base-href https://zakariabijoy.github.io/
npm run github-publish  # npx angular-cli-ghpages --dir=dist/portfolio/browser --no-silent
npm run github-deploy   # runs github-build then github-publish
```

- `base-href` must match the GitHub Pages URL.
- `github-publish` pushes to the `gh-pages` branch.

## Key Files to Reference
- `src/main.ts`: PrimeNG Aura theme bootstrap — `useTheme()`, `updatePrimaryPalette('#10b981')`
- `src/app/app.ts` / `app.html` / `app.scss`: Root component (`App` class, no `OnPush`)
- `src/app/app.config.ts`: `provideZonelessChangeDetection()` and router config
- `src/app/app.routes.ts`: All lazy-loaded page routes
- `src/app/core/theme.service.ts`: Signal-based theme management with `localStorage`
- `src/styles.scss`: Global styles, CSS custom properties, animated background keyframes
- `tailwind.config.js`: `--brand-*` CSS variable mappings and Inter font family
- `src/app/layout/header/header.component.ts`: PrimeNG + `inject()` + theme toggle example
- `src/app/pages/work/work.component.ts`: Hardcoded data, signals, keyboard navigation
- `src/app/pages/resume/resume.component.ts`: Tab signal (`activeTab`), local interfaces pattern
- `src/app/shared/scroll-reveal.directive.ts`: `appScrollReveal` IntersectionObserver directive

## Integration Points
- **PrimeNG v20**: Import per-component from `primeng/*` (e.g., `ButtonModule`, `AvatarModule`, `Ripple`)
- **`@primeng/themes`**: Aura preset initialized once in `main.ts`; `darkModeSelector: 'class'`
- **PrimeIcons v7**: Included globally via `angular.json` styles array
- **PrimeFlex v4**: Layout utility classes included in global styles
- **Theme service**: `inject(ThemeService)` → read `mode` signal → call `toggle()` or `setMode('dark'|'light')`