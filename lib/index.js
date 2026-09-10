/**
 * dsh-balance-widget — host half.
 *
 * Registers two loopback-only API routes over ctx.webServer:
 *   GET /api/dsh-balance/balance  → DeepSeek account balance (official /user/balance)
 *   GET /api/dsh-balance/cost     → cost endpoint (reserved; pricing is client-side)
 *
 * The API key is resolved through the host's credentials service (the same
 * seam dsh-llm uses) and never leaves the host process: the browser only
 * talks to these same-origin routes. Routes are guarded loopback-only,
 * mirroring dsh-ssh's pattern. This module deliberately imports NO
 * @deepseek-ai/* packages so it resolves from any profile layout (npm,
 * workspace link, or flat fallback).
 */

/** Stable cordis plugin name (also the client bundle mount id). */
export const name = "balance-widget";

/** Services required before the balance surface can mount. */
export const inject = ["webServer"];

/** Route paths shared with the browser half (spelled here, not imported). */
export const API = {
	balance: "/api/dsh-balance/balance",
	cost: "/api/dsh-balance/cost",
	lastCost: "/api/dsh-balance/last-cost",
	todayCost: "/api/dsh-balance/today-cost",
	activeCost: "/api/dsh-balance/active-cost"
};

/** Default DeepSeek API base (mirrors dsh-llm-deepseek's PUBLIC_BASE_URL). */
const DEFAULT_BASE_URL = "https://api.deepseek.com";
/** Default credential ref, mirrors dsh-llm-deepseek's DEFAULT_API_KEY_ENV. */
const DEFAULT_API_KEY_ENV = "DEEPSEEK_API_KEY";
/** Default model used to price client-side session cost. */
const DEFAULT_MODEL_ID = "deepseek-v4-flash";

/**
 * Config schema exposed to the cordis loader. Cordis calls
 * `Config["~standard"].validate(config)` and expects a Standard Schema
 * (version 1) result — the same interface @deepseek-ai/schemastery produces.
 * We hand-build it here so the host half keeps ZERO external imports (the
 * workspace-link layout cannot resolve @deepseek-ai/* from the plugin's own
 * path, and importing nothing sidesteps that entirely).
 */
const CONFIG_FIELDS = {
	balanceBaseURL: "string",
	balanceApiKeyEnv: "string",
	requestTimeoutMs: "number",
	modelId: "string",
	lowThreshold: "number",
	criticalThreshold: "number"
};
const CONFIG_DEFAULTS = {
	balanceBaseURL: DEFAULT_BASE_URL,
	balanceApiKeyEnv: DEFAULT_API_KEY_ENV,
	requestTimeoutMs: 5000,
	modelId: DEFAULT_MODEL_ID,
	lowThreshold: 5,
	criticalThreshold: 1
};

export const Config = {
	"~standard": {
		version: 1,
		vendor: "dsh-balance-widget",
		validate(value) {
			if (value === void 0 || value === null) value = {};
			if (typeof value !== "object") {
				return { issues: [{ message: "config must be an object", path: [] }] };
			}
			const out = {};
			for (const [key, type] of Object.entries(CONFIG_FIELDS)) {
				const raw = value[key];
				const fallback = CONFIG_DEFAULTS[key];
				if (raw === void 0 || raw === null) {
					out[key] = fallback;
					continue;
				}
				if (type === "string" && typeof raw === "string" && raw !== "") {
					out[key] = raw;
				} else if (type === "number" && typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
					out[key] = raw;
				} else {
					out[key] = fallback;
				}
			}
			return { value: out };
		}
	},
	shape: CONFIG_FIELDS,
	defaults: CONFIG_DEFAULTS
};

/** Resolve config with defaults applied. */
function resolveConfig(raw) {
	const value = raw ?? {};
	return {
		balanceBaseURL: typeof value.balanceBaseURL === "string" && value.balanceBaseURL !== ""
			? value.balanceBaseURL
			: Config.defaults.balanceBaseURL,
		balanceApiKeyEnv: typeof value.balanceApiKeyEnv === "string" && value.balanceApiKeyEnv !== ""
			? value.balanceApiKeyEnv
			: Config.defaults.balanceApiKeyEnv,
		requestTimeoutMs: typeof value.requestTimeoutMs === "number" && value.requestTimeoutMs > 0
			? value.requestTimeoutMs
			: Config.defaults.requestTimeoutMs,
		modelId: typeof value.modelId === "string" && value.modelId !== ""
			? value.modelId
			: Config.defaults.modelId,
		lowThreshold: typeof value.lowThreshold === "number" && Number.isFinite(value.lowThreshold) && value.lowThreshold >= 0
			? value.lowThreshold
			: Config.defaults.lowThreshold,
		criticalThreshold: typeof value.criticalThreshold === "number" && Number.isFinite(value.criticalThreshold) && value.criticalThreshold >= 0
			? value.criticalThreshold
			: Config.defaults.criticalThreshold
	};
}

