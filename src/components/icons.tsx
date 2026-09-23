import { useId, type ReactNode } from 'react';
import type { EngineId } from '../types';

interface GlyphProps {
  from: string;
  to: string;
  size?: number;
  children: (fill: string) => ReactNode;
}

/** Gradient-filled glyph used for the dock / grid tiles. */
export function Glyph({ from, to, size = 24, children }: GlyphProps) {
  const rawId = useId();
  const id = `g${rawId.replace(/[^a-zA-Z0-9]/g, '')}`;
  const fill = `url(#${id})`;
  return (
    <svg className="glyph" width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={from} />
          <stop offset="100%" stopColor={to} />
        </linearGradient>
      </defs>
      {children(fill)}
    </svg>
  );
}

export function GlyphGrid({ from, to, size }: Omit<GlyphProps, 'children'>) {
  const cells = [3.1, 9.7, 16.3];
  return (
    <Glyph from={from} to={to} size={size}>
      {(fill) => (
        <>
          {cells.map((x) =>
            cells.map((y) => <rect key={`${x}-${y}`} x={x} y={y} width={4.6} height={4.6} rx={1.5} fill={fill} />),
          )}
        </>
      )}
    </Glyph>
  );
}

export function GlyphImage({ from, to, size }: Omit<GlyphProps, 'children'>) {
  return (
    <Glyph from={from} to={to} size={size}>
      {(fill) => (
        <>
          <rect x="1.8" y="3.4" width="20.4" height="17.2" rx="4.6" fill={fill} />
          <circle cx="8.4" cy="9.6" r="2.1" fill="#fff" fillOpacity="0.92" />
          <path
            d="M4.6 19.6 10.2 13l4.3 4.3 2.3-2.2 3.1 4.5z"
            fill="#fff"
            fillOpacity="0.92"
          />
        </>
      )}
    </Glyph>
  );
}

export function GlyphSun({ from, to, size }: Omit<GlyphProps, 'children'>) {
  const rays = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <Glyph from={from} to={to} size={size}>
      {(fill) => (
        <>
          <circle cx="12" cy="12" r="4.7" fill={fill} />
          {rays.map((angle) => (
            <rect
              key={angle}
              x="11.05"
              y="1.4"
              width="1.9"
              height="3.9"
              rx="0.95"
              fill={fill}
              transform={`rotate(${angle} 12 12)`}
            />
          ))}
        </>
      )}
    </Glyph>
  );
}

export function GlyphMoon({ from, to, size }: Omit<GlyphProps, 'children'>) {
  return (
    <Glyph from={from} to={to} size={size}>
      {(fill) => (
        <path
          d="M20.4 15.6A8.8 8.8 0 0 1 8.4 3.6a8.9 8.9 0 1 0 12 12z"
          fill={fill}
        />
      )}
    </Glyph>
  );
}

interface IconProps {
  size?: number;
  className?: string;
}

export function IconSearch({ size = 16, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <circle cx="10.6" cy="10.6" r="6.4" />
      <path d="m15.6 15.6 4.6 4.6" />
    </svg>
  );
}

