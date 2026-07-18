import DOMPurify from 'dompurify';

const ALLOWED_TAGS = [
  'p', 'br', 'hr',
  'h1', 'h2', 'h3', 'h4',
  'strong', 'b', 'em', 'i', 'u', 's', 'blockquote',
  'ul', 'ol', 'li',
  'a', 'img',
  'pre', 'code',
  'span', 'div',
  'table', 'thead', 'tbody', 'tr', 'th', 'td',
];

const ALLOWED_ATTR = [
  'href', 'target', 'rel', 'src', 'alt', 'title', 'class', 'id',
  'width', 'height',
];

/** Turn a title into a URL-safe slug. */
export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120) || 'post';
}

/** Strip HTML to plain text for reading-time / excerpts. */
export function htmlToPlainText(html: string): string {
  if (!html) return '';
  if (typeof document !== 'undefined') {
    const el = document.createElement('div');
    el.innerHTML = html;
    return (el.textContent || el.innerText || '').replace(/\s+/g, ' ').trim();
  }
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Approximate reading time (words / 200 wpm, minimum 1). */
export function estimateReadingTimeMinutes(html: string): number {
  const words = htmlToPlainText(html).split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

/**
 * Sanitize rich-text HTML with an explicit allowlist.
 * Safe to call in browser; returns empty string for empty input.
 */
export function sanitizeBlogHtml(dirty: string): string {
  if (!dirty?.trim()) return '';

  if (typeof window === 'undefined') {
    // Build-time / SSR fallback: strip script tags and event handlers crudely.
    return dirty
      .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
      .replace(/\son\w+\s*=\s*(['"]).*?\1/gi, '')
      .replace(/javascript:/gi, '');
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['target'],
  });
}

export interface TocHeading {
  id: string;
  text: string;
  level: number;
}

/**
 * Ensure h2/h3 elements have stable ids and return a table of contents.
 * Mutates a copy of the HTML string (does not touch the live DOM).
 */
export function enrichHeadings(html: string): { html: string; toc: TocHeading[] } {
  const clean = sanitizeBlogHtml(html);
  if (!clean || typeof document === 'undefined') {
    return { html: clean, toc: [] };
  }

  const container = document.createElement('div');
  container.innerHTML = clean;
  const toc: TocHeading[] = [];
  const used = new Set<string>();

  container.querySelectorAll('h2, h3').forEach((heading) => {
    const text = (heading.textContent || '').trim();
    if (!text) return;
    let id = heading.getAttribute('id') || slugify(text);
    let n = 2;
    while (used.has(id)) {
      id = `${slugify(text)}-${n++}`;
    }
    used.add(id);
    heading.setAttribute('id', id);
    toc.push({
      id,
      text,
      level: heading.tagName.toLowerCase() === 'h2' ? 2 : 3,
    });
  });

  // Force safe link targets.
  container.querySelectorAll('a[href]').forEach((anchor) => {
    const href = anchor.getAttribute('href') || '';
    if (/^https?:\/\//i.test(href)) {
      anchor.setAttribute('target', '_blank');
      anchor.setAttribute('rel', 'noopener noreferrer');
    }
  });

  return { html: container.innerHTML, toc };
}

const VISITOR_KEY = 'blog_visitor_key';

/** Stable anonymous visitor id for reactions (localStorage). */
export function getVisitorKey(): string {
  if (typeof localStorage === 'undefined') {
    return `anon-${Math.random().toString(36).slice(2, 12)}`;
  }
  let key = localStorage.getItem(VISITOR_KEY);
  if (!key || key.length < 8) {
    key = `v-${crypto.randomUUID()}`;
    localStorage.setItem(VISITOR_KEY, key);
  }
  return key;
}
