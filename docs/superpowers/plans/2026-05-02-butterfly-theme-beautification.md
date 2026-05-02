# Butterfly 主题美化实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 为 Wislist 博客实现简约现代风格的全面美化，包括视觉升级、深色模式、本地搜索、文章目录优化和性能优化。

**Architecture:** 基于 Butterfly 主题的非侵入式扩展，通过配置文件、自定义 CSS/JS 注入和插件实现所有功能。不修改主题源码，确保可维护性和可升级性。

**Tech Stack:** Hexo 8.x, Butterfly 主题, hexo-generator-search, CSS Variables, localStorage API

---

## 文件结构规划

本次实现将创建和修改以下文件：

**新建文件：**
- `source/css/custom.css` - 自定义样式（简约现代风格、深色模式、动画）
- `source/js/custom.js` - 自定义脚本（深色模式切换、阅读时间计算）

**修改文件：**
- `_config.butterfly.yml` - 主题配置（启用功能、注入自定义文件）
- `package.json` - 添加搜索插件依赖

---

### Task 1: 安装搜索插件

**Files:**
- Modify: `package.json`

- [ ] **Step 1: 安装 hexo-generator-search 插件**

```bash
pnpm install hexo-generator-search --save
```

Expected: 插件成功安装，package.json 中添加依赖

- [ ] **Step 2: 验证安装**

```bash
pnpm list hexo-generator-search
```

Expected: 显示已安装的版本号

- [ ] **Step 3: 提交更改**

```bash
git add package.json pnpm-lock.yaml
git commit -m "$(cat <<'EOF'
feat: 添加本地搜索插件

安装 hexo-generator-search 用于实现博客本地搜索功能

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 2: 配置 Butterfly 主题基础功能

**Files:**
- Modify: `_config.butterfly.yml`

- [ ] **Step 1: 启用本地搜索功能**

在 `_config.butterfly.yml` 中添加或修改搜索配置：

```yaml
# Local search
local_search:
  enable: true
  preload: false
  CDN:
```

- [ ] **Step 2: 优化文章目录配置**

确保 TOC 配置如下：

```yaml
toc:
  post: true
  page: false
  number: true
  expand: false
  style_simple: false
  scroll_percent: true
```

- [ ] **Step 3: 启用图片懒加载**

确保懒加载已启用：

```yaml
lazyload:
  enable: true
  field: site
  placeholder:
  blur: false
```

- [ ] **Step 4: 配置右侧按钮**

确保显示滚动百分比：

```yaml
rightside_scroll_percent: true
```

- [ ] **Step 5: 提交配置更改**

```bash
git add _config.butterfly.yml
git commit -m "$(cat <<'EOF'
feat: 配置 Butterfly 主题基础功能

启用本地搜索、优化文章目录、启用图片懒加载和滚动百分比显示

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 3: 创建自定义样式文件（简约现代风格）

**Files:**
- Create: `source/css/custom.css`

- [ ] **Step 1: 创建 CSS 目录**

```bash
mkdir -p source/css
```

- [ ] **Step 2: 创建自定义样式文件（第 1 部分：CSS 变量）**

创建 `source/css/custom.css` 并添加 CSS 变量定义：

```css
/* ==========================================
   Butterfly 主题自定义样式 - 简约现代风格
   ========================================== */

:root {
  /* 浅色模式配色 */
  --primary-color: #2c3e50;
  --bg-color: #ffffff;
  --secondary-bg: #f8f9fa;
  --accent-color: #3498db;
  --border-color: #e1e4e8;
  --text-color: #2c3e50;
  --text-secondary: #6c757d;
  
  /* 字体 */
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
  --code-font: "JetBrains Mono", "Fira Code", Consolas, Monaco, monospace;
  
  /* 间距 */
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 2rem;
  
  /* 圆角 */
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  
  /* 阴影 */
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.15);
  
  /* 过渡 */
  --transition-fast: 150ms ease;
  --transition-normal: 200ms ease;
  --transition-slow: 300ms ease;
  --transition-theme: 400ms ease;
}

/* 深色模式配色 */
[data-theme="dark"] {
  --primary-color: #e4e6eb;
  --bg-color: #1a1a1a;
  --secondary-bg: #242424;
  --accent-color: #5dade2;
  --border-color: #333333;
  --text-color: #e4e6eb;
  --text-secondary: #a8a8a8;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
}
```

- [ ] **Step 3: 添加全局样式覆盖（第 2 部分）**

