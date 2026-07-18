import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { supabase } from '../../../core/supabase.client';
import { Profile } from '../../../core/models';

@Component({
  standalone: true,
  selector: 'app-profile-editor',
  imports: [CommonModule, ReactiveFormsModule, InputNumberModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card-panel max-w-3xl">
      <h2 class="card-heading">Profile</h2>
      <p class="card-subtitle">Update the public profile shown across the site.</p>

      <form [formGroup]="form" (ngSubmit)="save()" class="admin-form grid grid-cols-1 md:grid-cols-2 gap-5">
        <div class="form-group md:col-span-2">
          <label for="full_name" class="form-label">Full name *</label>
          <input id="full_name" formControlName="full_name" class="form-input" placeholder="Your full name" />
        </div>
        <div class="form-group md:col-span-2">
          <label for="headline" class="form-label">Headline *</label>
          <input id="headline" formControlName="headline" class="form-input" placeholder="Short professional headline" />
        </div>
        <div class="form-group md:col-span-2">
          <label for="bio" class="form-label">Bio</label>
          <textarea id="bio" formControlName="bio" class="form-textarea" rows="5" placeholder="A short bio about yourself"></textarea>
        </div>

        <div class="form-group">
          <label for="email" class="form-label">Email *</label>
          <input id="email" formControlName="email" class="form-input" type="email" placeholder="your.email@example.com" />
        </div>
        <div class="form-group">
          <label for="location" class="form-label">Location</label>
          <input id="location" formControlName="location" class="form-input" placeholder="City, Country" />
        </div>
        <div class="form-group">
          <label for="phone" class="form-label">Phone</label>
          <input id="phone" formControlName="phone" class="form-input" type="tel" placeholder="+880 1XXX-XXXXXX" />
        </div>
        <div class="form-group">
          <label for="phone_alt" class="form-label">Phone (alt)</label>
          <input id="phone_alt" formControlName="phone_alt" class="form-input" type="tel" />
        </div>
        <div class="form-group">
          <label for="nationality" class="form-label">Nationality</label>
          <input id="nationality" formControlName="nationality" class="form-input" />
        </div>
        <div class="form-group">
          <label for="blood_group" class="form-label">Blood group</label>
          <input id="blood_group" formControlName="blood_group" class="form-input" />
        </div>
        <div class="form-group">
          <label for="freelance_status" class="form-label">Freelance status</label>
          <input id="freelance_status" formControlName="freelance_status" class="form-input" placeholder="Available / Busy" />
        </div>
        <div class="form-group">
          <label for="resume_url" class="form-label">Resume URL</label>
          <input id="resume_url" formControlName="resume_url" class="form-input" placeholder="https://" />
        </div>
        <div class="form-group md:col-span-2">
          <label for="avatar_url" class="form-label">Avatar URL</label>
          <input id="avatar_url" formControlName="avatar_url" class="form-input" placeholder="https://" />
        </div>

        <div class="form-group">
          <label for="years_experience" class="form-label">Years experience</label>
          <p-inputnumber inputId="years_experience" formControlName="years_experience" [showButtons]="true" styleClass="w-full" />
        </div>
        <div class="form-group">
          <label for="projects_count" class="form-label">Projects count</label>
          <p-inputnumber inputId="projects_count" formControlName="projects_count" [showButtons]="true" styleClass="w-full" />
        </div>
        <div class="form-group">
          <label for="companies_count" class="form-label">Companies count</label>
          <p-inputnumber inputId="companies_count" formControlName="companies_count" [showButtons]="true" styleClass="w-full" />
        </div>

        <div class="md:col-span-2 flex justify-end mt-2">
          <button class="btn-send btn-send--sm !w-auto" type="submit" [disabled]="saving()" [class.loading]="saving()">
            @if (!saving()) {
              <span class="flex items-center gap-2">
                <i class="pi pi-check"></i>
                <span>Save profile</span>
              </span>
            } @else {
              <span class="flex items-center gap-2">
                <span class="loading-spinner"></span>
                <span>Saving...</span>
              </span>
            }
          </button>
        </div>
      </form>
    </div>
  `,
})
export class ProfileEditorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(MessageService);

  readonly saving = signal(false);

  readonly form = this.fb.nonNullable.group({
    full_name: ['', Validators.required],
    headline: ['', Validators.required],
    bio: [''],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    phone_alt: [''],
    location: [''],
    nationality: [''],
    blood_group: [''],
    freelance_status: [''],
    years_experience: [0],
    projects_count: [0],
    companies_count: [0],
    resume_url: [''],
    avatar_url: [''],
  });

  async ngOnInit() {
    const { data, error } = await supabase.from('profile').select('*').eq('id', 1).maybeSingle();
    if (!error && data) {
      const p = data as Profile;
      this.form.patchValue({
        full_name: p.full_name,
        headline: p.headline,
        bio: p.bio ?? '',
        email: p.email,
        phone: p.phone ?? '',
        phone_alt: p.phone_alt ?? '',
        location: p.location ?? '',
        nationality: p.nationality ?? '',
        blood_group: p.blood_group ?? '',
        freelance_status: p.freelance_status ?? '',
        years_experience: p.years_experience,
        projects_count: p.projects_count,
        companies_count: p.companies_count,
        resume_url: p.resume_url ?? '',
        avatar_url: p.avatar_url ?? '',
      });
    }
  }

  async save() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    this.saving.set(true);
    const v = this.form.getRawValue();
    const { error } = await supabase.from('profile').upsert({
      id: 1,
      ...v,
      bio: v.bio || null,
      phone: v.phone || null,
      phone_alt: v.phone_alt || null,
      location: v.location || null,
      nationality: v.nationality || null,
      blood_group: v.blood_group || null,
      freelance_status: v.freelance_status || null,
      resume_url: v.resume_url || null,
      avatar_url: v.avatar_url || null,
      updated_at: new Date().toISOString(),
    });
    this.saving.set(false);

    if (error) {
      this.toast.add({ severity: 'error', summary: 'Save failed', detail: error.message });
    } else {
      this.toast.add({ severity: 'success', summary: 'Profile saved' });
    }
  }
}
