import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { BlogDataService } from '../../core/blog-data.service';
import {
  BlogComment,
  BlogPost,
  BlogReactionSummary,
  BlogReactionType,
} from '../../core/models';
import { TocHeading, enrichHeadings } from '../../core/blog-utils';
import { SeoService } from '../../core/seo.service';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'app-blog-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './blog-detail.component.html',
  styleUrls: ['./blog-detail.component.scss'],
})
export class BlogDetailComponent implements OnInit, OnDestroy {
  private readonly blog = inject(BlogDataService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);
  private readonly sanitizer = inject(DomSanitizer);
  private readonly fb = inject(FormBuilder);

  readonly post = signal<BlogPost | null>(null);
  readonly related = signal<BlogPost[]>([]);
  readonly comments = signal<BlogComment[]>([]);
  readonly reactions = signal<BlogReactionSummary>({
    like: 0,
    insightful: 0,
    celebrate: 0,
    mine: [],
  });
  readonly toc = signal<TocHeading[]>([]);
  readonly contentHtml = signal<SafeHtml | null>(null);
  readonly loading = signal(true);
  readonly notFound = signal(false);
  readonly commentSubmitting = signal(false);
  readonly commentMessage = signal<string | null>(null);
  readonly commentError = signal<string | null>(null);
  readonly reacting = signal(false);

  readonly reactionTypes: { type: BlogReactionType; label: string; icon: string }[] = [
    { type: 'like', label: 'Like', icon: 'pi pi-thumbs-up' },
    { type: 'insightful', label: 'Insightful', icon: 'pi pi-lightbulb' },
    { type: 'celebrate', label: 'Celebrate', icon: 'pi pi-star' },
  ];

  readonly commentForm = this.fb.nonNullable.group({
    authorName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(80)]],
    authorEmail: ['', [Validators.required, Validators.email]],
    body: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(2000)]],
    website: [''], // honeypot
  });

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const slug = params.get('slug');
      if (slug) void this.load(slug);
    });
  }

  ngOnDestroy(): void {
    this.seo.resetDefault();
  }

  async load(slug: string): Promise<void> {
    this.loading.set(true);
    this.notFound.set(false);
    this.commentMessage.set(null);
    this.commentError.set(null);

    const post = await this.blog.getBySlug(slug);
    if (!post) {
      this.notFound.set(true);
      this.loading.set(false);
      this.post.set(null);
      return;
    }

    const { html, toc } = enrichHeadings(post.content_html || '');
    this.post.set(post);
    this.toc.set(toc);
    this.contentHtml.set(this.sanitizer.bypassSecurityTrustHtml(html));

    const title = post.seo_title || `${post.title} | Md Zakaria Masud`;
    const description = post.seo_description || post.excerpt || post.title;
    this.seo.set({
      title,
      description,
      path: `/blog/${post.slug}`,
      image: post.cover_image_url,
      type: 'article',
      publishedTime: post.published_at,
      jsonLd: {
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'BlogPosting',
            headline: post.title,
            description,
            image: post.cover_image_url || undefined,
            datePublished: post.published_at,
            dateModified: post.updated_at || post.published_at,
            author: {
              '@type': 'Person',
              name: 'Md Zakaria Masud',
              url: 'https://zakariabijoy.github.io/',
            },
            mainEntityOfPage: `https://zakariabijoy.github.io/blog/${post.slug}`,
          },
          {
            '@type': 'BreadcrumbList',
            itemListElement: [
              { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://zakariabijoy.github.io/' },
              { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://zakariabijoy.github.io/blog' },
              { '@type': 'ListItem', position: 3, name: post.title },
            ],
          },
        ],
      },
    });

    this.loading.set(false);

    if (post.id) {
      const [related, comments, reactions] = await Promise.all([
        this.blog.listRelated(post),
        this.blog.listApprovedComments(post.id),
        this.blog.getReactionSummary(post.id),
      ]);
      this.related.set(related);
      this.comments.set(comments);
      this.reactions.set(reactions);
    }
  }

  async toggleReaction(type: BlogReactionType): Promise<void> {
    const post = this.post();
    if (!post?.id || post.id.startsWith('fallback') || this.reacting()) return;
    this.reacting.set(true);
    try {
      const summary = await this.blog.toggleReaction(post.id, type);
      this.reactions.set(summary);
    } finally {
      this.reacting.set(false);
    }
  }

  isMine(type: BlogReactionType): boolean {
    return this.reactions().mine.includes(type);
  }

  async submitComment(): Promise<void> {
    const post = this.post();
    if (!post?.id || this.commentForm.invalid || this.commentSubmitting()) return;

    this.commentSubmitting.set(true);
    this.commentError.set(null);
    this.commentMessage.set(null);

    const value = this.commentForm.getRawValue();
    const result = await this.blog.submitComment({
      postId: post.id,
      authorName: value.authorName,
      authorEmail: value.authorEmail,
      body: value.body,
      website: value.website,
    });

    this.commentSubmitting.set(false);
    if (result.ok) {
      this.commentMessage.set(result.message);
      this.commentForm.reset({ authorName: '', authorEmail: '', body: '', website: '' });
    } else {
      this.commentError.set(result.message);
    }
  }

  shareUrl(): string {
    const post = this.post();
    return post ? `https://zakariabijoy.github.io/blog/${post.slug}` : '';
  }

  twitterShareUrl(): string {
    const post = this.post();
    if (!post) return '#';
    return (
      'https://twitter.com/intent/tweet?url=' +
      encodeURIComponent(this.shareUrl()) +
      '&text=' +
      encodeURIComponent(post.title)
    );
  }

  linkedInShareUrl(): string {
    return (
      'https://www.linkedin.com/sharing/share-offsite/?url=' +
      encodeURIComponent(this.shareUrl())
    );
  }

  async copyLink(): Promise<void> {
    try {
      await navigator.clipboard.writeText(this.shareUrl());
    } catch {
      /* ignore */
    }
  }

  goHome(): void {
    this.router.navigate(['/blog']);
  }
}
