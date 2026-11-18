/**
 * 首页自动截断：为没有 `<!-- more -->` 的文章在构建时自动插入该标记。
 *
 * 为什么用脚本而不是插件：
 *  - 不往文章正文里写标记，Typora 里看不到多余的 HTML 注释；
 *  - 新文章零配置，写完直接 push 即可；
 *  - 想调整截断长度只改 _config.yml 的 excerpt_length。
 *
 * 截断点的选择：
 *  - 只在空行处切，绝不切开代码块 / 表格 / 列表；
 *  - 短于阈值 1.2 倍的文章不截断，避免把短笔记切得只剩标题。
 */

const MIN_LENGTH = parseInt(hexo.config.excerpt_length, 10) || 200;

// 粗略估算可见字数：去掉 markdown 符号
function visibleLength(line) {
  return line
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')      // 图片
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')   // 链接保留文字
    .replace(/[#>*`_~\-|[\]()]/g, '')
    .trim().length;
}

function insertMore(content) {
  const lines = content.split('\n');

  let inFence = false;
  let fenceMark = '';
  let count = 0;
  let lastWasHeading = false;
  let candidate = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fence = line.match(/^\s*(`{3,}|~{3,})/);

    if (fence) {
      if (!inFence) {
        inFence = true;
        fenceMark = fence[1][0];
      } else if (fence[1][0] === fenceMark) {
        inFence = false;
        fenceMark = '';
      }
      continue;
    }

    if (inFence) continue;

    // 空行且不在代码块内 → 可作为切点
    if (!line.trim()) {
      if (count >= MIN_LENGTH && !lastWasHeading) {
        candidate = i;
        break;
      }
      continue;
    }

    lastWasHeading = /^#{1,6}\s/.test(line);
    count += visibleLength(line);
  }

  // 太短的文章不截断，或没找到安全切点
  if (candidate === -1 || count < MIN_LENGTH * 1.2) return content;

  return [...lines.slice(0, candidate), '', '<!-- more -->', '', ...lines.slice(candidate)].join('\n');
}

hexo.extend.filter.register('before_post_render', function (data) {
  if (data.layout && data.layout !== 'post') return data;
  if (!data.content || data.content.includes('<!-- more -->')) return data;
  data.content = insertMore(data.content);
  return data;
});
