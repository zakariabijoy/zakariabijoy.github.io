import { Injectable, inject } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { DOCUMENT } from '@angular/common';

export interface SeoInput {
  title: string;
  description: string;
  path: string;
  image?: string | null;
  type?: 'website' | 'article';
  publishedTime?: string | null;
  jsonLd?: Record<string, unknown> | null;
}

const SITE = 'https://zakariabijoy.github.io';
const DEFAULT_IMAGE = `${SITE}/assets/profile.jpg`;
const DEFAULT_DESCRIPTION =
  'Md Zakaria Masud — Senior Software Engineer specializing in .NET, Angular, cloud-native microservices, and Agentic AI.';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly doc = inject(DOCUMENT);

  set(input: SeoInput): void {
    const url = `${SITE}${input.path.startsWith('/') ? input.path : `/${input.path}`}`;
    const description = input.description || DEFAULT_DESCRIPTION;
    const image = input.image || DEFAULT_IMAGE;
    const type = input.type || 'website';

    this.title.setTitle(input.title);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:type', content: type });
    this.meta.updateTag({ property: 'og:title', content: input.title });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: url });
    this.meta.updateTag({ property: 'og:image', content: image });
    this.meta.updateTag({ name: 'twitter:card', content: image ? 'summary_large_image' : 'summary' });
    this.meta.updateTag({ name: 'twitter:title', content: input.title });
    this.meta.updateTag({ name: 'twitter:description', content: description });
    this.meta.updateTag({ name: 'twitter:image', content: image });

    if (input.publishedTime) {
      this.meta.updateTag({ property: 'article:published_time', content: input.publishedTime });
    }

    this.setCanonical(url);
    this.setJsonLd(input.jsonLd ?? null);
  }

  resetDefault(): void {
    this.set({
      title: 'Md Zakaria Masud — Senior Software Engineer',
      description: DEFAULT_DESCRIPTION,
      path: '/',
      type: 'website',
      jsonLd: null,
    });
  }

  private setCanonical(url: string): void {
    let link = this.doc.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
    if (!link) {
      link = this.doc.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.doc.head.appendChild(link);
    }
    link.setAttribute('href', url);
  }

  private setJsonLd(data: Record<string, unknown> | null): void {
    const id = 'blog-jsonld';
    const existing = this.doc.getElementById(id);
    if (existing) existing.remove();
    if (!data) return;

    const script = this.doc.createElement('script');
    script.id = id;
    script.type = 'application/ld+json';
    script.text = JSON.stringify(data);
    this.doc.head.appendChild(script);
  }
}
