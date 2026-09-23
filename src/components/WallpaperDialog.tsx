import { useState, type FormEvent } from 'react';
import type { Wallpaper, WallpaperMode } from '../types';
import { WALLPAPERS } from '../data/wallpapers';
import { isCurrentImage, stampLabel, type BingImage } from '../lib/bingDaily';
import type { BingDaily } from '../lib/useBingDaily';
import { Modal } from './Dialog';
import { IconCheck, IconImageOutline, IconLink, IconRefresh, IconTrash } from './icons';
import './WallpaperDialog.css';

interface WallpaperDialogProps {
  current: Wallpaper;
  mode: WallpaperMode;
  builtinId: string;
  bingDate: string | null;
  customUrl: string | null;
  daily: BingDaily;
  uhd: boolean;
  onToggleUhd: (value: boolean) => void;
  onUseDaily: () => void;
  onSelectBingDate: (date: string) => void;
  onSelect: (id: string) => void;
  onUseCustom: (url: string) => void;
  onClearCustom: () => void;
  onClose: () => void;
}

const HISTORY_LIMIT = 8;

function clockLabel(timestamp: number | null): string {
  if (!timestamp) return '';
  const time = new Date(timestamp);
  const pad = (value: number) => `${value}`.padStart(2, '0');
  return `${pad(time.getHours())}:${pad(time.getMinutes())}`;
}