继续在 `source/css/custom.css` 中添加：

```css

/* ==========================================
   全局样式优化
   ========================================== */

* {
  transition: background-color var(--transition-theme),
              color var(--transition-theme),
              border-color var(--transition-theme);
}

body {
  font-family: var(--font-family);
  color: var(--text-color);
  background-color: var(--bg-color);
  line-height: 1.8;
  font-size: 16px;
}

/* 链接样式 */
a {
  color: var(--accent-color);
  text-decoration: none;
  transition: color var(--transition-fast);
}

a:hover {
  color: var(--primary-color);
}

/* 代码块样式 */
code, pre {
  font-family: var(--code-font);
}
```

- [ ] **Step 4: 添加卡片和布局样式（第 3 部分）**

继续在 `source/css/custom.css` 中添加：

```css

/* ==========================================
   卡片和布局样式
   ========================================== */

/* 卡片样式 */
.card-widget {
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  transition: transform var(--transition-normal),
              box-shadow var(--transition-normal);
}

.card-widget:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

/* 文章卡片 */
#recent-posts > .recent-post-item {
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: transform var(--transition-normal),
              box-shadow var(--transition-normal);
}

#recent-posts > .recent-post-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-md);
}

/* 页面容器 */
#page {
  background: var(--bg-color);
}

#content-inner {
  background: var(--bg-color);
}
```

- [ ] **Step 5: 添加动画效果（第 4 部分）**

继续在 `source/css/custom.css` 中添加：

```css

/* ==========================================
   动画效果
   ========================================== */

/* 页面加载淡入 */
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

#page {
  animation: fadeIn var(--transition-slow) ease-out;
}

/* 卡片渐入效果 */
@keyframes staggerFadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.recent-post-item {
  animation: staggerFadeIn 0.6s ease-out backwards;
}

.recent-post-item:nth-child(1) { animation-delay: 0.1s; }
.recent-post-item:nth-child(2) { animation-delay: 0.2s; }
.recent-post-item:nth-child(3) { animation-delay: 0.3s; }
.recent-post-item:nth-child(4) { animation-delay: 0.4s; }
.recent-post-item:nth-child(5) { animation-delay: 0.5s; }

/* 按钮交互效果 */
button, .button, .btn {
  transition: transform var(--transition-fast),
              box-shadow var(--transition-fast);
}

button:active, .button:active, .btn:active {
  transform: scale(0.95);
}

/* 图片淡入效果 */
img {
  transition: opacity var(--transition-slow);
}

img[loading="lazy"] {
  opacity: 0;
}

img[loading="lazy"].loaded {
  opacity: 1;
}
```

- [ ] **Step 6: 添加响应式优化（第 5 部分）**

继续在 `source/css/custom.css` 中添加：

```css

/* ==========================================
   响应式优化
   ========================================== */

@media (max-width: 768px) {
  body {
    font-size: 15px;
  }
  
  .card-widget {
    border-radius: var(--radius-sm);
  }
  
  #recent-posts > .recent-post-item {
    border-radius: var(--radius-sm);
  }
}

/* 深色模式特定优化 */
[data-theme="dark"] img {
  opacity: 0.9;
}

[data-theme="dark"] .card-widget {
  background: var(--secondary-bg);
  border-color: var(--border-color);
}
```

- [ ] **Step 7: 提交自定义样式文件**

```bash
git add source/css/custom.css
git commit -m "$(cat <<'EOF'
feat: 添加简约现代风格自定义样式

- 定义浅色和深色模式的 CSS 变量
- 优化全局字体和排版
- 添加卡片悬停效果和阴影
- 实现页面加载和卡片渐入动画
- 添加响应式优化

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 4: 创建深色模式切换脚本

**Files:**
- Create: `source/js/custom.js`

- [ ] **Step 1: 创建 JS 目录**

```bash
mkdir -p source/js
```

- [ ] **Step 2: 创建深色模式切换脚本**

创建 `source/js/custom.js`：

```javascript
/**
 * Butterfly 主题自定义脚本
 * 功能：深色模式切换、阅读时间计算
 */

