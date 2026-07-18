import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { EditorModule } from 'primeng/editor';
import { SelectModule } from 'primeng/select';
import { BlogDataService } from '../../../core/blog-data.service';
import { MediaService } from '../../../core/media.service';
import { BlogPostStatus } from '../../../core/models';
import { estimateReadingTimeMinutes, sanitizeBlogHtml, slugify } from '../../../core/blog-utils';

@Component({
  standalone: true,
  selector: 'app-blog-post-editor',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, EditorModule, SelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card-panel max-w-5xl">
      <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-6">
        <div>
          <h2 class="card-heading">{{ isNew() ? 'New post' : 'Edit post' }}</h2>
          <p class="card-subtitle">Rich-text editor with draft, publish, and schedule controls.</p>
        </div>
        <a routerLink="/admin/posts" class="text-sm text-brand-400 hover:underline">← Back to posts</a>
      </div>

      @if (loading()) {
        <p class="text-sm text-white/50">Loading…</p>
      } @else {
        <form [formGroup]="form" (ngSubmit)="save()" class="admin-form grid grid-cols-1 md:grid-cols-2 gap-5">
          <div class="form-group md:col-span-2">
            <label class="form-label" for="title">Title *</label>
            <input id="title" class="form-input" formControlName="title" (blur)="maybeAutofillSlug()" />
          </div>

          <div class="form-group">
            <label class="form-label" for="slug">Slug *</label>
            <input id="slug" class="form-input" formControlName="slug" />
            <p class="text-xs text-white/40 mt-1">URL: /blog/{{ form.controls.slug.value || '…' }}</p>
          </div>

          <div class="form-group">
            <label class="form-label" for="status">Status *</label>
            <p-select
              inputId="status"
              formControlName="status"
              [options]="statusOptions"
              optionLabel="label"
              optionValue="value"
              styleClass="w-full"
            />
          </div>

          <div class="form-group md:col-span-2">
            <label class="form-label" for="excerpt">Excerpt</label>
            <textarea id="excerpt" class="form-textarea" rows="3" formControlName="excerpt"></textarea>
          </div>

          <div class="form-group md:col-span-2">
            <label class="form-label">Content *</label>
            <p-editor
              formControlName="content_html"
              styleClass="blog-rich-editor"
              [style]="{ height: '360px' }"
            />
            <p class="text-xs text-white/40 mt-1">
              Estimated reading time: {{ readingMinutes() }} min
            </p>
          </div>

          <div class="form-group md:col-span-2">
            <label class="form-label">Cover image</label>
            <div class="flex flex-col sm:flex-row gap-4 items-start">
              @if (form.controls.cover_image_url.value) {
                <img
                  [src]="form.controls.cover_image_url.value"
                  alt="Cover preview"
                  class="w-40 h-24 object-cover rounded-lg border border-white/15"
                />
              }
              <div class="flex flex-col gap-2">
                <input
                  #coverInput
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/svg+xml"
                  class="hidden"
                  (change)="onCoverSelected($event)"
                />
                <div class="flex flex-wrap gap-2">
                  <button type="button" class="btn-send btn-send--sm !w-auto" [disabled]="uploading()" (click)="coverInput.click()">
                    {{ uploading() ? 'Uploading…' : 'Upload cover' }}
                  </button>
                  @if (form.controls.cover_image_url.value) {
                    <button type="button" class="text-sm text-white/60 hover:text-white px-3" (click)="clearCover()">
                      Remove
                    </button>
                  }
                </div>
              </div>
            </div>
          </div>

          <div class="form-group md:col-span-2">
            <label class="form-label" for="tags">Tags</label>
            <input
              id="tags"
              class="form-input"
              formControlName="tags"
              placeholder="Comma-separated, e.g. .NET, Angular, Architecture"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="published_at">Publish / schedule at</label>
            <input id="published_at" class="form-input" type="datetime-local" formControlName="published_at" />
            <p class="text-xs text-white/40 mt-1">
              For scheduled posts, set a future time and status = Scheduled.
            </p>
          </div>

          <div class="form-group">
            <label class="form-label" for="seo_title">SEO title</label>
            <input id="seo_title" class="form-input" formControlName="seo_title" />
          </div>

          <div class="form-group md:col-span-2">
            <label class="form-label" for="seo_description">SEO description</label>
            <textarea id="seo_description" class="form-textarea" rows="2" formControlName="seo_description"></textarea>
          </div>

          <div class="md:col-span-2 flex flex-wrap gap-3 pt-2">
            <button type="submit" class="btn-send !w-auto" [disabled]="saving() || form.invalid">
              {{ saving() ? 'Saving…' : 'Save post' }}
            </button>
            <button type="button" class="btn-send btn-send--sm !w-auto" [disabled]="saving()" (click)="saveAs('draft')">
              Save draft
            </button>
            <button type="button" class="btn-send btn-send--sm !w-auto" [disabled]="saving()" (click)="saveAs('published')">
              Publish now
            </button>
          </div>
        </form>
      }
    </div>
  `,
})
export class BlogPostEditorComponent implements OnInit {
  private readonly blog = inject(BlogDataService);
  private readonly media = inject(MediaService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);
  private readonly fb = inject(FormBuilder);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly uploading = signal(false);
  readonly isNew = signal(true);
  readonly dirty = signal(false);

  private postId: string | null = null;
  private slugTouched = false;

  readonly statusOptions: { label: string; value: BlogPostStatus }[] = [
    { label: 'Draft', value: 'draft' },
    { label: 'Published', value: 'published' },
    { label: 'Scheduled', value: 'scheduled' },
  ];

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    slug: ['', [Validators.required, Validators.maxLength(120)]],
    excerpt: [''],
    content_html: ['', Validators.required],
    cover_image_url: [null as string | null],
    status: ['draft' as BlogPostStatus, Validators.required],
    published_at: [''],
    seo_title: [''],
    seo_description: [''],
    tags: [''],
  });

  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => this.dirty.set(true));
    this.form.controls.slug.valueChanges.subscribe(() => {
      this.slugTouched = true;
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (!id || id === 'new') {
      this.isNew.set(true);
      this.postId = crypto.randomUUID();
      this.loading.set(false);
      return;
    }

    this.isNew.set(false);
    this.postId = id;
    void this.load(id);
  }

  @HostListener('window:beforeunload', ['$event'])
  onBeforeUnload(event: BeforeUnloadEvent): void {
    if (this.dirty()) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  readingMinutes(): number {
    return estimateReadingTimeMinutes(this.form.controls.content_html.value || '');
  }

  maybeAutofillSlug(): void {
    if (this.slugTouched && this.form.controls.slug.value) return;
    const title = this.form.controls.title.value;
    if (title) {
      this.form.controls.slug.setValue(slugify(title), { emitEvent: false });
    }
  }

  async onCoverSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !this.postId) return;

    this.uploading.set(true);
    try {
      const previous = this.media.pathFromPublicUrl(this.form.controls.cover_image_url.value);
      const path = this.media.buildPath(`blog/${this.postId}`, file);
      const result = await this.media.upload(path, file, 'image');
      this.form.controls.cover_image_url.setValue(result.publicUrl);
      if (previous && previous !== path) {
        await this.media.remove([previous]).catch(() => undefined);
      }
      this.messages.add({ severity: 'success', summary: 'Cover uploaded' });
    } catch (e) {
      this.messages.add({
        severity: 'error',
        summary: 'Upload failed',
        detail: e instanceof Error ? e.message : 'Unknown error',
      });
    } finally {
      this.uploading.set(false);
    }
  }

  clearCover(): void {
    const previous = this.media.pathFromPublicUrl(this.form.controls.cover_image_url.value);
    this.form.controls.cover_image_url.setValue(null);
    if (previous) {
      void this.media.remove([previous]).catch(() => undefined);
    }
  }

  saveAs(status: BlogPostStatus): void {
    this.form.controls.status.setValue(status);
    if (status === 'published' && !this.form.controls.published_at.value) {
      this.form.controls.published_at.setValue(this.toLocalInput(new Date()));
    }
    void this.save();
  }

  async save(): Promise<void> {
    if (this.form.invalid || this.saving() || !this.postId) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();
    const content = sanitizeBlogHtml(value.content_html);
    if (!content.trim()) {
      this.messages.add({ severity: 'warn', summary: 'Content is required' });
      this.saving.set(false);
      return;
    }

    try {
      const saved = await this.blog.adminSavePost({
        id: this.postId,
        title: value.title,
        slug: value.slug,
        excerpt: value.excerpt || null,
        content_html: content,
        cover_image_url: value.cover_image_url,
        status: value.status,
        published_at: value.published_at ? new Date(value.published_at).toISOString() : null,
        seo_title: value.seo_title || null,
        seo_description: value.seo_description || null,
        tagNames: value.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean),
      });

      this.dirty.set(false);
      this.messages.add({ severity: 'success', summary: 'Post saved' });

      if (this.isNew()) {
        this.isNew.set(false);
        await this.router.navigate(['/admin/posts', saved.id], { replaceUrl: true });
      } else {
        this.patchFromPost(saved);
      }
    } catch (e) {
      this.messages.add({
        severity: 'error',
        summary: 'Save failed',
        detail: e instanceof Error ? e.message : 'Unknown error',
      });
    } finally {
      this.saving.set(false);
    }
  }

  private async load(id: string): Promise<void> {
    this.loading.set(true);
    try {
      const post = await this.blog.adminGetPost(id);
      if (!post) {
        this.messages.add({ severity: 'error', summary: 'Post not found' });
        await this.router.navigate(['/admin/posts']);
        return;
      }
      this.patchFromPost(post);
      this.dirty.set(false);
    } catch (e) {
      this.messages.add({
        severity: 'error',
        summary: 'Failed to load post',
        detail: e instanceof Error ? e.message : 'Unknown error',
      });
    } finally {
      this.loading.set(false);
    }
  }

  private patchFromPost(post: {
    title: string;
    slug: string;
    excerpt: string | null;
    content_html: string;
    cover_image_url: string | null;
    status: BlogPostStatus;
    published_at: string | null;
    seo_title: string | null;
    seo_description: string | null;
    tags?: { name: string }[];
  }): void {
    this.form.patchValue({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content_html: post.content_html || '',
      cover_image_url: post.cover_image_url,
      status: post.status,
      published_at: post.published_at ? this.toLocalInput(new Date(post.published_at)) : '',
      seo_title: post.seo_title || '',
      seo_description: post.seo_description || '',
      tags: (post.tags || []).map((t) => t.name).join(', '),
    });
    this.slugTouched = true;
  }

  private toLocalInput(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
  }
}
