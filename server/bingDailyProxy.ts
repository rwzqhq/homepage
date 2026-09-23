import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';

/**
 * Dev / preview middleware that exposes Bing's daily wallpaper archive as a same-origin
 * JSON endpoint.
 *
 * `https://www.bing.com/HPImageArchive.aspx` sends no `Access-Control-Allow-Origin`
 * header, so a start page served from another origin cannot read it in the browser.
 * Proxying it server-side keeps the official titles, copyright and market (`mkt`) intact.
 * Static deployments simply skip this route — `src/lib/bingDaily.ts` falls back to the
 * public mirrors documented in the README.
 */

const UPSTREAM = 'https://www.bing.com/HPImageArchive.aspx';
const ROUTE = '/api/bing-daily';
const UPSTREAM_TIMEOUT = 8000;
/** Bing publishes one image per day, so a short server-side reuse window is plenty. */
const REUSE_WINDOW = 5 * 60 * 1000;
const MAX_COUNT = 8;

type Next = (error?: unknown) => void;

let cached: { body: string; at: number; key: string } | null = null;

async function loadArchive(count: number, market: string): Promise<string> {
  const key = `${count}:${market}`;
  if (cached && cached.key === key && Date.now() - cached.at < REUSE_WINDOW) return cached.body;

  const url = `${UPSTREAM}?format=js&idx=0&n=${count}&mkt=${encodeURIComponent(market)}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), UPSTREAM_TIMEOUT);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        accept: 'application/json, text/plain, */*',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
      },
    });
    if (!response.ok) throw new Error(`upstream responded ${response.status}`);
    const body = await response.text();
    const parsed = JSON.parse(body) as { images?: unknown };
    if (!Array.isArray(parsed.images) || parsed.images.length === 0) throw new Error('unexpected upstream payload');
    cached = { body, at: Date.now(), key };
    return body;
  } finally {
    clearTimeout(timer);
  }
}

function sendJson(response: ServerResponse, status: number, payload: unknown) {
  const body = JSON.stringify(payload);
  response.statusCode = status;
  response.setHeader('content-type', 'application/json; charset=utf-8');
  response.setHeader('access-control-allow-origin', '*');
  response.setHeader('cache-control', status === 200 ? 'public, max-age=1800' : 'no-store');
  response.end(body);
}

async function middleware(request: IncomingMessage, response: ServerResponse, next: Next) {
  const url = new URL(request.url ?? '/', 'http://localhost');
  if (url.pathname !== ROUTE) {
    next();
    return;
  }

  const count = Math.min(Math.max(Number(url.searchParams.get('n')) || MAX_COUNT, 1), MAX_COUNT);
  const market = (url.searchParams.get('mkt') ?? 'zh-CN').slice(0, 16);

  try {
    const body = await loadArchive(count, market);
    response.statusCode = 200;
    response.setHeader('content-type', 'application/json; charset=utf-8');
    response.setHeader('access-control-allow-origin', '*');
    response.setHeader('cache-control', 'public, max-age=1800');
    response.end(body);
  } catch (error) {
    sendJson(response, 502, { error: error instanceof Error ? error.message : 'bing upstream unavailable' });
  }
}

export function bingDailyProxy(): Plugin {
  return {
    name: 'limestart:bing-daily-proxy',
    configureServer(server) {
      server.middlewares.use(middleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(middleware);
    },
  };
}
