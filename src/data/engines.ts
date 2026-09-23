import type { Engine, EngineId } from '../types';

export const ENGINES: Engine[] = [
  { id: 'baidu', name: '百度', searchUrl: 'https://www.baidu.com/s?wd=%s', hint: 'Alt+1' },
  { id: 'google', name: '谷歌', searchUrl: 'https://www.google.com/search?q=%s', hint: 'Alt+2' },
  { id: 'bing', name: '必应', searchUrl: 'https://www.bing.com/search?q=%s', hint: 'Alt+3' },
  { id: 'yandex', name: 'Yandex', searchUrl: 'https://yandex.com/search/?text=%s', hint: 'Alt+4' },
  { id: 'sogou', name: '搜狗搜索', searchUrl: 'https://www.sogou.com/web?query=%s', hint: 'Alt+5' },
  { id: 'so360', name: '360 搜索', searchUrl: 'https://www.so.com/s?q=%s', hint: 'Alt+6' },
];

export const DEFAULT_ENGINE: EngineId = 'baidu';

export function getEngine(id: EngineId): Engine {
  return ENGINES.find((engine) => engine.id === id) ?? ENGINES[0];
}
