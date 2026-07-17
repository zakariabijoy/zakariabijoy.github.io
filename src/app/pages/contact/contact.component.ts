import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ContactService } from '../../core/contact.service';
import { PortfolioDataService } from '../../core/portfolio-data.service';

@Component({
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  selector: 'app-contact-page',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {
  private readonly contact = inject(ContactService);
  private readonly data = inject(PortfolioDataService);
  private readonly fb = inject(FormBuilder);

  readonly profile = this.data.profile;
  readonly socialLinks = this.data.socialLinks;

  readonly status = signal<'idle' | 'sending' | 'sent' | 'error'>('idle');

  readonly form = this.fb.nonNullable.group({
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', Validators.maxLength(100)],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.pattern(/^[0-9+()\s-]{6,}$/)],
    message: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(5000)]],
  });

  fieldError(name: 'firstName' | 'lastName' | 'email' | 'phone' | 'message'): string | null {
    const control = this.form.controls[name];
    if (!control.invalid || (!control.touched && this.status() === 'idle')) return null;
    if (control.hasError('required')) {
      return name === 'message' ? 'Please enter a message.' : 'This field is required.';
    }
    if (control.hasError('email')) return 'Please enter a valid email address.';
    if (control.hasError('pattern')) return 'Please enter a valid phone number.';
    if (control.hasError('minlength')) return 'Message must be at least 10 characters.';
    if (control.hasError('maxlength')) return 'Too long.';
    return 'Invalid value.';
  }

  async submit() {
    if (this.status() === 'sending') return;

    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.status.set('sending');
    const value = this.form.getRawValue();
    const { ok } = await this.contact.send({
      first_name: value.firstName.trim(),
      last_name: value.lastName.trim() || null,
      email: value.email.trim(),
      phone: value.phone.trim() || null,
      message: value.message.trim(),
    });

    if (ok) {
      this.status.set('sent');
      this.form.reset();
      setTimeout(() => this.status.set('idle'), 6000);
    } else {
      this.status.set('error');
    }
  }
}
