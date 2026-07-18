import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TagModule } from 'primeng/tag';
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
    CommonModule, ReactiveFormsModule, TableModule, DialogModule, ButtonModule,
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
            <button class="btn-send btn-send--sm !w-auto" type="submit" [disabled]="saving()" [class.loading]="saving()">
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

  config!: CrudConfig;

  readonly rows = signal<Row[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);

  dialogVisible = false;
  editingId: string | null = null;
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
    this.form = this.buildForm();
    this.dialogVisible = true;
  }

  openEdit(row: Row) {
    this.editingId = row['id'] as string;
    this.form = this.buildForm(row);
    this.dialogVisible = true;
  }

  async save() {
    if (!this.form) return;
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const value = this.form.getRawValue() as Row;
    const row: Row = {};
    for (const field of this.config.fields) {
      const v = value[field.key];
      row[field.key] = field.type === 'lines'
        ? String(v ?? '').split('\n').map(s => s.trim()).filter(Boolean)
        : (v === '' ? null : v);
    }
    if (this.editingId) row['id'] = this.editingId;

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
          await this.load();
        }
      },
    });
  }
}