/** Write a JSON response with a status code. */
function writeJson(res, status, body) {
	const payload = JSON.stringify(body);
	res.writeHead(status, {
		"content-type": "application/json; charset=utf-8",
		"content-length": Buffer.byteLength(payload)
	});
	res.end(payload);
}

/** Whether the request comes from the loopback interface. */
function isLoopbackRequest(req) {
	const address = req.socket?.remoteAddress ?? "";
	return address === "::1"
		|| address === "::ffff:127.0.0.1"
		|| address === "127.0.0.1"
		|| address === "localhost"
		|| address.startsWith("::ffff:127.");
}

/** Guard helper: loopback fence + method check. */
function guard(req, res, method) {
	if (!isLoopbackRequest(req)) {
		writeJson(res, 403, { error: "forbidden: loopback-only" });
		return false;
	}
	if ((req.method ?? "GET") !== method) {
		writeJson(res, 405, { error: `method not allowed: ${req.method}` });
		return false;
	}
	return true;
}

/**
 * Resolve the DeepSeek API key through the host credentials service.
 * Falls back to the launch environment, then process env. Returns undefined
 * when absent everywhere.
 */
async function resolveApiKey(ctx, config) {
	try {
		const credentials = ctx.get("credentials");
		if (credentials !== void 0) {
			const hit = await credentials.resolve(config.balanceApiKeyEnv);
			if (hit !== void 0 && hit.value !== void 0 && hit.value !== "") return hit.value;
		}
	} catch (error) {
		ctx.logger?.warn?.("[dsh-balance-widget] credentials resolve failed: %s", error instanceof Error ? error.message : String(error));
	}
	try {
		const environment = ctx.get("launchEnvironment");
		if (environment !== void 0) {
			const entry = environment.get(config.balanceApiKeyEnv);
			if (entry !== void 0 && entry.value.length > 0) return entry.value;
		}
	} catch {
		/* fall through to process env */
	}
	const ambient = process.env[config.balanceApiKeyEnv];
	if (ambient !== void 0 && ambient !== "") return ambient;
	return void 0;
}

/**
 * Query the official DeepSeek /user/balance endpoint.
 * @returns { ok: true, ...payload } | { ok: false, error }
 */
async function fetchBalance(ctx, config) {
	let apiKey;
	try {
		apiKey = await resolveApiKey(ctx, config);
	} catch (error) {
		return { ok: false, error: error instanceof Error ? error.message : String(error) };
	}
	if (apiKey === void 0) {
		return {
			ok: false,
			error: `no API key for ${config.balanceApiKeyEnv}; store it through the credentials service or export it in the launching environment`
		};
	}
	const controller = new AbortController();
	const timer = setTimeout(() => controller.abort(), config.requestTimeoutMs);
	try {
		const response = await fetch(`${config.balanceBaseURL}/user/balance`, {
			headers: { authorization: `Bearer ${apiKey}` },
			signal: controller.signal
		});
		if (!response.ok) {
			const text = await response.text().catch(() => "");
			return { ok: false, error: `balance endpoint responded ${response.status}: ${text.slice(0, 200)}` };
		}
		const payload = await response.json();
		return { ok: true, ...payload };
	} catch (error) {
		return {
			ok: false,
			error: error instanceof Error ? error.message : String(error)
		};
	} finally {
		clearTimeout(timer);
	}
}

/**
 * Built-in pricing table (CNY per 1M tokens). Used before the first successful
 * sync and as the fallback for any model the official page cannot be parsed
 * for, so it must be kept current by hand: V4.1-Flash rates as of 2026-09-10.
 * Mutable: syncOfficialPricing() replaces entries with freshly parsed rates.
 */
