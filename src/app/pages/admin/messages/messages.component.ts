import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ConfirmationService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { AdminDataService } from '../shared/admin-data.service';
import { ContactMessage } from '../../../core/models';

@Component({
  standalone: true,
  selector: 'app-admin-messages',
  imports: [CommonModule, DatePipe, TableModule, ButtonModule, TagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="glass-card p-6">
      <div class="flex items-center justify-between mb-6">
        <h2 class="text-2xl font-bold">Messages</h2>
        @if (unreadCount() > 0) {
          <p-tag severity="info" [value]="unreadCount() + ' unread'" />
        }
      </div>

      <p-table [value]="messages()" [loading]="loading()" dataKey="id" size="small"
               [expandedRowKeys]="expandedRows" stripedRows>
        <ng-template #header>
          <tr>
            <th style="width: 3rem"></th>
            <th>From</th>
            <th>Email</th>
            <th>Received</th>
            <th>Status</th>
            <th style="width: 8rem">Actions</th>
          </tr>
        </ng-template>
        <ng-template #body let-msg let-expanded="expanded">
          <tr [class.font-semibold]="!msg.is_read">
            <td>
              <p-button type="button" [pRowToggler]="msg" [text]="true" size="small"
                        [icon]="expanded ? 'pi pi-chevron-down' : 'pi pi-chevron-right'" ariaLabel="Toggle message" />
            </td>
            <td>{{ msg.first_name }} {{ msg.last_name }}</td>
            <td><a [href]="'mailto:' + msg.email" class="text-brand-400 hover:underline">{{ msg.email }}</a></td>
            <td>{{ msg.created_at | date: 'MMM d, y, h:mm a' }}</td>
            <td>
              <p-tag [severity]="msg.is_read ? 'secondary' : 'info'" [value]="msg.is_read ? 'Read' : 'New'" />
            </td>
            <td>
              <div class="flex gap-2">
                <p-button [icon]="msg.is_read ? 'pi pi-envelope' : 'pi pi-check'" severity="secondary" size="small" [text]="true"
                          (onClick)="toggleRead(msg)" [ariaLabel]="msg.is_read ? 'Mark unread' : 'Mark read'" />
                <p-button icon="pi pi-trash" severity="danger" size="small" [text]="true"
                          (onClick)="confirmDelete(msg)" ariaLabel="Delete" />
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template #expandedrow let-msg>
          <tr>
            <td colspan="6">
              <div class="p-4 text-sm leading-relaxed whitespace-pre-wrap bg-white/5 rounded-lg m-2">
                @if (msg.phone) {
                  <div class="text-gray-400 mb-2">Phone: {{ msg.phone }}</div>
                }
                {{ msg.message }}
              </div>
            </td>
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr><td colspan="6" class="text-center py-8 text-gray-400">No messages yet.</td></tr>
        </ng-template>
      </p-table>
    </div>
  `,
})
export class MessagesComponent implements OnInit {
  private readonly adminData = inject(AdminDataService);
  private readonly confirm = inject(ConfirmationService);

  readonly messages = signal<ContactMessage[]>([]);
  readonly loading = signal(false);
  readonly unreadCount = signal(0);

  expandedRows: Record<string, boolean> = {};

  async ngOnInit() {
    await this.load();
  }

  private async load() {
    this.loading.set(true);
    const rows = await this.adminData.list<ContactMessage>('contact_messages', 'created_at');
    rows.reverse(); // newest first
    this.messages.set(rows);
    this.unreadCount.set(rows.filter(m => !m.is_read).length);
    this.loading.set(false);
  }

  async toggleRead(msg: ContactMessage) {
    if (!msg.id) return;
    if (await this.adminData.update('contact_messages', msg.id, { is_read: !msg.is_read })) {
      await this.load();
    }
  }

  confirmDelete(msg: ContactMessage) {
    this.confirm.confirm({
      message: 'Delete this message? This cannot be undone.',
      header: 'Confirm delete',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonProps: { severity: 'danger', label: 'Delete' },
      rejectButtonProps: { severity: 'secondary', text: true, label: 'Cancel' },
      accept: async () => {
        if (msg.id && await this.adminData.remove('contact_messages', msg.id)) {
          await this.load();
        }
      },
    });
  }
}
