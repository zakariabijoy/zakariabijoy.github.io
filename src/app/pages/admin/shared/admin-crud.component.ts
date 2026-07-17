import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
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
    InputTextModule, TextareaModule, InputNumberModule, SelectModule, ToggleSwitchModule, TagModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="glass-card p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">{{ config.title }}</h2>
        <p-button icon="pi pi-plus" label="Add" (onClick)="openNew()" />
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
          <tr><td [attr.colspan]="config.listColumns.length + 1" class="text-center py-8 text-gray-400">No rows yet.</td></tr>
        </ng-template>
      </p-table>
    </div>

    <p-dialog [(visible)]="dialogVisible" [modal]="true" [style]="{ width: '34rem', maxWidth: '95vw' }"
              [header]="editingId ? 'Edit ' + config.title : 'New ' + config.title" (onHide)="form = null">
      @if (form; as f) {
        <form [formGroup]="f" (ngSubmit)="save()" class="flex flex-col gap-4 pt-2">
          @for (field of config.fields; track field.key) {
            <div class="flex flex-col gap-1">
              <label [for]="field.key" class="text-sm font-medium">{{ field.label }}{{ field.required ? ' *' : '' }}</label>

              @switch (field.type) {
                @case ('text') {
                  <input pInputText [id]="field.key" [formControlName]="field.key" class="w-full" />
                }
                @case ('textarea') {
                  <textarea pTextarea [id]="field.key" [formControlName]="field.key" rows="4" class="w-full"></textarea>
                }
                @case ('lines') {
                  <textarea pTextarea [id]="field.key" [formControlName]="field.key" rows="5" class="w-full font-mono text-sm"></textarea>
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
                <small class="text-gray-400">{{ field.hint }}</small>
              }
              @if (f.controls[field.key].invalid && f.controls[field.key].touched) {
                <small class="text-red-400">{{ field.label }} is required.</small>
              }
            </div>
          }

          <div class="flex justify-end gap-2 mt-2">
            <p-button label="Cancel" severity="secondary" [text]="true" (onClick)="dialogVisible = false" />
            <p-button label="Save" type="submit" [loading]="saving()" />
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
