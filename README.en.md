# dsh-balance-widget

[中文](README.md) | **English**

<p align="center">
  <img src="https://img.shields.io/github/stars/LL-cmyk-so/dsh-balance-widget?style=flat-square&label=Stars" alt="Stars">
  <img src="https://img.shields.io/github/license/LL-cmyk-so/dsh-balance-widget?style=flat-square" alt="License">
  <img src="https://img.shields.io/github/last-commit/LL-cmyk-so/dsh-balance-widget?style=flat-square" alt="Last commit">
  <img src="https://img.shields.io/badge/Node%2024-ready-brightgreen?style=flat-square" alt="Node 24">
  <img src="https://img.shields.io/badge/dependencies-zero-brightgreen?style=flat-square" alt="Zero deps">
</p>

A balance & cost widget for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH) Web GUI: a 💰 icon in the corner of the conversation session header. Click it to see your DeepSeek account balance and the current session's estimated spend.

## How it differs from similar plugins

| Aspect | This plugin | Others (dsh-balance / dsh-token-price / ...) |
| --- | --- | --- |
| **Zero external dependencies** | ✅ Imports no `@deepseek-ai/*` packages, no native modules | ❌ Most depend on dsh SDK packages |
| **Node 24 ready** | ✅ Works out of the box on any profile layout | ⚠️ Many community plugins still error on Node 24 |
| **Boot stability** | ✅ Registers routes via official `ctx.webServer`; never conflicts with apiproxy | ⚠️ Some self-host HTTP servers that crash `dsh web` on boot |
| **On-demand queries** | ✅ Fetches balance only on click; no polling, zero background requests | Some always-on badges refresh on a timer |
| **Peak/off-peak pricing** | ✅ Built-in official 2026-08-17 rate table, auto-switches by window | Partial support |
| **Security** | ✅ API key stays in the host process; loopback-only guard | Varies |

**In one line**: *The zero-dependency, Node 24-ready balance/cost widget that never breaks `dsh web` boot.*

## Features

- **Account balance** — On click, the host proxies DeepSeek's official `GET /user/balance` and shows the `¥` balance. The API key is resolved through the host credentials service and never leaves the host process; the browser only talks to same-origin routes.
- **Session cost (estimate)** — Computed from the session's `tokenUsage` projection × DeepSeek's official peak/off-peak price table. Follows the configured model (default `deepseek-v4-flash`, switchable to `deepseek-v4-pro`) and the Beijing-time peak/off-peak windows automatically.
- **Token usage** — Also shows the session's input (incl. cache hits) / output tokens.
- **On-demand refresh** — No polling, no background requests; the balance endpoint is only hit when you click the icon. Costs zero tokens to use.

## Why this plugin

- **Zero external dependencies** — the host half imports no `@deepseek-ai/*` packages and no native modules, so it loads from any profile layout and works on **Node 24** (many community cordis plugins still lag on Node 24).
- **Uses official APIs only** — routes are registered through `ctx.webServer` (the same seam `dsh-ssh` uses) with loopback-only guards; no conflicting custom HTTP servers.

## Architecture

```
host half (lib/index.js)
  ctx.webServer.register:
    GET /api/dsh-balance/balance → official /user/balance (loopback-only guard)
    GET /api/dsh-balance/cost    → reserved route (cost priced client-side)

client half (lib/client.js)
  ctx.slots.inject("conversation.session.header.utilities")
    → 💰 icon (session header, top-right corner)
    → click fetches same-origin /api/dsh-balance/balance → popover with balance + cost + tokens
```

## Installation

From npm (once published):

```sh
dsh plugin --profile web add dsh-balance-widget
```

From GitHub (development):

```sh
git clone https://github.com/LL-cmyk-so/dsh-balance-widget.git
cd dsh-balance-widget
dsh plugin --profile web add "link:$(pwd)"
```

Then restart `dsh web`.

## Configuration

In `~/.dsh/profiles/web/cordis.patch.yml`:

```yaml
- id: balance-widget
  name: dsh-balance-widget
  config:
    balanceBaseURL: https://api.deepseek.com   # official balance endpoint
    balanceApiKeyEnv: DEEPSEEK_API_KEY          # credential ref for the API key
    requestTimeoutMs: 5000                      # balance request timeout
    modelId: deepseek-v4-flash                  # pricing model (or deepseek-v4-pro)
```

## Pricing

Built-in DeepSeek official peak/off-peak pricing (CNY per 1M tokens), effective 2026-08-17. Peak windows are Beijing time 09:00–12:00 and 14:00–18:00; prices are double the off-peak rates:

| Model | Window | Cache hit (input) | Cache miss (input) | Output |
| --- | --- | --- | --- | --- |
| V4-Flash | Off-peak | 0.05 | 1.5 | 4.5 |
| V4-Flash | Peak | 0.10 | 3.0 | 9.0 |
| V4-Pro | Off-peak | 0.15 | 4.5 | 13.5 |
| V4-Pro | Peak | 0.30 | 9.0 | 27.0 |

`deepseek-chat` / `deepseek-reasoner` aliases map to Flash / Pro pricing respectively. Costs are **estimates**; actual billing from the provider is authoritative.

## Verify

- Config tree: `dsh --profile web --dump-config` should show a `balance-widget` entry.
- Balance route: after restarting dsh web, `curl -s http://127.0.0.1:3080/api/dsh-balance/balance` should return `{ ok, balance_infos, modelId }`.

## License

MIT
