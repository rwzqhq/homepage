export function faviconUrl(siteUrl: string): string {
  try {
    const { origin } = new URL(siteUrl);
    return `${origin}/favicon.ico`;
  } catch {
    return '';
  }
}

export function monogram(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return '?';
  const first = trimmed[0];
  return /^[\x20-\x7f]$/.test(first) ? first.toUpperCase() : first;
}
