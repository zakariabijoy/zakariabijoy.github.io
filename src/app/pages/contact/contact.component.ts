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
  recipient = 'youremail@email.com';

  constructor() {}
  ngOnInit(): void {
    // placeholder for future logic (form handling, sending)
  }

  // Simple errors holder to show inline validation messages in the template.
  errors: { first?: string; last?: string; phone?: string; message?: string } = {};

  private validatePhone(phone: string) {
    if (!phone) return true;
    // allow digits, spaces, parentheses, plus and hyphens; require at least 6 chars
    return /^[0-9+()\s-]{6,}$/.test(phone.trim());
  }

  sendEmail(first: string, last: string, phone: string, message: string) {
    // Clear previous errors
    this.errors = {};

    const f = (first || '').trim();
    const l = (last || '').trim();
    const msg = (message || '').trim();
    const ph = (phone || '').trim();

    // Validate required fields: first name and message
    if (!f) this.errors.first = 'First name is required.';
    if (!msg) this.errors.message = 'Please enter a message.';
    if (ph && !this.validatePhone(ph)) this.errors.phone = 'Please enter a valid phone number.';

    // If any errors, stop and let template render messages
    if (Object.keys(this.errors).length) return;

    const name = [f, l].filter(Boolean).join(' ').trim();
    const subject = name ? `Contact from ${name}` : 'Contact from website';

    let body = '';
    if (msg) body += `${msg}\n\n`;
    if (ph) body += `Phone: ${ph}\n`;
    body += `\n--\nSent from the portfolio site.`;

    const mailto = `mailto:${this.recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailto;
  }
}
// ...existing component is above. No duplicate declarations.