export function IconPlus({ size = 22, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function IconClose({ size = 14, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M5 5l14 14M19 5 5 19" />
    </svg>
  );
}

export function IconMore({ size = 20, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g fill="currentColor">
        <circle cx="5.2" cy="12" r="1.9" />
        <circle cx="12" cy="12" r="1.9" />
        <circle cx="18.8" cy="12" r="1.9" />
      </g>
    </svg>
  );
}

export function IconCheck({ size = 13, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="m5 12.8 4.6 4.6L19 7.2" />
    </svg>
  );
}

export function IconRefresh({ size = 18, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 3.6V9h-5.4" />
    </svg>
  );
}

export function IconCopy({ size = 18, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="9" y="9" width="11" height="11" rx="3" />
      <path d="M6.5 15H5.8A1.8 1.8 0 0 1 4 13.2V5.8A1.8 1.8 0 0 1 5.8 4h7.4A1.8 1.8 0 0 1 15 5.8v.7" />
    </svg>
  );
}

export function IconGear({ size = 14, className }: IconProps) {
  const teeth = [0, 45, 90, 135, 180, 225, 270, 315];
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g fill="currentColor">
        {teeth.map((angle) => (
          <rect
            key={angle}
            x="10.7"
            y="2.6"
            width="2.6"
            height="4.4"
            rx="1.1"
            transform={`rotate(${angle} 12 12)`}
          />
        ))}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M12 2.6A9.4 9.4 0 1 0 12 21.4 9.4 9.4 0 0 0 12 2.6Zm0 6.2a3.2 3.2 0 1 1 0 6.4 3.2 3.2 0 0 1 0-6.4Z"
        />
      </g>
    </svg>
  );
}

export function IconFolder({ size = 15, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M3.5 7.4a2 2 0 0 1 2-2h3.2l2 2.4h7.8a2 2 0 0 1 2 2v7.8a2 2 0 0 1-2 2H5.5a2 2 0 0 1-2-2z" />
    </svg>
  );
}

export function IconLink({ size = 15, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M10.2 13.8a3.6 3.6 0 0 0 5.1 0l3-3a3.6 3.6 0 0 0-5.1-5.1l-1.4 1.4" />
      <path d="M13.8 10.2a3.6 3.6 0 0 0-5.1 0l-3 3a3.6 3.6 0 0 0 5.1 5.1l1.4-1.4" />
    </svg>
  );
}

export function IconPencil({ size = 16, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M15.6 5.2a2.3 2.3 0 0 1 3.2 3.2L8.4 18.8l-4.2 1.2 1.2-4.2z" />
    </svg>
  );
}

export function IconTrash({ size = 16, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d="M4.8 6.6h14.4M9.4 6.6V4.9a1.3 1.3 0 0 1 1.3-1.3h2.6a1.3 1.3 0 0 1 1.3 1.3v1.7" />
      <path d="M6.8 6.6l.9 11.3a1.8 1.8 0 0 0 1.8 1.7h5a1.8 1.8 0 0 0 1.8-1.7l.9-11.3" />
    </svg>
  );
}

export function IconImageOutline({ size = 20, className }: IconProps) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <rect x="3.2" y="4.6" width="17.6" height="14.8" rx="3" />
      <circle cx="8.8" cy="9.8" r="1.5" />
      <path d="m5 17.6 4.7-5 3.4 3.5 2.2-2.1 3.7 3.6" />
    </svg>
  );
}

/** 百度 keeps the paw mark from the reference; that paw is its actual logo shape. */
export function EngineBaiduPaw({ size = 14, className }: IconProps) {
  return (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <g fill="currentColor">
        <ellipse cx="12" cy="16.4" rx="4.6" ry="3.9" />
        <ellipse cx="5.6" cy="10.9" rx="2.5" ry="3" transform="rotate(-16 5.6 10.9)" />
        <ellipse cx="12" cy="8.4" rx="2.6" ry="3.2" />
        <ellipse cx="18.4" cy="10.9" rx="2.5" ry="3" transform="rotate(16 18.4 10.9)" />
      </g>
    </svg>
  );
}

const ENGINE_MARKS: Record<Exclude<EngineId, 'baidu'>, { label: string; gradient: [string, string] }> = {
  bing: { label: 'b', gradient: ['#5cc8d8', '#0f7f95'] },
  google: { label: 'G', gradient: ['#8ab8ff', '#4285f4'] },
  yandex: { label: 'Y', gradient: ['#ff9c9c', '#e0342c'] },
  sogou: { label: '搜', gradient: ['#ffb07a', '#f5620f'] },
  so360: { label: '3', gradient: ['#a8e58f', '#2fa84f'] },
};

export function EngineMark({ id, size = 14 }: { id: EngineId; size?: number }) {
  if (id === 'baidu') return <EngineBaiduPaw size={size} />;
  const { label, gradient } = ENGINE_MARKS[id];
  return (
    <span
      className="engine-mark"
      style={{
        width: size,
        height: size,
        backgroundImage: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
      }}
    >
      {label}
    </span>
  );
}
