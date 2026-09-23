import { useEffect, useState } from 'react';
import type { Shortcut, ThemeMode } from '../types';
import { ShortcutIcon, shortcutLabel } from './ShortcutIcon';
import { IconMore, IconPencil, IconPlus, IconTrash } from './icons';
import './ShortcutGrid.css';

interface ShortcutGridProps {
  shortcuts: Shortcut[];
  theme: ThemeMode;
  onActivate: (shortcut: Shortcut) => void;
  onEdit: (shortcut: Shortcut) => void;
  onDelete: (shortcut: Shortcut) => void;
  onAdd: () => void;
  onClose: () => void;
}

export function ShortcutGrid({
  shortcuts,
  theme,
  onActivate,
  onEdit,
  onDelete,
  onAdd,
  onClose,
}: ShortcutGridProps) {
  const [menuId, setMenuId] = useState<string | null>(null);
  const items = shortcuts.filter((shortcut) => shortcut.action !== 'all-shortcuts');

  useEffect(() => {
    if (!menuId) return undefined;
    const onPointerDown = () => setMenuId(null);
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [menuId]);

  return (
    <div
      className="shortcut-view"
      role="dialog"
      aria-modal="true"
      aria-label="所有捷径"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="shortcut-view__grid">
        {items.map((shortcut) => {
          const editable = !shortcut.action;
          return (
            <div className="shortcut-view__item" key={shortcut.id}>
              <button
                type="button"
                className="tile tile--large"
                aria-label={shortcut.name}
                onClick={() => onActivate(shortcut)}
              >
                <ShortcutIcon shortcut={shortcut} theme={theme} size={26} />
              </button>
              {editable ? (
                <button
                  type="button"
                  className="shortcut-view__menu-button"
                  aria-label={`${shortcut.name} 选项`}
                  aria-haspopup="menu"
                  aria-expanded={menuId === shortcut.id}
                  onClick={(event) => {
                    event.stopPropagation();
                    setMenuId((current) => (current === shortcut.id ? null : shortcut.id));
                  }}
                >
                  <IconMore size={16} />
                </button>
              ) : null}
              <span className="shortcut-view__label">{shortcut.name}</span>
              {menuId === shortcut.id ? (
                <div className="menu shortcut-view__menu" role="menu" onMouseDown={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    role="menuitem"
                    className="menu__item"
                    onClick={() => {
                      setMenuId(null);
                      onEdit(shortcut);
                    }}
                  >
                    <span className="menu__label">
                      <span className="menu__icon">
                        <IconPencil size={14} />
                      </span>
                      编辑
                    </span>
                  </button>
                  <button
                    type="button"
                    role="menuitem"
                    className="menu__item"
                    onClick={() => {
                      setMenuId(null);
                      onDelete(shortcut);
                    }}
                  >
                    <span className="menu__label">
                      <span className="menu__icon">
                        <IconTrash size={14} />
                      </span>
                      删除
                    </span>
                  </button>
                </div>
              ) : null}
            </div>
          );
        })}

        <div className="shortcut-view__item">
          <button type="button" className="tile tile--large tile--add" aria-label="添加捷径" onClick={onAdd}>
            <IconPlus size={26} />
          </button>
        </div>
      </div>
    </div>
  );
}

export { shortcutLabel };
