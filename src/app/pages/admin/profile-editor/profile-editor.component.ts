import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { supabase } from '../../../core/supabase.client';
import { Profile } from '../../../core/models';

@Component({
  standalone: true,
  selector: 'app-profile-editor',
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, TextareaModule, InputNumberModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="glass-card p-6 max-w-3xl">
      <h2 class="text-2xl font-bold mb-6">Profile</h2>

      <form [formGroup]="form" (ngSubmit)="save()" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="flex flex-col gap-1 md:col-span-2">
          <label for="full_name" class="text-sm font-medium">Full name *</label>
          <input pInputText id="full_name" formControlName="full_name" />
        </div>
        <div class="flex flex-col gap-1 md:col-span-2">
          <label for="headline" class="text-sm font-medium">Headline *</label>
          <input pInputText id="headline" formControlName="headline" />
        </div>
        <div class="flex flex-col gap-1 md:col-span-2">
          <label for="bio" class="text-sm font-medium">Bio</label>
          <textarea pTextarea id="bio" formControlName="bio" rows="5"></textarea>
        </div>

        <div class="flex flex-col gap-1">
          <label for="email" class="text-sm font-medium">Email *</label>
          <input pInputText id="email" formControlName="email" />
        </div>
        <div class="flex flex-col gap-1">
          <label for="location" class="text-sm font-medium">Location</label>
          <input pInputText id="location" formControlName="location" />
        </div>
        <div class="flex flex-col gap-1">
          <label for="phone" class="text-sm font-medium">Phone</label>
          <input pInputText id="phone" formControlName="phone" />
        </div>
        <div class="flex flex-col gap-1">
          <label for="phone_alt" class="text-sm font-medium">Phone (alt)</label>
          <input pInputText id="phone_alt" formControlName="phone_alt" />
        </div>
        <div class="flex flex-col gap-1">
          <label for="nationality" class="text-sm font-medium">Nationality</label>
          <input pInputText id="nationality" formControlName="nationality" />
        </div>
        <div class="flex flex-col gap-1">
          <label for="blood_group" class="text-sm font-medium">Blood group</label>
          <input pInputText id="blood_group" formControlName="blood_group" />
        </div>
        <div class="flex flex-col gap-1">
          <label for="freelance_status" class="text-sm font-medium">Freelance status</label>
          <input pInputText id="freelance_status" formControlName="freelance_status" />
        </div>
        <div class="flex flex-col gap-1">
          <label for="resume_url" class="text-sm font-medium">Resume URL</label>
          <input pInputText id="resume_url" formControlName="resume_url" />
        </div>
        <div class="flex flex-col gap-1">
          <label for="avatar_url" class="text-sm font-medium">Avatar URL</label>
          <input pInputText id="avatar_url" formControlName="avatar_url" />
        </div>

        <div class="flex flex-col gap-1">
          <label for="years_experience" class="text-sm font-medium">Years experience</label>
          <p-inputnumber inputId="years_experience" formControlName="years_experience" [showButtons]="true" />
        </div>
        <div class="flex flex-col gap-1">
          <label for="projects_count" class="text-sm font-medium">Projects count</label>
          <p-inputnumber inputId="projects_count" formControlName="projects_count" [showButtons]="true" />
        </div>
        <div class="flex flex-col gap-1">
          <label for="companies_count" class="text-sm font-medium">Companies count</label>
          <p-inputnumber inputId="companies_count" formControlName="companies_count" [showButtons]="true" />
        </div>

        <div class="md:col-span-2 flex justify-end mt-2">
          <p-button label="Save profile" type="submit" [loading]="saving()" />
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
