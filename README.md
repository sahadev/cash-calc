# CashCalc 薪资计算器

支持全国 10 城的专业薪资计算器，含五险一金、个税、年终奖、薪资结构转换、跨城对比等。

---

## 业务模式

| 模式 | 说明 |
|------|------|
| **Freemium** | 核心计算、跨城对比、多 Offer 对比、年度汇算等全部免费 |
| **广告** | Google AdSense 展示广告，按展示/点击计费 |
| **未来** | 可扩展：高级功能付费墙、企业版 API、招聘平台导流佣金 |

---

## 产品模式

### 目标用户

- **个人用户**：求职者、跳槽者、薪资谈判者
- **HR / 薪酬专员**：Offer 对比、成本测算

### 核心能力

| 模块 | 功能 |
|------|------|
| 薪资计算 | 五险一金、个税（累计预扣法）、年终奖（单独/并入对比）、补充公积金、企业年金 |
| 薪资结构转换 | 综合价值反推月 Base，支持最低社保、避税渠道、股票折价 |
| 跨城对比 | 同一薪资方案在 10 城到手差异（可选 2~6 城） |
| 多 Offer 对比 | 最多 4 个 Offer 并排对比综合价值 |
| 年度汇算模拟 | 预估个税补税/退税金额 |
| 搜索词落地页 | `/q/beijing-20000` 等 SEO 友好直达页 |
| 云端分享 | 计算结果生成短链接，可分享给他人查看 |
| 攻略内容 | 年终奖计税、跳槽谈薪、汇算指南、公积金全解等 SEO 文章 |

### 支持城市

北京、上海、广州、深圳、杭州、成都、南京、武汉、苏州、天津

---

## 技术架构

```
┌─────────────────────────────────────────────────────────────────┐
│  前端 (React 19 + Vite 7 + Tailwind 4)                           │
│  - SPA + PWA 离线支持                                             │
│  - React Router 路由 + React.lazy 代码分割                         │
│  - 部署：Vercel / Cloudflare Pages / 任意静态托管                 │
└───────────────────────────┬─────────────────────────────────────┘
                            │ VITE_API_BASE
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  后端 (Hono + Cloudflare Workers + D1)                          │
│  - 边缘运行时，全球低延迟                                         │
│  - POST /api/v1/save  |  GET /api/v1/save/:id  |  POST /api/v1/feedback │
│  - 部署：Cloudflare Workers                                      │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────────┐
│  D1 (边缘 SQLite)                                                │
│  - saved_records：分享链接存储                                    │
│  - feedback：用户反馈                                             │
└─────────────────────────────────────────────────────────────────┘
```

### 前端技术栈

| 技术 | 用途 |
|------|------|
| React 19 | UI 框架 |
| TypeScript | 类型安全 |
| Vite 7 | 构建工具 |
| Tailwind CSS 4 | 样式 |
| React Router 7 | 路由 |
| Recharts | 图表 |
| html2canvas + jspdf + xlsx | 导出图片/PDF/Excel |
| vite-plugin-pwa | PWA + Service Worker |

### 后端技术栈

| 技术 | 用途 |
|------|------|
| Hono | Web 框架 |
| Cloudflare Workers | 边缘运行时 |
| D1 | SQLite 数据库 |

### 目录结构

```
cash-calc/
├── src/                 # 前端源码
│   ├── components/      # 页面组件
│   ├── data/           # 城市政策、攻略文章
│   ├── hooks/          # useCalculation, useTheme, useHistory
│   ├── utils/          # calculator, converter, api, exportUtils
│   └── types/          # 类型定义
├── backend/            # 后端服务
│   ├── src/index.ts    # Hono 应用
│   └── migrations/     # D1 迁移
├── public/             # 静态资源、sitemap、robots、llms.txt
└── dist/               # 构建输出
```

---

## 开发

```bash
# 前端
npm run dev

# 后端（可选，用于云端分享）
cd backend && npm run dev
```

配置 `VITE_API_BASE=http://localhost:8787` 启用「链接」分享功能。

## 部署

- **前端**：`npm run build`，将 `dist/` 部署到静态托管；构建时设置 `VITE_API_BASE` 指向后端 URL
- **后端**：见 [backend/README.md](backend/README.md)
