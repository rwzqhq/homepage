import { useEffect, useState } from 'react';
import type { Shortcut, ThemeMode } from '../types';
import { faviconUrl, monogram } from '../lib/favicon';
import { GlyphGrid, GlyphImage, GlyphMoon, GlyphSun } from './icons';
import './ShortcutIcon.css';

interface ShortcutIconProps {
  shortcut: Shortcut;
  theme: ThemeMode;
  size?: number;
}

export function ShortcutIcon({ shortcut, theme, size = 24 }: ShortcutIconProps) {
  const [failed, setFailed] = useState(false);
  const [from, to] = shortcut.gradient;

  useEffect(() => {
    setFailed(false);
  }, [shortcut.url]);

  if (shortcut.action === 'theme') {
    return theme === 'dark' ? (
      <GlyphMoon from={from} to={to} size={size} />
    ) : (
      <GlyphSun from={from} to={to} size={size} />
    );
  }

  if (shortcut.action === 'all-shortcuts') return <GlyphGrid from={from} to={to} size={size} />;
  if (shortcut.action === 'wallpaper') return <GlyphImage from={from} to={to} size={size} />;

  if (shortcut.localIcon) {
    return (
      <img
        className="shortcut-icon"
        src={shortcut.localIcon}
        width={size}
        height={size}
        alt=""
        draggable={false}
      />
    );
  }

  const src = shortcut.url ? faviconUrl(shortcut.url) : '';

  if (!src || failed) {
    return (
      <span
        className="monogram"
        style={{
          width: size,
          height: size,
          fontSize: Math.round(size * 0.52),
          backgroundImage: `linear-gradient(135deg, ${from}, ${to})`,
        }}
        aria-hidden="true"
      >
        {monogram(shortcut.name)}
      </span>
    );
  }

  return (
    <img
      className="shortcut-icon"
      src={src}
      width={size}
      height={size}
      alt=""
      draggable={false}
      onLoad={(event) => {
        // Some sites answer /favicon.ico with HTML; treat tiny or empty renders as missing.
        if (event.currentTarget.naturalWidth <= 1) setFailed(true);
      }}
      onError={() => setFailed(true)}
    />
  );
}

export function shortcutLabel(shortcut: Shortcut, theme: ThemeMode): string {
  if (shortcut.action === 'theme') return theme === 'dark' ? '浅色主题' : '深色主题';
  return shortcut.name;
}
