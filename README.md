# dsh-balance-widget

**中文** | [English](README.en.md)

DeepSeek Harness (DSH) Web GUI 的余额与成本小部件：在会话头部右上角（角落）渲染一个 💰 图标，点击弹出账户余额与本会话的估算成本。

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
git clone https://github.com/YOUR_USERNAME/dsh-balance-widget.git
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
