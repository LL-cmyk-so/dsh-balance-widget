# dsh-balance-widget

**中文** | [English](https://github.com/LL-cmyk-so/dsh-balance-widget/blob/main/README.en.md)

[![npm](https://img.shields.io/npm/v/dsh-balance-widget?style=flat-square&label=npm)](https://www.npmjs.com/package/dsh-balance-widget)
[![Stars](https://img.shields.io/github/stars/LL-cmyk-so/dsh-balance-widget?style=flat-square&label=Stars)](https://github.com/LL-cmyk-so/dsh-balance-widget)
[![License](https://img.shields.io/github/license/LL-cmyk-so/dsh-balance-widget?style=flat-square)](https://github.com/LL-cmyk-so/dsh-balance-widget/blob/main/LICENSE)
[![Last commit](https://img.shields.io/github/last-commit/LL-cmyk-so/dsh-balance-widget?style=flat-square)](https://github.com/LL-cmyk-so/dsh-balance-widget)
[![Node 24](https://img.shields.io/badge/Node%2024-ready-brightgreen?style=flat-square)](https://nodejs.org)
[![Zero deps](https://img.shields.io/badge/dependencies-zero-brightgreen?style=flat-square)]()

DeepSeek Harness (DSH) **Web GUI 与桌面版**通用的余额与成本小部件：侧边栏底部常驻卡片显示账户余额与今日花费，点击弹出五层级成本明细（余额 / 最近提问·标注会话名 / 今日·本会话 / 今日·本工作区 / 今日·所有工作区）。

## 效果预览

| 侧边栏卡片（左下角常驻） | 点击弹出五层级成本 |
| --- | --- |
| ![侧边栏卡片](https://raw.githubusercontent.com/LL-cmyk-so/dsh-balance-widget/main/docs/screenshot-corner.png) | ![成本明细弹框](https://raw.githubusercontent.com/LL-cmyk-so/dsh-balance-widget/main/docs/screenshot-popover.png) |

## 与同类插件的区别

| 特点 | 本插件 | 同类插件（dsh-balance / dsh-token-price 等） |
| --- | --- | --- |
| **零外部依赖** | ✅ 不 import 任何 `@deepseek-ai/*` 包，无原生模块 | ❌ 多数依赖 dsh SDK 包 |
| **Node 24 兼容** | ✅ 天然兼容（零依赖设计），任何 profile 布局可加载 | ⚠️ 不少社区插件在 Node 24 下报错 |
| **启动稳定性** | ✅ 用官方 `ctx.webServer` 注册路由，不与 apiproxy 冲突 | ⚠️ 有的自建 HTTP 服务导致 dsh web 启动崩溃 |
| **常驻自动刷新** | ✅ 侧边栏卡片每 60s 自动刷新余额与成本，弹框点击即强刷 | 有的常驻徽章定时刷新 |
| **峰谷定价** | ✅ 内置官方 2026-09-10 峰谷价表，启动时与每 12h 自动从官方页刷新 | 部分支持 |
| **安全性** | ✅ API key 仅在宿主进程，loopback-only 守卫 | 参差不齐 |

**一句话**：*零依赖、Node 24 就绪、在 `dsh web` 与桌面版都不拖垮启动的余额/成本小部件。*

## 功能

- **账户余额** — 余额优先取自宿主账号服务 `deepseekAccount`（由 `@deepseek-ai/dsh-deepseek-account-platform` 提供，即官方「设置 → 账号与余额」页的同一来源，因此两处显示同一个数字，且**不需要 API Key**）；未登录或旧版宿主（0.1.x）时回退到 DeepSeek 官方 `GET /user/balance`。展示 `¥` 余额，按阈值自动变色（充足 / 低于 `lowThreshold` 变黄 / 低于 `criticalThreshold` 变红）；API key 只在宿主进程内读取（凭据服务），浏览器不接触密钥。
- **最近一次提问成本（估算）** — 从最近活跃会话文件解析最后一个 turn 的 token 用量 × 单价，回答"刚才那条提问花了多少"；下方标注该会话的**会话名**。
- **今日·本会话成本（估算）** — 当前会话今天（自然日）产生的 token 用量 × DeepSeek 官方峰谷定价表计算，随当前会话模型（默认 `deepseek-v4-flash`，可在配置中改为 `deepseek-v4-pro`）与北京时间高峰/空闲时段自动切换。
- **今日·本工作区成本（估算）** — 遍历当前工作区（由当前会话锚定）下的所有会话，累加今天的 token 用量 × 单价。
- **今日·所有工作区成本（估算）** — 遍历 `~/.dsh/sessions/` 下所有工作区的所有会话，累加今天的 token 用量 × 单价。
- **峰谷状态标签** — 卡片金额前的状态圆点按当前时段着色（峰时琥珀 / 谷时绿色），弹框标题旁显示「峰时/谷时」标签，悬停可查看当前价格档位（输入/输出单价）。
- **Token 用量** — 同时展示输入（含缓存命中）/ 输出 token 数。
- **一键充值** — 弹层底部「去充值」链接直达 DeepSeek 官方充值页（platform.deepseek.com/top_up），新窗口打开。
- **侧边栏常驻卡片** — 侧边栏底部（设置上方）显示余额 + 今日花费，全局可见；每 60 秒自动刷新（余额走官方接口、成本为本地会话解析），打开弹框时也会立即刷新一次，无需手动操作。
- **余额数字变色预警** — 余额数字按三档着色：充足（默认色）→ 琥珀（低于 `lowThreshold`）→ 红色（低于 `criticalThreshold`），一眼判断余额健康度。
- **官方价格自动同步** — 启动时 + 每 12 小时抓取 DeepSeek 官方定价页，改价自动跟进；失败回退内置价目表。
- **模型工具查询** — 新增 `deepseek_billing` 工具，可直接问模型"余额多少/今天花了多少"。

## 架构

```
host 半区 (lib/index.js)
  ctx.webServer.register:
    GET /api/dsh-balance/balance     → 官方 /user/balance（loopback-only 守卫）
    GET /api/dsh-balance/active-cost → 最近活跃会话的最近提问 + 今日·本会话（含会话名）
    GET /api/dsh-balance/today-cost  → 今日成本（双值：当前工作区 + 所有工作区）
  依赖：零外部 @deepseek-ai/* import，任何 profile 布局均可解析
  另有 deepseek_billing 工具供模型直接查询余额/成本

client 半区 (lib/client.js)
  ctx.slots.inject("sidebar.footer.action")
    → 侧边栏底部常驻卡片（余额 + 今日花费，峰/谷时段状态圆点；侧边栏收起时变为 36×36 图标按钮）
    → 点击弹出五层级成本明细 + 峰谷标签 + ⓘ 名词解释
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

**桌面版（DeepSeek Harness.app）同样支持**，安装目标是 `desktop` profile：可在桌面版侧边栏的「插件」面板里安装，或把包加进 `~/.dsh/profiles/desktop/package.json` 的依赖与 `dsh.profile.bundles`；装完**重启桌面版**生效。桌面版由 GUI 启动，本插件不依赖外部命令行，无需额外配置 PATH。

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

**注意**：官方已公告 V4-Pro 将于北京时间 2026-09-14 12:00 下线——此后 V4-Pro 请求会被路由到 V4.1-Flash 并按 Flash 计费。若在这之后仍配置 `deepseek-v4-pro`，估算会偏高，建议使用默认的 Flash 档。

**提示**：`cordis.patch.yml` 可能有其他插件的配置行，追加时注意**不要改动已有的行**，只加新内容。

## 定价说明

内置 DeepSeek 官方 2026-09-10 峰谷定价（元 / 百万 tokens），高峰时段为北京时间**周一至周五** 09:00–12:00、14:00–18:00（周末全天为空闲时段），价格为空闲时段两倍：

| 模型 | 时段 | 缓存命中(输入) | 缓存未命中(输入) | 输出 |
| --- | --- | --- | --- | --- |
| V4.1-Flash | 空闲 | 0.02 | 1.0 | 4.0 |
| V4.1-Flash | 高峰 | 0.04 | 2.0 | 8.0 |
| V4-Pro | 空闲 | 0.15 | 4.5 | 13.5 |
| V4-Pro | 高峰 | 0.30 | 9.0 | 27.0 |

官方页当前只列 `deepseek-flash` 与 `deepseek-v4-pro` 两列；`deepseek-v4-flash`、`deepseek-v4-flash-vision-exp`、`deepseek-chat` 等旧名仍可调用，按 Flash 价计费。插件在启动时与每 12h 从官方页重新解析，只有解析失败才回退上表。成本为**估算值**，实际以官方账单为准。

### 搜索调用（估算）

每次 `web_search` 的**每个查询**都会被 DSH 当作一次独立的辅助模型调用（`@deepseek-ai/dsh-web-search-deepseek`，默认 `deepseek-v4-flash`，每个请求最多 `maxUses` 次）。而会话日志只记录派发前的 `web/deepseek-search-llm-request` 事件——**不含 usage 字段**，本地任何文件都查不到这些调用的真实 token 数。

插件因此按「请求次数 × 标定常数」计入：每次搜索 ≈ 6k 缓存未命中输入 + 2k 输出 token，即谷时 **¥0.014**、峰时 **¥0.028**（2026-09-22 用余额差标定：14 次搜索实测 **¥0.0133/次**）。搜索会归到它所属的会话、工作区与「今日·全部」，但单次金额是估算值（±30% 量级）。

## 安全与权限边界

本节面向 DSH Store / 插件审计，列出依赖、运行时权限、外部服务与失败边界。

**依赖与兼容**
- 零运行时依赖：不 import 任何 `@deepseek-ai/*` 包，宿主端无第三方依赖
- `peerDependencies["@deepseek-ai/dsh"]`: `>=0.1.2-rc.1 <0.3.0`（DSH 兼容范围；0.1.5 / 0.1.7 / 0.2.0 实测通过）
- `engines.node`: `^22.19.0 || >=24.0.0`
- `peerDependencies["react"]`: `^18.2.0`（仅浏览器端渲染）

**运行时权限**
- `files`：只读 `~/.dsh/sessions/` 下的会话 JSONL（成本统计）；不写入、不修改任何会话文件
- `network`：仅请求 DeepSeek 官方端点——`api.deepseek.com`（`GET /user/balance`，仅在未登录/旧版宿主时使用；已登录时余额走宿主的 `deepseekAccount` 服务，不产生本插件的网络请求）与 `api-docs.deepseek.com` 定价页（每 12h 抓取）；不走任何第三方代理
- `commands`：**不执行任何命令**。会话解压改用 Node 内置 zstd（`node:zlib`，需 Node ≥22.15），不再依赖 `zstd` 可执行文件与 `PATH`
- `credentials`：仅在回退路径上读取 `DEEPSEEK_API_KEY`（经宿主凭据服务解析），仅宿主进程使用、loopback-only 路由守卫；浏览器不接触密钥。已登录账号时余额不读任何密钥
- 所有 host 路由均绑定 load 回环地址，外部不可达

**外部服务**
- 宿主账号服务 `deepseekAccount`（DSH 0.2.0+ 且已登录账号时；余额与官方账号页同源，金额按官方规则截断到分）
- DeepSeek 官方余额接口 `GET /user/balance`（回退路径：未登录或旧版宿主；点击/60s 刷新时调用）
- DeepSeek 官方定价页（启动时 + 每 12h 抓取，用于峰谷单价）

**失败边界**
- 余额接口失败：面板提示失败信息，保留上次成功快照（不中断）
- 定价页抓取失败：回退内置 2026-09-10 价目表，`pricingSource` 标记为 `default`（解析成功则为 `synced`）
- Node 无内置 zstd（<22.15）或会话文件解不出任何帧：返回可读错误提示，而非静默失败
- 会话文件缺失/损坏：跳过该会话，不影响其他会话统计
- 所有成本为估算值，实际以官方账单为准

## 版本历史

### v0.6.2 — 余额优先读官方账号服务（与设置页同源，不再需要 API Key）
- ✨ **余额优先取自宿主账号服务 `deepseekAccount`**：当 DSH ≥ 0.2.0 **且已登录 DeepSeek 账号**时，余额改读这个服务——它就是官方「设置 → 账号与余额」页的数据来源，所以卡片与设置页显示同一个数字。金额按官方规则处理：**正金额截断至分**（`55.6787307800000000` → `55.67`，与设置页一致），充值余额 = 官方 `value[]`、赠金余额 = `bonusWallets[]`，总额为两者之和，多币种各自成组
- 🚪 **降级路径完全不变**：未登录、宿主无该服务（DSH 0.1.x）、或账号读取失败（token 过期等）时，一律回退到原来的 `GET /user/balance` + `DEEPSEEK_API_KEY`，行为与 0.6.1 相同；账号读取失败会记一条 warn 说明原因
- 🔑 **登录态下余额不读任何密钥**：不再强制依赖 `DEEPSEEK_API_KEY`，纯账号模式（不配 API Key）也能显示余额
- 🔎 **可审计**：余额响应新增 `balanceSource` 字段（`deepseekAccount` 或回退路径），便于确认这一次的数字从哪来
- 🧪 **验证**：用假 cordis ctx 驱动**真实路由**跑 13 项断言全通过——账号映射 / 多币种与赠金求和 / 截断到分、未登录回退、服务缺失回退、账号抛错回退并告警、账号优先于 API Key、agent 计费工具同源，以及"凭据 key 的拼写不能被误当成服务名"这条防回归
- 📏 **实测同源**（2026-09-29，真机重启后）：官方 `account/getBalance` 返回 `¥55.0685054200000000`，插件卡片显示 `¥55.06` —— 逐分一致

> **关于这个版本的背景，也说给我们自己听。**
> 桌面版 0.2.0 上线后，官方在「设置 → 账号与余额」里放出了登录后的余额页。**这说明官方已经承认"用户需要随时知道余额"这个痛点**——只是它要多点几下才能看到，日常用起来仍然不如侧边栏常驻、一眼可读。
>
> 所以这一版还是做了适配：余额改读官方账号服务，与设置页逐分一致，并且不再需要 API Key。但我们心里清楚，官方既然已经把这个需求接过去了，**这个插件被替代只是时间问题**。有点不舍，不过工具的价值本来就应该由平台自己长出来——**接下来进入告别期**：后续只跟随 DSH 版本做必要的兼容性维护，不再扩展新功能。谢谢一路用它看住余额的每一天。

### v0.6.1 — 兼容范围放宽到 DSH 0.2.0（否则升级后插件会被静默摘掉）
- 🐛 **修复**：DSH 0.2.0 新增了插件兼容性闸门（`dsh-app-boot` 的 `evaluatePluginCompatibility`），它把 `peerDependencies` 里每个 `@deepseek-ai/dsh` / `@deepseek-ai/dsh-*` 范围与运行时版本比对，**且预发布版本参与范围匹配**（`semver.satisfies(..., { includePrerelease: true })`）；不匹配且未被豁免的 bundle 在启动时被**静默跳过**（`loadProfileDirectory` 收进 `skippedBundles`，不报错、也不改 manifest）。旧声明 `>=0.1.2-rc.1 <0.2.0` 恰好覆盖 `0.2.0-rc.1`（所以在 0.2.0-rc.1 桌面上一切正常，实测确认），但**不覆盖 0.2.0 正式版**——桌面版一升级，侧边栏卡片就会直接消失，插件管理器还会要求 `dsh plugin allow-version` 手动豁免。现放宽为 `<0.3.0`（实测覆盖 0.2.0 / 0.2.1 / 0.3.0-rc.1）
- ✅ **0.2.0 兼容性实测**（在 0.2.0-rc.1 桌面版 + 真实浏览器上运行）：宿主五条路由全部正常；会话日志仍为 `SESSION_FORMAT_VERSION = 4`，`totalTokens = inputTokens + outputTokens + cacheReadTokens` 在 394 条 usage 事件上全部成立（计价公式未变）；`sidebar.footer.action` 槽位、`dsh.client.platform === "web"` 加载闸门、`IconRefreshOutlineRegular` 图标名均未变；插件用到的 19 个 `--dsw-*` token 全部存在（其中 15 个在 `body[data-ds-dark-theme]` 下重定义，弹层 portal 到 `document.body` 仍能继承主题）；React 仍为 18.3.1；收起态 36×36 图标按钮与弹层定位照常
- 📦 **范围**：仅 `package.json` 的兼容范围声明与文档，运行代码无变化

### v0.6.0 — 适配 DSH 桌面版，界面与桌面端视觉对齐
- 🖥️ **适配桌面版（DSH 0.1.7 / DeepSeek Harness.app）**
  - **会话解压不再依赖 `zstd` 命令行**，改用 Node 内置 zstd（`node:zlib`）。桌面版由 GUI 启动，进程 PATH 只有 `/usr/bin:/bin:/usr/sbin:/sbin`，找不到 Homebrew 的 zstd——此前在桌面端「今日花费 / 最近一次提问」等所有成本档位都会直接报错
  - **按帧解压 v4 会话日志**：日志是 append-only 的，每次 flush 追加一个独立 zstd 帧（实测一份 726 KB 的 v4 日志含 97 帧）。Node 的一次性解压只返回第一帧（258 B）——比报错更危险的是它会静默丢掉 99% 以上的数据。现按帧魔数逐帧解码，v0 / v3 / v4 三种日志与 `zstd -dc` 输出字节级一致
  - **刷新图标按版本解析**：0.1.7 把产品图标改为尺寸中性权重（`IconRefreshOutlineRegular` + `size` 属性），旧名 `IconRefreshOutline14` 已不存在；把它当组件渲染会抛 React #130，而侧边栏槽位对崩溃条目的处理是整条摘掉——表现为「卡片闪一下、一点开就消失」。现按可用名解析并带本地 SVG 兜底
  - **客户端注入声明清空**：`@deepseek-ai/dsh-client-runtime` 从不是真实包（0.1.5 与 0.1.7 都没有），浏览器端只依赖 react 与 shell 的 seed 模块
- 🎨 **视觉贴合桌面端**
  - 去掉卡片的状态边框（谷时绿 / 峰时琥珀，看着像「被选中」）；峰/谷改为金额前的 6px 状态圆点。填充色、12px 圆角、金额 14px 字号均对齐桌面端会话行所用的设计 token
  - 卡片占满侧边栏列：此前被 flex 收缩到 131px 宽并横向溢出 8px
  - **新增侧边栏收起态**：在 56px 图标轨里渲染 36×36 图标按钮（与轨道其它按钮同规格），状态点变为图标角标
  - **弹层改挂 `document.body`**：侧边栏列是 `overflow:hidden`，收起态下弹层此前会被裁到只剩左边一小条；面板宽度跟随卡片（打开时实测，240px 起），并用 `ResizeObserver` 在拖动侧边栏 / 缩放窗口时实时跟随
  - 阴影与焦点环改用桌面端 token（`--dsw-shadow-lv3`、`--dsw-focus-ring-*`）
  - 📄 文档：README 两张截图按新外观重新生成

### v0.5.5 — 修复 README 在 npm 包页面上的显示
- 🐛 **修复**：README 的截图与语言切换此前用相对路径（`docs/screenshot-corner.png`、`README.en.md`）。npm 包页面只渲染 README 正文、不解析仓库内的相对路径，所以在 npm 上两张截图和语言链接都是坏的。现改为绝对 URL：截图走 `raw.githubusercontent.com`，语言切换走 GitHub blob 链接
- 📦 **范围**：仅文档，代码无变化

### v0.5.4 — 计入搜索调用（此前全部漏算）
- 🐛 **修复**：`web_search` 的辅助模型调用完全不计入成本。DSH 对每次搜索只写一个派发前的 `web/deepseek-search-llm-request` 事件（无 usage），所以按会话日志计价的实现系统性漏算——实测 2026-09-22 一天 1073 次搜索全部没进账。现按「请求次数 × 标定常数」计价，并归入该搜索所属的会话 / 工作区 / 当日及当轮
- 📏 **标定**：单次搜索 ≈ 6k 缓存未命中输入 + 2k 输出 token（谷时 ¥0.014、峰时 ¥0.028）。2026-09-22 用余额差实测：同一窗口 14 次搜索、余额差 ¥0.28、扣掉日志可算的对话成本 ¥0.094，得 **¥0.0133/次**
- ⚠️ **口径**：搜索部分是估算值（±30% 量级），会话正文部分仍是按日志精算

### v0.5.3 — 修复周末被误判为峰时
- 🐛 **修复**：峰/谷判断只看小时、不看星期，导致周末 09:00–12:00、14:00–18:00 被误判为峰时并按 2× 计价，"今日花费"最多翻倍。官方规则为**周一至周五** 09:00–12:00、14:00–18:00（其余含周末全天为空闲时段），现按北京时间的星期先行排除周六/周日
- 📄 **文档**：定价说明与峰谷 tooltip 补上"周一至周五"限定

### v0.5.2 — 适配 DSH 0.1.5：新会话格式与新定价页
- 🐛 **修复**：DSH 0.1.5 将会话日志改为代数命名 `session.v3.jsonl.zstd`，插件此前只认 `session.jsonl.zstd`，导致升级后新建的会话全部不可见——查看这类会话时弹层出现红色报错，今日成本也漏算（实测少约 36%）。现按「每个会话目录取最高代」发现日志；迁移会话保留的旧文件是新代的子集，因此只读最高代，避免整个会话被重复计算
- 🐛 **修复**：官方定价页将 Flash 列改名为 `deepseek-flash` 并下调价格，插件按模型名定位价格块的锚点因此落到页面脚注，同步"成功"却静默沿用旧高价，成本被高估约 1.7 倍。现改为按价格表行标签锚定，并把该列价格套用到全部 Flash 系名称
- 💰 **价目**：内置兜底价目表更新为 V4.1-Flash 价（空闲 0.02 / 1.0 / 4.0，高峰 0.04 / 2.0 / 8.0，元/百万 tokens）；V4-Pro 档位保留
- 📄 **文档**：更正 `pricingSource` 取值为 `default` / `synced`（此前误写为 `builtin`）

### v0.5.1 — 冷启动提速与代码清理
- 🚀 **性能**：今日成本冷启动从 ~5.4s 降至 ~0.01s——只解压当天活跃的会话文件（按 mtime 过滤）+ 解压结果按 (path, mtime) 长期缓存 + 并行解析
- ⏰ **轮询口径**：README 与代码统一——常驻卡片每 60s 自动刷新（此前文档"无轮询"表述自相矛盾，已更正）
- 🌏 **峰谷时区修正**：峰/谷判断改为显式按北京时间（UTC+8）计算，不再依赖宿主机时区
- 🧹 **清理**：移除客户端一套从未调用的死计价代码（PRICING/priceSession），计价统一走宿主
- 📐 **定价解析加固**：峰价改为从官方页面显式解析（不再硬编码"谷价 ×2"）；解析不到缓存命中价时整表回退内置价目表，避免静默按 0 计价
- 🏷️ **卡片语义**：卡片底部"今日"改为"今日·全部"，明确是全局（所有工作区）口径
- 🎨 **外观**：💰 换 SVG 钱包图标、弹框/卡片微交互动画、层级弱化（详情见 v0.5.1 diff）

### v0.5.0 — 五层级成本与峰谷状态
- ✨ **新增**：成本明细改为五层级——余额 / 最近一次提问 / 今日·本会话 / 今日·本工作区 / 今日·所有工作区
  - 最近一次提问下方标注**会话名**（基于最近活跃会话）
  - 「今日·本会话」= 当前会话今天产生的费用；「今日·本工作区」= 当前工作区今天所有会话合计（由当前会话锚定工作区）；「今日·所有工作区」= 全部工作区今天合计
- ✨ **新增**：峰/谷时段状态可视化——卡片与弹框边框按时段着色（峰时橙色 / 谷时绿色），弹框标题旁显示「峰时/谷时」标签，悬停查看当前价格档位
- 🎨 **调整**：移除余额剩余比例条，改为余额数字按阈值直接变色（充足 / 黄 / 红）
- 🗑️ **移除**：弹框中的「本会话成本」（会话全程累计）行

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
- 会话成本：`curl -s http://127.0.0.1:3080/api/dsh-balance/active-cost` 应返回 `{ lastPrompt, todaySession, title, sessionId, peak, workspaceName, ... }`；加 `?session=SESSION_ID` 可指定会话
- 今日成本：`curl -s http://127.0.0.1:3080/api/dsh-balance/today-cost` 应返回 `{ workspace: { cost, ..., cwd }, all: { cost, ... }, modelId }`
- 兼容旧路由：`curl -s "http://127.0.0.1:3080/api/dsh-balance/last-cost?session=SESSION_ID"` 仍可用，返回 `{ cost, inputTokens, outputTokens, modelId }`

## License

MIT
