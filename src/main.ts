import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// PrimeNG Themes (Aura preset) via PrimeUIX Styled
import Aura from '@primeng/themes/aura';
import { useTheme, updatePrimaryPalette, palette } from '@primeng/themes';

// Use class-based dark mode so our ThemeService can toggle it.
// darkModeSelector must be an actual CSS selector ('.dark'), not the bare word 'class'.
useTheme({ preset: Aura, options: { darkModeSelector: '.dark', cssLayer: { name: 'primeui' } } });
// palette() expands a single color into the 50-900 ramp PrimeNG expects —
// passing a bare hex string here silently produces empty --p-primary-* tokens.
updatePrimaryPalette(palette('#10b981'));

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