(function() {
  'use strict';

  // ==========================================
  // 深色模式管理
  // ==========================================
  
  const ThemeManager = {
    // 主题常量
    THEMES: {
      LIGHT: 'light',
      DARK: 'dark',
      AUTO: 'auto'
    },
    
    STORAGE_KEY: 'theme-preference',
    
    // 初始化主题
    init() {
      this.applyTheme(this.getPreference());
      this.setupToggleButton();
      this.watchSystemTheme();
    },
    
    // 获取用户偏好
    getPreference() {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored || this.THEMES.AUTO;
    },
    
    // 保存用户偏好
    savePreference(theme) {
      localStorage.setItem(this.STORAGE_KEY, theme);
    },
    
    // 获取系统主题
    getSystemTheme() {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? this.THEMES.DARK
        : this.THEMES.LIGHT;
    },
    
    // 应用主题
    applyTheme(preference) {
      const theme = preference === this.THEMES.AUTO
        ? this.getSystemTheme()
        : preference;
      
      document.documentElement.setAttribute('data-theme', theme);
      this.updateToggleButton(preference);
    },
    
    // 切换主题
    toggleTheme() {
      const current = this.getPreference();
      let next;
      
      // 循环切换：light -> dark -> auto -> light
      switch(current) {
        case this.THEMES.LIGHT:
          next = this.THEMES.DARK;
          break;
        case this.THEMES.DARK:
          next = this.THEMES.AUTO;
          break;
        case this.THEMES.AUTO:
          next = this.THEMES.LIGHT;
          break;
        default:
          next = this.THEMES.AUTO;
      }
      
      this.savePreference(next);
      this.applyTheme(next);
    },
    
    // 设置切换按钮
    setupToggleButton() {
      // 创建切换按钮
      const button = document.createElement('button');
      button.id = 'theme-toggle';
      button.className = 'theme-toggle-btn';
      button.setAttribute('aria-label', '切换主题');
      button.innerHTML = this.getButtonIcon(this.getPreference());
      
      // 添加到右侧工具栏
      const rightside = document.getElementById('rightside');
      if (rightside) {
        rightside.insertBefore(button, rightside.firstChild);
      }
      
      // 绑定点击事件
      button.addEventListener('click', () => this.toggleTheme());
    },
    
    // 更新按钮图标
    updateToggleButton(preference) {
      const button = document.getElementById('theme-toggle');
      if (button) {
        button.innerHTML = this.getButtonIcon(preference);
      }
    },
    
    // 获取按钮图标
    getButtonIcon(preference) {
      const icons = {
        light: '<i class="fas fa-sun"></i>',
        dark: '<i class="fas fa-moon"></i>',
        auto: '<i class="fas fa-circle-half-stroke"></i>'
      };
      return icons[preference] || icons.auto;
    },
    
    // 监听系统主题变化
    watchSystemTheme() {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', () => {
        if (this.getPreference() === this.THEMES.AUTO) {
          this.applyTheme(this.THEMES.AUTO);
        }
      });
    }
  };

  // ==========================================
  // 阅读时间计算
  // ==========================================
  
  const ReadingTime = {
    // 中文每分钟阅读字数
    WORDS_PER_MINUTE_ZH: 300,
    // 英文每分钟阅读单词数
    WORDS_PER_MINUTE_EN: 200,
    
    // 计算阅读时间
    calculate() {
      const content = document.querySelector('.post-content');
      if (!content) return;
      
      const text = content.textContent || '';
      
      // 统计中文字符
      const chineseChars = (text.match(/[一-龥]/g) || []).length;
      // 统计英文单词
      const englishWords = (text.match(/[a-zA-Z]+/g) || []).length;
      
      // 计算阅读时间（分钟）
      const minutes = Math.ceil(
        chineseChars / this.WORDS_PER_MINUTE_ZH +
        englishWords / this.WORDS_PER_MINUTE_EN
      );
      
      this.display(minutes);
    },
    
    // 显示阅读时间
    display(minutes) {
      const metaDiv = document.querySelector('.post-meta');
      if (!metaDiv) return;
      
      // 创建阅读时间元素
      const readingTimeEl = document.createElement('span');
      readingTimeEl.className = 'post-meta-item reading-time';
      readingTimeEl.innerHTML = `
        <i class="far fa-clock"></i>
        <span>预计阅读 ${minutes} 分钟</span>
      `;
      
      // 添加到 meta 区域
      metaDiv.appendChild(readingTimeEl);
    }
  };

  // ==========================================
  // 初始化
  // ==========================================
  
  // DOM 加载完成后初始化
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      ThemeManager.init();
      ReadingTime.calculate();
    });
  } else {
    ThemeManager.init();
    ReadingTime.calculate();
  }

})();
```

- [ ] **Step 3: 添加按钮样式到 CSS**

在 `source/css/custom.css` 末尾添加主题切换按钮样式：

```css

