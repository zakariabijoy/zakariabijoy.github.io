// Supabase Edge Function: submit-blog-comment
// Validates guest comments, rate-limits by IP/email, inserts as pending.
// Deploy: supabase functions deploy submit-blog-comment --no-verify-jwt

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface CommentPayload {
  postId?: string;
  authorName?: string;
  authorEmail?: string;
  body?: string;
  /** Honeypot — must be empty. */
  website?: string;
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/i;

const MAX_NAME = 80;
const MAX_BODY = 2000;
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_PER_IP = 5;
const MAX_PER_EMAIL = 3;

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value.toLowerCase().trim());
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function clientIp(req: Request): string {
  return (
    req.headers.get('cf-connecting-ip') ||
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'
  );
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return json(405, { error: 'Method not allowed' });
  }

  let payload: CommentPayload;
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: 'Invalid JSON body' });
  }

  // Honeypot: bots fill this; humans leave it blank.
  if (payload.website && payload.website.trim().length > 0) {
    return json(200, { ok: true });
  }

  const postId = (payload.postId || '').trim();
  const authorName = (payload.authorName || '').trim();
  const authorEmail = (payload.authorEmail || '').trim().toLowerCase();
  const body = (payload.body || '').trim();

  if (!UUID_RE.test(postId)) {
    return json(400, { error: 'Invalid post id' });
  }
  if (authorName.length < 2 || authorName.length > MAX_NAME) {
    return json(400, { error: `Name must be 2–${MAX_NAME} characters` });
  }
  if (!EMAIL_RE.test(authorEmail) || authorEmail.length > 254) {
    return json(400, { error: 'Invalid email address' });
  }
  if (body.length < 3 || body.length > MAX_BODY) {
    return json(400, { error: `Comment must be 3–${MAX_BODY} characters` });
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!supabaseUrl || !serviceKey) {
    return json(500, { error: 'Server misconfigured' });
  }

  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const { data: post, error: postError } = await supabase
    .from('blog_posts')
    .select('id, status, published_at')
    .eq('id', postId)
    .maybeSingle();

  if (postError) {
    return json(500, { error: 'Failed to verify post' });
  }
  if (
    !post ||
    post.status !== 'published' ||
    (post.published_at && new Date(post.published_at).getTime() > Date.now())
  ) {
    return json(404, { error: 'Post not found' });
  }

  const ip = clientIp(req);
  const ipHash = await sha256(ip);
  const emailHash = await sha256(authorEmail);
  const since = new Date(Date.now() - RATE_WINDOW_MS).toISOString();

  const [{ count: ipCount }, { count: emailCount }] = await Promise.all([
    supabase
      .from('blog_comment_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('ip_hash', ipHash)
      .gte('created_at', since),
    supabase
      .from('blog_comment_rate_limits')
      .select('*', { count: 'exact', head: true })
      .eq('email_hash', emailHash)
      .gte('created_at', since),
  ]);

  if ((ipCount ?? 0) >= MAX_PER_IP || (emailCount ?? 0) >= MAX_PER_EMAIL) {
    return json(429, { error: 'Too many comments. Please try again later.' });
  }

  const { error: insertError } = await supabase.from('blog_comments').insert({
    post_id: postId,
    author_name: authorName,
    author_email: authorEmail,
    body,
    status: 'pending',
  });

  if (insertError) {
    return json(500, { error: 'Failed to submit comment' });
  }

  await supabase.from('blog_comment_rate_limits').insert({
    ip_hash: ipHash,
    email_hash: emailHash,
  });

  return json(200, {
    ok: true,
    message: 'Comment submitted and awaiting moderation.',
  });
});
