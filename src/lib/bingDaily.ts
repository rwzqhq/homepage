/**
 * Bing「每日一图」数据源。
 *
 * 官方接口 `https://www.bing.com/HPImageArchive.aspx` 不返回 `Access-Control-Allow-Origin`，
 * 浏览器在其它源上无法直接读取（也没有 JSONP）。因此这里按顺序尝试多个来源，
 * 只要有一个成功就用它，并写入本地缓存，保证：
 *
 *  1. `/api/bing-daily`（本机 dev / preview 中间件，字段最全，含中文标题与版权）；
 *  2. `bing.biturl.top`（公开镜像，自带 `Access-Control-Allow-Origin: *`）；
 *  3. 公共 CORS 代理转发官方接口；
 *  4. `peapix.com/bing`（最后的备用镜像）。
 *
 * 全部失败时抛错，由调用方回退到内置壁纸 —— 起始页永远有背景图。
 */

export interface BingImage {
  /** 必应 startdate，图片开始展示的日期（YYYYMMDD），用作唯一标识。 */
  date: string;
  /** 必应 enddate，通常为次日，用来判断这张图是不是「今天的」。 */
  endDate: string;
  title: string;
  copyright: string;
  copyrightLink: string;
  /** 1920×1080，起始页默认使用。 */
  src: string;
  /** UHD 原图（约 3840×2160）。 */
  uhd: string;
  /** 小缩略图，用于壁纸弹窗。 */
  thumb: string;
}

export interface BingCache {
  fetchedAt: number;
  source: string;
  sourceLabel: string;
  images: BingImage[];
}

export type BingSourceId = 'proxy' | 'biturl' | 'allorigins' | 'codetabs' | 'peapix';

const CACHE_KEY = 'limestart-homepage:v1:bing-daily';
const ARCHIVE = 'https://www.bing.com/HPImageArchive.aspx';
const MARKET = 'zh-CN';
const MAX_HISTORY = 16;

/* ------------------------------------------------------------------ 日期工具 */

