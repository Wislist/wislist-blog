# Twikoo 评论服务端（部署到 Cloudflare Workers）

评论数据存在 Cloudflare D1，游客填昵称即可评论，不需要登录。

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
