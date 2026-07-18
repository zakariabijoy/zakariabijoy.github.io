-- Sample blog content. Run AFTER blog.sql.
-- Does not truncate portfolio content tables.

truncate public.blog_reactions, public.blog_comments, public.blog_post_tags, public.blog_tags, public.blog_posts cascade;

insert into public.blog_tags (id, name, slug) values
  ('a1111111-1111-4111-8111-111111111111', '.NET', 'dotnet'),
  ('a2222222-2222-4222-8222-222222222222', 'Angular', 'angular'),
  ('a3333333-3333-4333-8333-333333333333', 'Architecture', 'architecture'),
  ('a4444444-4444-4444-8444-444444444444', 'AI', 'ai');

insert into public.blog_posts (
  id, title, slug, excerpt, content_html, cover_image_url,
  status, published_at, seo_title, seo_description, reading_time_minutes
) values
(
  'b1111111-1111-4111-8111-111111111111',
  'Building Clean APIs with .NET and CQRS',
  'building-clean-apis-with-dotnet-and-cqrs',
  'Practical patterns for structuring maintainable ASP.NET Core APIs with CQRS and Clear Architecture boundaries.',
  '<h2 id="why-cqrs">Why CQRS</h2><p>Separating reads from writes keeps complex domains easier to evolve. Commands focus on invariants; queries optimize for presentation.</p><h2 id="project-layout">Project layout</h2><p>Keep <strong>Application</strong>, <strong>Domain</strong>, and <strong>Infrastructure</strong> boundaries explicit. Controllers stay thin and map DTOs to commands or queries.</p><pre><code>public record CreateOrderCommand(Guid CustomerId, IReadOnlyList&lt;LineItem&gt; Items);</code></pre><h2 id="takeaways">Takeaways</h2><ul><li>Start simple — split only when write models diverge from read models.</li><li>Validate on the command boundary.</li><li>Prefer explicit handlers over generic repositories for write paths.</li></ul>',
  null,
  'published',
  now() - interval '7 days',
  'Building Clean APIs with .NET and CQRS | Md Zakaria Masud',
  'Practical CQRS and Clean Architecture patterns for ASP.NET Core APIs.',
  4
),
(
  'b2222222-2222-4222-8222-222222222222',
  'Angular Signals for Portfolio-Scale UIs',
  'angular-signals-for-portfolio-scale-uis',
  'How signals and OnPush change detection keep a content-heavy Angular site snappy without NgRx.',
  '<h2 id="signals-first">Signals first</h2><p>For content sites, a few root services exposing <code>signal()</code> values often beat a full store. Components derive views with <code>computed()</code>.</p><h2 id="fallback-hydration">Fallback hydration</h2><p>Initialize with local fallback data, then overwrite once Supabase responds. The first paint never waits on the network.</p><blockquote><p>Empty states are a UX failure when you already know the content.</p></blockquote><h2 id="when-to-reach-for-more">When to reach for more</h2><ol><li>Cross-cutting optimistic mutations</li><li>Complex normalized entity graphs</li><li>Offline sync queues</li></ol>',
  null,
  'published',
  now() - interval '2 days',
  'Angular Signals for Portfolio-Scale UIs | Md Zakaria Masud',
  'Using Angular signals and OnPush for fast content-driven UIs.',
  3
),
(
  'b3333333-3333-4333-8333-333333333333',
  'Draft: Notes on Agentic AI Integrations',
  'draft-notes-on-agentic-ai-integrations',
  'Internal draft exploring Microsoft Agent Framework patterns.',
  '<p>This draft is not public yet. Exploring tool calling, MCP connectors, and evaluation loops.</p>',
  null,
  'draft',
  null,
  null,
  null,
  2
);

insert into public.blog_post_tags (post_id, tag_id) values
  ('b1111111-1111-4111-8111-111111111111', 'a1111111-1111-4111-8111-111111111111'),
  ('b1111111-1111-4111-8111-111111111111', 'a3333333-3333-4333-8333-333333333333'),
  ('b2222222-2222-4222-8222-222222222222', 'a2222222-2222-4222-8222-222222222222'),
  ('b3333333-3333-4333-8333-333333333333', 'a4444444-4444-4444-8444-444444444444');

insert into public.blog_comments (post_id, author_name, author_email, body, status) values
  (
    'b1111111-1111-4111-8111-111111111111',
    'Sam Rahman',
    'sam@example.com',
    'Clear explanation of when CQRS is worth the complexity. Thanks!',
    'approved'
  ),
  (
    'b2222222-2222-4222-8222-222222222222',
    'Pending Guest',
    'guest@example.com',
    'This comment should stay pending until moderated.',
    'pending'
  );
