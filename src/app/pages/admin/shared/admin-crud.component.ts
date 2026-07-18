import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';
import { MediaService } from '../../../core/media.service';
import { AdminDataService } from './admin-data.service';
import { CrudConfig } from './crud-config';

type Row = Record<string, unknown>;

/**
 * Generic table + dialog-form CRUD screen. The target table, list columns and
 * form fields come from route data (see crud-config.ts / admin.routes.ts).
 */
@Component({
  standalone: true,
  selector: 'app-admin-crud',
  imports: [
    CommonModule, FormsModule, ReactiveFormsModule, TableModule, DialogModule, ButtonModule,
    InputNumberModule, SelectModule, ToggleSwitchModule, TagModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card-panel admin-table">
      <div class="flex items-center justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h2 class="card-heading !mb-0">{{ config.title }}</h2>
        </div>
        <button type="button" class="btn-send btn-send--sm !w-auto" (click)="openNew()">
          <i class="pi pi-plus"></i>
          <span>Add</span>
        </button>
      </div>

      <p-table [value]="rows()" [loading]="loading()" dataKey="id" size="small" stripedRows>
        <ng-template #header>
          <tr>
            @for (col of config.listColumns; track col.key) {
              <th>{{ col.label }}</th>
            }
            <th style="width: 7rem">Actions</th>
          </tr>
        </ng-template>
        <ng-template #body let-row>
          <tr>
            @for (col of config.listColumns; track col.key) {
              <td class="max-w-[22rem] truncate">
                @if (row[col.key] === true || row[col.key] === false) {
                  <p-tag [severity]="row[col.key] ? 'success' : 'secondary'" [value]="row[col.key] ? 'Yes' : 'No'" />
                } @else {
                  {{ row[col.key] }}
                }
              </td>
            }
            <td>
              <div class="flex gap-2">
                <p-button icon="pi pi-pencil" severity="secondary" size="small" [text]="true" (onClick)="openEdit(row)" ariaLabel="Edit" />
                <p-button icon="pi pi-trash" severity="danger" size="small" [text]="true" (onClick)="confirmDelete(row)" ariaLabel="Delete" />
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr><td [attr.colspan]="config.listColumns.length + 1" class="text-center py-8">No rows yet.</td></tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog
      [(visible)]="dialogVisible"
      [modal]="true"
      [style]="{ width: '34rem', maxWidth: '95vw' }"
      [header]="editingId ? 'Edit ' + config.title : 'New ' + config.title"
      styleClass="admin-dialog"
      (onHide)="form = null"
    >
      @if (form; as f) {
        <form [formGroup]="f" (ngSubmit)="save()" class="admin-form flex flex-col gap-4 pt-1">
          @for (field of config.fields; track field.key) {
            <div class="form-group">
              <label [for]="field.key" class="form-label">{{ field.label }}{{ field.required ? ' *' : '' }}</label>

              @switch (field.type) {
                @case ('text') {
                  <input [id]="field.key" [formControlName]="field.key" class="form-input" />
                }
                @case ('textarea') {
                  <textarea [id]="field.key" [formControlName]="field.key" class="form-textarea" rows="4"></textarea>
                }
                @case ('lines') {
                  <textarea [id]="field.key" [formControlName]="field.key" class="form-textarea font-mono text-sm" rows="5"></textarea>
                }
                @case ('images') {
                  <div class="flex flex-col gap-3">
                    @if (imageList(field.key).length) {
                      <div class="flex flex-wrap gap-2">
                        @for (img of imageList(field.key); track img; let i = $index) {
                          <div class="relative group w-20 h-20 rounded-lg overflow-hidden border border-white/15 bg-black/20">
                            <img [src]="img" [alt]="'Image ' + (i + 1)" class="w-full h-full object-cover" />
                            <button
                              type="button"
                              class="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white text-xs flex items-center justify-center opacity-90 hover:opacity-100"
                              (click)="removeImage(field.key, i)"
                              aria-label="Remove image"
                            >
                              <i class="pi pi-times text-[10px]"></i>
                            </button>
                          </div>
                        }
                      </div>
                    }

                    <input
                      #imageInput
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/svg+xml"
                      class="hidden"
                      multiple
                      (change)="onImagesSelected(field.key, $event)"
                    />
                    <button
                      type="button"
                      class="btn-send btn-send--sm !w-auto self-start"
                      [disabled]="uploadingImages()"
                      (click)="imageInput.click()"
                    >
                      @if (uploadingImages()) {
                        <span class="flex items-center gap-2">
                          <span class="loading-spinner"></span>
                          <span>Uploading...</span>
                        </span>
                      } @else {
                        <span class="flex items-center gap-2">
                          <i class="pi pi-upload"></i>
                          <span>Upload images</span>
                        </span>
                      }
                    </button>

                    <textarea
                      [id]="field.key"
                      class="form-textarea font-mono text-sm"
                      rows="3"
                      [ngModel]="imageList(field.key).join('\n')"
                      (ngModelChange)="setImageUrls(field.key, $event)"
                      [ngModelOptions]="{ standalone: true }"
                      placeholder="One URL per line, e.g. /assets/work-1.svg"
                    ></textarea>
                  </div>
                }
                @case ('number') {
                  <p-inputnumber [inputId]="field.key" [formControlName]="field.key" [showButtons]="true" styleClass="w-full" />
                }
                @case ('select') {
                  <p-select [inputId]="field.key" [formControlName]="field.key" [options]="field.options" styleClass="w-full" />
                }
                @case ('toggle') {
                  <p-toggleswitch [inputId]="field.key" [formControlName]="field.key" />
                }
              }

              @if (field.hint) {
                <small class="form-hint">{{ field.hint }}</small>
              }
              @if (f.controls[field.key].invalid && f.controls[field.key].touched) {
                <div class="field-error">{{ field.label }} is required.</div>
              }
            </div>
          }

          <div class="flex justify-end gap-3 mt-2">
            <button type="button" class="text-sm font-medium text-white/60 hover:text-white px-4 py-2 transition-colors" (click)="dialogVisible = false">
              Cancel
            </button>
            <button class="btn-send btn-send--sm !w-auto" type="submit" [disabled]="saving() || uploadingImages()" [class.loading]="saving()">
              @if (!saving()) {
                <span>Save</span>
              } @else {
                <span class="flex items-center gap-2">
                  <span class="loading-spinner"></span>
                  <span>Saving...</span>
                </span>
              }
            </button>
          </div>
        </form>
      }
    </p-dialog>
  `,
})
export class AdminCrudComponent implements OnInit {
  private readonly adminData = inject(AdminDataService);
  private readonly confirm = inject(ConfirmationService);
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly media = inject(MediaService);
  private readonly toast = inject(MessageService);

  config!: CrudConfig;

  readonly rows = signal<Row[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly uploadingImages = signal(false);

  dialogVisible = false;
  editingId: string | null = null;
  /** Stable id used for Storage paths when creating a new project. */
  private draftId: string | null = null;
  form: FormGroup | null = null;

  ngOnInit(): void {
    // config via route data; component instance is reused between crud routes
    this.route.data.subscribe(data => {
      this.config = data['config'] as CrudConfig;
      this.dialogVisible = false;
      this.load();
    });
  }

  private async load() {
    this.loading.set(true);
    this.rows.set(await this.adminData.list<Row>(this.config.table));
    this.loading.set(false);
  }

  private buildForm(row?: Row): FormGroup {
    const group: Record<string, unknown> = {};
    for (const field of this.config.fields) {
      const raw = row?.[field.key];
      let value: unknown;
      switch (field.type) {
        case 'lines':
          value = Array.isArray(raw) ? raw.join('\n') : '';
          break;
        case 'images':
          value = Array.isArray(raw) ? [...raw] : [];
          break;
        case 'number':
          value = raw ?? 0;
          break;
        case 'toggle':
          value = raw ?? true;
          break;
        default:
          value = raw ?? '';
      }
      group[field.key] = field.required ? [value, Validators.required] : [value];
    }
    return this.fb.group(group);
  }

  openNew() {
    this.editingId = null;
    this.draftId = crypto.randomUUID();
    this.form = this.buildForm();
    this.dialogVisible = true;
  }

  openEdit(row: Row) {
    this.editingId = row['id'] as string;
    this.draftId = null;
    this.form = this.buildForm(row);
    this.dialogVisible = true;
  }

  imageList(key: string): string[] {
    const value = this.form?.get(key)?.value;
    return Array.isArray(value) ? value : [];
  }

  setImageUrls(key: string, text: string) {
    const urls = text.split('\n').map(s => s.trim()).filter(Boolean);
    this.form?.get(key)?.setValue(urls);
  }

  async onImagesSelected(key: string, event: Event) {
    const input = event.target as HTMLInputElement;
    const files = [...(input.files ?? [])];
    input.value = '';
    if (!files.length || !this.form) return;

    const folderId = this.editingId ?? this.draftId ?? crypto.randomUUID();
    if (!this.editingId && !this.draftId) this.draftId = folderId;

    this.uploadingImages.set(true);
    try {
      const uploaded: string[] = [];
      for (const file of files) {
        const path = this.media.buildPath(`projects/${folderId}`, file);
        const { publicUrl } = await this.media.upload(path, file, 'image');
        uploaded.push(publicUrl);
      }
      const current = this.imageList(key);
      this.form.get(key)?.setValue([...current, ...uploaded]);
      this.toast.add({
        severity: 'success',
        summary: uploaded.length === 1 ? 'Image uploaded' : `${uploaded.length} images uploaded`,
      });
    } catch (err) {
      this.toast.add({
        severity: 'error',
        summary: 'Upload failed',
        detail: err instanceof Error ? err.message : 'Could not upload images',
      });
    } finally {
      this.uploadingImages.set(false);
    }
  }

  async removeImage(key: string, index: number) {
    const current = this.imageList(key);
    const [removed] = current.splice(index, 1);
    this.form?.get(key)?.setValue([...current]);

    const path = this.media.pathFromPublicUrl(removed);
    if (path) {
      await this.media.remove([path]).catch(() => undefined);
    }
  }

  async save() {
    if (!this.form) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const value = this.form.getRawValue() as Row;
    const row: Row = {};
    for (const field of this.config.fields) {
      const v = value[field.key];
      if (field.type === 'lines') {
        row[field.key] = String(v ?? '').split('\n').map(s => s.trim()).filter(Boolean);
      } else if (field.type === 'images') {
        row[field.key] = Array.isArray(v) ? v : [];
      } else {
        row[field.key] = v === '' ? null : v;
      }
    }

    if (this.editingId) {
      row['id'] = this.editingId;
    } else if (this.draftId && this.config.fields.some(f => f.type === 'images')) {
      // Keep Storage folder and DB id aligned for new projects with uploads.
      row['id'] = this.draftId;
    }

    this.saving.set(true);
    const ok = await this.adminData.upsert(this.config.table, row);
    this.saving.set(false);
    if (ok) {
      this.dialogVisible = false;
      await this.load();
    }
  }

  confirmDelete(row: Row) {
    this.confirm.confirm({
      message: 'Delete this row? This cannot be undone.',
      header: 'Confirm delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger', label: 'Delete' },
      rejectButtonProps: { severity: 'secondary', text: true, label: 'Cancel' },
      accept: async () => {
        if (await this.adminData.remove(this.config.table, row['id'] as string)) {
          const images = row['images'];
          if (Array.isArray(images)) {
            const paths = images
              .map(url => this.media.pathFromPublicUrl(typeof url === 'string' ? url : null))
              .filter((p): p is string => !!p);
            if (paths.length) {
              await this.media.remove(paths).catch(() => undefined);
            }
          }
          await this.load();
        }
      },
    });
  }
}
