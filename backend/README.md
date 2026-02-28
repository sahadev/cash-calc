# CashCalc API

Hono + Cloudflare Workers + D1 后端服务。

## 技术栈

- **Hono** - 轻量 Web 框架
- **Cloudflare Workers** - 边缘运行时
- **D1** - 边缘 SQLite 数据库

## 开发

```bash
# 安装依赖
npm install

# 本地数据库迁移（首次或 schema 变更时）
npx wrangler d1 migrations apply cash-calc-db --local

# 启动开发服务器（默认 http://localhost:8787）
npm run dev
```

## API

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/v1/health | 健康检查 |
| POST | /api/v1/save | 保存计算记录，返回 `{ id, url }` |
| GET | /api/v1/save/:id | 根据 ID 加载记录 |
| POST | /api/v1/feedback | 提交用户反馈 |

### 保存记录

```bash
curl -X POST http://localhost:8787/api/v1/save \
  -H "Content-Type: application/json" \
  -d '{"input":{...},"summary":{...},"label":"可选标签"}'
# => {"id":"abc12345","url":"/s/abc12345"}
```

### 加载记录

```bash
curl http://localhost:8787/api/v1/save/abc12345
# => {"input":{...},"summary":{...},"label":"...","createdAt":1234567890}
```

## 部署

**⚠️ 部署前必须完成以下步骤，否则会失败：**

1. 登录 Cloudflare：`npx wrangler login`
2. 创建 D1 数据库：`npx wrangler d1 create cash-calc-db`
3. 将返回的 `database_id`（UUID 格式）填入 `wrangler.toml` 第 10 行，替换 `placeholder`
4. 应用迁移：`npx wrangler d1 migrations apply cash-calc-db --remote`
5. 部署：`npm run deploy`
6. 记下 Workers 部署后的 URL（如 `https://cash-calc-api.xxx.workers.dev`）
7. 前端构建时设置 `VITE_API_BASE=该URL`，重新构建并部署前端

## 环境变量

前端需配置 `VITE_API_BASE` 指向 API 地址，例如：

- 开发：`http://localhost:8787`
- 生产：`https://cash-calc-api.xxx.workers.dev`
