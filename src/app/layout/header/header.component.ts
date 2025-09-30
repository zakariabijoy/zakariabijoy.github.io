import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { Ripple } from 'primeng/ripple';
import { ThemeService } from '../../core/theme.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ButtonModule, AvatarModule, Ripple],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  private theme = inject(ThemeService);
  readonly mode = this.theme.mode;
  mobileMenuOpen = signal(false);

  toggleTheme() { this.theme.toggle(); }
  
  toggleMobileMenu() { 
    this.mobileMenuOpen.update(v => !v);
  }
  
  closeMobileMenu() {
    this.mobileMenuOpen.set(false);
  }
}