const FLASH_RATES = {
	peak: { inputMiss: 2.0, inputHit: 0.04, output: 8.0 },
	offPeak: { inputMiss: 1.0, inputHit: 0.02, output: 4.0 }
};
const PRO_RATES = {
	peak: { inputMiss: 9.0, inputHit: 0.30, output: 27.0 },
	offPeak: { inputMiss: 4.5, inputHit: 0.15, output: 13.5 }
};
/**
 * "deepseek-flash" is the current model name; the older names below are
 * retired but still accepted by the API and billed at the Flash rate
 * (V4-Pro requests are routed to V4.1-Flash from 2026-09-14 12:00 CST).
 */
const DEFAULT_PRICING = {
	"deepseek-flash": FLASH_RATES,
	"deepseek-v4-flash": FLASH_RATES,
	"deepseek-v4-flash-vision-exp": FLASH_RATES,
	"deepseek-v4-pro": PRO_RATES,
	"deepseek-chat": FLASH_RATES,
	"deepseek-reasoner": PRO_RATES
};
let pricingTable = { ...DEFAULT_PRICING };
/** Source of the current pricing: "default" | "synced". */
let pricingSource = "default";
/** Last successful sync time (ms epoch), or null. */
let pricingSyncedAt = null;

/** Official pricing page (parsed for peak/off-peak rates). */
const PRICING_URL = "https://api-docs.deepseek.com/zh-cn/quick_start/pricing/";
const PRICE_SYNC_INTERVAL_MS = 12 * 60 * 60 * 1000;

const PRICING_ALIASES = {
	"deepseek-vision": "deepseek-v4-flash",
	"deepseek-official": "deepseek-v4-flash"
};

/**
 * Whether `date` falls inside a Beijing-time (UTC+8) peak window.
 * DeepSeek's peak pricing applies to Beijing time 09:00-12:00 and 14:00-18:00
 * regardless of the host's timezone, so the window is computed in UTC+8
 * explicitly instead of the machine's local time.
 */
function isPeak(date) {
	const beijing = new Date(date.getTime() + 8 * 60 * 60 * 1000);
	const hour = beijing.getUTCHours();
	return (hour >= 9 && hour < 12) || (hour >= 14 && hour < 18);
}

/** Map a provider/model id to a pricing key. */
function pricingKey(modelId) {
	if (modelId === void 0 || modelId === null) return "deepseek-v4-flash";
	if (pricingTable[modelId] !== void 0) return modelId;
	const alias = PRICING_ALIASES[modelId];
	if (alias !== void 0) return alias;
	// heuristic: pro/reasoner-ish names price as pro
	if (/pro|reasoner|r1/i.test(modelId)) return "deepseek-v4-pro";
	return "deepseek-v4-flash";
}

/** Price one usage sample in CNY. */
function priceUsage(usage, modelId, timeMs) {
	if (usage === void 0 || usage === null) return 0;
	const input = usage.inputTokens ?? usage.uncachedInputTokens ?? 0;
	const hit = usage.cacheReadTokens ?? 0;
	const output = usage.outputTokens ?? 0;
	if (input + hit + output <= 0) return 0;
	const table = isPeak(new Date(timeMs ?? Date.now())) ? pricingTable[pricingKey(modelId)].peak : pricingTable[pricingKey(modelId)].offPeak;
	return (input * table.inputMiss + hit * table.inputHit + output * table.output) / 1e6;
}

/**
 * Parse the official pricing page into our pricingTable shape.
 * The page is HTML; we look for per-model peak/off-peak "per 1M tokens" rates.
 * Returns true on success (pricingTable updated), false on any failure
 * (pricingTable left untouched).
 */
async function syncOfficialPricing() {
	try {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), 15000);
		const response = await fetch(PRICING_URL, { signal: controller.signal });
		clearTimeout(timer);
		if (!response.ok) return false;
		const html = await response.text();
		const parsed = parsePricingPage(html);
		if (parsed === null || Object.keys(parsed).length === 0) return false;
		// Merge over defaults so any model we cannot parse keeps its fallback.
		const merged = { ...DEFAULT_PRICING };
		for (const [model, rates] of Object.entries(parsed)) merged[model] = rates;
		pricingTable = merged;
		pricingSource = "synced";
		pricingSyncedAt = Date.now();
		return true;
	} catch {
		return false;
	}
}

/**
 * Pricing keys served by the page's leftmost (Flash) model column. Retired
 * names are still billed at the Flash rate, so they share its entries.
 */
const FLASH_PRICING_KEYS = ["deepseek-flash", "deepseek-v4-flash", "deepseek-v4-flash-vision-exp", "deepseek-chat"];

