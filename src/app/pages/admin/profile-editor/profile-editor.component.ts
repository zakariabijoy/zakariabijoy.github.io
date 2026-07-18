import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { InputNumberModule } from 'primeng/inputnumber';
import { supabase } from '../../../core/supabase.client';
import { MediaService } from '../../../core/media.service';
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

        <div class="form-group md:col-span-2">
          <label class="form-label">Avatar</label>
          <div class="flex flex-col sm:flex-row gap-4 items-start">
            @if (form.controls.avatar_url.value) {
              <img
                [src]="form.controls.avatar_url.value"
                alt="Avatar preview"
                class="w-24 h-24 rounded-full object-cover border border-white/15 shrink-0"
              />
            } @else {
              <div class="w-24 h-24 rounded-full border border-dashed border-white/20 flex items-center justify-center text-white/40 text-xs shrink-0">
                No photo
              </div>
            }
            <div class="flex flex-col gap-2 min-w-0 flex-1">
              <input
                #avatarInput
                type="file"
                accept="image/jpeg,image/png,image/webp,image/svg+xml"
                class="hidden"
                (change)="onAvatarSelected($event)"
              />
              <div class="flex flex-wrap gap-2">
                <button type="button" class="btn-send btn-send--sm !w-auto" [disabled]="uploadingAvatar()" (click)="avatarInput.click()">
                  @if (uploadingAvatar()) {
                    <span class="flex items-center gap-2">
                      <span class="loading-spinner"></span>
                      <span>Uploading...</span>
                    </span>
                  } @else {
                    <span class="flex items-center gap-2">
                      <i class="pi pi-upload"></i>
                      <span>Upload photo</span>
                    </span>
                  }
                </button>
                @if (form.controls.avatar_url.value) {
                  <button type="button" class="text-sm font-medium text-white/60 hover:text-white px-3 py-2 transition-colors" (click)="clearAvatar()">
                    Clear
                  </button>
                }
              </div>
              @if (form.controls.avatar_url.value; as avatarUrl) {
                <p class="form-hint break-all !mt-0">{{ avatarUrl }}</p>
              } @else {
                <p class="form-hint !mt-0">Falls back to /assets/profile.jpg on the public site when empty.</p>
              }
            </div>
          </div>
        </div>

        <div class="form-group md:col-span-2">
          <label class="form-label">Resume (PDF)</label>
          <input
            #resumeInput
            type="file"
            accept="application/pdf,.pdf"
            class="hidden"
            (change)="onResumeSelected($event)"
          />
          <div class="flex flex-wrap gap-2 items-center">
            <button type="button" class="btn-send btn-send--sm !w-auto" [disabled]="uploadingResume()" (click)="resumeInput.click()">
              @if (uploadingResume()) {
                <span class="flex items-center gap-2">
                  <span class="loading-spinner"></span>
                  <span>Uploading...</span>
                </span>
              } @else {
                <span class="flex items-center gap-2">
                  <i class="pi pi-upload"></i>
                  <span>Upload PDF</span>
                </span>
              }
            </button>
            @if (form.controls.resume_url.value; as resumeUrl) {
              <a [href]="resumeUrl" target="_blank" rel="noopener" class="text-sm text-brand-400 hover:underline truncate max-w-full">
                View current resume
              </a>
              <button type="button" class="text-sm font-medium text-white/60 hover:text-white px-3 py-2 transition-colors" (click)="clearResume()">
                Clear
              </button>
            }
          </div>
          @if (form.controls.resume_url.value; as resumeUrl) {
            <p class="form-hint break-all">{{ resumeUrl }}</p>
          } @else {
            <p class="form-hint">Falls back to /assets/Md_Zakaria_Masud_Resume_SSE.pdf on the public site when empty.</p>
          }
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
          <button class="btn-send btn-send--sm !w-auto" type="submit" [disabled]="saving() || uploadingAvatar() || uploadingResume()" [class.loading]="saving()">
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
  private readonly media = inject(MediaService);

  readonly saving = signal(false);
  readonly uploadingAvatar = signal(false);
  readonly uploadingResume = signal(false);

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

  async onAvatarSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.uploadingAvatar.set(true);
    try {
      const previous = this.form.controls.avatar_url.value;
      const path = this.media.buildPath('avatar', file);
      const { publicUrl } = await this.media.upload(path, file, 'image');
      this.form.controls.avatar_url.setValue(publicUrl);

      const oldPath = this.media.pathFromPublicUrl(previous);
      if (oldPath && oldPath !== path) {
        await this.media.remove([oldPath]).catch(() => undefined);
      }
      this.toast.add({ severity: 'success', summary: 'Avatar uploaded' });
    } catch (err) {
      this.toast.add({
        severity: 'error',
        summary: 'Upload failed',
        detail: err instanceof Error ? err.message : 'Could not upload avatar',
      });
    } finally {
      this.uploadingAvatar.set(false);
    }
  }

  async onResumeSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.uploadingResume.set(true);
    try {
      const previous = this.form.controls.resume_url.value;
      const path = this.media.buildPath('resume', file);
      const { publicUrl } = await this.media.upload(path, file, 'pdf');
      this.form.controls.resume_url.setValue(publicUrl);

      const oldPath = this.media.pathFromPublicUrl(previous);
      if (oldPath && oldPath !== path) {
        await this.media.remove([oldPath]).catch(() => undefined);
      }
      this.toast.add({ severity: 'success', summary: 'Resume uploaded' });
    } catch (err) {
      this.toast.add({
        severity: 'error',
        summary: 'Upload failed',
        detail: err instanceof Error ? err.message : 'Could not upload resume',
      });
    } finally {
      this.uploadingResume.set(false);
    }
  }

  async clearAvatar() {
    const previous = this.form.controls.avatar_url.value;
    this.form.controls.avatar_url.setValue('');
    const path = this.media.pathFromPublicUrl(previous);
    if (path) {
      await this.media.remove([path]).catch(() => undefined);
    }
  }

  async clearResume() {
    const previous = this.form.controls.resume_url.value;
    this.form.controls.resume_url.setValue('');
    const path = this.media.pathFromPublicUrl(previous);
    if (path) {
      await this.media.remove([path]).catch(() => undefined);
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
