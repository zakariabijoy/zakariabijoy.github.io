import { provideZonelessChangeDetection } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { SeoService } from './seo.service';

describe('SeoService', () => {
  let service: SeoService;
  let title: Title;
  let meta: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideZonelessChangeDetection()],
    });
    service = TestBed.inject(SeoService);
    title = TestBed.inject(Title);
    meta = TestBed.inject(Meta);
  });

  it('sets document title and description', () => {
    service.set({
      title: 'Test Post | Blog',
      description: 'A test description',
      path: '/blog/test-post',
      type: 'article',
    });

    expect(title.getTitle()).toBe('Test Post | Blog');
    expect(meta.getTag('name="description"')?.content).toBe('A test description');
    expect(meta.getTag('property="og:type"')?.content).toBe('article');
  });
});
