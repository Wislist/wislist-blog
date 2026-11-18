# 部署到 Cloudflare Pages

Hexo 静态站，走 Cloudflare Pages 的 Git 集成：push 到 GitHub 后自动构建并发布。

## 一、推送源码到 GitHub

仓库里**不要**提交 `public/`、`node_modules/`、`db.json`（`.gitignore` 已覆盖）。

```bash
git remote add origin git@github.com:Wislist/wislist-blog.git
git add -A
git commit -m "chore: 迁移到 NexT + Cloudflare Pages"
git push -u origin main
```

> 主题 `themes/next` 已作为**普通文件**提交（原始 `.git` 已移除）。
> 这样做的原因：Cloudflare Pages 构建时不会拉取 git submodule；
> 若保留内嵌仓库，提交进去的只是一个指针，构建会报 `Theme not found`。

## 二、创建 Pages 项目

Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages**
→ **Import an existing Git repository** → 选上面的仓库。

构建配置：

| 配置项 | 值 |
| --- | --- |
| Production branch | `main` |
| Framework preset | `None` |
| Build command | `pnpm build` |
| Build directory | `public` |

环境变量（Settings → Environment variables）：

| 变量 | 值 | 说明 |
| --- | --- | --- |
| `NODE_VERSION` | `22.23.4` | NexT 8 要求 Node `^22.13.0 \|\| >=24`；仓库根目录也放了 `.node-version` |
| `PNPM_VERSION` | `10.34.5` | v3 构建镜像不再从 `pnpm-lock.yaml` 推断版本，必须显式指定或依赖默认 10.11.1 |

## 三、改站点 url

上线后把 `_config.yml` 里的 `url` 改成最终域名，否则 sitemap / canonical / RSS 里的绝对链接是错的：

```yaml
url: https://your-domain.com
```

改完重新 push 即会重新构建。

## 四、绑定自定义域名

Pages 项目 → **Custom domains** → 添加域名，按提示在 DNS 加记录：

- 根域名（`example.com`）→ `CNAME` 到 `<project>.pages.dev`，或走 Cloudflare 的 CNAME flattening
- 子域名（`blog.example.com`）→ `CNAME` 到 `<project>.pages.dev`

域名托管在 Cloudflare 的话，记录会自动配好，HTTPS 证书也自动签发。

别忘了同步改 `_config.yml` 的 `url`。

## 免费额度（2026-09 官方限制）

| 项目 | Free |
| --- | --- |
| 请求 / 带宽 | 不限量 |
| 构建次数 | 500 次/月 |
| 站点文件数 | 20,000 |
| 单文件大小 | 25 MiB |
| 自定义域名 | 100 个/项目 |

## 备注

- `_config.yml` 里 `deploy:` 段（hexo-deployer-git 推 GitHub Pages）保留着当 fallback，走 Pages 后不会自动执行，无副作用。
- 更新 NexT 主题：因为 `.git` 已移除，不能 `git pull`。重新下载新版本后覆盖 `themes/next`，自己的配置都在根目录 `_config.next.yml`，不会丢。
- 需要给静态资源加缓存头时，在 `source/` 放 `_headers` 无效（Hexo 会跳过 `_` 开头的文件），得在 `scripts/` 里写生成钩子把文件写到 `public/`。

## 评论与页脚定制

- `source/_data/styles.styl` 控制 Twikoo 行内表情、回复竖线和父评论定位高亮；历史无 class 的表情也按 `:表情名:` 的 alt 标记匹配，不改变普通配图。
- 评论区隐藏 Twikoo 默认署名，技术与服务链接统一位于 `source/_data/footer.njk`；通过 `_config.next.yml` 的 footer 注入，不修改主题或 Twikoo 压缩包。
- `source/js/footer-hitokoto.js` 将一言放在版权上方：从左到右逐字显示，短暂停留后从右到左收回，再接续新句；没有轮换说明或操作按钮。仅在页脚可见且标签页在前台时继续动画，失败保留上一句；尊重系统减少动态效果设置，句子链接指向真实 UUID。
- 本地样式出现旧缓存时使用 `npm run build -- --force --bail` 重新生成；浏览器验收需同时检查桌面、移动端和深浅色模式。
