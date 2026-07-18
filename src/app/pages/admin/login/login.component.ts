import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { PasswordModule } from 'primeng/password';
import { AuthService } from '../../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-admin-login',
  imports: [CommonModule, ReactiveFormsModule, PasswordModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-[70vh] flex items-center justify-center py-20 px-4">
      <div class="card-panel w-full max-w-md">
        <h1 class="card-heading text-2xl">Admin Login</h1>
        <p class="card-subtitle">Sign in to manage portfolio content.</p>

        <form [formGroup]="form" (ngSubmit)="signIn()" class="admin-form flex flex-col gap-5">
          <div class="form-group">
            <label for="email" class="form-label">Email Address *</label>
            <input
              id="email"
              type="email"
              formControlName="email"
              class="form-input"
              autocomplete="username"
              placeholder="your.email@example.com"
            />
            @if (form.controls.email.invalid && form.controls.email.touched) {
              <div class="field-error">Enter a valid email.</div>
            }
          </div>

          <div class="form-group">
            <label for="password" class="form-label">Password *</label>
            <p-password
              inputId="password"
              formControlName="password"
              [feedback]="false"
              [toggleMask]="true"
              styleClass="w-full"
              inputStyleClass="form-input w-full"
              placeholder="Enter your password"
              autocomplete="current-password"
            />
            @if (form.controls.password.invalid && form.controls.password.touched) {
              <div class="field-error">Password is required.</div>
            }
          </div>

          @if (error(); as err) {
            <div class="error-message !mt-0">
              <i class="pi pi-exclamation-triangle"></i>
              <span>{{ err }}</span>
            </div>
          }

          <div class="form-actions !mt-2">
            <button class="btn-send" type="submit" [disabled]="loading()" [class.loading]="loading()">
              @if (!loading()) {
                <span class="flex items-center gap-2">
                  <i class="pi pi-sign-in"></i>
                  <span>Sign in</span>
                </span>
              } @else {
                <span class="flex items-center gap-2">
                  <span class="loading-spinner"></span>
                  <span>Signing in...</span>
                </span>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  async signIn() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    const { error } = await this.auth.signIn(email, password);
    this.loading.set(false);

    if (error) {
      this.error.set(error);
    } else {
      this.router.navigate(['/admin']);
    }
  }
}
