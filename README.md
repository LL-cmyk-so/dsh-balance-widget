# dsh-balance-widget

**中文** | [English](README.en.md)

[![npm](https://img.shields.io/npm/v/dsh-balance-widget?style=flat-square&label=npm)](https://www.npmjs.com/package/dsh-balance-widget)
[![Stars](https://img.shields.io/github/stars/LL-cmyk-so/dsh-balance-widget?style=flat-square&label=Stars)](https://github.com/LL-cmyk-so/dsh-balance-widget)
[![License](https://img.shields.io/github/license/LL-cmyk-so/dsh-balance-widget?style=flat-square)](https://github.com/LL-cmyk-so/dsh-balance-widget/blob/main/LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/LL-cmyk-so/dsh-balance-widget?style=flat-square)](https://github.com/LL-cmyk-so/dsh-balance-widget)
[![Node 24](https://img.shields.io/badge/Node%2024-ready-brightgreen?style=flat-square)](https://nodejs.org)
[![Zero deps](https://img.shields.io/badge/dependencies-zero-brightgreen?style=flat-square)]()

DeepSeek Harness (DSH) Web GUI 的余额与成本小部件：在会话头部右上角（角落）渲染一个 💰 图标，点击弹出账户余额与本会话的估算成本。

## 效果预览

| 余额常驻右上角 | 点击弹出详情 |
| --- | --- |
| ![余额常驻](docs/screenshot-corner.png) | ![弹框详情](docs/screenshot-popover.png) |

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
- **最近一次提问成本（估算）** — 从当前会话文件解析最后一个 turn 的 token 用量 × 单价，回答"刚才那条提问花了多少"。
- **今天总成本（估算）** — 遍历 `~/.dsh/sessions/` 下所有会话，累加今天（自然日）的 token 用量 × 单价。
- **Token 用量** — 同时展示本会话输入（含缓存命中）/ 输出 token 数。
- **一键充值** — 弹层底部「去充值」链接直达 DeepSeek 官方充值页（platform.deepseek.com/top_up），新窗口打开。
- **侧边栏常驻卡片** — 侧边栏底部（设置上方）显示余额 + 剩余比例条 + 今日花费，全局可见，60 秒自动刷新。
- **余额剩余比例条** — 蓝色（充足）→ 琥珀（低于 lowThreshold）→ 红色（低于 criticalThreshold）三档。
- **官方价格自动同步** — 启动时 + 每 12 小时抓取 DeepSeek 官方定价页，改价自动跟进；失败回退内置价目表。
- **模型工具查询** — 新增 `deepseek_billing` 工具，可直接问模型"余额多少/今天花了多少"。
- **按需刷新** — 无轮询、无后台请求；只有点击图标时才发起查询，不消耗任何 token。

## 架构

```
host 半区 (lib/index.js)
  ctx.webServer.register:
    GET /api/dsh-balance/balance    → 官方 /user/balance（loopback-only 守卫）
    GET /api/dsh-balance/last-cost  → 当前会话最近一次提问成本（读会话文件 + zstd 解压）
    GET /api/dsh-balance/today-cost → 今天所有会话总成本
  依赖：零外部 @deepseek-ai/* import，任何 profile 布局均可解析

client 半区 (lib/client.js)
  ctx.slots.inject("conversation.session.header.utilities")
    → 💰 图标（会话头部右上角）
    → 点击 fetch 同源 API → 弹层展示余额 + 三种成本 + token
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

### 配置文件在哪

DSH 的插件配置统一放在这个文件里：

```
~/.dsh/profiles/web/cordis.patch.yml
```

**说明**：`~` 是你的用户主目录（macOS 是 `/Users/你的用户名`）。

### 全部配置项

在 `cordis.patch.yml` 中追加以下内容（**只改你需要的那几行**，其余保持默认即可）：

```yaml
- id: balance-widget
  name: dsh-balance-widget
  config:
    balanceBaseURL: https://api.deepseek.com   # 官方余额接口（一般不用改）
    balanceApiKeyEnv: DEEPSEEK_API_KEY          # 凭据服务中的密钥 ref（一般不用改）
    requestTimeoutMs: 5000                      # 余额查询超时（毫秒）
    modelId: deepseek-v4-flash                  # 成本计价模型（可改 deepseek-v4-pro）
    lowThreshold: 5                             # 余额低于此值（¥）图标变黄提醒
    criticalThreshold: 1                        # 余额低于此值（¥）图标变红警告
```

### 示例：调整余额预警阈值

默认余额 **低于 ¥5 变黄、低于 ¥1 变红**。想改成"低于 ¥10 提醒、低于 ¥3 警告"：

```yaml
- id: balance-widget
  name: dsh-balance-widget
  config:
    lowThreshold: 10
    criticalThreshold: 3
```

改完**重启 `dsh web`** 生效。

### 示例：成本按 V4-Pro 计价

如果主要使用 DeepSeek-V4-Pro 模型，把计价模型改掉，成本估算更准：

```yaml
- id: balance-widget
  name: dsh-balance-widget
  config:
    modelId: deepseek-v4-pro
```

**提示**：`cordis.patch.yml` 可能有其他插件的配置行，追加时注意**不要改动已有的行**，只加新内容。

## 定价说明

内置 DeepSeek 官方 2026-08-17 峰谷定价（元 / 百万 tokens），高峰时段为北京时间 09:00–12:00、14:00–18:00，价格为空闲时段两倍：

| 模型 | 时段 | 缓存命中(输入) | 缓存未命中(输入) | 输出 |
| --- | --- | --- | --- | --- |
| V4-Flash | 空闲 | 0.05 | 1.5 | 4.5 |
| V4-Flash | 高峰 | 0.10 | 3.0 | 9.0 |
| V4-Pro | 空闲 | 0.15 | 4.5 | 13.5 |
| V4-Pro | 高峰 | 0.30 | 9.0 | 27.0 |

`deepseek-chat` / `deepseek-reasoner` 别名分别映射到 Flash / Pro 价格。成本为**估算值**，实际以官方账单为准。

## 版本历史

### v0.2.0 — 最近一次提问与今日总成本
- ✨ **新增**：弹层增加「最近一次提问成本」与「今天总成本」两项
  - 最近一次提问：解析当前会话最后一个 turn 的 token 用量 × 单价
  - 今天总成本：遍历 `~/.dsh/sessions/` 下所有会话，累加今天（自然日）用量
- 🐛 **修复**：last-cost 路由的 session-id 前缀重复问题（带/不带 `session-` 前缀均可解析）

### v0.1.0 — 初始版本
- 🎉 账户余额（官方 `/user/balance`）+ 本会话成本（估算）+ Token 用量
- 按需刷新：无轮询，点击才查询，不消耗 token

## 验证

- 配置树：`dsh --profile web --dump-config` 应出现 `balance-widget` 条目
- 余额路由：重启 dsh web 后 `curl -s http://127.0.0.1:3080/api/dsh-balance/balance` 应返回 `{ ok, balance_infos, modelId }`
- 成本路由：`curl -s "http://127.0.0.1:3080/api/dsh-balance/last-cost?session=SESSION_ID"` 与 `curl -s http://127.0.0.1:3080/api/dsh-balance/today-cost` 应返回 `{ cost, inputTokens, outputTokens, modelId }`

## License

MIT