/**
 * Best-effort parse of the official pricing page HTML. Only the leftmost model
 * column is readable by {@link parseRates}, i.e. the Flash-tier column, so its
 * rates are applied to every flash-family pricing key. Heuristic: returns a
 * partial table rather than failing the whole sync.
 */
function parsePricingPage(html) {
	const block = extractPricingTable(html);
	if (block === null) return {};
	const rates = parseRates(block);
	if (rates === null) return {};
	const out = {};
	for (const key of FLASH_PRICING_KEYS) out[key] = rates;
	return out;
}

/**
 * Extract the pricing-table region: a window around the first per-metric row
 * label. Anchoring on the row label rather than on a model id keeps the sync
 * alive across DeepSeek's model renames — anchoring on "deepseek-v4-flash"
 * silently broke once that id survived only in a footnote *after* the table.
 */
function extractPricingTable(html) {
	const idx = html.indexOf("缓存命中");
	if (idx < 0) return null;
	return html.slice(Math.max(0, idx - 200), Math.min(html.length, idx + 1600));
}

/**
 * Parse per-1M-token rates from a block of HTML text. The pricing table lists
 * rows per metric with "空闲时段 <off-peak> … 高峰时段 <peak>" columns (CN) or
 * "off-peak … peak" (EN); the first model column is the one we price. Each
 * metric is captured as an (offPeak, peak) pair from its labelled row.
 * Returns { offPeak, peak } or null when any off-peak figure is missing
 * (the caller then falls back to the built-in rate table rather than silently
 * pricing cache hits at 0).
 */
function parseRates(block) {
	// Strip tags to plain text for simpler matching.
	const text = block.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
	const pair = (label) => {
		// label + short gap + "空闲时段 <n>" + gap + "高峰时段 <n>" (first model
		// column). Also tolerate EN "off-peak … peak".
		const re = new RegExp(
			label + "[\\s\\S]{0,120}?(?:空闲时段|off[- ]?peak)\\s*([\\d.]+)[\\s\\S]{0,80}?(?:高峰时段|peak)\\s*([\\d.]+)",
			"i"
		);
		const m = text.match(re);
		if (!m) return null;
		const a = parseFloat(m[1]);
		const b = parseFloat(m[2]);
		return Number.isFinite(a) && Number.isFinite(b) ? [a, b] : null;
	};
	const hit = pair("缓存命中");
	const miss = pair("缓存未命中");
	const out = pair("百万tokens输出") ?? pair("输出");
	if (miss === null || out === null) return null;
	// Cache-hit row missing is acceptable only if it cannot be parsed at all —
	// reject rather than guess zero.
	if (hit === null) return null;
	return {
		offPeak: { inputMiss: miss[0], inputHit: hit[0], output: out[0] },
		peak: { inputMiss: miss[1], inputHit: hit[1], output: out[1] }
	};
}

/** Kick off the first sync (fire-and-forget) and schedule the interval. */
function startPricingSync() {
	syncOfficialPricing().catch(() => {});
	const timer = setInterval(() => {
		syncOfficialPricing().catch(() => {});
	}, PRICE_SYNC_INTERVAL_MS);
	// Unref so the interval never keeps the process alive on its own.
	if (typeof timer.unref === "function") timer.unref();
	return timer;
}

/**
 * Resolve the DSH sessions root directory (defaults to ~/.dsh/sessions).
 * Avoids importing dsh-home-paths to keep zero external dependencies.
 */
function sessionsRoot() {
	return `${process.env.HOME ?? ""}/.dsh/sessions`;
}

/** Strip a leading "session-" prefix if present (callers may pass either form). */
function normalizeSessionId(sessionId) {
	return sessionId.startsWith("session-") ? sessionId.slice("session-".length) : sessionId;
}

/** Resolve the current session's JSONL path by walking the sessions tree. */
async function resolveSessionFile(sessionId) {
	if (sessionId === void 0 || sessionId === "") return void 0;
	const bareId = normalizeSessionId(sessionId);
	const root = sessionsRoot();
	try {
		const fs = await awaitImportFs();
		const dirs = fs.readdirSync(root, { withFileTypes: true });
		for (const dir of dirs) {
			if (!dir.isDirectory()) continue;
			const candidate = `${root}/${dir.name}/session-${bareId}/session.jsonl.zstd`;
			if (fs.existsSync(candidate)) return candidate;
		}
	} catch {
		/* ignore filesystem errors */
	}
	return void 0;
}

let _fs;
function awaitImportFs() {
	if (_fs === void 0) _fs = import("node:fs");
	return _fs;
}

