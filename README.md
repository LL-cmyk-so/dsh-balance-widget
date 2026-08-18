# dsh-balance-widget

**中文** | [English](README.en.md)

<p align="center">
  <img src="https://img.shields.io/github/stars/LL-cmyk-so/dsh-balance-widget?style=flat-square&label=Stars" alt="Stars">
  <img src="https://img.shields.io/github/license/LL-cmyk-so/dsh-balance-widget?style=flat-square" alt="License">
  <img src="https://img.shields.io/github/last-commit/LL-cmyk-so/dsh-balance-widget?style=flat-square" alt="Last commit">
  <img src="https://img.shields.io/badge/Node%2024-ready-brightgreen?style=flat-square" alt="Node 24">
  <img src="https://img.shields.io/badge/dependencies-zero-brightgreen?style=flat-square" alt="Zero deps">
</p>

DeepSeek Harness (DSH) Web GUI 的余额与成本小部件：在会话头部右上角（角落）渲染一个 💰 图标，点击弹出账户余额与本会话的估算成本。

## 与同类插件的区别

| 特点 | 本插件 | 同类插件（dsh-balance / dsh-token-price 等） |
| --- | --- | --- |
| **零外部依赖** | ✅ 不 import 任何 `@deepseek-ai/*` 包，无原生模块 | ❌ 多数依赖 dsh SDK 包 |
| **Node 24 兼容** | ✅ 天然兼容（零依赖设计），任何 profile 布局可加载 | ⚠️ 不少社区插件在 Node 24 下报错 |
| **启动稳定性** | ✅ 用官方 `ctx.webServer` 注册路由，不与 apiproxy 冲突 | ⚠️ 有的自建 HTTP 服务导致 dsh web 启动崩溃 |
| **按需查询** | ✅ 点击才查余额，无轮询、零后台请求 | 有的常驻徽章定时刷新 |
| **峰谷定价** | ✅ 内置官方 2026-08-17 峰谷价表，自动按时段切换 | 部分支持 |
| **安全性** | ✅ API key 仅在宿主进程，loopback-only 守卫 | 参差不齐 |

**一句话**：*零依赖、Node 24 就绪、永不拖垮 dsh web 启动的余额/成本小部件。*

## 功能

- **账户余额** — 点击图标时经宿主代理查询 DeepSeek 官方 `GET /user/balance`，展示 `¥` 余额；API key 只在宿主进程内读取（凭据服务），浏览器不接触密钥。
- **本会话成本（估算）** — 由会话的 `tokenUsage` 投影 × DeepSeek 官方峰谷定价表计算，随当前会话模型（默认 `deepseek-v4-flash`，可在配置中改为 `deepseek-v4-pro`）与北京时间高峰/空闲时段自动切换。
- **Token 用量** — 同时展示本会话输入（含缓存命中）/ 输出 token 数。
- **按需刷新** — 无轮询、无后台请求；只有点击图标时才发起余额查询，不消耗任何 token。

## 架构

```
host 半区 (lib/index.js)
  ctx.webServer.register:
    GET /api/dsh-balance/balance → 官方 /user/balance（loopback-only 守卫）
    GET /api/dsh-balance/cost    → 保留路由（成本目前客户端计价）
  依赖：零外部 @deepseek-ai/* import，任何 profile 布局均可解析

client 半区 (lib/client.js)
  ctx.slots.inject("conversation.session.header.utilities")
    → 💰 图标（会话头部右上角）
    → 点击 fetch 同源 /api/dsh-balance/balance → 弹层展示余额 + 成本 + token
```

## 安装

npm 安装（发布后）：

```sh
dsh plugin --profile web add dsh-balance-widget
```

GitHub 仓库安装（开发调试）：

```sh
git clone https://github.com/LL-cmyk-so/dsh-balance-widget.git
cd dsh-balance-widget
dsh plugin --profile web add "link:$(pwd)"
```

装完重启 `dsh web` 生效。

## 配置

在 `~/.dsh/profiles/web/cordis.patch.yml` 中：

```yaml
- id: balance-widget
  name: dsh-balance-widget
  config:
    balanceBaseURL: https://api.deepseek.com   # 官方余额接口
    balanceApiKeyEnv: DEEPSEEK_API_KEY          # 凭据服务中的密钥 ref
    requestTimeoutMs: 5000                      # 余额查询超时
    modelId: deepseek-v4-flash                  # 成本计价模型（可改 deepseek-v4-pro）
```

## 定价说明

内置 DeepSeek 官方 2026-08-17 峰谷定价（元 / 百万 tokens），高峰时段为北京时间 09:00–12:00、14:00–18:00，价格为空闲时段两倍：

| 模型 | 时段 | 缓存命中(输入) | 缓存未命中(输入) | 输出 |
| --- | --- | --- | --- | --- |
| V4-Flash | 空闲 | 0.05 | 1.5 | 4.5 |
| V4-Flash | 高峰 | 0.10 | 3.0 | 9.0 |
| V4-Pro | 空闲 | 0.15 | 4.5 | 13.5 |
| V4-Pro | 高峰 | 0.30 | 9.0 | 27.0 |

`deepseek-chat` / `deepseek-reasoner` 别名分别映射到 Flash / Pro 价格。成本为**估算值**，实际以官方账单为准。

## 验证

- 配置树：`dsh --profile web --dump-config` 应出现 `balance-widget` 条目
- 余额路由：重启 dsh web 后 `curl -s http://127.0.0.1:3080/api/dsh-balance/balance` 应返回 `{ ok, balance_infos, modelId }`

## License

MIT
