import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { BlogDataService } from '../../core/blog-data.service';
import { BlogPost, BlogTag } from '../../core/models';
import { SeoService } from '../../core/seo.service';

@Component({
  selector: 'app-blog-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './blog-list.component.html',
  styleUrls: ['./blog-list.component.scss'],
})
export class BlogListComponent implements OnInit {
  private readonly blog = inject(BlogDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  readonly posts = signal<BlogPost[]>([]);
  readonly tags = signal<BlogTag[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly pageSize = 9;
  readonly loading = signal(true);
  readonly search = signal('');
  readonly activeTag = signal<string | null>(null);

  readonly Math = Math;

  ngOnInit(): void {
    this.seo.set({
      title: 'Blog | Md Zakaria Masud',
      description:
        'Articles on .NET, Angular, software architecture, and Agentic AI by Md Zakaria Masud.',
      path: '/blog',
      type: 'website',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: 'Md Zakaria Masud Blog',
        url: 'https://zakariabijoy.github.io/blog',
        author: {
          '@type': 'Person',
          name: 'Md Zakaria Masud',
        },
      },
    });

    this.blog.listTags().then((tags) => this.tags.set(tags));

    combineLatest([this.route.paramMap, this.route.queryParamMap]).subscribe(
      ([params, qp]) => {
        const isTagRoute = (this.route.snapshot.routeConfig?.path || '').startsWith('tag');
        this.activeTag.set(isTagRoute ? params.get('slug') : null);
        this.search.set(qp.get('q') || '');
        const p = Number(qp.get('page') || '1');
        this.page.set(Number.isFinite(p) && p > 0 ? p : 1);
        void this.load();
      },
    );
  }

  async load(): Promise<void> {
    this.loading.set(true);
    const result = await this.blog.listPublished({
      page: this.page(),
      pageSize: this.pageSize,
      search: this.search() || undefined,
      tagSlug: this.activeTag() || undefined,
    });
    this.posts.set(result.posts);
    this.total.set(result.total);
    this.loading.set(false);
  }

  onSearchSubmit(event: Event): void {
    event.preventDefault();
    const value = this.search().trim();
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: value || null, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  clearSearch(): void {
    this.search.set('');
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: null, page: 1 },
      queryParamsHandling: 'merge',
    });
  }

  goPage(next: number): void {
    const max = Math.max(1, Math.ceil(this.total() / this.pageSize));
    const page = Math.min(max, Math.max(1, next));
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { page },
      queryParamsHandling: 'merge',
    });
  }

  featured(): BlogPost | null {
    return this.page() === 1 && !this.search() && !this.activeTag()
      ? this.posts()[0] ?? null
      : null;
  }

  gridPosts(): BlogPost[] {
    const featured = this.featured();
    return featured ? this.posts().slice(1) : this.posts();
  }
}
