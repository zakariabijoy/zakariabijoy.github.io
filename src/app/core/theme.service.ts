import { Injectable, effect, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private storageKey = 'theme-preference';
  // 'light' | 'dark'
  readonly mode = signal<'light' | 'dark'>(this.detectInitialMode());

  constructor() {
    effect(() => {
      this.applyMode(this.mode());
    });
  }

  init() {
    // Trigger initial application of theme
    this.applyMode(this.mode());
  }

  toggle() {
    this.setMode(this.mode() === 'dark' ? 'light' : 'dark');
  }

  setMode(mode: 'light' | 'dark') {
    this.mode.set(mode);
    try {
      localStorage.setItem(this.storageKey, mode);
    } catch {
      // Storage access failed - mode will still be set in memory
    }
  }

  private detectInitialMode(): 'light' | 'dark' {
    try {
      const stored = localStorage.getItem(this.storageKey) as 'light' | 'dark' | null;
      if (stored === 'light' || stored === 'dark') return stored;
    } catch {
      // Storage access failed - continue with system preference
    }
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  private applyMode(mode: 'light' | 'dark') {
    const root = document.documentElement;
    root.classList.toggle('dark', mode === 'dark');
    // PrimeNG + PrimeUIX uses class-based dark mode via useTheme options; no link swapping needed.
  }
}