export function WallpaperDialog({
  current,
  mode,
  builtinId,
  bingDate,
  customUrl,
  daily,
  uhd,
  onToggleUhd,
  onUseDaily,
  onSelectBingDate,
  onSelect,
  onUseCustom,
  onClearCustom,
  onClose,
}: WallpaperDialogProps) {
  const [linkOpen, setLinkOpen] = useState(false);
  const [url, setUrl] = useState(customUrl ?? '');
  const [error, setError] = useState<string | null>(null);
  const [checking, setChecking] = useState(false);

  const dailyOn = mode === 'daily';
  const today = daily.today;
  const updatedAt = clockLabel(daily.fetchedAt);

  const fresh = !!today && isCurrentImage(today);
  const statusText = daily.loading
    ? '正在获取今天的图片…'
    : today
      ? `已同步${fresh ? '今日图片' : ` ${stampLabel(today.date)} 的图片`} · 来源：${daily.sourceLabel}${
          updatedAt ? ` · ${updatedAt}` : ''
        }`
      : '尚未同步到必应图片，可点「立即同步」重试。';

  /** 当前壁纸是不是就是最新（今天）的这张。 */
  const showingToday = !!today && current.date === today.date;

  const submitLink = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = url.trim();
    if (!/^(https?:)?\/\/.+/i.test(value)) {
      setError('请输入以 http:// 或 https:// 开头的图片地址。');
      return;
    }
    setError(null);
    setChecking(true);
    const probe = new Image();
    probe.onload = () => {
      setChecking(false);
      onUseCustom(value);
      setLinkOpen(false);
    };
    probe.onerror = () => {
      setChecking(false);
      setError('无法加载该地址的图片，请检查链接是否可以直接访问。');
    };
    probe.src = value;
  };

  const history: BingImage[] = daily.images.slice(0, HISTORY_LIMIT);

  return (
    <Modal title="壁纸偏好" onClose={onClose}>
      <p className="modal__section">必应每日一图</p>
      <div className="wallpaper-daily">
        <div className="wallpaper-daily__preview">
          {today ? <img src={today.thumb} alt="" draggable={false} /> : <IconImageOutline size={22} />}
        </div>
        <div className="wallpaper-daily__body">
          <p className="wallpaper-custom__title">
            每天自动同步必应首页图片
            {dailyOn ? <span className="wallpaper-tag">{today ? '使用中' : '待同步'}</span> : null}
          </p>
          <p className="wallpaper-custom__desc">
            每次打开起始页都会跟随必应「每日一图」更新，无需手动更换；同步失败时先显示本地保存的
            图片。
          </p>
          <p className="wallpaper-daily__status">{statusText}</p>
          <div className="wallpaper-custom__actions">
            <button
              type="button"
              role="switch"
              aria-checked={dailyOn}
              aria-label="每天自动更新"
              className={`switch-control${dailyOn ? ' is-on' : ''}`}
              onClick={() => (dailyOn ? onSelect(builtinId) : onUseDaily())}
            >
              <span className="switch-control__track">
                <span className="switch-control__knob" />
              </span>
              <span className="switch-control__label">每天自动更新</span>
            </button>
            <button
              type="button"
              className="pill-button"
              disabled={daily.refreshing}
              onClick={() => daily.refresh(true)}
            >
              <IconRefresh size={13} className={daily.refreshing ? 'is-spinning' : undefined} />
              {daily.refreshing ? '同步中…' : '立即同步'}
            </button>
            <button
              type="button"
              className="pill-button"
              aria-pressed={uhd}
              onClick={() => onToggleUhd(!uhd)}
            >
              4K 原图
            </button>
          </div>
          {daily.error ? (
            <p className="wallpaper-daily__error">
              {today ? '本次同步失败，正在显示上一次同步的图片：' : '同步失败：'}
              {daily.error}
            </p>
          ) : null}
        </div>
      </div>

      {daily.loading ? (
        <div className="wallpaper-grid wallpaper-grid--history">
          {Array.from({ length: HISTORY_LIMIT }, (_, index) => (
            <div key={index} className="wallpaper-thumb is-skeleton" aria-hidden="true" />
          ))}
        </div>
      ) : history.length ? (
        <>
          <p className="wallpaper-daily__hint">最近 {history.length} 天（点击可固定使用某一天）</p>
          <div className="wallpaper-grid wallpaper-grid--history">
            {history.map((image) => {
              const selected = mode === 'bing' && bingDate === image.date;
              return (
                <button
                  key={image.date}
                  type="button"
                  className={`wallpaper-thumb${selected ? ' is-selected' : ''}`}
                  title={`${stampLabel(image.date)} ${image.title}`}
                  aria-pressed={selected}
                  onClick={() => onSelectBingDate(image.date)}
                >
                  <img src={image.thumb} alt="" loading="lazy" draggable={false} />
                  <span className="wallpaper-thumb__date">
                    {isCurrentImage(image) ? '今日' : stampLabel(image.date)}
                  </span>
                  {selected ? (
                    <span className="wallpaper-thumb__check" aria-hidden="true">
                      <IconCheck size={11} />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </>
      ) : null}

      <p className="modal__section">自定义</p>
      <div className="wallpaper-custom">
        <div className="wallpaper-custom__preview" aria-hidden="true">
          <IconImageOutline size={22} />
        </div>
        <div className="wallpaper-custom__info">
          <p className="wallpaper-custom__title">
            将您喜爱的图片设为壁纸。
            {mode === 'custom' ? <span className="wallpaper-tag">使用中</span> : null}
          </p>
          <p className="wallpaper-custom__desc">粘贴可直接访问的在线图片地址，起始页每次加载都会显示这张图片。</p>
          <div className="wallpaper-custom__actions">
            <button
              type="button"
              className="pill-button"
              onClick={() => {
                setLinkOpen((open) => !open);
                setError(null);
              }}
            >
              <IconLink size={14} />
              在线图片链接
            </button>
            {customUrl ? (
              <button type="button" className="pill-button" onClick={onClearCustom}>
                <IconTrash size={14} />
                移除自定义壁纸
              </button>
            ) : null}
          </div>
          {linkOpen ? (
            <form className="wallpaper-link" onSubmit={submitLink}>
              <input
                className="text-field"
                type="url"
                inputMode="url"
                value={url}
                placeholder="https://example.com/wallpaper.jpg"
                aria-label="在线图片地址"
                autoFocus
                onChange={(event) => setUrl(event.target.value)}
              />
              <button type="submit" className="pill-button pill-button--primary" disabled={checking}>
                {checking ? '检查中…' : '使用'}
              </button>
            </form>
          ) : null}
          {error ? <p className="field__error">{error}</p> : null}
        </div>
      </div>

      <p className="modal__section">默认</p>
      <div className="wallpaper-grid">
        {WALLPAPERS.map((wallpaper) => {
          const selected = mode === 'builtin' && builtinId === wallpaper.id;
          return (
            <button
              key={wallpaper.id}
              type="button"
              className={`wallpaper-thumb${selected ? ' is-selected' : ''}`}
              title={wallpaper.name}
              aria-pressed={selected}
              onClick={() => onSelect(wallpaper.id)}
            >
              <img src={wallpaper.thumb} alt="" loading="lazy" draggable={false} />
              {selected ? (
                <span className="wallpaper-thumb__check" aria-hidden="true">
                  <IconCheck size={11} />
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      <div className="wallpaper-meta">
        <span className="wallpaper-meta__name">{current.name}</span>
        {current.creditLink ? (
          <a className="wallpaper-meta__credit" href={current.creditLink} target="_blank" rel="noreferrer">
            {current.credit}
          </a>
        ) : (
          <span className="wallpaper-meta__credit">{current.credit}</span>
        )}
        <span className="wallpaper-meta__source">
          {current.source === 'bing'
            ? `图片来源：必应每日一图 · ${
                showingToday ? '今日' : current.date ? stampLabel(current.date) : '历史图片'
              }${mode === 'daily' ? ' · 每天自动更新' : ' · 已固定使用'}`
            : current.source === 'custom'
              ? '图片来源：自定义在线图片'
              : '图片来源：本地内置素材（必应每日一图历史图片）'}
        </span>
      </div>
    </Modal>
  );
}
