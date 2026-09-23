import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Background } from './components/Background';
import { Clock } from './components/Clock';
import { Dock } from './components/Dock';
import { EnginePreferenceDialog } from './components/EnginePreferenceDialog';
import { QuoteCard } from './components/QuoteCard';
import { SearchBar } from './components/SearchBar';
import { ShortcutEditorDialog } from './components/ShortcutEditorDialog';
import { ShortcutGrid } from './components/ShortcutGrid';
import { WallpaperDialog } from './components/WallpaperDialog';
import { DEFAULT_ENGINE, ENGINES, getEngine } from './data/engines';
import { QUOTES, randomQuoteIndex } from './data/quotes';
import { DEFAULT_SHORTCUTS, gradientFor } from './data/shortcuts';
import { DEFAULT_WALLPAPER_ID, getWallpaper } from './data/wallpapers';
import { bingImageUrl, isCurrentImage, stampLabel, type BingImage } from './lib/bingDaily';
import { useStoredState } from './lib/storage';
import { useBingDaily } from './lib/useBingDaily';
import type { EngineId, Shortcut, ThemeMode, Wallpaper, WallpaperMode } from './types';

type DialogState =
  | { kind: 'wallpaper' }
  | { kind: 'engines' }
  | { kind: 'shortcut'; shortcut?: Shortcut }
  | null;

interface CustomWallpaper {
  url: string;
}

