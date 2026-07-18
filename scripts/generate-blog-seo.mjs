/**
 * Build-time blog SEO helpers (GitHub Pages).
 *
 * - Writes public/sitemap.xml from published Supabase posts (anon key only).
 * - Writes prerender-routes.txt for optional static route listing.
 * - After Angular build, copies index.html → 404.html for SPA deep-link fallback.
 *
 * Env (optional; falls back to values in environment.ts via --env-file parsing):
 *   SUPABASE_URL
 *   SUPABASE_ANON_KEY
 *
 * Never requires the service-role key.
 */

import { readFileSync, writeFileSync, copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');
const SITE = 'https://zakariabijoy.github.io';

function loadEnvFromEnvironmentTs() {
  const envPath = join(root, 'src', 'environments', 'environment.ts');
  const src = readFileSync(envPath, 'utf8');
  const url = src.match(/supabaseUrl:\s*'([^']+)'/)?.[1];
  const key = src.match(/supabaseAnonKey:\s*'([^']+)'/)?.[1];
  return { url, key };
}

async function fetchPublishedPosts(url, key) {
  const endpoint =
    `${url}/rest/v1/blog_posts` +
    `?select=slug,published_at,updated_at,status` +
    `&status=eq.published` +
    `&order=published_at.desc`;

  const res = await fetch(endpoint, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
    },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase posts fetch failed (${res.status}): ${text}`);
  }

  const rows = await res.json();
  const now = Date.now();
  return (rows || []).filter(
    (r) => !r.published_at || new Date(r.published_at).getTime() <= now,
  );
}

function buildSitemap(posts) {
  const staticPaths = ['/', '/work', '/resume', '/contact', '/blog'];
  const urls = [
    ...staticPaths.map((path) => ({
      loc: `${SITE}${path === '/' ? '/' : path}`,
      lastmod: new Date().toISOString().slice(0, 10),
    })),
    ...posts.map((p) => ({
      loc: `${SITE}/blog/${p.slug}`,
      lastmod: (p.updated_at || p.published_at || new Date().toISOString()).slice(0, 10),
    })),
  ];

  const body = urls
    .map(
      (u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
  </url>`,
    )
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function writePrerenderRoutes(posts) {
  const routes = [
    '/',
    '/work',
    '/resume',
    '/contact',
    '/blog',
    ...posts.map((p) => `/blog/${p.slug}`),
  ];
  writeFileSync(join(root, 'prerender-routes.txt'), routes.join('\n') + '\n', 'utf8');
  return routes;
}

async function generatePrebuild() {
  const fromFile = loadEnvFromEnvironmentTs();
  const url = process.env.SUPABASE_URL || fromFile.url;
  const key = process.env.SUPABASE_ANON_KEY || fromFile.key;

  if (!url || !key) {
    console.warn('[blog-seo] Missing Supabase URL/anon key — writing static-only sitemap.');
  }

  let posts = [];
  if (url && key) {
    try {
      posts = await fetchPublishedPosts(url, key);
      console.log(`[blog-seo] Loaded ${posts.length} published post(s).`);
    } catch (err) {
      console.warn(`[blog-seo] Could not fetch posts (${err.message}). Using static routes only.`);
    }
  }

  const publicDir = join(root, 'public');
  if (!existsSync(publicDir)) mkdirSync(publicDir, { recursive: true });

  writeFileSync(join(publicDir, 'sitemap.xml'), buildSitemap(posts), 'utf8');
  const routes = writePrerenderRoutes(posts);
  console.log(`[blog-seo] Wrote sitemap.xml and prerender-routes.txt (${routes.length} routes).`);
}

function copySpaFallback() {
  const browserDir = join(root, 'dist', 'portfolio', 'browser');
  const index = join(browserDir, 'index.html');
  const fallback = join(browserDir, '404.html');
  if (!existsSync(index)) {
    console.warn('[blog-seo] dist/portfolio/browser/index.html not found — skip 404.html copy.');
    return;
  }
  copyFileSync(index, fallback);
  console.log('[blog-seo] Copied index.html → 404.html for GitHub Pages deep links.');
}

const mode = process.argv[2] || 'prebuild';
if (mode === 'postbuild') {
  copySpaFallback();
} else {
  await generatePrebuild();
}
