import type { Plugin } from 'vite';

/**
 * 把构建产物收成一个可双击打开的单文件 index.html。
 *
 * 直接双击 dist/index.html 时页面是 `file://` 源：Chrome 会以 CORS 为由拦掉
 * `<script type="module">` 与外部样式表，所以这里把 JS / CSS 内联进 HTML，
 * 并要求 `rollupOptions.output.format = 'iife'`（普通脚本，不用模块加载）。
 *
 * 两个容易踩的坑：
 *  1. 替换内容必须用「函数形式」传给 String.replace —— 压缩后的代码里含 `$&`、`` $` ``
 *     这类序列，用字符串替换会被当成替换模式，把 HTML 拼进脚本里；
 *  2. 内联脚本要放到 `</body>` 之前 —— 普通脚本（非 module）不会 defer，
 *     留在 <head> 里会在 `<div id="root">` 存在之前执行。
 *
 * 产物仍然可以直接丢到静态托管，不受影响。
 */

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** 内联进 <script> / <style> 的内容里不能出现结束标签。 */
function guardEndTag(code: string, tag: 'script' | 'style'): string {
  return code.replace(new RegExp(`</${tag}`, 'gi'), `<\\/${tag}`);
}

function readSource(source: string | Uint8Array): string {
  return typeof source === 'string' ? source : Buffer.from(source).toString('utf8');
}

/** 去掉标签替换后留下的空行。 */
function tidyBlankLines(html: string): string {
  return html.replace(/[ \t]*\r?\n[ \t]*\r?\n/g, '\n');
}

export function inlineSingleFile(): Plugin {
  return {
    name: 'limestart:inline-single-file',
    apply: 'build',
    enforce: 'post',
    generateBundle(_options, bundle) {
      const entries = Object.values(bundle);
      const htmlAsset = entries.find((item) => item.type === 'asset' && item.fileName.endsWith('.html'));
      if (!htmlAsset || htmlAsset.type !== 'asset') return;

      let html = readSource(htmlAsset.source);
      const scripts: string[] = [];

      // 1. 摘掉入口脚本（稍后统一放到 </body> 之前）
      for (const item of entries) {
        if (item.type !== 'chunk' || !item.isEntry) continue;
        const tag = new RegExp(`<script[^>]*src="[^"]*${escapeRegExp(item.fileName)}"[^>]*></script>`);
        if (!tag.test(html)) continue;
        html = html.replace(tag, () => '');
        scripts.push(guardEndTag(item.code, 'script'));
        delete bundle[item.fileName];
      }

      // 2. 样式表换成 <style>
      for (const item of entries) {
        if (item.type !== 'asset' || !item.fileName.endsWith('.css')) continue;
        const link = new RegExp(`<link[^>]*href="[^"]*${escapeRegExp(item.fileName)}"[^>]*>`);
        if (!link.test(html)) continue;
        const css = guardEndTag(readSource(item.source), 'style');
        html = html.replace(link, () => `<style>${css}</style>`);
        delete bundle[item.fileName];
      }

      html = html.replace(/[ \t]*<link[^>]*rel="modulepreload"[^>]*>\r?\n?/g, '');

      // 3. 脚本放到 </body> 之前，保证 DOM 已经解析完
      const inline = scripts.map((code) => `    <script>${code}</script>`).join('\n');
      if (inline) {
        html = html.includes('</body>')
          ? html.replace('</body>', () => `${inline}\n  </body>`)
          : `${html}\n${inline}\n`;
      }

      htmlAsset.source = tidyBlankLines(html);
    },
  };
}