/** Cache the zstd availability probe (run once per process). */
let _zstdAvailable = void 0;

/**
 * Probe whether the zstd CLI is available, caching the result.
 * macOS does not ship zstd by default, so this must be checked lazily and
 * surfaced as a distinct error rather than a silent "session not found".
 */
async function isZstdAvailable() {
	if (_zstdAvailable !== void 0) return _zstdAvailable;
	const { execFile } = await import("node:child_process");
	const { promisify } = await import("node:util");
	const execFileP = promisify(execFile);
	try {
		await execFileP("zstd", ["--version"], { timeout: 5000 });
		_zstdAvailable = true;
	} catch {
		_zstdAvailable = false;
	}
	return _zstdAvailable;
}

/**
 * Decompress a .zstd session file to text via the zstd CLI.
 * @returns { ok: true, text } | { ok: false, error }
 */
async function decompressSession(path) {
	if (!(await isZstdAvailable())) {
		return {
			ok: false,
			error: "zstd CLI not found — install it (e.g. `brew install zstd`) to read session files"
		};
	}
	const { execFile } = await import("node:child_process");
	const { promisify } = await import("node:util");
	const execFileP = promisify(execFile);
	try {
		const { stdout } = await execFileP("zstd", ["-d", "-c", path], { maxBuffer: 512 * 1024 * 1024 });
		return { ok: true, text: stdout };
	} catch (error) {
		return {
			ok: false,
			error: `failed to decompress session file: ${error instanceof Error ? error.message : String(error)}`
		};
	}
}

/**
 * Parse a decompressed session JSONL and return every assistant usage sample
 * with its turn, time, and the model id from the nearest request/header.
 */
function parseSessionUsages(text) {
	const samples = [];
	let currentModel = void 0;
	let cwd = void 0;
	let title = void 0;
	for (const line of text.split("\n")) {
		if (line === "") continue;
		let event;
		try {
			event = JSON.parse(line);
		} catch {
			continue;
		}
		const type = event.type;
		if (type === "session") {
			cwd = event.cwd;
		} else if (type === "session/title") {
			title = event.data?.title ?? title;
		} else if (type === "request/header") {
			currentModel = event.data?.header?.config?.model ?? currentModel;
		} else if (type === "assistant/message") {
			const usage = event.data?.usage;
			if (usage !== void 0) {
				samples.push({
					turn: event.data?.turn ?? 0,
					time: event.time ?? Date.now(),
					model: currentModel,
					usage
				});
			}
		}
	}
	return { samples, cwd, title };
}

/** Cost of the last turn (the most recent user prompt) in one session file. */
function lastTurnCost(samples) {
	if (samples.length === 0) return { cost: 0, inputTokens: 0, outputTokens: 0 };
	let lastTurn = -1;
	for (const s of samples) if (s.turn > lastTurn) lastTurn = s.turn;
	let cost = 0;
	let input = 0;
	let output = 0;
	for (const s of samples) {
		if (s.turn !== lastTurn) continue;
		cost += priceUsage(s.usage, s.model, s.time);
		input += (s.usage.inputTokens ?? s.usage.uncachedInputTokens ?? 0) + (s.usage.cacheReadTokens ?? 0);
		output += s.usage.outputTokens ?? 0;
	}
	return { cost, inputTokens: input, outputTokens: output };
}

/** Cost of one session's usage that falls on the current calendar day. */
function todaySessionCost(samples) {
	const now = new Date();
	const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
	const dayEnd = dayStart + 24 * 60 * 60 * 1000;
	let cost = 0;
	let input = 0;
	let output = 0;
	for (const s of samples) {
		if (s.time < dayStart || s.time >= dayEnd) continue;
		cost += priceUsage(s.usage, s.model, s.time);
		input += (s.usage.inputTokens ?? s.usage.uncachedInputTokens ?? 0) + (s.usage.cacheReadTokens ?? 0);
		output += s.usage.outputTokens ?? 0;
	}
	return { cost, inputTokens: input, outputTokens: output };
}

/**
 * Find the session file modified most recently (the "active" session).
 * Walks the sessions tree and picks by mtime; returns the path or undefined.
 */
