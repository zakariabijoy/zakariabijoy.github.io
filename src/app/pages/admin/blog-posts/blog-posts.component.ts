import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { BlogDataService } from '../../../core/blog-data.service';
import { BlogPost } from '../../../core/models';

@Component({
  standalone: true,
  selector: 'app-blog-posts',
  imports: [CommonModule, RouterLink, TableModule, TagModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card-panel">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 class="card-heading">Blog posts</h2>
          <p class="card-subtitle">Create, edit, and publish rich-text articles.</p>
        </div>
        <a routerLink="/admin/posts/new" class="btn-send btn-send--sm !w-auto inline-flex items-center gap-2">
          <i class="pi pi-plus"></i>
          <span>New post</span>
        </a>
      </div>

      @if (loading()) {
        <p class="text-sm text-white/50">Loading…</p>
      } @else if (!posts().length) {
        <p class="text-sm text-white/50">No posts yet. Create your first article.</p>
      } @else {
        <p-table [value]="posts()" [paginator]="posts().length > 10" [rows]="10" styleClass="p-datatable-sm">
          <ng-template pTemplate="header">
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Published</th>
              <th>Updated</th>
              <th style="width: 8rem"></th>
            </tr>
          </ng-template>
          <ng-template pTemplate="body" let-post>
            <tr>
              <td>
                <div class="font-medium">{{ post.title }}</div>
                <div class="text-xs text-white/40">/blog/{{ post.slug }}</div>
              </td>
              <td>
                <p-tag [value]="post.status" [severity]="severity(post.status)" />
              </td>
              <td class="text-sm text-white/60">
                {{ post.published_at ? (post.published_at | date: 'mediumDate') : '—' }}
              </td>
              <td class="text-sm text-white/60">
                {{ post.updated_at ? (post.updated_at | date: 'mediumDate') : '—' }}
              </td>
              <td>
                <div class="flex gap-2 justify-end">
                  <a [routerLink]="['/admin/posts', post.id]" class="text-brand-400 text-sm hover:underline">Edit</a>
                  <button type="button" class="text-red-400 text-sm hover:underline" (click)="confirmDelete(post)">
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
export class BlogPostsComponent implements OnInit {
  private readonly blog = inject(BlogDataService);
  private readonly messages = inject(MessageService);
  private readonly confirm = inject(ConfirmationService);

  readonly posts = signal<BlogPost[]>([]);
  readonly loading = signal(true);

  ngOnInit(): void {
    void this.reload();
  }

  async reload(): Promise<void> {
    this.loading.set(true);
    try {
      this.posts.set(await this.blog.adminListPosts());
    } catch (e) {
      this.messages.add({
        severity: 'error',
        summary: 'Failed to load posts',
        detail: e instanceof Error ? e.message : 'Unknown error',
      });
    } finally {
      this.loading.set(false);
    }
  }

  severity(status: string): 'success' | 'warn' | 'secondary' | 'info' {
    switch (status) {
      case 'published':
        return 'success';
      case 'scheduled':
        return 'info';
      case 'draft':
        return 'secondary';
      default:
        return 'warn';
    }
  }

  confirmDelete(post: BlogPost): void {
    this.confirm.confirm({
      message: `Delete “${post.title}”? This cannot be undone.`,
      header: 'Delete post',
      icon: 'pi pi-exclamation-triangle',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => void this.remove(post),
    });
  }

  private async remove(post: BlogPost): Promise<void> {
    if (!post.id) return;
    try {
      await this.blog.adminDeletePost(post.id);
      this.messages.add({ severity: 'success', summary: 'Post deleted' });
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
