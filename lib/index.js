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
	todayCost: "/api/dsh-balance/today-cost"
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
 * Pricing table (CNY per 1M tokens, official 2026-08-17 peak/off-peak).
 * Mirrors the client half; kept here so host-computed costs use the same
 * numbers.
 */
const PRICING = {
	"deepseek-v4-flash": { peak: { inputMiss: 3.0, inputHit: 0.10, output: 9.0 }, offPeak: { inputMiss: 1.5, inputHit: 0.05, output: 4.5 } },
	"deepseek-v4-pro": { peak: { inputMiss: 9.0, inputHit: 0.30, output: 27.0 }, offPeak: { inputMiss: 4.5, inputHit: 0.15, output: 13.5 } },
	"deepseek-chat": { peak: { inputMiss: 3.0, inputHit: 0.10, output: 9.0 }, offPeak: { inputMiss: 1.5, inputHit: 0.05, output: 4.5 } },
	"deepseek-reasoner": { peak: { inputMiss: 9.0, inputHit: 0.30, output: 27.0 }, offPeak: { inputMiss: 4.5, inputHit: 0.15, output: 13.5 } }
};
const PRICING_ALIASES = {
	"deepseek-vision": "deepseek-v4-flash",
	"deepseek-official": "deepseek-v4-flash"
};

/** Whether `date` falls inside a Beijing-time peak window. */
function isPeak(date) {
	const hour = date.getHours();
	return (hour >= 9 && hour < 12) || (hour >= 14 && hour < 18);
}

/** Map a provider/model id to a pricing key. */
function pricingKey(modelId) {
	if (modelId === void 0 || modelId === null) return "deepseek-v4-flash";
	if (PRICING[modelId] !== void 0) return modelId;
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
	const table = isPeak(new Date(timeMs ?? Date.now())) ? PRICING[pricingKey(modelId)].peak : PRICING[pricingKey(modelId)].offPeak;
	return (input * table.inputMiss + hit * table.inputHit + output * table.output) / 1e6;
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
	for (const line of text.split("\n")) {
		if (line === "") continue;
		let event;
		try {
			event = JSON.parse(line);
		} catch {
			continue;
		}
		const type = event.type;
		if (type === "request/header") {
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
	return samples;
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

/**
 * Sum today's usage across every session file. "Today" = events whose time
 * falls on the same calendar day (local time) as now.
 */
function todayCost(samplesBySession) {
	const now = new Date();
	const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
	const dayEnd = dayStart + 24 * 60 * 60 * 1000;
	let cost = 0;
	let input = 0;
	let output = 0;
	for (const samples of samplesBySession) {
		for (const s of samples) {
			if (s.time < dayStart || s.time >= dayEnd) continue;
			cost += priceUsage(s.usage, s.model, s.time);
			input += (s.usage.inputTokens ?? s.usage.uncachedInputTokens ?? 0) + (s.usage.cacheReadTokens ?? 0);
			output += s.usage.outputTokens ?? 0;
		}
	}
	return { cost, inputTokens: input, outputTokens: output };
}

/** Walk every session file under the sessions root, decompress, and parse. */
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
	const perSession = [];
	for (const file of files) {
		const result = await decompressSession(file);
		if (!result.ok) continue;
		perSession.push(parseSessionUsages(result.text));
	}
	return perSession;
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
					const samples = parseSessionUsages(result.text);
					return { value: lastTurnCost(samples) };
				};
				const outcome = await dedupe(key, () => cachedOrCompute(key, compute));
				if (outcome.error !== void 0) {
					writeJson(res, 502, { error: outcome.error, modelId: config.modelId });
					return;
				}
				writeJson(res, 200, { ...outcome.value, modelId: config.modelId });
			}
		},
		{
			kind: "exact",
			path: API.todayCost,
			handler: async (req, res) => {
				if (!guard(req, res, "GET")) return;
				const key = "today";
				const compute = async () => {
					const perSession = await collectAllSessionSamples();
					return { value: todayCost(perSession) };
				};
				const outcome = await dedupe(key, () => cachedOrCompute(key, compute));
				writeJson(res, 200, { ...outcome.value, modelId: config.modelId });
			}
		}
	];
}

/** Cordis plugin apply: register routes on the host webServer. */
export function apply(ctx, config) {
	const resolved = resolveConfig(config);
	const routes = makeRoutes(ctx, resolved);
	const disposers = routes.map((route) => ctx.webServer.register(route));
	ctx.effect(() => () => {
		for (const dispose of disposers) dispose();
	}, "dsh-balance-widget: routes");
}