async function findMostRecentSessionFile() {
	const root = sessionsRoot();
	try {
		const fs = await awaitImportFs();
		const { statSync } = fs;
		let best = void 0;
		let bestMtime = -1;
		const walk = (dir) => {
			for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
				const full = `${dir}/${entry.name}`;
				if (entry.isDirectory()) {
					walk(full);
				} else if (entry.name === "session.jsonl.zstd") {
					try {
						const mtime = statSync(full).mtimeMs;
						if (mtime > bestMtime) {
							bestMtime = mtime;
							best = full;
						}
					} catch {
						/* ignore unreadable files */
					}
				}
			}
		};
		walk(root);
		return best;
	} catch {
		return void 0;
	}
}

/**
 * Sum today's usage across session files. "Today" = events whose time
 * falls on the same calendar day (local time) as now.
 * @param {Array<{samples:Array,cwd?:string}>} sessionList - parsed sessions.
 * @param {string} [cwdFilter] - if given, only sessions with this cwd count.
 */
function todayCost(sessionList, cwdFilter) {
	const now = new Date();
	const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
	const dayEnd = dayStart + 24 * 60 * 60 * 1000;
	let cost = 0;
	let input = 0;
	let output = 0;
	for (const session of sessionList) {
		if (cwdFilter !== void 0 && session.cwd !== cwdFilter) continue;
		for (const s of session.samples) {
			if (s.time < dayStart || s.time >= dayEnd) continue;
			cost += priceUsage(s.usage, s.model, s.time);
			input += (s.usage.inputTokens ?? s.usage.uncachedInputTokens ?? 0) + (s.usage.cacheReadTokens ?? 0);
			output += s.usage.outputTokens ?? 0;
		}
	}
	return { cost, inputTokens: input, outputTokens: output };
}

/**
 * Decompressed session parse cache, keyed by path and validated against the
 * file's mtime. Long-lived: an untouched file is never re-decompressed, so a
 * cold /today-cost after the outer 30s TTL expires only re-reads files that
 * actually changed. Cleared wholesale when it outgrows a bound.
 */
const sessionParseCache = new Map();
const SESSION_PARSE_CACHE_MAX = 600;

/** Decompress+parse one file, honoring the (path,mtime) cache. */
async function parseSessionFileCached(path, mtimeMs) {
	const hit = sessionParseCache.get(path);
	if (hit !== void 0 && hit.mtimeMs === mtimeMs) return hit.parsed;
	const result = await decompressSession(path);
	if (!result.ok) return null;
	const parsed = parseSessionUsages(result.text);
	if (sessionParseCache.size >= SESSION_PARSE_CACHE_MAX) sessionParseCache.clear();
	sessionParseCache.set(path, { mtimeMs, parsed });
	return parsed;
}

/**
 * Walk every session file under the sessions root and parse the ones that can
 * contribute to "today" numbers. Only files whose mtime falls on the current
 * local calendar day can contain today's samples, so older files are skipped
 * entirely (avoids decompressing the whole ~/.dsh/sessions tree on every cold
 * call). Parsing runs in parallel; results are cached by (path, mtime).
 */
async function collectAllSessionSamples() {
	const root = sessionsRoot();
	const fs = (await awaitImportFs());
	const files = [];
	try {
		const walk = (dir) => {
			for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
				const full = `${dir}/${entry.name}`;
				if (entry.isDirectory()) walk(full);
				else if (entry.name === "session.jsonl.zstd") files.push(full);
			}
		};
		walk(root);
	} catch {
		return [];
	}
	const now = new Date();
	const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
	const candidates = [];
	for (const file of files) {
		try {
			const mtimeMs = fs.statSync(file).mtimeMs;
			if (mtimeMs >= dayStart) candidates.push({ path: file, mtimeMs });
		} catch { /* file vanished mid-walk */ }
	}
	const parsed = await Promise.all(candidates.map((c) => parseSessionFileCached(c.path, c.mtimeMs)));
	return parsed.filter((p) => p !== null);
}

/** Simple in-memory TTL cache for cost computations (30s). */
const costCache = new Map();
const COST_CACHE_TTL_MS = 30000;
function cachedOrCompute(key, compute) {
	const hit = costCache.get(key);
	if (hit !== void 0 && Date.now() - hit.at < COST_CACHE_TTL_MS) return hit.value;
	const value = compute();
	costCache.set(key, { at: Date.now(), value });
	return value;
}
/** In-flight dedupe: key → shared promise, dropped when settled. */
const costInflight = new Map();
function dedupe(key, compute) {
	const pending = costInflight.get(key);
	if (pending !== void 0) return pending;
	const promise = compute().finally(() => costInflight.delete(key));
	costInflight.set(key, promise);
	return promise;
}

