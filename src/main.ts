import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// PrimeNG Themes (Aura preset) via PrimeUIX Styled
import Aura from '@primeng/themes/aura';
import { useTheme, updatePrimaryPalette } from '@primeng/themes';

// Use class-based dark mode so our ThemeService can toggle it
useTheme({ preset: Aura, options: { darkModeSelector: 'class', cssLayer: { name: 'primeui' } } });
updatePrimaryPalette('#10b981');

bootstrapApplication(App, appConfig).catch((err) => console.error(err));
