import { useEffect, useRef, useState } from 'react';
import type { Quote } from '../data/quotes';
import { IconCopy, IconMore, IconRefresh } from './icons';
import './QuoteCard.css';

interface QuoteCardProps {
  quote: Quote;
  hidden: boolean;
  onRefresh: () => void;
  onCopied: (text: string) => void;
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    /* fall through to the legacy path */
  }
  try {
    const area = document.createElement('textarea');
    area.value = text;
    area.setAttribute('readonly', 'true');
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
}

export function QuoteCard({ quote, hidden, onRefresh, onCopied }: QuoteCardProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onPointerDown = (event: MouseEvent) => {
      if (!cardRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  return (
    <div className={`quote${hidden ? ' is-hidden' : ''}`} ref={cardRef}>
      <div className="quote__bg" aria-hidden="true" />
      <div className="quote__text">
        <span>「</span>
        {quote.text}
        <span>」</span>
      </div>
      <div className="quote__author">—— {quote.author}</div>
      <button
        className="quote__menu-button"
        type="button"
        title="选项"
        aria-label="选项"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <IconMore size={20} />
      </button>
      {menuOpen ? (
        <div className="menu quote__menu" role="menu">
          <button
            type="button"
            role="menuitem"
            className="menu__item"
            onClick={() => {
              setMenuOpen(false);
              onRefresh();
            }}
          >
            <span className="menu__label">
              <span className="menu__icon">
                <IconRefresh size={14} />
              </span>
              换一句
            </span>
          </button>
          <button
            type="button"
            role="menuitem"
            className="menu__item"
            onClick={async () => {
              setMenuOpen(false);
              const ok = await copyText(`「${quote.text}」—— ${quote.author}`);
              if (ok) onCopied(`已复制：${quote.text}`);
            }}
          >
            <span className="menu__label">
              <span className="menu__icon">
                <IconCopy size={14} />
              </span>
              复制
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
