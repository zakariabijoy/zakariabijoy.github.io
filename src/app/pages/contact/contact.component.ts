import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [],
  template: '<div class="container py-16"><h1 class="text-4xl font-bold text-center">Contact Me</h1><p class="text-center mt-4">Get in touch</p></div>',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactComponent {}