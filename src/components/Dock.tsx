import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Shortcut, ThemeMode } from '../types';
import { ShortcutIcon, shortcutLabel } from './ShortcutIcon';
import './Dock.css';

interface DockProps {
  shortcuts: Shortcut[];
  theme: ThemeMode;
  onActivate: (shortcut: Shortcut) => void;
  onReorder: (from: number, to: number) => void;
}

export function Dock({ shortcuts, theme, onActivate, onReorder }: DockProps) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);
  const [tip, setTip] = useState<{ label: string; x: number; y: number } | null>(null);

  const showTip = useCallback((label: string, element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    setTip({ label, x: rect.left + rect.width / 2, y: rect.top });
  }, []);

  return (
    <>
      <nav className="dock" aria-label="捷径" onMouseLeave={() => setTip(null)}>
        {shortcuts.map((shortcut, index) => {
          const label = shortcutLabel(shortcut, theme);
          return (
            <div
              key={shortcut.id}
              className={`dock__slot${overIndex === index && dragIndex !== null ? ' is-over' : ''}`}
              draggable
              onDragStart={(event) => {
                setDragIndex(index);
                setTip(null);
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', shortcut.id);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                event.dataTransfer.dropEffect = 'move';
                setOverIndex(index);
              }}
              onDragEnd={() => {
                setDragIndex(null);
                setOverIndex(null);
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (dragIndex !== null && dragIndex !== index) onReorder(dragIndex, index);
                setDragIndex(null);
                setOverIndex(null);
              }}
            >
              <button
                type="button"
                className="tile"
                title={label}
                aria-label={label}
                onClick={() => onActivate(shortcut)}
                onMouseEnter={(event) => showTip(label, event.currentTarget)}
                onFocus={(event) => showTip(label, event.currentTarget)}
                onBlur={() => setTip(null)}
              >
                <ShortcutIcon shortcut={shortcut} theme={theme} size={24} />
              </button>
            </div>
          );
        })}
      </nav>
      {tip
        ? createPortal(
            <div className="dock__tooltip" style={{ left: tip.x, top: tip.y }} role="presentation">
              {tip.label}
            </div>,
            document.body,
          )
        : null}
    </>
  );
}
