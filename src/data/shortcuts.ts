import type { Shortcut } from '../types';
/** 本地图标路径：开发时是 /icons/x.png，构建后是 ./icons/x.png */
const iconPath = (file: string) => `${import.meta.env.BASE_URL}icons/${file}`;

/** Gradient tiles follow the reference dock: a light tile with a gradient glyph. */
export const GRADIENTS: [string, string][] = [
  ['#54aee5', '#936ad1'],
  ['#7cd6ff', '#1a87b2'],
  ['#dce35b', '#448000'],
  ['#ffad8d', '#f3525c'],
  ['#ffd976', '#dd8900'],
  ['#aed2ff', '#0055c0'],
  ['#ffb597', '#d75d2b'],
  ['#ffa3aa', '#f24452'],
  ['#ffa2bf', '#eb4772'],
  ['#8ec5ff', '#0f6fff'],
];

export function gradientFor(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % 9973;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}

export const DEFAULT_SHORTCUTS: Shortcut[] = [
  {
    id: 'all-shortcuts',
    name: '所有捷径',
    action: 'all-shortcuts',
    icon: 'grid',
    gradient: ['#54aee5', '#936ad1'],
  },
  {
    id: 'bilibili',
    name: '哔哩哔哩',
    url: 'https://www.bilibili.com',
    favicon: true,
    gradient: ['#ffa2bf', '#eb4772'],
  },
  {
    id: 'github',
    name: 'GitHub',
    url: 'https://github.com',
    localIcon: iconPath('github.svg'),
    favicon: true,
    gradient: ['#a7b1bd', '#24292f'],
  },
  {
    id: 'gmail',
    name: 'Gmail',
    url: 'https://mail.google.com',
    localIcon: iconPath('gmail.svg'),
    favicon: true,
    gradient: ['#a7b1bd', '#24292f'],
  },
  {
    id: '52pojie',
    name: '吾爱破解',
    url: 'https://www.52pojie.cn',
    favicon: true,
    gradient: ['#a7b1bd', '#24292f'],
  },
  {
    id: 'quark',
    name: '夸克网盘',
    url: 'https://pan.quark.cn',
    favicon: true,
    gradient: ['#a7b1bd', '#24292f'],
  },
  {
    id: 'wallpaper',
    name: '壁纸',
    action: 'wallpaper',
    icon: 'image',
    gradient: ['#54aee5', '#936ad1'],
  },
  {
    id: 'theme',
    name: '深色主题',
    action: 'theme',
    icon: 'sun',
    gradient: ['#f7ce46', '#d56829'],
  },
];
