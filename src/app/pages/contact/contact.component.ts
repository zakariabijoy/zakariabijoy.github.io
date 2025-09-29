import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  standalone: true,
  imports: [CommonModule],
  selector: 'app-contact-page',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  // recipient address used for mailto. Change to your real email if desired.
  recipient = 'zakaria.bijoy@live.com';

  ngOnInit(): void {
    // placeholder for future logic (form handling, sending)
  }

  // Simple errors holder to show inline validation messages in the template.
  errors: { first?: string; last?: string; phone?: string; email?: string; message?: string } = {};

  // Form submission state
  isSubmitting = false;

  private validatePhone(phone: string) {
    if (!phone) return true;
    // allow digits, spaces, parentheses, plus and hyphens; require at least 6 chars
    return /^[0-9+()\s-]{6,}$/.test(phone.trim());
  }

  private validateEmail(email: string): boolean {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  }

  sendEmail(first: string, last: string, phone: string, email: string, message: string) {
    // Set submitting state
    this.isSubmitting = true;

    // Clear previous errors
    this.errors = {};

    const f = (first || '').trim();
    const l = (last || '').trim();
    const msg = (message || '').trim();
    const ph = (phone || '').trim();
    const em = (email || '').trim();

    // Validate required fields: first name, email, and message
    if (!f) this.errors.first = 'First name is required.';
    if (!em) this.errors.email = 'Email address is required.';
    else if (!this.validateEmail(em)) this.errors.email = 'Please enter a valid email address.';
    if (!msg) this.errors.message = 'Please enter a message.';
    if (ph && !this.validatePhone(ph)) this.errors.phone = 'Please enter a valid phone number.';

    // If any errors, stop and let template render messages
    if (Object.keys(this.errors).length) {
      this.isSubmitting = false;
      return;
    }

    const name = [f, l].filter(Boolean).join(' ').trim();
    const subject = name ? `Contact from ${name}` : 'Contact from website';

    let body = '';
    if (msg) body += `${msg}\n\n`;
    if (ph) body += `Phone: ${ph}\n`;
    if (em) body += `Email: ${em}\n`;
    body += `\n--\nSent from the portfolio site.`;

    const mailto = `mailto:${this.recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;

    // Reset submitting state after a short delay (since mailto opens immediately)
    setTimeout(() => {
      this.isSubmitting = false;
    }, 1000);
  }
}
// ...existing component is above. No duplicate declarations.