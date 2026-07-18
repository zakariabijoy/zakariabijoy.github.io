import {
  estimateReadingTimeMinutes,
  htmlToPlainText,
  sanitizeBlogHtml,
  slugify,
} from './blog-utils';

describe('blog-utils', () => {
  describe('slugify', () => {
    it('creates URL-safe slugs', () => {
      expect(slugify('Hello World!')).toBe('hello-world');
      expect(slugify('  .NET & Angular  ')).toBe('net-angular');
    });

    it('falls back when empty', () => {
      expect(slugify('@@@')).toBe('post');
    });
  });

  describe('htmlToPlainText', () => {
    it('strips tags', () => {
      expect(htmlToPlainText('<p>Hello <strong>world</strong></p>')).toContain('Hello');
      expect(htmlToPlainText('<p>Hello <strong>world</strong></p>')).toContain('world');
      expect(htmlToPlainText('<p>Hello <strong>world</strong></p>')).not.toContain('<');
    });
  });

  describe('estimateReadingTimeMinutes', () => {
    it('returns at least 1', () => {
      expect(estimateReadingTimeMinutes('<p>Hi</p>')).toBe(1);
    });

    it('scales with word count', () => {
      const words = Array.from({ length: 450 }, () => 'word').join(' ');
      expect(estimateReadingTimeMinutes(`<p>${words}</p>`)).toBe(3);
    });
  });

  describe('sanitizeBlogHtml', () => {
    it('removes script tags', () => {
      const dirty = '<p>Safe</p><script>alert(1)</script>';
      const clean = sanitizeBlogHtml(dirty);
      expect(clean).toContain('Safe');
      expect(clean.toLowerCase()).not.toContain('<script');
    });

    it('keeps allowed formatting', () => {
      const dirty = '<h2>Title</h2><p>Hello <strong>there</strong></p><ul><li>One</li></ul>';
      const clean = sanitizeBlogHtml(dirty);
      expect(clean).toContain('<h2>');
      expect(clean).toContain('<strong>');
      expect(clean).toContain('<li>');
    });

    it('strips event handlers', () => {
      const dirty = '<p onclick="alert(1)">Click</p>';
      const clean = sanitizeBlogHtml(dirty);
      expect(clean.toLowerCase()).not.toContain('onclick');
    });
  });
});
