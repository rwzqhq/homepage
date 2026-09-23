import type { Wallpaper } from '../types';

/** 构建后 base 是 './'，开发时是 '/'，两种打开方式都能定位到 wallpapers/。 */
const ASSET_BASE = import.meta.env.BASE_URL;

function asset(path: string): string {
  return `${ASSET_BASE}${path}`;
}

/**
 * 内置壁纸：必应每日一图的历史图片，已本地化，离线或在线同步失败时兜底，
 * 保证起始页任何情况下都有背景图。在线每日同步见 `src/lib/bingDaily.ts`。
 */
function local(id: string, name: string, credit: string, file: string): Wallpaper {
  return {
    id,
    name,
    credit,
    src: asset(`wallpapers/${file}.jpg`),
    thumb: asset(`wallpapers/thumbs/${file}.jpg`),
    source: 'local',
  };
}

export const WALLPAPERS: Wallpaper[] = [
  local('bing-01', '金秋平分，地坛染黄', '地坛公园秋日美景，北京，中国 (© by Wei/Adobestock)', 'bing-01'),
  local('bing-02', '金色时节', '瓜兹曼山口附近的秋日山杨林，犹他州，美国 (© Danita Delimont/Shutterstock)', 'bing-02'),
  local('bing-03', '皮毛与海洋之间的生命', '正在梳理皮毛的海獭，蒙特雷湾，加利福尼亚州，美国 (© Suzi Eszterhas/Minden Pictures)', 'bing-03'),
  local('bing-04', '终获巴黎青睐的铁塔', '日落时分的埃菲尔铁塔，巴黎，法国 (© Alexander Spatari/Getty Images)', 'bing-04'),
  local('bing-05', '慕尼黑啤酒节的阿尔卑斯之声', '阿尔卑斯长号演奏者，巴伐利亚州，德国 (© U. J. Alexander/Shutterstock)', 'bing-05'),
  local('bing-06', '穿越山口腹地', '温纳茨山口，峰区国家公园，英格兰 (© Daniel_Kay/Getty Images)', 'bing-06'),
  local('fantasy-valley', '山海云境', '内置插画壁纸', 'fantasy-valley'),
];

export const DEFAULT_WALLPAPER_ID = 'bing-01';

export function getWallpaper(id: string): Wallpaper {
  return WALLPAPERS.find((wallpaper) => wallpaper.id === id) ?? WALLPAPERS[0];
}
