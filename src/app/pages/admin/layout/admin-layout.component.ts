import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ButtonModule } from 'primeng/button';
import { AuthService } from '../../../core/auth.service';
import { AdminDataService } from '../shared/admin-data.service';

@Component({
  standalone: true,
  selector: 'app-admin-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastModule, ConfirmDialogModule, ButtonModule],
  providers: [MessageService, ConfirmationService, AdminDataService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <p-toast position="bottom-right" />
    <p-confirmdialog />

    <div class="container py-10">
      <div class="flex flex-col lg:flex-row gap-8">
        <!-- Sidebar -->
        <aside class="lg:w-56 flex-shrink-0">
          <div class="card-panel !p-4 lg:sticky lg:top-24">
            <div class="flex items-center justify-between mb-4 px-2">
              <span class="card-heading !text-lg !mb-0">Admin</span>
              <p-button icon="pi pi-sign-out" severity="secondary" [text]="true" size="small"
                        (onClick)="signOut()" ariaLabel="Sign out" />
            </div>
            <nav class="flex flex-row lg:flex-col flex-wrap gap-1">
              @for (item of nav; track item.path) {
                <a [routerLink]="item.path" routerLinkActive="admin-nav-active"
                   class="flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-white/5 transition-colors">
                  <i [class]="item.icon + ' text-brand-400'"></i>
                  <span>{{ item.label }}</span>
                </a>
              }
            </nav>
          </div>
        </aside>

        <!-- Content -->
        <main class="flex-1 min-w-0">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: `
    .admin-nav-active {
      background: color-mix(in srgb, var(--brand-500) 15%, transparent);
      color: var(--brand-400);
      font-weight: 600;
    }
  `,
})
export class AdminLayoutComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly nav = [
    { path: 'messages', label: 'Messages', icon: 'pi pi-inbox' },
    { path: 'profile', label: 'Profile', icon: 'pi pi-user' },
    { path: 'posts', label: 'Blog Posts', icon: 'pi pi-book' },
    { path: 'comments', label: 'Comments', icon: 'pi pi-comments' },
    { path: 'projects', label: 'Projects', icon: 'pi pi-briefcase' },
    { path: 'experience', label: 'Experience', icon: 'pi pi-building' },
    { path: 'education', label: 'Education', icon: 'pi pi-graduation-cap' },
    { path: 'skills', label: 'Skills', icon: 'pi pi-cog' },
    { path: 'social-links', label: 'Social Links', icon: 'pi pi-share-alt' },
  ];

  async signOut() {
    await this.auth.signOut();
    this.router.navigate(['/']);
  }
}
