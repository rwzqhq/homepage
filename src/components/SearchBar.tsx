import { useEffect, useRef, useState, type FocusEvent, type FormEvent } from 'react';
import type { Engine, EngineId } from '../types';
import { ENGINES } from '../data/engines';
import { openTarget, resolveTarget } from '../lib/search';
import { EngineMark, IconGear, IconSearch } from './icons';
import './SearchBar.css';

interface SearchBarProps {
  engine: Engine;
  focusSignal: number;
  onEngineChange: (id: EngineId) => void;
  onOpenPreferences: () => void;
  onFocusChange: (focused: boolean) => void;
}

export function SearchBar({
  engine,
  focusSignal,
  onEngineChange,
  onOpenPreferences,
  onFocusChange,
}: SearchBarProps) {
  const anchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [everExpanded, setEverExpanded] = useState(false);
  const [focusWithin, setFocusWithin] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (focusSignal > 0) inputRef.current?.focus();
  }, [focusSignal]);

  useEffect(() => {
    onFocusChange(focusWithin || menuOpen);
  }, [focusWithin, menuOpen, onFocusChange]);

  useEffect(() => {
    if (!menuOpen) return undefined;
    const onPointerDown = (event: MouseEvent) => {
      if (!anchorRef.current?.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        inputRef.current?.focus();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [menuOpen]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const target = resolveTarget(value, engine);
    if (target) openTarget(target);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null;
    if (!next || !anchorRef.current?.contains(next)) setFocusWithin(false);
  };

  const expanded = everExpanded || focusWithin;
  const className = [
    'search',
    expanded ? 'is-expanded' : '',
    focusWithin || menuOpen ? 'is-focused' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div
      className="search-anchor"
      ref={anchorRef}
      onFocus={() => {
        setFocusWithin(true);
        setEverExpanded(true);
      }}
      onBlur={handleBlur}
    >
      <form className={className} onSubmit={handleSubmit} role="search">
        <input
          ref={inputRef}
          className="search__input"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          placeholder="搜索"
          aria-label="搜索"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          enterKeyHint="search"
        />
        <button
          className="search__button search__button--engine"
          type="button"
          aria-label={`切换搜索引擎，当前为${engine.name}`}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          tabIndex={expanded ? 0 : -1}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <EngineMark id={engine.id} size={14} />
        </button>
        <button
          className="search__button search__button--submit"
          type="submit"
          aria-label="搜索"
          tabIndex={expanded ? 0 : -1}
        >
          <IconSearch size={16} />
        </button>
      </form>

      {menuOpen ? (
        <div className="menu engine-menu" role="menu" aria-label="搜索引擎">
          {ENGINES.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitemradio"
              aria-checked={item.id === engine.id}
              className="menu__item"
              onClick={() => {
                onEngineChange(item.id);
                setMenuOpen(false);
                inputRef.current?.focus();
              }}
            >
              <span className="menu__label">
                <span className="menu__icon">
                  <EngineMark id={item.id} size={14} />
                </span>
                {item.name}
              </span>
              <span className="menu__hint">{item.hint}</span>
            </button>
          ))}
          <div className="menu__divider" role="separator" />
          <button
            type="button"
            role="menuitem"
            className="menu__item"
            onClick={() => {
              setMenuOpen(false);
              onOpenPreferences();
            }}
          >
            <span className="menu__label">
              <span className="menu__icon">
                <IconGear size={14} />
              </span>
              搜索引擎偏好
            </span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
