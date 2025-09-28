# Portfolio Project - AI Agent Guidelines

## Architecture Overview
This is an Angular 20 portfolio website using standalone components with zoneless change detection. The app follows a page-based structure:

- **Pages** (`src/app/pages/`): Route-based components (home, resume, work, contact) that contain all content directly in their templates
- **Layout** (`src/app/layout/`): Shared layout components like header and footer
- **Shared** (`src/app/shared/`): Cross-cutting components like background layers
- **Core** (`src/app/core/`): Services like theme management

Key architectural decisions:
- All components use `ChangeDetectionStrategy.OnPush` for performance
- Theme service uses Angular signals for reactive dark/light mode switching with localStorage persistence
- Routing employs lazy loading for pages with in-memory scrolling and anchor support
- No separate "sections" components - content is embedded directly in page components

## Component Patterns
- **Standalone components** with explicit imports (e.g., `imports: [ButtonModule, AvatarModule, Ripple]`)
- **Inline templates** for simple components (see `bg-layer.component.ts`)
- **Hardcoded data** in component classes (e.g., projects array in `WorkComponent`)
- **PrimeNG integration** for UI components (Buttons, Avatars, Ripple effects) - import modules explicitly
- **Tailwind CSS** with custom brand color variables (`--brand-50` to `--brand-900`)
- **Signal-based state** for reactive UI updates (e.g., `index = signal(0)` in `WorkComponent`)

## Styling Conventions
- **SCSS files** for component styles, using Tailwind utilities
- **CSS custom properties** for theming (defined in `styles.scss`)
- **Class-based dark mode** (`dark` class on `:root`) with media query fallback
- **Animations** via CSS keyframes (e.g., spinning background in `styles.scss`)
- **Responsive design** with Tailwind breakpoints (`md:grid-cols-2`)
- **Utility classes** defined in `styles.scss` (`.container`, `.section-title`)

## Development Workflow
- **Serve**: `ng serve` (runs on localhost:4200 with auto-reload)
- **Build**: `ng build` (outputs to `dist/`, optimized for production)
- **Test**: `ng test` (Karma + Jasmine, headless Chrome)
- **Generate components**: `ng generate component path/name --standalone` (always use `--standalone`)
- **Theme initialization**: Call `theme.init()` in `App` component's `ngOnInit`

## Key Files to Reference
- `app.config.ts`: Zoneless change detection and router config
- `core/theme.service.ts`: Signal-based theme management with localStorage
- `styles.scss`: Global styles, CSS variables, animated background
- `tailwind.config.js`: Brand color palette and Inter font family
- `layout/header/header.component.ts`: PrimeNG integration example with theme toggle
- `pages/work/work.component.ts`: Hardcoded data and signal usage example

## Integration Points
- **PrimeNG**: Import modules explicitly in components (e.g., `ButtonModule` for buttons)
- **PrimeIcons**: Included globally via `angular.json` styles array
- **PrimeFlex**: Utility classes for layout (included in global styles)
- **Theme service**: Inject with `inject(ThemeService)`, access `mode` signal, call `toggle()` method