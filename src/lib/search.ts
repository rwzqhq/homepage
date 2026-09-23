import type { Engine } from '../types';

const KNOWN_TLDS = new Set([
  'com',
  'cn',
  'net',
  'org',
  'io',
  'dev',
  'ai',
  'co',
  'me',
  'app',
  'xyz',
  'top',
  'info',
  'edu',
  'gov',
  'cc',
  'tv',
  'im',
  'site',
  'link',
  'fun',
  'vip',
  'shop',
  'tech',
  '中国',
]);

/** True when the typed text looks like an address instead of a query. */
export function looksLikeUrl(input: string): boolean {
  const value = input.trim();
  if (!value || /\s/.test(value)) return false;
  if (/^(https?|ftp):\/\//i.test(value)) return true;
  if (/^localhost(:\d+)?(\/.*)?$/i.test(value)) return true;
  if (/^\d{1,3}(\.\d{1,3}){3}(:\d+)?(\/.*)?$/.test(value)) return true;
  const match = /^([\w-]+(\.[\w-]+)+)(:\d+)?(\/.*)?$/i.exec(value);
  if (!match) return false;
  const host = match[1];
  const tld = host.split('.').pop()?.toLowerCase() ?? '';
  return KNOWN_TLDS.has(tld);
}

export function resolveTarget(input: string, engine: Engine): string {
  const value = input.trim();
  if (!value) return '';
  if (/^[a-z][\w+.-]*:\/\//i.test(value) || value.startsWith('about:')) return value;
  if (looksLikeUrl(value)) return `https://${value.replace(/^\/+/, '')}`;
  return engine.searchUrl.replace('%s', encodeURIComponent(value));
}

export function openTarget(url: string): void {
  if (!url) return;
  window.location.href = url;
}
