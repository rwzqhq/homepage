import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchBingDaily,
  isCacheFresh,
  readBingCache,
  writeBingCache,
  type BingCache,
  type BingImage,
} from './bingDaily';

/** 缓存新鲜度：够新就不重复请求，避免每次开关标签页都打网络。 */
const REVALIDATE_AFTER = 6 * 60 * 60 * 1000;
/** 失败后的自动重试间隔。 */
const RETRY_AFTER = 5 * 60 * 1000;

export interface BingDaily {
  images: BingImage[];
  /** 今天的这张（列表第一张）。 */
  today: BingImage | null;
  sourceLabel: string;
  fetchedAt: number | null;
  error: string | null;
  /** 首次加载，尚无任何图片。 */
  loading: boolean;
  /** 已有图片，正在后台同步。 */
  refreshing: boolean;
  refresh: (force?: boolean) => void;
}

function sameImages(a: BingImage[], b: BingImage[]): boolean {
  if (a.length !== b.length) return false;
  return a.every(
    (image, index) =>
      image.date === b[index].date && image.src === b[index].src && image.title === b[index].title,
  );
}

function msUntilNextDay(): number {
  const now = new Date();
  const next = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 30);
  return Math.max(next.getTime() - now.getTime(), 30_000);
}

/**
 * 保持「必应每日一图」与当天同步：
 * 首次挂载同步一次，跨天（含页面长时间挂着标签页）自动重新同步。
 */
export function useBingDaily(): BingDaily {
  const [cache, setCache] = useState<BingCache | null>(() => readBingCache());
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const inFlight = useRef(false);
  const lastAttempt = useRef(0);

  const run = useCallback(async (force: boolean) => {
    if (inFlight.current) return;

    if (!force) {
      const cached = readBingCache();
      if (cached && isCacheFresh(cached) && Date.now() - cached.fetchedAt < REVALIDATE_AFTER) {
        setCache((current) => (current && sameImages(current.images, cached.images) ? current : cached));
        return;
      }
      if (Date.now() - lastAttempt.current < RETRY_AFTER) return;
    }

    inFlight.current = true;
    lastAttempt.current = Date.now();
    setPending(true);
    try {
      const result = writeBingCache(await fetchBingDaily({ count: 8 }));
      setCache(result);
      setError(null);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : '同步失败');
    } finally {
      inFlight.current = false;
      setPending(false);
    }
  }, []);

  const refresh = useCallback(
    (force = true) => {
      void run(force);
    },
    [run],
  );

  useEffect(() => {
    void run(false);

    const onVisible = () => {
      if (document.visibilityState === 'visible') void run(false);
    };
    const onFocus = () => void run(false);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('focus', onFocus);

    // 跨天：到本地时间第二天再同步一次，页面一直开着也不会停在昨天的图上。
    let timer = window.setTimeout(function tick() {
      void run(true);
      timer = window.setTimeout(tick, msUntilNextDay());
    }, msUntilNextDay());

    return () => {
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('focus', onFocus);
      window.clearTimeout(timer);
    };
  }, [run]);

  const images = cache?.images ?? [];

  return {
    images,
    today: images[0] ?? null,
    sourceLabel: cache?.sourceLabel ?? '',
    fetchedAt: cache?.fetchedAt ?? null,
    error,
    loading: pending && !images.length,
    refreshing: pending && images.length > 0,
    refresh,
  };
}