/** Build the route table for the balance widget. */
function makeRoutes(ctx, config) {
	return [
		{
			kind: "exact",
			path: API.balance,
			handler: async (req, res) => {
				if (!guard(req, res, "GET")) return;
				const result = await fetchBalance(ctx, config);
				if (result.ok) {
					writeJson(res, 200, {
						...result,
						modelId: config.modelId,
						lowThreshold: config.lowThreshold,
						criticalThreshold: config.criticalThreshold
					});
				} else {
					writeJson(res, 502, {
						error: result.error,
						modelId: config.modelId,
						lowThreshold: config.lowThreshold,
						criticalThreshold: config.criticalThreshold
					});
				}
			}
		},
		{
			kind: "exact",
			path: API.cost,
			handler: async (req, res) => {
				if (!guard(req, res, "GET")) return;
				// Legacy route: cost is priced per-session; keep responding for
				// compatibility with older client builds.
				writeJson(res, 200, { ok: true, note: "use /last-cost and /today-cost" });
			}
		},
		{
			kind: "exact",
			path: API.lastCost,
			handler: async (req, res) => {
				if (!guard(req, res, "GET")) return;
				const url = new URL(req.url ?? "/", "http://localhost");
				const sessionId = url.searchParams.get("session") ?? "";
				const file = await resolveSessionFile(sessionId);
				if (file === void 0) {
					writeJson(res, 404, { error: `session ${sessionId} not found`, modelId: config.modelId });
					return;
				}
				const key = `last:${sessionId}`;
				const compute = async () => {
					const result = await decompressSession(file);
					if (!result.ok) return { error: result.error };
					const parsed = parseSessionUsages(result.text);
					return { value: lastTurnCost(parsed.samples) };
				};
				const outcome = await dedupe(key, () => cachedOrCompute(key, compute));
				if (outcome.error !== void 0) {
					writeJson(res, 502, { error: outcome.error, modelId: config.modelId });
					return;
				}
				writeJson(res, 200, { ...outcome.value, modelId: config.modelId, pricingSource, pricingSyncedAt });
			}
		},
		{
			kind: "exact",
			path: API.todayCost,
			handler: async (req, res) => {
				if (!guard(req, res, "GET")) return;
				const url = new URL(req.url ?? "/", "http://localhost");
				const sessionId = url.searchParams.get("session") ?? "";
				const key = `today:${sessionId}`;
				const compute = async () => {
					const sessionList = await collectAllSessionSamples();
					const all = todayCost(sessionList);
					// "Current workspace": prefer the cwd of the explicitly passed
					// session (the client's currently selected session). Fall back
					// to the session with the most samples today when absent.
					let activeCwd = void 0;
					if (sessionId !== "") {
						const target = await resolveSessionFile(sessionId);
						if (target !== void 0) {
							const text = await decompressSession(target);
							if (text.ok) activeCwd = parseSessionUsages(text.text).cwd;
						}
					}
					if (activeCwd === void 0) {
						let activeCount = 0;
						for (const session of sessionList) {
							if (session.cwd === void 0) continue;
							const todaySamples = session.samples.filter((s) => {
								const now = new Date();
								const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
								return s.time >= dayStart && s.time < dayStart + 24 * 60 * 60 * 1000;
							}).length;
							if (todaySamples > activeCount) {
								activeCount = todaySamples;
								activeCwd = session.cwd;
							}
						}
					}
					const workspace = todayCost(sessionList, activeCwd);
					return {
						value: {
							workspace: { ...workspace, cwd: activeCwd },
							all
						}
					};
				};
				const outcome = await dedupe(key, () => cachedOrCompute(key, compute));
				writeJson(res, 200, { ...outcome.value, modelId: config.modelId, pricingSource, pricingSyncedAt });
			}
		},
		{
			kind: "exact",
			path: API.activeCost,
			handler: async (req, res) => {
				if (!guard(req, res, "GET")) return;
				const url = new URL(req.url ?? "/", "http://localhost");
				const sessionId = url.searchParams.get("session") ?? "";
				// Prefer the explicitly passed session (the client's currently
				// selected one); fall back to the most recently active session.
				const file = sessionId !== ""
					? await resolveSessionFile(sessionId)
					: await findMostRecentSessionFile();
				if (file === void 0) {
					writeJson(res, 404, { error: "no session files found", modelId: config.modelId });
					return;
				}
				const result = await decompressSession(file);
				if (!result.ok) {
					writeJson(res, 502, { error: result.error, modelId: config.modelId });
					return;
				}
				const parsed = parseSessionUsages(result.text);
				const last = lastTurnCost(parsed.samples);
				const todaySession = todaySessionCost(parsed.samples);
				// Current peak/off-peak state + price tier for the configured model.
				const now = new Date();
				const peakActive = isPeak(now);
				const table = peakActive
					? pricingTable[pricingKey(config.modelId)].peak
					: pricingTable[pricingKey(config.modelId)].offPeak;
				// Short workspace name from the cwd path (last segment).
				let workspaceName = "未知工作区";
				if (typeof parsed.cwd === "string" && parsed.cwd !== "") {
					const segments = parsed.cwd.split("/").filter((s) => s !== "");
					workspaceName = segments.length > 0 ? segments[segments.length - 1] : parsed.cwd;
				}
				// Session id from the file path (…/session-<id>/session.jsonl.zstd).
				let fileSessionId = void 0;
				const sidMatch = file.match(/session-([0-9a-f-]+)/);
				if (sidMatch !== null) fileSessionId = sidMatch[1];
				writeJson(res, 200, {
					lastPrompt: last,
					todaySession,
					cwd: parsed.cwd,
					title: parsed.title,
					workspaceName,
					sessionId: fileSessionId,
					peak: {
						active: peakActive,
						inputMiss: table.inputMiss,
						inputHit: table.inputHit,
						output: table.output
					},
					modelId: config.modelId,
					pricingSource,
					pricingSyncedAt
				});
			}
		}
	];
}

