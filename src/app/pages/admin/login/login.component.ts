import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { MessageModule } from 'primeng/message';
import { AuthService } from '../../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-admin-login',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, PasswordModule, MessageModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-[70vh] flex items-center justify-center py-20">
      <div class="glass-card p-8 w-full max-w-md">
        <h1 class="text-2xl font-bold mb-2">Admin Login</h1>
        <p class="text-gray-400 text-sm mb-6">Sign in to manage portfolio content.</p>

        <form [formGroup]="form" (ngSubmit)="signIn()" class="flex flex-col gap-4">
          <div class="flex flex-col gap-1">
            <label for="email" class="text-sm font-medium">Email</label>
            <input pInputText id="email" type="email" formControlName="email" autocomplete="username" />
          </div>

          <div class="flex flex-col gap-1">
            <label for="password" class="text-sm font-medium">Password</label>
            <p-password inputId="password" formControlName="password" [feedback]="false"
                        [toggleMask]="true" styleClass="w-full" inputStyleClass="w-full"
                        autocomplete="current-password" />
          </div>

          @if (error(); as err) {
            <p-message severity="error" [text]="err" />
          }

          <p-button label="Sign in" type="submit" [loading]="loading()" styleClass="w-full mt-2" />
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