export function todayStamp(now: Date = new Date()): string {
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${now.getFullYear()}${month}${day}`;
}

/** `20260922` → `9月22日`。 */
export function stampLabel(stamp: string): string {
  if (!/^\d{8}$/.test(stamp)) return '';
  return `${Number(stamp.slice(4, 6))}月${Number(stamp.slice(6, 8))}日`;
}

/** 当前这张图是否仍然是必应今天在用的那张。 */
export function isCurrentImage(image: BingImage, today: string = todayStamp()): boolean {
  if (image.endDate && image.endDate >= today) return true;
  return image.date === today;
}

export function isCacheFresh(cache: BingCache | null, today: string = todayStamp()): boolean {
  const first = cache?.images[0];
  if (!first) return false;
  if (isCurrentImage(first, today)) return true;
  // 镜像源可能没有 enddate，只要今天同步过、且图片就是最近一两天的，就先当作可用，
  // 避免在没有 enddate 时反复请求；有 enddate 的一律按 enddate 判断新旧。
  if (first.endDate) return false;
  const fetchedToday = cache ? todayStamp(new Date(cache.fetchedAt)) === today : false;
  const yesterday = todayStamp(new Date(Date.now() - 86_400_000));
  return fetchedToday && first.date >= yesterday;
}

/* -------------------------------------------------------------- 图片地址变体 */

/**
 * 把 `..._1920x1080.jpg` 换成指定尺寸。
 * 注意 Bing 的地址是 `th?id=OHR.X_1920x1080.jpg&rf=...&pid=hp`，尺寸后缀在查询串里，
 * 所以直接在整条地址上替换（后缀后面跟着 `&`、`#`、`?` 或字符串结尾）。
 */
function withSize(url: string, size: string): string {
  return url.replace(/_(?:\d+x\d+|UHD)\.(jpe?g|png)(?=[&?#]|$)/i, `_${size}.$1`);
}

function absoluteBingUrl(raw: unknown, urlbase: unknown): string | null {
  const base = typeof urlbase === 'string' ? urlbase : '';
  const value = typeof raw === 'string' ? raw : '';
  const path = value || (base ? `${base}_1920x1080.jpg` : '');
  if (!path) return null;
  const absolute = path.startsWith('http') ? path : `https://www.bing.com${path.startsWith('/') ? '' : '/'}${path}`;
  return withSize(absolute, '1920x1080');
}

/** 版权文案里通常已经包含标题，镜像源没有 title 字段时从版权里取。 */
function deriveTitle(copyright: string): string {
  const head = copyright.split(/[(（]/)[0].trim().replace(/^©\s*/, '');
  return head.length >= 2 && head.length <= 48 ? head : '必应每日一图';
}

/* ------------------------------------------------------------------ 归一化 */

function fromArchive(payload: unknown): BingImage[] | null {
  const images = (payload as { images?: unknown })?.images;
  if (!Array.isArray(images)) return null;
  const list: BingImage[] = [];
  for (const raw of images) {
    const item = raw as Record<string, unknown>;
    const src = absoluteBingUrl(item.url, item.urlbase);
    if (!src) continue;
    const date = typeof item.startdate === 'string' ? item.startdate : '';
    if (!/^\d{8}$/.test(date)) continue;
    const copyright = typeof item.copyright === 'string' ? item.copyright : '';
    const title = typeof item.title === 'string' && item.title.trim() ? item.title.trim() : deriveTitle(copyright);
    list.push({
      date,
      endDate: typeof item.enddate === 'string' ? item.enddate : '',
      title,
      copyright,
      copyrightLink: typeof item.copyrightlink === 'string' ? item.copyrightlink : '',
      src,
      uhd: withSize(src, 'UHD'),
      thumb: withSize(src, '400x240'),
    });
  }
  return list.length ? list : null;
}

function fromBiturl(payload: unknown): BingImage | null {
  const item = payload as Record<string, unknown>;
  const src = typeof item?.url === 'string' ? item.url : '';
  if (!src.startsWith('http')) return null;
  const date = typeof item.start_date === 'string' ? item.start_date : '';
  if (!/^\d{8}$/.test(date)) return null;
  const clean = withSize(src, '1920x1080');
  const copyright = typeof item.copyright === 'string' ? item.copyright : '';
  return {
    date,
    endDate: typeof item.end_date === 'string' ? item.end_date : '',
    title: deriveTitle(copyright),
    copyright,
    copyrightLink: typeof item.copyright_link === 'string' ? item.copyright_link : '',
    src: clean,
    uhd: withSize(src, 'UHD'),
    thumb: withSize(src, '400x240'),
  };
}

function fromPeapix(payload: unknown): BingImage[] | null {
  if (!Array.isArray(payload)) return null;
  const list: BingImage[] = [];
  for (const raw of payload) {
    const item = raw as Record<string, unknown>;
    const src = typeof item.fullUrl === 'string' ? item.fullUrl : '';
    if (!src.startsWith('http')) continue;
    const date = typeof item.date === 'string' ? item.date.replace(/-/g, '') : '';
    if (!/^\d{8}$/.test(date)) continue;
    const title = typeof item.title === 'string' ? item.title.trim() : '';
    list.push({
      date,
      endDate: '',
      title: title || '必应每日一图',
      copyright: typeof item.copyright === 'string' ? item.copyright : '',
      copyrightLink: typeof item.pageUrl === 'string' ? item.pageUrl : '',
      src,
      uhd: typeof item.imageUrl === 'string' ? item.imageUrl : src,
      thumb: typeof item.thumbUrl === 'string' ? item.thumbUrl : src,
    });
  }
  return list.length ? list : null;
}

/* --------------------------------------------------------------- 抓取与缓存 */

async function fetchJson(url: string, signal: AbortSignal): Promise<unknown> {
  const response = await fetch(url, {
    signal,
    credentials: 'omit',
    referrerPolicy: 'no-referrer',
    headers: { accept: 'application/json, text/plain, */*' },
  });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  const text = await response.text();
  return JSON.parse(text) as unknown;
}

function archiveUrl(count: number): string {
  return `${ARCHIVE}?format=js&idx=0&n=${count}&mkt=${MARKET}`;
}

interface BingSource {
  id: BingSourceId;
  label: string;
  load: (count: number, signal: AbortSignal) => Promise<BingImage[]>;
}

const SOURCES: BingSource[] = [
  {
    id: 'proxy',
    label: '必应官方接口',
    async load(count, signal) {
      const images = fromArchive(await fetchJson(`/api/bing-daily?n=${count}&mkt=${MARKET}`, signal));
      if (!images) throw new Error('接口未返回图片');
      return images;
    },
  },
  {
    id: 'biturl',
    label: '必应每日一图镜像',
    async load(count, signal) {
      // 该镜像一次只返回一张，用 index 并行取最近几天。
      const indexes = Array.from({ length: Math.min(count, 4) }, (_, index) => index);
      const settled = await Promise.allSettled(
        indexes.map((index) =>
          fetchJson(`https://bing.biturl.top/?resolution=1920&format=json&index=${index}&mkt=${MARKET}`, signal),
        ),
      );
      const images: BingImage[] = [];
      for (const result of settled) {
        if (result.status !== 'fulfilled') continue;
        const image = fromBiturl(result.value);
        if (image) images.push(image);
      }
      if (!images.length) throw new Error('镜像未返回图片');
      return images;
    },
  },
  {
    id: 'allorigins',
    label: 'CORS 代理 · allorigins',
    async load(count, signal) {
      const url = `https://api.allorigins.win/raw?url=${encodeURIComponent(archiveUrl(count))}`;
      const images = fromArchive(await fetchJson(url, signal));
      if (!images) throw new Error('代理未返回图片');
      return images;
    },
  },
  {
    id: 'codetabs',
    label: 'CORS 代理 · codetabs',
    async load(count, signal) {
      const url = `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(archiveUrl(count))}`;
      const images = fromArchive(await fetchJson(url, signal));
      if (!images) throw new Error('代理未返回图片');
      return images;
    },
  },
  {
    id: 'peapix',
    label: 'Peapix 镜像',
    async load(_count, signal) {
      const images = fromPeapix(await fetchJson('https://peapix.com/bing/feed', signal));
      if (!images) throw new Error('镜像未返回图片');
      return images;
    },
  },
];

export function bingSourceLabel(id: string): string {
  return SOURCES.find((source) => source.id === id)?.label ?? id;
}

/** 双击 dist/index.html（file://）时不存在 /api/bing-daily，跳过本机代理这一源。 */
function availableSources(): BingSource[] {
  const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';
  return isFileProtocol ? SOURCES.filter((source) => source.id !== 'proxy') : SOURCES;
}

/** 依次尝试所有来源，返回第一个拿到的结果。 */
export async function fetchBingDaily(
  options: { count?: number; budgetMs?: number; perSourceMs?: number; signal?: AbortSignal } = {},
): Promise<BingCache> {
  const count = Math.min(Math.max(Math.trunc(options.count ?? 8), 1), 8);
  const perSourceMs = options.perSourceMs ?? 6500;
  const deadline = Date.now() + (options.budgetMs ?? 13000);
  const failures: string[] = [];

  for (const source of availableSources()) {
    const remaining = deadline - Date.now();
    if (remaining <= 500) {
      failures.push('已超出等待时间');
      break;
    }

    const controller = new AbortController();
    const abort = () => controller.abort();
    options.signal?.addEventListener('abort', abort);
    const timer = setTimeout(abort, Math.min(perSourceMs, remaining));

    try {
      const images = await source.load(count, controller.signal);
      return { fetchedAt: Date.now(), source: source.id, sourceLabel: source.label, images };
    } catch (error) {
      failures.push(`${source.label}：${error instanceof Error ? error.message : '失败'}`);
    } finally {
      clearTimeout(timer);
      options.signal?.removeEventListener('abort', abort);
    }
  }

  throw new Error(failures.join('；') || '所有壁纸来源都不可用');
}

/* -------------------------------------------------------------------- 缓存 */

function mergeImages(previous: BingImage[], next: BingImage[]): BingImage[] {
  const byDate = new Map<string, BingImage>();
  // next 在前：同一天的图片一定以最新抓到的结果为准，previous 只用来补历史。
  for (const image of [...next, ...previous]) {
    if (byDate.has(image.date)) continue;
    byDate.set(image.date, image);
  }
  return [...byDate.values()].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)).slice(0, MAX_HISTORY);
}

export function readBingCache(): BingCache | null {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<BingCache>;
    if (!Array.isArray(parsed.images) || !parsed.images.length) return null;
    const images = parsed.images.filter(
      (image): image is BingImage =>
        !!image && typeof image.date === 'string' && typeof image.src === 'string' && /^\d{8}$/.test(image.date),
    );
    if (!images.length) return null;
    return {
      fetchedAt: typeof parsed.fetchedAt === 'number' ? parsed.fetchedAt : 0,
      source: typeof parsed.source === 'string' ? parsed.source : 'cache',
      sourceLabel: typeof parsed.sourceLabel === 'string' ? parsed.sourceLabel : '本地缓存',
      images,
    };
  } catch {
    return null;
  }
}

export function writeBingCache(result: BingCache): BingCache {
  const previous = readBingCache();
  const merged: BingCache = {
    ...result,
    images: mergeImages(previous?.images ?? [], result.images),
  };
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(merged));
  } catch {
    /* 隐私模式下写不进去也无所谓 */
  }
  return merged;
}

/** 按偏好挑出 1080p 或 4K 原图。 */
export function bingImageUrl(image: BingImage, uhd: boolean): string {
  return uhd && image.uhd ? image.uhd : image.src;
}