export default function App() {
  const [theme, setTheme] = useStoredState<ThemeMode>('theme', 'light');
  const [engineId, setEngineId] = useStoredState<EngineId>('engine', DEFAULT_ENGINE);
  const [wallpaperMode, setWallpaperMode] = useStoredState<WallpaperMode>('wallpaper-mode', 'daily');
  const [wallpaperId, setWallpaperId] = useStoredState<string>('wallpaper', DEFAULT_WALLPAPER_ID);
  const [bingDate, setBingDate] = useStoredState<string | null>('bing-date', null);
  const [bingUhd, setBingUhd] = useStoredState<boolean>('bing-uhd', false);
  const [customWallpaper, setCustomWallpaper] = useStoredState<CustomWallpaper | null>('custom-wallpaper', null);
  const [shortcuts, setShortcuts] = useStoredState<Shortcut[]>('shortcuts', DEFAULT_SHORTCUTS);
  const [showSeconds, setShowSeconds] = useStoredState<boolean>('clock-seconds', false);

  const [view, setView] = useState<'none' | 'shortcuts'>('none');
  const [dialog, setDialog] = useState<DialogState>(null);
  const [focusSignal, setFocusSignal] = useState(0);
  const [searchFocused, setSearchFocused] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [quoteIndex, setQuoteIndex] = useState(() => randomQuoteIndex());
  const toastTimer = useRef<number | null>(null);
  const announcedBingDate = useRef<string | null>(null);

  const engine = getEngine(engineId);

  // 必应每日一图：挂载时同步一次，跨天自动重新同步（见 lib/useBingDaily.ts）。
  const daily = useBingDaily();

  const bingWallpaper = useMemo<Wallpaper | null>(() => {
    if (!daily.images.length) return null;
    const image: BingImage | null =
      (bingDate ? daily.images.find((item) => item.date === bingDate) : null) ?? daily.today;
    if (!image) return null;
    return {
      id: `bing:${image.date}`,
      name: image.title,
      credit: image.copyright,
      creditLink: image.copyrightLink,
      src: bingImageUrl(image, bingUhd),
      thumb: image.thumb,
      source: 'bing',
      date: image.date,
    };
  }, [bingDate, bingUhd, daily.images, daily.today]);

  const wallpaper: Wallpaper = useMemo(
    () => {
      if (wallpaperMode === 'custom' && customWallpaper) {
        return {
          id: 'custom',
          name: '自定义壁纸',
          credit: customWallpaper.url,
          src: customWallpaper.url,
          thumb: customWallpaper.url,
          source: 'custom',
        };
      }
      // 同步尚未完成 / 失败时先退回内置壁纸，等图片到位再淡入切换。
      if ((wallpaperMode === 'daily' || wallpaperMode === 'bing') && bingWallpaper) return bingWallpaper;
      return getWallpaper(wallpaperId);
    },
    [bingWallpaper, customWallpaper, wallpaperId, wallpaperMode],
  );
  const quote = QUOTES[quoteIndex] ?? QUOTES[0];
  const overlayOpen = view !== 'none' || dialog !== null;
  const blurred = overlayOpen || searchFocused;
  const dimmed = theme === 'dark' || overlayOpen;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Match the reference start page: the search field is ready to type on desktop.
  useEffect(() => {
    if (window.matchMedia('(min-width: 769px)').matches) setFocusSignal(1);
  }, []);

  useEffect(() => () => {
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
  }, []);

  const showToast = useCallback((message: string) => {
    setToast(message);
    if (toastTimer.current) window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 1800);
  }, []);

  const handleFocusChange = useCallback((focused: boolean) => setSearchFocused(focused), []);

  // 页面一直开着跨天时，图片换了给个提示（首屏加载不打扰）。
  useEffect(() => {
    const date = daily.today?.date ?? null;
    if (!date) return;
    if (announcedBingDate.current === null) {
      announcedBingDate.current = date;
      return;
    }
    if (announcedBingDate.current === date) return;
    announcedBingDate.current = date;
    if (wallpaperMode !== 'daily') return;
    showToast(
      daily.today && isCurrentImage(daily.today) ? '已同步今日必应图片' : `已同步 ${stampLabel(date)} 的必应图片`,
    );
  }, [daily.today, showToast, wallpaperMode]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.altKey && /^[1-6]$/.test(event.key)) {
        event.preventDefault();
        const next = ENGINES[Number(event.key) - 1];
        if (next) setEngineId(next.id);
        return;
      }
      const target = event.target as HTMLElement | null;
      const typing =
        !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if (!typing && (event.key === '/' || ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k'))) {
        event.preventDefault();
        setFocusSignal((signal) => signal + 1);
        return;
      }
      if (event.key === 'Escape' && view !== 'none') setView('none');
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setEngineId, view]);

  const activateShortcut = useCallback(
    (shortcut: Shortcut) => {
      switch (shortcut.action) {
        case 'all-shortcuts':
          setView('shortcuts');
          break;
        case 'wallpaper':
          setDialog({ kind: 'wallpaper' });
          break;
        case 'theme':
          setTheme((mode) => (mode === 'dark' ? 'light' : 'dark'));
          break;
        default:
          if (shortcut.url) window.location.href = shortcut.url;
      }
    },
    [setTheme],
  );

  const reorderShortcuts = useCallback(
    (from: number, to: number) => {
      setShortcuts((list) => {
        if (from === to || from < 0 || to < 0 || from >= list.length || to >= list.length) return list;
        const next = [...list];
        const [moved] = next.splice(from, 1);
        next.splice(to, 0, moved);
        return next;
      });
    },
    [setShortcuts],
  );

  const saveShortcut = useCallback(
    (data: { name: string; url: string }, existing?: Shortcut) => {
      setShortcuts((list) => {
        if (existing) {
          return list.map((shortcut) =>
            shortcut.id === existing.id
              ? { ...shortcut, name: data.name, url: data.url, favicon: true }
              : shortcut,
          );
        }
        const shortcut: Shortcut = {
          id: `custom-${Date.now().toString(36)}`,
          name: data.name,
          url: data.url,
          favicon: true,
          gradient: gradientFor(data.name),
        };
        return [...list, shortcut];
      });
      setDialog(null);
      showToast(existing ? '已保存修改' : `已添加「${data.name}」`);
    },
    [setShortcuts, showToast],
  );

  const removeShortcut = useCallback(
    (shortcut: Shortcut) => {
      setShortcuts((list) => list.filter((item) => item.id !== shortcut.id));
      setDialog(null);
      showToast(`已删除「${shortcut.name}」`);
    },
    [setShortcuts, showToast],
  );

  const selectWallpaper = useCallback(
    (id: string) => {
      setWallpaperId(id);
      setWallpaperMode('builtin');
      setCustomWallpaper(null);
    },
    [setCustomWallpaper, setWallpaperId, setWallpaperMode],
  );

  const useCustomWallpaper = useCallback(
    (url: string) => {
      setCustomWallpaper({ url });
      setWallpaperMode('custom');
      showToast('已使用自定义壁纸');
    },
    [setCustomWallpaper, setWallpaperMode, showToast],
  );

  const useDailyWallpaper = useCallback(() => {
    setWallpaperMode('daily');
    setBingDate(null);
    showToast('已开启必应每日一图，每天自动更新');
  }, [setBingDate, setWallpaperMode, showToast]);

  const selectBingDate = useCallback(
    (date: string) => {
      setWallpaperMode('bing');
      setBingDate(date);
      showToast(`已选用 ${stampLabel(date)} 的必应图片`);
    },
    [setBingDate, setWallpaperMode, showToast],
  );

  return (
    <>
      <Background wallpaper={wallpaper} blurred={blurred} dimmed={dimmed} />
      <Clock showSeconds={showSeconds} onToggle={() => setShowSeconds((value) => !value)} />
      <SearchBar
        engine={engine}
        focusSignal={focusSignal}
        onEngineChange={setEngineId}
        onOpenPreferences={() => setDialog({ kind: 'engines' })}
        onFocusChange={handleFocusChange}
      />
      <QuoteCard
        quote={quote}
        hidden={overlayOpen}
        onRefresh={() => setQuoteIndex((index) => randomQuoteIndex(index))}
        onCopied={showToast}
      />
      <Dock
        shortcuts={shortcuts}
        theme={theme}
        onActivate={activateShortcut}
        onReorder={reorderShortcuts}
      />

      {view === 'shortcuts' ? (
        <ShortcutGrid
          shortcuts={shortcuts}
          theme={theme}
          onActivate={activateShortcut}
          onEdit={(shortcut) => setDialog({ kind: 'shortcut', shortcut })}
          onDelete={removeShortcut}
          onAdd={() => setDialog({ kind: 'shortcut' })}
          onClose={() => setView('none')}
        />
      ) : null}

      {dialog?.kind === 'wallpaper' ? (
        <WallpaperDialog
          current={wallpaper}
          mode={wallpaperMode}
          builtinId={wallpaperId}
          bingDate={bingDate}
          customUrl={customWallpaper?.url ?? null}
          daily={daily}
          uhd={bingUhd}
          onToggleUhd={setBingUhd}
          onUseDaily={useDailyWallpaper}
          onSelectBingDate={selectBingDate}
          onSelect={selectWallpaper}
          onUseCustom={useCustomWallpaper}
          onClearCustom={() => {
            setCustomWallpaper(null);
            showToast('已移除自定义壁纸');
          }}
          onClose={() => setDialog(null)}
        />
      ) : null}

      {dialog?.kind === 'engines' ? (
        <EnginePreferenceDialog
          current={engineId}
          onChange={(id) => setEngineId(id)}
          onClose={() => setDialog(null)}
        />
      ) : null}

      {dialog?.kind === 'shortcut' ? (
        <ShortcutEditorDialog
          shortcut={dialog.shortcut}
          onSubmit={(data) => saveShortcut(data, dialog.shortcut)}
          onDelete={() => dialog.shortcut && removeShortcut(dialog.shortcut)}
          onClose={() => setDialog(null)}
        />
      ) : null}

      {toast ? (
        <div className="toast" role="status">
          {toast}
        </div>
      ) : null}
    </>
  );
}
