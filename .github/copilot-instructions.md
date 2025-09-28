# Portfolio Project - AI Agent Guidelines

## Architecture Overview
This is an Angular 20 portfolio website using standalone components with zoneless change detection. The app follows a page/section structure:

- **Pages** (`src/app/pages/`): Route-based components (home, resume, work) that compose sections
- **Sections** (`src/app/sections/`): Reusable portfolio content blocks (hero, about, projects, etc.)
- **Shared** (`src/app/shared/`): Cross-cutting components like background layers
- **Core** (`src/app/core/`): Services like theme management

Key architectural decisions:
- All components use `ChangeDetectionStrategy.OnPush` for performance
- Theme service uses Angular signals for reactive dark/light mode switching
- Routing employs lazy loading for pages, with in-memory scrolling and anchor support

## Component Patterns
- **Standalone components** with explicit imports (e.g., `imports: [CardModule, ButtonModule]`)
- **Inline templates** for simple components (see `bg-layer.component.ts`)
- **Hardcoded data** in component classes (e.g., stats array in `StatsComponent`)
- **PrimeNG integration** for UI components (Cards, Buttons, Icons)
- **Tailwind CSS** with custom brand color variables (`--brand-50` to `--brand-900`)

## Styling Conventions
- **SCSS files** for component styles, using Tailwind utilities
- **CSS custom properties** for theming (defined in `styles.scss`)
- **Class-based dark mode** (`dark` class on `:root`)
- **Animations** via CSS keyframes (e.g., floating profile photo)
- **Responsive design** with Tailwind breakpoints (`md:grid-cols-3`)

## Development Workflow
- **Serve**: `ng serve` (runs on localhost:4200 with auto-reload)
- **Build**: `ng build` (outputs to `dist/`, optimized for production)
- **Test**: `ng test` (Karma + Jasmine, headless Chrome)
- **Generate components**: `ng generate component path/name --standalone` (always use `--standalone`)

## Key Files to Reference
- `app.config.ts`: Zoneless change detection and router config
- `core/theme.service.ts`: Signal-based theme management with localStorage
- `styles.scss`: Global styles, CSS variables, animated background
- `tailwind.config.js`: Brand color palette and Inter font family
- `sections/hero/hero.component.scss`: Example of component-specific animations

## Integration Points
- **PrimeNG**: Import modules explicitly in components (e.g., `CardModule` for project cards)
- **PrimeIcons**: Included globally via `angular.json` styles array
- **PrimeFlex**: Utility classes for layout (included in global styles)

When adding new sections, follow the pattern in `pages/home/home.component.ts`: import sections as standalone components and list them in the template.