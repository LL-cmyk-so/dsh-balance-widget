window.__ModuleLoader__.load({
	id: "dsh-balance-widget",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react_jsx_runtime = require("react/jsx-runtime");
		let react = require("react");
		let _deepseek_ai_dsh_client_ui_primitives = require("@deepseek-ai/dsh-client-ui-primitives");
		//#region lib/types/client/styles.js
		const css = ".dshbw_wrap{position:relative;display:inline-flex;align-items:center}.dshbw_btn{background:none;border:none;cursor:pointer;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:6px;font-size:12px;line-height:18px;font-family:inherit}.dshbw_btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.dshbw_pop{position:absolute;top:calc(100% + 6px);right:0;z-index:60;min-width:230px;background:var(--dsw-alias-bg-layer-3);border:1px solid var(--dsw-alias-border-l3);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.18);padding:12px 14px;font-size:12px;line-height:20px;color:var(--dsw-alias-label-primary)}.dshbw_head{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}.dshbw_title{font-weight:600;color:var(--dsw-alias-label-primary)}.dshbw_refresh{background:none;border:1px solid var(--dsw-alias-border-l2);cursor:pointer;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:6px;font-size:13px;line-height:1;padding:0;font-family:inherit}.dshbw_refresh:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-interactive-bg-hover)}.dshbw_refresh[data-spinning=true]{animation:dshbw-spin .8s linear infinite}.dshbw_row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:2px 0}.dshbw_label{display:inline-flex;align-items:center;min-width:0}.dshbw_val{font-weight:600;color:var(--dsw-alias-label-primary)}.dshbw_err{color:var(--dsw-alias-state-error-primary);font-size:11px;line-height:16px;margin-top:6px}.dshbw_hint{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;margin-top:6px;border-top:1px solid var(--dsw-alias-border-l1);padding-top:6px}.dshbw_foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px}.dshbw_link{background:none;border:none;cursor:pointer;color:var(--dsw-alias-state-business-primary);display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:6px;font-size:12px;line-height:18px;font-family:inherit;text-decoration:none}.dshbw_link:hover{color:var(--dsw-alias-state-business-primary);text-decoration:underline}@keyframes dshbw-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}";
		const tagId = "dsh-balance-widget/styles.css";
		if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {
			const tag = document.createElement("style");
			tag.dataset.plugin = "dsh-balance-widget";
			tag.dataset.pluginCss = tagId;
			tag.textContent = css;
			document.head.appendChild(tag);
		}
		var styles = {
			"wrap": "dshbw_wrap",
			"btn": "dshbw_btn",
			"pop": "dshbw_pop",
			"head": "dshbw_head",
			"title": "dshbw_title",
			"refresh": "dshbw_refresh",
			"row": "dshbw_row",
			"label": "dshbw_label",
			"val": "dshbw_val",
			"err": "dshbw_err",
			"hint": "dshbw_hint",
			"foot": "dshbw_foot",
			"link": "dshbw_link"
		};
		//#endregion
		//#region lib/types/client/pricing.js
		/**
		* DeepSeek official pricing, in CNY per 1M tokens, effective 2026-08-17
		* (peak/off-peak two-tier billing). Peak windows are Beijing time:
		* 09:00-12:00 and 14:00-18:00; off-peak is half the peak price.
		* Prices are hard-coded from the official announcement and are estimates
		* for display — actual billing is authoritative from the provider.
		*/
		const PRICING = {
			"deepseek-v4-flash": {
				peak: { inputMiss: 3.0, inputHit: 0.10, output: 9.0 },
				offPeak: { inputMiss: 1.5, inputHit: 0.05, output: 4.5 }
			},
			"deepseek-v4-pro": {
				peak: { inputMiss: 9.0, inputHit: 0.30, output: 27.0 },
				offPeak: { inputMiss: 4.5, inputHit: 0.15, output: 13.5 }
			},
			"deepseek-chat": {
				peak: { inputMiss: 3.0, inputHit: 0.10, output: 9.0 },
				offPeak: { inputMiss: 1.5, inputHit: 0.05, output: 4.5 }
			},
			"deepseek-reasoner": {
				peak: { inputMiss: 9.0, inputHit: 0.30, output: 27.0 },
				offPeak: { inputMiss: 4.5, inputHit: 0.15, output: 13.5 }
			}
		};
		/** Fall back to Flash pricing for unknown model ids. */
		function pricingFor(modelId) {
			return PRICING[modelId] ?? PRICING["deepseek-v4-flash"];
		}
		/**
		* Whether `date` falls inside a Beijing-time peak window.
		* The host's local timezone is used; the widget is for a CN deployment.
		*/
		function isPeak(date) {
			const hour = date.getHours();
			return (hour >= 9 && hour < 12) || (hour >= 14 && hour < 18);
		}
		/**
		* Price one session's token usage into a CNY estimate.
		* @param usage - tokenUsage projection value.
		* @param modelId - provider model id used for pricing.
		* @returns { input, output, total } in CNY, or null when usage is absent.
		*/
		function priceSession(usage, modelId) {
			if (usage === void 0 || usage === null) return null;
			const input = usage.uncachedInputTokens ?? 0;
			const hit = usage.cacheReadTokens ?? 0;
			const write = usage.cacheWriteTokens ?? 0;
			const output = usage.outputTokens ?? 0;
			if (input + hit + write + output <= 0) return null;
			const table = isPeak(new Date()) ? pricingFor(modelId).peak : pricingFor(modelId).offPeak;
			const inputCost = (input * table.inputMiss + (hit + write) * table.inputHit) / 1e6;
			const outputCost = (output * table.output) / 1e6;
			return {
				input: inputCost,
				output: outputCost,
				total: inputCost + outputCost
			};
		}
		/** Format a CNY amount: ¥ + 3 significant decimals (drop trailing zeros). */
		function formatCny(value) {
			if (value === void 0 || value === null || !Number.isFinite(value)) return "—";
			const rounded = Math.round(value * 1e4) / 1e4;
			return `¥${rounded.toLocaleString("zh-CN", { minimumFractionDigits: 0, maximumFractionDigits: 4 })}`;
		}
		/** Format token counts compactly: 1234 -> 1.2K. */
		function formatTokens(value) {
			if (value === void 0 || value === null) return "—";
			if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
			if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
			return String(value);
		}
		//#endregion
		//#region lib/types/client/balance-api.js
		/** Same-origin balance route (host half registers it over ctx.webServer). */
		const BALANCE_ROUTE = "/api/dsh-balance/balance";
		/** Same-origin cost routes. */
		const LAST_COST_ROUTE = "/api/dsh-balance/last-cost";
		const TODAY_COST_ROUTE = "/api/dsh-balance/today-cost";
		/** Official DeepSeek platform top-up page (opens in a new tab). */
		const TOP_UP_URL = "https://platform.deepseek.com/top_up";
		/**
		* Fetch the account balance from the host proxy.
		* @returns { ok, balanceInfos?, modelId?, error? }
		*/
		async function fetchBalance() {
			try {
				const response = await fetch(BALANCE_ROUTE, { headers: { accept: "application/json" } });
				if (!response.ok) {
					let detail = "";
					try {
						detail = (await response.json()).error ?? "";
					} catch (_error) {
						/* ignore body parse failure */
					}
					return { ok: false, error: detail || `balance endpoint responded ${response.status}` };
				}
				const payload = await response.json();
				if (payload.ok === false) return { ok: false, error: payload.error ?? "unknown balance error" };
				return { ok: true, balanceInfos: payload.balance_infos ?? [], modelId: payload.modelId };
			} catch (error) {
				return { ok: false, error: error instanceof Error ? error.message : String(error) };
			}
		}
		/**
		* Fetch a cost figure from the host (last turn or today's total).
		* @param {string} route - LAST_COST_ROUTE or TODAY_COST_ROUTE.
		* @param {string} [sessionId] - required for last-cost.
		* @returns { ok, cost?, inputTokens?, outputTokens?, error? }
		*/
		async function fetchCost(route, sessionId) {
			try {
				const url = sessionId === void 0 || sessionId === ""
					? route
					: `${route}?session=${encodeURIComponent(sessionId)}`;
				const response = await fetch(url, { headers: { accept: "application/json" } });
				const payload = await response.json().catch(() => ({}));
				if (!response.ok) return { ok: false, error: payload.error ?? `cost endpoint responded ${response.status}` };
				return { ok: true, cost: payload.cost ?? 0, inputTokens: payload.inputTokens ?? 0, outputTokens: payload.outputTokens ?? 0 };
			} catch (error) {
				return { ok: false, error: error instanceof Error ? error.message : String(error) };
			}
		}
		/** Pick the display balance from balance_infos (prefer CNY, else first). */
		function displayBalance(balanceInfos) {
			if (!Array.isArray(balanceInfos) || balanceInfos.length === 0) return null;
			const cny = balanceInfos.find((entry) => (entry.currency ?? "").toUpperCase() === "CNY");
			const entry = cny ?? balanceInfos[0];
			const total = Number(entry.total_balance);
			if (!Number.isFinite(total)) return null;
			const symbol = (entry.currency ?? "").toUpperCase() === "CNY" ? "¥" : (entry.currency ?? "") + " ";
			return { symbol, total, currency: entry.currency };
		}
		//#endregion
		//#region lib/types/client/ExplainIcon.js
		/**
		* A small ⓘ marker with a hover tooltip explaining a term. Wraps the
		* official DSH Tooltip so the popover stays visually consistent.
		* @param {Object} props - label (tooltip text), t (locale).
		*/
		function ExplainIcon({ label, t }) {
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: label,
				side: "top",
				delayMs: 300,
				children: (0, react_jsx_runtime.jsx)("span", {
					role: "img",
					"aria-label": t("explain.aria"),
					style: { cursor: "help", color: "var(--dsw-alias-label-tertiary)", marginLeft: 3, fontSize: 11, lineHeight: 1 },
					children: (0, react_jsx_runtime.jsx)("span", {
						children: "ⓘ"
					})
				})
			});
		}
		//#endregion
		//#region lib/types/client/BalanceWidget.js
		/**
		* Corner widget: a small balance button in the session header utilities
		* slot. Clicking opens a popover with the account balance and the current
		* session's estimated spend (priced from the tokenUsage projection).
		* @param {Object} props - useProjection (framework), sessionId (slot scope).
		*/
		function BalanceWidget({ useProjection, sessionId, t }) {
			const [open, setOpen] = (0, react.useState)(false);
			const [balance, setBalance] = (0, react.useState)(null);
			const [modelId, setModelId] = (0, react.useState)("deepseek-v4-flash");
			const [lastCost, setLastCost] = (0, react.useState)(null);
			const [todayCost, setTodayCost] = (0, react.useState)(null);
			const [error, setError] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(false);
			const [refreshing, setRefreshing] = (0, react.useState)(false);
			const usage = useProjection("tokenUsage");
			const priced = priceSession(usage, modelId);
			/** Fetch balance only (used for the always-visible corner amount). */
			const refreshBalance = async () => {
				const result = await fetchBalance();
				if (result.ok) {
					setBalance(displayBalance(result.balanceInfos));
					if (typeof result.modelId === "string" && result.modelId !== "") setModelId(result.modelId);
				}
			};
			/** Fetch all data; optionally keeps the popover's silent loading state. */
			const refreshAll = async (showLoading) => {
				if (showLoading) setLoading(true);
				setError(null);
				const [balanceResult, lastResult, todayResult] = await Promise.all([
					fetchBalance(),
					fetchCost(LAST_COST_ROUTE, sessionId),
					fetchCost(TODAY_COST_ROUTE)
				]);
				// Collect every failure into one fresh message; never accumulate
				// across refreshes (each refresh starts from a clean slate).
				const failures = [];
				if (balanceResult.ok) {
					setBalance(displayBalance(balanceResult.balanceInfos));
					if (typeof balanceResult.modelId === "string" && balanceResult.modelId !== "") setModelId(balanceResult.modelId);
				} else {
					setBalance(null);
					failures.push(`余额: ${balanceResult.error}`);
				}
				if (lastResult.ok) setLastCost(lastResult.cost);
				else if (lastResult.error) failures.push(`最近提问: ${lastResult.error}`);
				if (todayResult.ok) setTodayCost(todayResult.cost);
				else if (todayResult.error) failures.push(`今日: ${todayResult.error}`);
				setError(failures.length > 0 ? failures.join("；") : null);
				if (showLoading) setLoading(false);
			};
			// Always fetch the balance on mount so the corner shows the amount
			// without requiring a click first.
			(0, react.useEffect)(() => {
				refreshBalance();
			}, []);
			const toggle = async () => {
				const next = !open;
				setOpen(next);
				if (next) await refreshAll(true);
			};
			const onRefresh = async () => {
				setRefreshing(true);
				await refreshAll(false);
				setRefreshing(false);
			};
			return (0, react_jsx_runtime.jsx)("div", {
				className: styles.wrap,
				children: (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, {
					children: [(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: styles.btn,
						"aria-label": t("aria"),
						title: t("title"),
						onClick: toggle,
						children: ["💰", balance !== null && (0, react_jsx_runtime.jsx)("span", {
							children: `${balance.symbol}${balance.total.toFixed(2)}`
						})]
					}), open && (0, react_jsx_runtime.jsx)("div", {
						className: styles.pop,
						role: "dialog",
						children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
							children: [(0, react_jsx_runtime.jsx)("div", {
								className: styles.head,
								children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: styles.title,
										children: t("title")
									}), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: styles.refresh,
										"aria-label": t("refresh.aria"),
										title: t("refresh.title"),
										"data-spinning": refreshing || undefined,
										disabled: refreshing,
										onClick: onRefresh,
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline14, {})
									})]
								})
							}), (0, react_jsx_runtime.jsx)("div", {
								className: styles.row,
								children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: styles.label,
										children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
											children: [t("balance"), (0, react_jsx_runtime.jsx)(ExplainIcon, {
												label: t("explain.balance"),
												t
											})]
										})
									}), (0, react_jsx_runtime.jsx)("span", {
										className: styles.val,
										children: loading ? "…" : balance !== null ? `${balance.symbol}${balance.total.toFixed(2)}` : "—"
									})]
								})
							}), (0, react_jsx_runtime.jsx)("div", {
								className: styles.row,
								children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: styles.label,
										children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
											children: [t("sessionCost"), (0, react_jsx_runtime.jsx)(ExplainIcon, {
												label: t("explain.sessionCost"),
												t
											})]
										})
									}), (0, react_jsx_runtime.jsx)("span", {
										className: styles.val,
										children: priced !== null ? formatCny(priced.total) : "—"
									})]
								})
							}), (0, react_jsx_runtime.jsx)("div", {
								className: styles.row,
								children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: styles.label,
										children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
											children: [t("lastPromptCost"), (0, react_jsx_runtime.jsx)(ExplainIcon, {
												label: t("explain.lastPromptCost"),
												t
											})]
										})
									}), (0, react_jsx_runtime.jsx)("span", {
										className: styles.val,
										children: loading ? "…" : lastCost !== null ? formatCny(lastCost) : "—"
									})]
								})
							}), (0, react_jsx_runtime.jsx)("div", {
								className: styles.row,
								children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: styles.label,
										children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
											children: [t("todayCost"), (0, react_jsx_runtime.jsx)(ExplainIcon, {
												label: t("explain.todayCost"),
												t
											})]
										})
									}), (0, react_jsx_runtime.jsx)("span", {
										className: styles.val,
										children: loading ? "…" : todayCost !== null ? formatCny(todayCost) : "—"
									})]
								})
							}), priced !== null && (0, react_jsx_runtime.jsx)("div", {
								className: styles.row,
								children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: styles.label,
										children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
											children: [t("tokens"), (0, react_jsx_runtime.jsx)(ExplainIcon, {
												label: t("explain.tokens"),
												t
											})]
										})
									}), (0, react_jsx_runtime.jsx)("span", {
										className: styles.val,
										children: `${formatTokens((usage.uncachedInputTokens ?? 0) + (usage.cacheReadTokens ?? 0) + (usage.cacheWriteTokens ?? 0))} in / ${formatTokens(usage.outputTokens ?? 0)} out`
									})]
								})
							}), error !== null && (0, react_jsx_runtime.jsx)("div", {
								className: styles.err,
								role: "status",
								children: error
							}), (0, react_jsx_runtime.jsx)("div", {
								className: styles.hint,
								children: t("hint")
							}), (0, react_jsx_runtime.jsx)("div", {
								className: styles.foot,
								children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
									children: [(0, react_jsx_runtime.jsx)("a", {
										className: styles.link,
										href: TOP_UP_URL,
										target: "_blank",
										rel: "noreferrer",
										children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
											children: ["⚡", t("topUp")]
										})
									}), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: styles.btn,
										onClick: () => setOpen(false),
										children: t("close")
									})]
								})
							})]
						})
					})]
				})
			});
		}
		//#endregion
		//#region lib/types/client/locales.js
		/** Dictionary namespace owned by this plugin. */
		const NS = "balance-widget";
		/** Simplified Chinese dictionary (the key-set source of truth). */
		const zh = {
			"aria": "查看账户余额与成本",
			"title": "余额与成本",
			"refresh.aria": "刷新数据",
			"refresh.title": "刷新余额与成本",
			"balance": "账户余额",
			"sessionCost": "本会话成本",
			"lastPromptCost": "最近一次提问",
			"todayCost": "今天总成本",
			"tokens": "Token 用量",
			"explain.aria": "解释",
			"explain.balance": "DeepSeek 账户可用余额，实时查询官方接口（每 60 秒刷新）。",
			"explain.sessionCost": "当前这个对话从开始到现在累计的费用，按官方峰谷定价估算。",
			"explain.lastPromptCost": "你刚发的这条提问（含 AI 回复）的费用估算。",
			"explain.todayCost": "今天所有对话（含其他窗口）的费用合计估算。",
			"explain.tokens": "本会话消耗的 token 数。1 token ≈ 0.75 个英文单词 ≈ 1 个汉字。",
			"hint": "价格为估算值，实际以官方账单为准。",
			"topUp": "去充值",
			"close": "关闭"
		};
		/** English dictionary, checked complete against the zh key set. */
		const en = {
			"aria": "View account balance and costs",
			"title": "Balance & cost",
			"refresh.aria": "Refresh data",
			"refresh.title": "Refresh balance and costs",
			"balance": "Account balance",
			"sessionCost": "This session cost",
			"lastPromptCost": "Last prompt",
			"todayCost": "Today total",
			"tokens": "Token usage",
			"explain.aria": "Explain",
			"explain.balance": "DeepSeek account balance, fetched live from the official API.",
			"explain.sessionCost": "Total estimated cost of this conversation since it started, priced at official peak/off-peak rates.",
			"explain.lastPromptCost": "Estimated cost of your latest prompt, including the AI reply.",
			"explain.todayCost": "Estimated total cost across all conversations today.",
			"explain.tokens": "Tokens used by this session. 1 token ≈ 0.75 English words ≈ 1 CJK character.",
			"hint": "Prices are estimates; actual billing from the provider is authoritative.",
			"topUp": "Top up",
			"close": "Close"
		};
		//#endregion
		//#region lib/types/client/index.js
		/** Required services: the seat's slot registry and locale registry. */
		const inject = [
			"slots",
			"locale"
		];
		/**
		* Client plugin body: register the corner balance widget in the
		* conversation session header utilities slot.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "dsh-balance-widget: dictionaries");
			ctx.slots.inject("conversation.session.header.utilities", () => ctx.slots.register({
				name: "conversation.session.header.utilities",
				id: "balance-widget",
				order: 90,
				locale: NS,
				inject: (sessionId) => ({ sessionId })
			}, BalanceWidget));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