/**
 * Build the `deepseek_billing` agent tool: lets the model query balance and
 * session costs directly ("how much balance do I have?"). Hand-constructed
 * tool object (no defineTool import) to keep zero external dependencies;
 * mirrors the shape defineTool produces.
 */
function buildBillingTool(ctx, config) {
	return {
		name: "deepseek_billing",
		description: "Query the DeepSeek account balance and estimated session costs. Use when the user asks about their balance, spending, or token costs. query = 'balance' (account balance), 'cost' (current session estimated cost), or 'both'.",
		parameters: {
			type: "object",
			properties: {
				query: {
					type: "string",
					enum: ["balance", "cost", "both"],
					description: "What to query: balance, cost, or both."
				}
			},
			required: ["query"]
		},
		async execute(args) {
			const query = args?.query ?? "both";
			const parts = [];
			if (query === "balance" || query === "both") {
				const result = await fetchBalance(ctx, config);
				if (result.ok) {
					const info = (result.balance_infos ?? [])[0];
					if (info !== void 0) {
						parts.push(`Balance: ${info.currency} ${info.total_balance} (granted ${info.granted_balance}, topped up ${info.topped_up_balance})`);
					} else {
						parts.push("Balance: unavailable (no balance info returned)");
					}
				} else {
					parts.push(`Balance query failed: ${result.error}`);
				}
			}
			if (query === "cost" || query === "both") {
				try {
					const sessionList = await collectAllSessionSamples();
					const today = todayCost(sessionList);
					parts.push(`Today's estimated cost: CNY ${today.cost.toFixed(4)} (${today.inputTokens} input tokens, ${today.outputTokens} output tokens)`);
				} catch (error) {
					parts.push(`Cost query failed: ${error instanceof Error ? error.message : String(error)}`);
				}
			}
			return { result: parts.join("\n") };
		}
	};
}

/** Cordis plugin apply: register routes on the host webServer. */
export function apply(ctx, config) {
	const resolved = resolveConfig(config);
	const routes = makeRoutes(ctx, resolved);
	const disposers = routes.map((route) => ctx.webServer.register(route));
	// Register the agent-facing billing tool when the tools service exists.
	let toolDisposer;
	try {
		if (ctx.tools !== void 0 && typeof ctx.tools.register === "function") {
			toolDisposer = ctx.tools.register(buildBillingTool(ctx, resolved));
		}
	} catch (error) {
		ctx.logger?.warn?.("[dsh-balance-widget] tool registration failed: %s", error instanceof Error ? error.message : String(error));
	}
	// Kick off official price sync (fire-and-forget) and keep the interval
	// handle for teardown.
	const syncTimer = startPricingSync();
	ctx.effect(() => () => {
		clearInterval(syncTimer);
		for (const dispose of disposers) dispose();
		if (typeof toolDisposer === "function") toolDisposer();
	}, "dsh-balance-widget: routes");
}
