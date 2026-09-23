import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { bingDailyProxy } from './server/bingDailyProxy.ts';
import { inlineSingleFile } from './server/inlineSingleFile.ts';

export default defineConfig(({ command }) => ({
  // 构建用相对路径，dist 放到任意目录 / 双击打开都不会找错文件。
  base: command === 'build' ? './' : '/',
  plugins: [react(), bingDailyProxy(), inlineSingleFile()],
  server: {
    port: 5173,
  },
  preview: {
    port: 4173,
  },
  build: {
    target: 'es2020',
    assetsInlineLimit: 4096,
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // 单文件产物必须是普通脚本：file:// 下 ES module 会被 CORS 拦掉。
        format: 'iife',
      },
    },
  },
}));
