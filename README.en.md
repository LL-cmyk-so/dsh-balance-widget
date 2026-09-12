# dsh-balance-widget

[中文](README.md) | **English**

[![npm](https://img.shields.io/npm/v/dsh-balance-widget?style=flat-square&label=npm)](https://www.npmjs.com/package/dsh-balance-widget)
[![Stars](https://img.shields.io/github/stars/LL-cmyk-so/dsh-balance-widget?style=flat-square&label=Stars)](https://github.com/LL-cmyk-so/dsh-balance-widget)
[![License](https://img.shields.io/github/license/LL-cmyk-so/dsh-balance-widget?style=flat-square)](https://github.com/LL-cmyk-so/dsh-balance-widget/blob/main/LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/LL-cmyk-so/dsh-balance-widget?style=flat-square)](https://github.com/LL-cmyk-so/dsh-balance-widget)
[![Node 24](https://img.shields.io/badge/Node%2024-ready-brightgreen?style=flat-square)](https://nodejs.org)
[![Zero deps](https://img.shields.io/badge/dependencies-zero-brightgreen?style=flat-square)]()

A balance & cost widget for the [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) (DSH) Web GUI: a persistent sidebar footer card shows the account balance and today's cost; clicking opens a five-tier cost breakdown (balance / last prompt with its session name / today-this-session / today-this-workspace / today-all-workspaces).

## Preview

| Sidebar card | Five-tier cost popover |
| --- | --- |
| ![Sidebar card](docs/screenshot-corner.png) | ![Cost popover](docs/screenshot-popover.png) |

## How it differs from similar plugins

| Aspect | This plugin | Others (dsh-balance / dsh-token-price / ...) |
| --- | --- | --- |
| **Zero external dependencies** | ✅ Imports no `@deepseek-ai/*` packages, no native modules | ❌ Most depend on dsh SDK packages |
| **Node 24 ready** | ✅ Works out of the box on any profile layout | ⚠️ Many community plugins still error on Node 24 |
| **Boot stability** | ✅ Registers routes via official `ctx.webServer`; never conflicts with apiproxy | ⚠️ Some self-host HTTP servers that crash `dsh web` on boot |
| **Always-fresh auto refresh** | ✅ Sidebar card refreshes balance & costs every 60s; opening the popover triggers an immediate refresh | Some always-on badges refresh on a timer |
| **Peak/off-peak pricing** | ✅ Built-in official 2026-09-10 rate table, re-synced from the official page at startup and every 12h | Partial support |
| **Security** | ✅ API key stays in the host process; loopback-only guard | Varies |

**In one line**: *The zero-dependency, Node 24-ready balance/cost widget that never breaks `dsh web` boot.*

## Features

- **Account balance** — On click, the host proxies DeepSeek's official `GET /user/balance` and shows the `¥` balance; the balance number is color-coded by threshold (healthy / amber below `lowThreshold` / red below `criticalThreshold`). The API key is resolved through the host credentials service and never leaves the host process; the browser only talks to same-origin routes.
- **Last prompt cost (estimate)** — Parses the most recent session file and prices the last turn's token usage, answering "how much did that last prompt cost", with the **session name** labeled underneath.
- **Today · this session cost (estimate)** — The current session's usage today (calendar day) × DeepSeek's official peak/off-peak price table. Follows the configured model (default `deepseek-v4-flash`, switchable to `deepseek-v4-pro`) and the Beijing-time peak/off-peak windows automatically.
- **Today · this workspace cost (estimate)** — Sums today's token usage × price across every session in the current workspace (anchored by the current session).
- **Today · all workspaces cost (estimate)** — Walks every session under `~/.dsh/sessions/` and sums today's (calendar day) token usage × price.
- **Peak/off-peak status** — The card and popover borders are tinted by the current window (orange at peak / green at off-peak), a "Peak/Off-peak" tag sits next to the popover title, and hovering it shows the current price tier (input/output per 1M tokens).
- **Token usage** — Also shows the session's input (incl. cache hits) / output tokens.
- **One-click top-up** — a "Top up" link in the popover footer jumps to the official DeepSeek top-up page (platform.deepseek.com/top_up) in a new tab.
- **Sidebar card** — a persistent card at the sidebar footer shows balance and today's cost; globally visible, auto-refreshes every 60s (balance via the official API, costs parsed locally), and opening the popover triggers an immediate refresh.
- **Balance color warning** — the balance number is tinted in three tiers: default (healthy) → amber (below `lowThreshold`) → red (below `criticalThreshold`).
- **Official price auto-sync** — fetches the DeepSeek official pricing page on startup and every 12h; falls back to built-in rates on failure.
- **Agent tool** — a `deepseek_billing` tool lets the model answer "how much balance do I have / how much did today cost".

## Why this plugin

- **Zero external dependencies** — the host half imports no `@deepseek-ai/*` packages and no native modules, so it loads from any profile layout and works on **Node 24** (many community cordis plugins still lag on Node 24).
- **Uses official APIs only** — routes are registered through `ctx.webServer` (the same seam `dsh-ssh` uses) with loopback-only guards; no conflicting custom HTTP servers.

## Architecture

```
host half (lib/index.js)
  ctx.webServer.register:
    GET /api/dsh-balance/balance     → official /user/balance (loopback-only guard)
    GET /api/dsh-balance/active-cost → last prompt + today-this-session (with session name, most recent session)
    GET /api/dsh-balance/today-cost  → today's costs (dual: current workspace + all workspaces)
  Zero @deepseek-ai/* imports; loads from any profile layout.
  Also registers a deepseek_billing tool for model-driven queries.

client half (lib/client.js)
  ctx.slots.inject("sidebar.footer.action")
    → persistent sidebar footer card (balance + today's cost, peak-tinted border)
    → click opens five-tier cost popover + peak tag + ⓘ term explanations
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

### Where the config file lives

DSH plugin configuration lives in:

```
~/.dsh/profiles/web/cordis.patch.yml
```

### All options

Append to `cordis.patch.yml` (only change the lines you need; the rest stay at defaults):

```yaml
- id: balance-widget
  name: dsh-balance-widget
  config:
    balanceBaseURL: https://api.deepseek.com   # official balance endpoint (rarely changed)
    balanceApiKeyEnv: DEEPSEEK_API_KEY          # credential ref for the API key (rarely changed)
    requestTimeoutMs: 5000                      # balance request timeout (ms)
    modelId: deepseek-v4-flash                  # pricing model (or deepseek-v4-pro)
    lowThreshold: 5                             # balance below this (¥) turns the icon amber
    criticalThreshold: 1                        # balance below this (¥) turns the icon red
```

### Example: custom balance thresholds

By default the icon turns **amber below ¥5 and red below ¥1**. To warn at ¥10 / ¥3 instead:

```yaml
- id: balance-widget
  name: dsh-balance-widget
  config:
    lowThreshold: 10
    criticalThreshold: 3
```

Restart `dsh web` for changes to take effect.

### Example: price with V4-Pro

If you mainly use DeepSeek-V4-Pro, point the pricing model at it for a more accurate estimate:

```yaml
- id: balance-widget
  name: dsh-balance-widget
  config:
    modelId: deepseek-v4-pro
```

**Note**: the provider has announced that V4-Pro is being retired — from 2026-09-14 12:00 CST, V4-Pro requests are routed to V4.1-Flash and billed at Flash rates. Keeping `deepseek-v4-pro` past that date will over-estimate costs, so the default Flash tier is the better choice.

**Note**: `cordis.patch.yml` may already contain lines for other plugins — append new lines without touching existing ones.

## Pricing

Built-in DeepSeek official peak/off-peak pricing (CNY per 1M tokens), effective 2026-09-10. Peak windows are Beijing time **Mon–Fri** 09:00–12:00 and 14:00–18:00 (weekends are off-peak all day); prices are double the off-peak rates:

| Model | Window | Cache hit (input) | Cache miss (input) | Output |
| --- | --- | --- | --- | --- |
| V4.1-Flash | Off-peak | 0.02 | 1.0 | 4.0 |
| V4.1-Flash | Peak | 0.04 | 2.0 | 8.0 |
| V4-Pro | Off-peak | 0.15 | 4.5 | 13.5 |
| V4-Pro | Peak | 0.30 | 9.0 | 27.0 |

The official page currently lists only `deepseek-flash` and `deepseek-v4-pro`; older names (`deepseek-v4-flash`, `deepseek-v4-flash-vision-exp`, `deepseek-chat`) still work and are billed at the Flash rate. The plugin re-parses the page at startup and every 12h, and falls back to the table above only when parsing fails. Costs are **estimates**; the provider's bill is authoritative.

## Security & permission boundaries

This section is for the DSH Store / plugin audit: dependencies, runtime permissions, external services, and failure bounds.

**Dependencies & compatibility**
- Zero runtime dependencies: imports no `@deepseek-ai/*` packages; no third-party host deps
- `peerDependencies["@deepseek-ai/dsh"]`: `>=0.1.2-rc.1 <0.2.0` (DSH compatibility range)
- `engines.node`: `^22.19.0 || >=24.0.0`
- `peerDependencies["react"]`: `^18.2.0` (browser rendering only)

**Runtime permissions**
- `files`: reads only `~/.dsh/sessions/` session JSONL (cost stats); never writes or mutates any session file
- `network`: only the DeepSeek official endpoints — `api.deepseek.com` (`GET /user/balance`) and `api-docs.deepseek.com` pricing page (fetched every 12h); no third-party proxy
- `commands`: spawns `zstd -d -c` to decompress session files (macOS needs `brew install zstd`); no other commands
- `credentials`: reads `DEEPSEEK_API_KEY` (resolved via the host credentials service), used only in the host process behind a loopback-only route guard; the browser never sees the key
- All host routes are bound to the loopback address and unreachable externally

**External services**
- DeepSeek official balance endpoint `GET /user/balance` (on click / 60s refresh)
- DeepSeek official pricing page (on startup + every 12h, for peak/off-peak rates)

**Failure bounds**
- Balance fetch failure: the panel shows the error and keeps the last successful snapshot (no interruption)
- Pricing fetch failure: falls back to the built-in 2026-09-10 rate table, `pricingSource` marked `default` (`synced` once parsing succeeds)
- Missing `zstd`: returns an actionable error (points to the install command) instead of failing silently
- Missing/corrupt session files: that session is skipped; other sessions are unaffected
- All costs are estimates; the provider's bill is authoritative

## Changelog

### v0.5.3 — weekends no longer mispriced as peak
- 🐛 **Fixed**: the peak/off-peak check looked only at the hour and ignored the weekday, so weekends were priced as peak (2×) during 09:00–12:00 and 14:00–18:00, up to doubling "today's cost". The official rule is **Mon–Fri** 09:00–12:00 and 14:00–18:00 (everything else, weekends included, is off-peak); Saturday and Sunday are now excluded first, using the Beijing-time weekday
- 📄 **Docs**: the pricing section and the peak/off-peak tooltips now state the Mon–Fri restriction

### v0.5.2 — DSH 0.1.5: new session format & new pricing page
- 🐛 **Fixed**: DSH 0.1.5 writes session logs under a generation-tagged name (`session.v3.jsonl.zstd`), but the plugin only matched `session.jsonl.zstd`, so every session created after the upgrade was invisible — viewing one produced red error text in the popover, and today's cost was understated (measured ~36% low). Logs are now found by taking the highest generation per session directory; a migrated session's older file is a subset of the new one, so reading only the newest avoids double-counting the session
- 🐛 **Fixed**: the official pricing page renamed the Flash column to `deepseek-flash` and cut its rates. The parser's model-id anchor landed on a page footnote, so the sync reported success while silently keeping the stale, higher rates — overstating costs by ~1.7x. The parser now anchors on the table's row labels and applies that column to every Flash-family name
- 💰 **Rates**: the built-in fallback table now carries V4.1-Flash pricing (off-peak 0.02 / 1.0 / 4.0, peak 0.04 / 2.0 / 8.0 CNY per 1M tokens); the V4-Pro tier is unchanged
- 📄 **Docs**: corrected the `pricingSource` values to `default` / `synced` (previously misdocumented as `builtin`)

### v0.5.1 — Cold-start speedup & cleanup
- 🚀 **Performance**: today-cost cold start dropped from ~5.4s to ~0.01s — only session files modified today are decompressed (mtime filter), parsed results are cached by (path, mtime), and parsing runs in parallel
- ⏰ **Refresh wording**: README now matches the code — the persistent card auto-refreshes every 60s (the old "no polling" claims contradicted the code and have been corrected)
- 🌏 **Timezone fix**: peak/off-peak windows are now computed in Beijing time (UTC+8) explicitly instead of the host's local timezone
- 🧹 **Cleanup**: removed a dead client-side pricing stack (PRICING/priceSession) that was never called; all pricing now goes through the host
- 📐 **Pricing parsing hardened**: peak rates are parsed explicitly from the official page (no more hard-coded "off-peak × 2"); if a cache-hit rate cannot be parsed the whole table falls back to built-in rates instead of silently pricing cache hits at 0
- 🏷️ **Card label**: the card footer now reads "Today · all" to make clear it is the global (all-workspaces) figure
- 🎨 **Visual refresh**: SVG wallet icon replaces 💰, press/pop micro-animations, muted secondary tiers in the popover

### v0.5.0 — Five-tier costs & peak/off-peak status
- ✨ **Added**: the cost breakdown is now five tiers — balance / last prompt / today-this-session / today-this-workspace / today-all-workspaces
  - The last-prompt row labels the **session name** underneath (based on the most recent session)
  - "Today · this session" = the current session's usage today; "Today · this workspace" = all sessions in the current workspace today (workspace anchored by the current session); "Today · all workspaces" = everything across all workspaces today
- ✨ **Added**: peak/off-peak status visuals — card and popover borders tinted by window (orange at peak / green at off-peak), a "Peak/Off-peak" tag next to the popover title with a hover tooltip showing the current price tier
- 🎨 **Changed**: removed the remaining-ratio bar; the balance number is now color-coded directly by threshold (healthy / amber / red)
- 🗑️ **Removed**: the "This session" row (all-time session total) from the popover

### v0.2.0 — Last prompt & today total cost
- ✨ **Added**: popover now shows "last prompt cost" and "today total cost"
  - Last prompt: prices the current session's last turn from the session file
  - Today total: walks every session under `~/.dsh/sessions/` and sums today's usage
- 🐛 **Fixed**: session-id prefix duplication in the last-cost route (both `session-`-prefixed and bare ids resolve)

### v0.1.0 — Initial release
- 🎉 Account balance (official `/user/balance`) + session cost (estimate) + token usage
- On-demand refresh: no polling, queries only on click, costs zero tokens

## Verify

- Config tree: `dsh --profile web --dump-config` should show a `balance-widget` entry.
- Balance route: after restarting dsh web, `curl -s http://127.0.0.1:3080/api/dsh-balance/balance` should return `{ ok, balance_infos, modelId }`.
- Session costs: `curl -s http://127.0.0.1:3080/api/dsh-balance/active-cost` should return `{ lastPrompt, todaySession, title, sessionId, peak, workspaceName, ... }`; append `?session=SESSION_ID` to target a specific session.
- Today costs: `curl -s http://127.0.0.1:3080/api/dsh-balance/today-cost` should return `{ workspace: { cost, ..., cwd }, all: { cost, ... }, modelId }`.
- Legacy route: `curl -s "http://127.0.0.1:3080/api/dsh-balance/last-cost?session=SESSION_ID"` still works and returns `{ cost, inputTokens, outputTokens, modelId }`.

## License

MIT
