# Twikoo 评论服务端（部署到 Cloudflare Workers）

评论数据存在 Cloudflare D1，游客填昵称即可评论，不需要登录。

## 当前博客部署

- Worker：`twikoo`，服务地址 `https://twikoo.wislist0721.workers.dev`。
- D1：`twikoo`，已绑定为 `DB` 并初始化表结构。
- 博客 `_config.next.yml` 的 `twikoo.env_id` 已配置服务地址，仅在允许评论的文章页加载。
- 管理员密码已初始化，密码不写入仓库。管理入口默认隐藏（`HIDE_ADMIN_CRYPT=wislist-admin`）；在昵称栏输入 `wislist-admin` 后，点击右下角管理入口并使用管理员密码登录。此暗号仅隐藏入口，不替代密码认证。
- 跨域安全域名为 `https://wislist.site`，本地开发地址也允许访问。
- 服务端更新：在本目录执行 `npx wrangler deploy --minify`；博客配置更新仍需发布博客。
- 服务端使用 `twikoo-func` 的 `getHtmlToText()` 提取最新评论纯文本，不再调用已移除的 `getCheerio()`。

## 访客侧栏接口

- 首次启用：执行 `npx wrangler d1 execute twikoo --remote --file=visitor-schema.sql`，再部署 Worker。与评论共用 D1，但使用独立的 `site_visitors`、`site_metrics` 表。
- `GET /visitor-weather`：用 Cloudflare 的 IP 城市、经纬度估算位置，再请求 Open-Meteo 当前天气；不申请浏览器精确定位，失败时明确显示不可用。
- 天气按约 0.1° 经纬度区域复用 10 分钟边缘缓存；仅缓存天气，不缓存访客城市信息。浏览器会话内复用 10 分钟成功结果，翻页无需再次请求；失败不缓存。切换网络后最多 10 分钟内可能仍显示之前的估算位置。首次查询上游最多等待 4 秒，前端请求最多等待 6 秒。
- `POST /site-stats`：每次页面加载计一次浏览，浏览器 localStorage 随机 UUID 用于独立访客去重；清空存储或更换浏览器会被视为新访客，不代表真实人数。
- 今日浏览按北京时间计算，统计自启用日起累计，不补造历史访问量。本站统计表不保存 IP 地址；本地预览不计数。
- 天气为估算位置的当前数据，使用代理时通常显示代理出口城市。天气数据源：[Open-Meteo](https://open-meteo.com/)。



在**你自己的终端**里执行下面命令（本机 npm 缓存权限、网络代理由你环境决定，比沙箱里顺畅）。

## 前置

- 已安装 Node.js 18+（推荐 20/22）
- 已有 Cloudflare 账号（就是部署博客那个）
- 当前目录：`comment-server/`

## 一、安装依赖

```bash
cd comment-server
npm install
```

## 二、控制打包体积（官方要求，必做）

Workers 免费版对 bundle 有体积限制，这几个包在 Workers 环境用不了，清空它们：

```bash
echo "" > node_modules/jsdom/lib/api.js
echo "" > node_modules/tencentcloud-sdk-nodejs/tencentcloud/index.js
echo "" > node_modules/nodemailer/lib/nodemailer.js
```

> 如果某个文件不存在，忽略即可（说明依赖树里没装这个包）。

## 三、登录 Cloudflare

```bash
npx wrangler login
```

会打开浏览器，点 **Allow** 授权即可。

## 四、创建数据库（D1）

```bash
npx wrangler d1 create twikoo
```

输出里会有一行 `database_id = "xxxxxxxx-xxxx-..."`，**把它复制到 `wrangler.toml`**，替换掉
`REPLACE_WITH_YOUR_D1_ID`。

## 五、建表

```bash
npx wrangler d1 execute twikoo --remote --file=./schema.sql
```

## 六、创建图片存储（可选）

Twikoo 后台的图片/表情上传要用 R2。不做图片上传可跳过，并从 `wrangler.toml` 删掉 `[[r2_buckets]]` 那 3 行。

```bash
npx wrangler r2 bucket create twikoo
```

## 七、部署

```bash
npx wrangler deploy --minify
```

成功后会打印一个地址，形如：

```
https://twikoo.<你的子域>.workers.dev
```

## 八、验证

浏览器打开上面那个地址，看到类似下面这行就说明服务端好了：

```json
{"code":100,"message":"Twikoo 云函数运行正常...","version":"1.6.x"}
```

## 九、接到博客上

把 `https://twikoo.xxx.workers.dev`（**带 https:// 前缀，末尾不要斜杠**）填到博客根目录的
`_config.next.yml`：

```yaml
twikoo:
  enable: true
  env_id: "https://twikoo.xxx.workers.dev"
```

然后 `git push origin main`，Cloudflare 重新部署后评论区就生效了。

## 已知限制（官方说明）

1. 不能用 `process.env` 配置行为，配置项要在 Twikoo 后台面板里设
2. 无法接入腾讯云（评论通知等）
3. 无法根据 IP 定位地理位置（Workers 兼容性限制）
4. 邮件通知走 SendGrid 的 HTTPS API，**不支持 SMTP 直连**
5. 路径 `/a/b/` 和 `/a/b` 不会自动归一，前端已固定传 `path: location.pathname`

## 更新

服务端代码升级：重新拉官方仓库覆盖 `src/`、`schema.sql` 后重新 `npx wrangler deploy --minify`。
前端脚本 `source/js/twikoo.min.js` 要同步升级到相同版本。
