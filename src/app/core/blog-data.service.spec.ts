import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { BlogDataService } from './blog-data.service';

describe('BlogDataService', () => {
  let service: BlogDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(BlogDataService);
  });

  it('falls back to local posts when Supabase is unavailable', async () => {
    const result = await service.listPublished({ page: 1, pageSize: 9 });
    expect(result.posts.length).toBeGreaterThan(0);
    expect(result.posts.every((p) => p.status === 'published')).toBeTrue();
  });

  it('filters fallback posts by search', async () => {
    const result = await service.listPublished({ search: 'signals', page: 1, pageSize: 9 });
    expect(result.posts.length).toBeGreaterThan(0);
    expect(result.posts.some((p) => /signal/i.test(p.title))).toBeTrue();
  });

  it('resolves a known fallback slug', async () => {
    const post = await service.getBySlug('angular-signals-for-portfolio-scale-uis');
    expect(post).toBeTruthy();
    expect(post?.title).toContain('Angular');
  });
});
