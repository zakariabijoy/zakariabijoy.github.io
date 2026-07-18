import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SelectModule } from 'primeng/select';
import { BlogDataService } from '../../../core/blog-data.service';
import { BlogComment, BlogCommentStatus } from '../../../core/models';

@Component({
  standalone: true,
  selector: 'app-blog-comments',
  imports: [CommonModule, FormsModule, TableModule, TagModule, SelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card-panel">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 class="card-heading">Comments</h2>
          <p class="card-subtitle">Moderate guest comments before they appear publicly.</p>
        </div>
        <div class="flex flex-wrap gap-3 items-center">
          <span class="text-xs text-white/50">
            Pending: {{ pendingCount() }} · Approved: {{ approvedCount() }} · Rejected: {{ rejectedCount() }}
          </span>
          <p-select
            [options]="filterOptions"
            [(ngModel)]="filter"
            (ngModelChange)="reload()"
            optionLabel="label"
            optionValue="value"
            placeholder="Filter"
            styleClass="w-40"
          />
        </div>
      </div>

      @if (loading()) {
        <p class="text-sm text-white/50">Loading…</p>
      } @else if (!comments().length) {
        <p class="text-sm text-white/50">No comments in this filter.</p>
      } @else {
        <p-table [value]="comments()" [paginator]="comments().length > 15" [rows]="15" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Author</th>
              <th>Comment</th>
              <th>Status</th>
              <th>Date</th>
              <th style="width: 12rem"></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-c>
            <tr>
              <td>
                <div class="font-medium">{{ c.author_name }}</div>
                <div class="text-xs text-white/40">{{ c.author_email }}</div>
                <div class="text-xs text-white/30 mt-1">post: {{ c.post_id | slice: 0:8 }}…</div>
              </td>
              <td class="text-sm whitespace-pre-wrap max-w-md">{{ c.body }}</td>
              <td><p-tag [value]="c.status" [severity]="severity(c.status)" /></td>
              <td class="text-sm text-white/60">{{ c.created_at | date: 'medium' }}</td>
              <td>
                <div class="flex flex-wrap gap-2 justify-end">
                  @if (c.status !== 'approved') {
                    <button type="button" class="text-brand-400 text-sm hover:underline" (click)="setStatus(c, 'approved')">
                      Approve
                    </button>
                  }
                  @if (c.status !== 'rejected') {
                    <button type="button" class="text-amber-400 text-sm hover:underline" (click)="setStatus(c, 'rejected')">
                      Reject
                    </button>
                  }
                  <button type="button" class="text-red-400 text-sm hover:underline" (click)="confirmDelete(c)">
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          </ng-template>
        </p-table>
      }
    </div>
  `,
})
export class BlogCommentsComponent implements OnInit {
  private readonly blog = inject(BlogDataService);
  private readonly messages = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly comments = signal<BlogComment[]>([]);
  readonly all = signal<BlogComment[]>([]);
  readonly loading = signal(true);

  filter: BlogCommentStatus | 'all' = 'pending';

  readonly filterOptions = [
    { label: 'Pending', value: 'pending' as const },
    { label: 'Approved', value: 'approved' as const },
    { label: 'Rejected', value: 'rejected' as const },
    { label: 'All', value: 'all' as const },
  ];

  ngOnInit(): void {
    void this.reload();
  }

  pendingCount(): number {
    return this.all().filter((c) => c.status === 'pending').length;
  }
  approvedCount(): number {
    return this.all().filter((c) => c.status === 'approved').length;
  }
  rejectedCount(): number {
    return this.all().filter((c) => c.status === 'rejected').length;
  }

  severity(status: string): 'success' | 'warn' | 'danger' | 'secondary' {
    switch (status) {
      case 'approved':
        return 'success';
      case 'pending':
        return 'warn';
      case 'rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  }

  async reload(): Promise<void> {
    this.loading.set(true);
    try {
      const all = await this.blog.adminListComments();
      this.all.set(all);
      this.comments.set(
        this.filter === 'all' ? all : all.filter((c) => c.status === this.filter),
      );
    } catch (e) {
      this.messages.add({
        severity: 'error',
        summary: 'Failed to load comments',
        detail: e instanceof Error ? e.message : 'Unknown error',
      });
    } finally {
      this.loading.set(false);
    }
  }

  async setStatus(comment: BlogComment, status: BlogCommentStatus): Promise<void> {
    if (!comment.id) return;
    try {
      await this.blog.adminUpdateCommentStatus(comment.id, status);
      this.messages.add({ severity: 'success', summary: `Marked ${status}` });
      await this.reload();
    } catch (e) {
      this.messages.add({
        severity: 'error',
        summary: 'Update failed',
        detail: e instanceof Error ? e.message : 'Unknown error',
      });
    }
  }

  confirmDelete(comment: BlogComment): void {
    this.confirm.confirm({
      message: 'Permanently delete this comment?',
      header: 'Delete comment',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => void this.remove(comment),
    });
  }

  private async remove(comment: BlogComment): Promise<void> {
    if (!comment.id) return;
    try {
      await this.blog.adminDeleteComment(comment.id);
      this.messages.add({ severity: 'success', summary: 'Comment deleted' });
      await this.reload();
    } catch (e) {
      this.messages.add({
        severity: 'error',
        summary: 'Delete failed',
        detail: e instanceof Error ? e.message : 'Unknown error',
      });
    }
  }
}
