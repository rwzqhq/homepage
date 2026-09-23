export type ThemeMode = 'light' | 'dark';

export type IconName = 'grid' | 'image' | 'sun' | 'moon' | 'monogram';

export type ShortcutAction = 'all-shortcuts' | 'wallpaper' | 'theme';

export interface Shortcut {
  id: string;
  name: string;
  /** Target address for website shortcuts. */
  url?: string;
  /** Built-in behaviour for start-page items. */
  action?: ShortcutAction;
  gradient: [string, string];
  icon?: IconName;
  /** Render the site favicon instead of a glyph. */
  favicon?: boolean;
  /** 本地图标（放在 public 下） */
  localIcon?: string;
}

export type EngineId = 'baidu' | 'bing' | 'google' | 'yandex' | 'sogou' | 'so360';

/**
 * 壁纸来源：
 * - `daily`   跟随必应每日一图自动更新；
 * - `bing`    固定使用某一天的必应图片；
 * - `builtin` 内置（本地）壁纸；
 * - `custom`  自定义在线图片地址。
 */
export type WallpaperMode = 'daily' | 'bing' | 'builtin' | 'custom';

export type WallpaperSource = 'bing' | 'local' | 'custom';

export interface Engine {
  id: EngineId;
  name: string;
  /** `%s` is replaced with the encoded query. */
  searchUrl: string;
  hint: string;
}

export interface Wallpaper {
  id: string;
  name: string;
  credit: string;
  src: string;
  thumb: string;
  source: WallpaperSource;
  /** 必应图片的日期（YYYYMMDD）。 */
  date?: string;
  /** 版权信息对应的介绍页。 */
  creditLink?: string;
}