/* ==========================================
   主题切换按钮
   ========================================== */

.theme-toggle-btn {
  position: fixed;
  right: 20px;
  bottom: 100px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--secondary-bg);
  border: 1px solid var(--border-color);
  color: var(--text-color);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: var(--shadow-md);
  transition: all var(--transition-normal);
  z-index: 100;
}

.theme-toggle-btn:hover {
  transform: scale(1.1);
  box-shadow: var(--shadow-lg);
}

.theme-toggle-btn:active {
  transform: scale(0.95);
}

/* 阅读时间样式 */
.reading-time {
  margin-left: var(--spacing-md);
  color: var(--text-secondary);
}

.reading-time i {
  margin-right: var(--spacing-sm);
}
```

- [ ] **Step 4: 提交自定义脚本**

```bash
git add source/js/custom.js source/css/custom.css
git commit -m "$(cat <<'EOF'
feat: 添加深色模式切换和阅读时间计算功能

- 实现三种主题模式：浅色、深色、跟随系统
- 使用 localStorage 保存用户偏好
- 添加右侧浮动切换按钮
- 实现阅读时间自动计算和显示
- 添加主题切换按钮样式

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 5: 配置自定义文件注入

**Files:**
- Modify: `_config.butterfly.yml`

- [ ] **Step 1: 添加自定义 CSS 注入配置**

在 `_config.butterfly.yml` 的 `inject` 部分添加：

```yaml
inject:
  head:
    - <link rel="stylesheet" href="/css/custom.css">
  bottom:
    - <script src="/js/custom.js"></script>
```

- [ ] **Step 2: 验证配置格式**

```bash
cat _config.butterfly.yml | grep -A 5 "inject:"
```

Expected: 显示正确的注入配置

- [ ] **Step 3: 提交配置更改**

```bash
git add _config.butterfly.yml
git commit -m "$(cat <<'EOF'
feat: 配置自定义 CSS 和 JS 文件注入

通过 inject 配置将自定义样式和脚本注入到页面中

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>
EOF
)"
```

---

### Task 6: 测试和验证

**Files:**
- None (testing only)

- [ ] **Step 1: 清理缓存并重新生成**

```bash
pnpm run clean && pnpm run build
```

Expected: 成功生成静态文件，无错误

- [ ] **Step 2: 启动本地服务器**

```bash
pnpm run server
```

Expected: 服务器在 http://localhost:4000 启动

- [ ] **Step 3: 手动验证功能**

在浏览器中打开 http://localhost:4000 并验证：
- [ ] 页面使用简约现代风格
- [ ] 深色模式切换按钮显示在右侧
- [ ] 点击按钮可以切换浅色/深色/自动模式
- [ ] 主题偏好保存在 localStorage
- [ ] 搜索功能正常工作
- [ ] 文章页面显示阅读时间
- [ ] 卡片悬停有上浮和阴影效果
- [ ] 页面加载有淡入动画
- [ ] 图片懒加载生效

- [ ] **Step 4: 停止服务器**

按 Ctrl+C 停止服务器

---

## 自审检查清单

**规格覆盖检查：**
- ✅ 视觉升级：简约现代配色方案、字体优化、动画效果
- ✅ 深色模式：三种模式切换、localStorage 保存、CSS 变量实现
- ✅ 本地搜索：hexo-generator-search 插件、配置启用
- ✅ 文章目录优化：TOC 配置、滚动百分比
- ✅ 图片懒加载：Butterfly 内置功能启用
- ✅ 页面动画：淡入效果、卡片渐入、按钮交互
- ✅ 阅读时间：自动计算和显示

**占位符检查：**
- ✅ 无 TBD、TODO 或占位符
- ✅ 所有代码块完整
- ✅ 所有命令具体明确

**类型一致性检查：**
- ✅ CSS 变量命名一致
- ✅ 函数和方法命名一致
- ✅ 类名和 ID 命名一致

---

## 执行选项

计划已完成并保存。现在有两种执行方式：

**方式 1：子代理驱动（推荐）**
- 为每个任务派发新的子代理
- 任务间进行审查
- 快速迭代

**方式 2：内联执行**
- 在当前会话中使用 executing-plans 执行任务
- 批量执行，设置检查点进行审查

你想使用哪种方式？
