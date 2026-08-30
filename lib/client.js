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
		const css = ".dshbw_wrap{position:relative;display:inline-flex;align-items:center}.dshbw_btn{background:none;border:none;cursor:pointer;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:6px;font-size:12px;line-height:18px;font-family:inherit}.dshbw_btn:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-interactive-bg-hover)}.dshbw_btn[data-level=\"1\"]{color:var(--dsw-alias-state-warn-primary)}.dshbw_btn[data-level=\"2\"]{color:var(--dsw-alias-state-error-primary)}.dshbw_pop{position:absolute;top:calc(100% + 6px);right:0;z-index:60;min-width:230px;background:var(--dsw-alias-bg-layer-3);border:1px solid var(--dsw-alias-border-l3);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.18);padding:12px 14px;font-size:12px;line-height:20px;color:var(--dsw-alias-label-primary)}.dshbw_head{display:flex;align-items:center;justify-content:space-between;margin-bottom:4px}.dshbw_title{font-weight:600;color:var(--dsw-alias-label-primary)}.dshbw_refresh{background:none;border:1px solid var(--dsw-alias-border-l2);cursor:pointer;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;border-radius:6px;font-size:13px;line-height:1;padding:0;font-family:inherit}.dshbw_refresh:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-interactive-bg-hover)}.dshbw_refresh[data-spinning=true]{animation:dshbw-spin .8s linear infinite}.dshbw_row{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:2px 0}.dshbw_label{display:inline-flex;align-items:center;min-width:0}.dshbw_val{font-weight:600;color:var(--dsw-alias-label-primary)}.dshbw_val[data-level=\"1\"]{color:var(--dsw-alias-state-warn-primary)}.dshbw_val[data-level=\"2\"]{color:var(--dsw-alias-state-error-primary)}.dshbw_err{color:var(--dsw-alias-state-error-primary);font-size:11px;line-height:16px;margin-top:6px}.dshbw_hint{color:var(--dsw-alias-label-tertiary);font-size:11px;line-height:16px;margin-top:6px;border-top:1px solid var(--dsw-alias-border-l1);padding-top:6px}.dshbw_foot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:8px}.dshbw_link{background:none;border:none;cursor:pointer;color:var(--dsw-alias-state-business-primary);display:inline-flex;align-items:center;gap:4px;padding:2px 6px;border-radius:6px;font-size:12px;line-height:18px;font-family:inherit;text-decoration:none}.dshbw_link:hover{color:var(--dsw-alias-state-business-primary);text-decoration:underline}@keyframes dshbw-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}.dshbw_side{display:flex;flex-direction:column;gap:4px;padding:6px 8px;margin:0 8px 4px;border-radius:8px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary)}.dshbw_side:hover{background:var(--dsw-alias-interactive-bg-hover)}.dshbw_sideTop{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:12px;line-height:18px}.dshbw_sideAmount{font-weight:700}.dshbw_sideAmount[data-level=\"1\"]{color:var(--dsw-alias-state-warn-primary);font-weight:700}.dshbw_sideAmount[data-level=\"2\"]{color:var(--dsw-alias-state-error-primary)}.dshbw_sideFoot{display:flex;justify-content:space-between;font-size:10px;line-height:14px;color:var(--dsw-alias-label-tertiary)}.dshbw_sideWrap{position:relative}.dshbw_side{display:flex;flex-direction:column;gap:4px;width:100%;padding:6px 8px;margin:0 8px 4px;border:none;border-radius:8px;background:var(--dsw-alias-bg-layer-2);color:var(--dsw-alias-label-primary);cursor:pointer;font-family:inherit;text-align:left}.dshbw_side:hover{background:var(--dsw-alias-interactive-bg-hover)}.dshbw_sidePop{position:absolute;bottom:calc(100% + 8px);left:8px;z-index:70;min-width:240px;background:var(--dsw-alias-bg-layer-3);border:1px solid var(--dsw-alias-border-l3);border-radius:10px;box-shadow:0 8px 24px rgba(0,0,0,.18);padding:12px 14px;font-size:12px;line-height:20px;color:var(--dsw-alias-label-primary)}.dshbw_sidePopHead{display:flex;align-items:center;justify-content:space-between;margin-bottom:6px}.dshbw_sidePopTitle{font-weight:600}.dshbw_sidePopClose{background:none;border:none;cursor:pointer;color:var(--dsw-alias-label-tertiary);font-size:16px;line-height:1;padding:0 2px;font-family:inherit}.dshbw_sidePopClose:hover{color:var(--dsw-alias-label-primary)}.dshbw_sidePopFoot{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:10px}.dshbw_sidePopRefresh{background:none;border:1px solid var(--dsw-alias-border-l2);cursor:pointer;color:var(--dsw-alias-label-secondary);display:inline-flex;align-items:center;justify-content:center;width:22px;height:22px;border-radius:6px;padding:0;font-family:inherit}.dshbw_sidePopRefresh:hover{color:var(--dsw-alias-label-primary);border-color:var(--dsw-alias-border-l3);background:var(--dsw-alias-interactive-bg-hover)}.dshbw_side[data-peak=\"true\"]{border:1px solid var(--dsw-alias-state-warn-primary);background:color-mix(in srgb, var(--dsw-alias-state-warn-primary) 8%, var(--dsw-alias-bg-layer-2))}.dshbw_side[data-peak=\"false\"]{border:1px solid var(--dsw-alias-state-success-primary);background:color-mix(in srgb, var(--dsw-alias-state-success-primary) 8%, var(--dsw-alias-bg-layer-2))}.dshbw_sidePop[data-peak=\"true\"]{border-color:var(--dsw-alias-state-warn-primary)}.dshbw_sidePop[data-peak=\"false\"]{border-color:var(--dsw-alias-state-success-primary)}.dshbw_peakTag{display:inline-flex;align-items:center;gap:4px;font-size:11px;line-height:16px;padding:1px 6px;border-radius:999px}.dshbw_peakTag[data-peak=\"true\"]{color:var(--dsw-alias-state-warn-primary);background:var(--dsw-alias-state-warn-tertiary)}.dshbw_peakTag[data-peak=\"false\"]{color:var(--dsw-alias-state-success-primary);background:var(--dsw-alias-state-success-tertiary)}.dshbw_sessionNote{display:flex;align-items:center;gap:4px;margin-top:6px;padding-top:6px;border-top:1px solid var(--dsw-alias-border-l1);font-size:11px;line-height:16px;color:var(--dsw-alias-label-tertiary);min-width:0}.dshbw_sessionName{max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}";
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
			"link": "dshbw_link",
			"side": "dshbw_side",
			"sideWrap": "dshbw_sideWrap",
			"sideTop": "dshbw_sideTop",
			"sideAmount": "dshbw_sideAmount",
			"sideFoot": "dshbw_sideFoot",
			"sidePop": "dshbw_sidePop",
			"sidePopHead": "dshbw_sidePopHead",
			"sidePopTitle": "dshbw_sidePopTitle",
			"sidePopClose": "dshbw_sidePopClose",
			"sidePopFoot": "dshbw_sidePopFoot",
			"sidePopRefresh": "dshbw_sidePopRefresh",
			"peakTag": "dshbw_peakTag",
			"sessionNote": "dshbw_sessionNote",
			"sessionName": "dshbw_sessionName"
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
		/** Format an epoch ms as HH:MM local time. */
		function formatTime(ms) {
			if (ms === void 0 || ms === null) return "—";
			const d = new Date(ms);
			return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
		}
		//#endregion
		//#region lib/types/client/balance-api.js
		/** Same-origin balance route (host half registers it over ctx.webServer). */
		const BALANCE_ROUTE = "/api/dsh-balance/balance";
		/** Same-origin cost routes. */
		const LAST_COST_ROUTE = "/api/dsh-balance/last-cost";
		const TODAY_COST_ROUTE = "/api/dsh-balance/today-cost";
		const ACTIVE_COST_ROUTE = "/api/dsh-balance/active-cost";
		/** Official DeepSeek platform top-up page (opens in a new tab). */
		const TOP_UP_URL = "https://platform.deepseek.com/top_up";
		/**
		* Fetch the active session's costs (last prompt + today's session total).
		* @param {string} [sessionId] - the currently selected session; when omitted
		*   the host falls back to its most recently active session.
		* @returns { ok, lastPrompt?, todaySession?, sessionTitle?, workspaceName?, peak?, error? }
		*/
		async function fetchActiveCost(sessionId) {
			try {
				const url = sessionId === void 0 || sessionId === ""
					? ACTIVE_COST_ROUTE
					: `${ACTIVE_COST_ROUTE}?session=${encodeURIComponent(sessionId)}`;
				const response = await fetch(url, { headers: { accept: "application/json" } });
				const payload = await response.json().catch(() => ({}));
				if (!response.ok) return { ok: false, error: payload.error ?? `active-cost responded ${response.status}` };
				return {
					ok: true,
					lastPrompt: payload.lastPrompt?.cost ?? 0,
					todaySession: payload.todaySession?.cost ?? 0,
					sessionTitle: payload.title,
					workspaceName: payload.workspaceName,
					cwd: payload.cwd,
					sessionId: payload.sessionId,
					peak: payload.peak
				};
			} catch (error) {
				return { ok: false, error: error instanceof Error ? error.message : String(error) };
			}
		}
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
				return {
					ok: true,
					balanceInfos: payload.balance_infos ?? [],
					modelId: payload.modelId,
					lowThreshold: payload.lowThreshold,
					criticalThreshold: payload.criticalThreshold
				};
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
		//#region lib/types/client/SidebarBalanceCard.js
		/**
		* Sidebar footer card: balance + remaining-ratio bar + today cost.
		* Root-scoped (global, not per-session) — fetches balance itself and
		* refreshes every 60s. Clicking opens a detail popover (balance, today
		* cost, top-up, refresh) using only global data.
		* @param {Object} props - wide (sidebar expanded), t (locale).
		*/
		function SidebarBalanceCard({ wide, t, useSessions }) {
			const [open, setOpen] = (0, react.useState)(false);
			const [balance, setBalance] = (0, react.useState)(null);
			const [lastPrompt, setLastPrompt] = (0, react.useState)(null);
			const [todaySession, setTodaySession] = (0, react.useState)(null);
			const [sessionTitle, setSessionTitle] = (0, react.useState)(null);
			const [todayWs, setTodayWs] = (0, react.useState)(null);
			const [todayAll, setTodayAll] = (0, react.useState)(null);
			const [lowThreshold, setLowThreshold] = (0, react.useState)(5);
			const [criticalThreshold, setCriticalThreshold] = (0, react.useState)(1);
			const [error, setError] = (0, react.useState)(null);
			const [loading, setLoading] = (0, react.useState)(false);
			const [peak, setPeak] = (0, react.useState)(null);
			// The currently selected session id (the session the user is viewing).
			// This anchors "today · this workspace" to the actual current workspace.
			const currentSessionId = typeof useSessions === "function"
				? (0, useSessions)((s) => s.current)
				: void 0;
			/** Fetch today's costs (workspace + all) from the dual-value route. */
			const fetchTodayCosts = async () => {
				const url = currentSessionId !== void 0 && currentSessionId !== ""
					? `${TODAY_COST_ROUTE}?session=${encodeURIComponent(currentSessionId)}`
					: TODAY_COST_ROUTE;
				const response = await fetch(url, { headers: { accept: "application/json" } });
				const payload = await response.json().catch(() => ({}));
				if (!response.ok) return { ok: false, error: payload.error ?? `today-cost responded ${response.status}` };
				return {
					ok: true,
					workspace: payload.workspace?.cost ?? 0,
					all: payload.all?.cost ?? 0
				};
			};
			const refresh = async (showLoading) => {
				if (showLoading) setLoading(true);
				setError(null);
				const [bResult, aResult, tResult] = await Promise.all([
					fetchBalance(),
					fetchActiveCost(currentSessionId),
					fetchTodayCosts()
				]);
				const failures = [];
				if (bResult.ok) {
					setBalance(displayBalance(bResult.balanceInfos));
					if (typeof bResult.lowThreshold === "number" && bResult.lowThreshold >= 0) setLowThreshold(bResult.lowThreshold);
					if (typeof bResult.criticalThreshold === "number" && bResult.criticalThreshold >= 0) setCriticalThreshold(bResult.criticalThreshold);
				} else {
					failures.push(`余额: ${bResult.error}`);
				}
				if (aResult.ok) {
					setLastPrompt(aResult.lastPrompt);
					setTodaySession(aResult.todaySession);
					setSessionTitle(aResult.sessionTitle ?? null);
					setPeak(aResult.peak ?? null);
				} else {
					failures.push(`会话: ${aResult.error}`);
				}
				if (tResult.ok) {
					setTodayWs(tResult.workspace);
					setTodayAll(tResult.all);
				} else {
					failures.push(`今日: ${tResult.error}`);
				}
				setError(failures.length > 0 ? failures.join("；") : null);
				if (showLoading) setLoading(false);
			};
			(0, react.useEffect)(() => {
				refresh(false);
				const timer = setInterval(() => refresh(false), 60000);
				return () => clearInterval(timer);
			}, [currentSessionId]);
			// Close the popover when clicking outside the card.
			const wrapRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (!open) return;
				const onDocClick = (event) => {
					const el = wrapRef.current;
					if (el !== null && !el.contains(event.target)) setOpen(false);
				};
				document.addEventListener("mousedown", onDocClick);
				return () => document.removeEventListener("mousedown", onDocClick);
			}, [open]);
			const level = balance === null ? 0 : balance.total < criticalThreshold ? 2 : balance.total < lowThreshold ? 1 : 0;
			const toggle = async () => {
				const next = !open;
				setOpen(next);
				if (next) await refresh(true);
			};
			return (0, react_jsx_runtime.jsx)("div", {
				ref: wrapRef,
				className: styles.sideWrap,
				children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
					children: [(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: styles.side,
						"data-peak": peak !== null ? String(peak.active) : undefined,
						title: t("title"),
						onClick: toggle,
						children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
							children: [(0, react_jsx_runtime.jsx)("div", {
								className: styles.sideTop,
								children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
									children: [(0, react_jsx_runtime.jsx)("span", {
										children: "💰"
									}), (0, react_jsx_runtime.jsx)("span", {
										className: styles.sideAmount,
										"data-level": level > 0 ? level : undefined,
										children: balance !== null ? `${balance.symbol}${balance.total.toFixed(2)}` : "—"
									})]
								})
							}), (0, react_jsx_runtime.jsx)("div", {
								className: styles.sideFoot,
								children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
									children: [(0, react_jsx_runtime.jsx)("span", {
										children: t("todayCostShort")
									}), (0, react_jsx_runtime.jsx)("span", {
										children: todayAll !== null ? formatCny(todayAll) : "—"
									})]
								})
							})]
						})
					}), open && (0, react_jsx_runtime.jsx)("div", {
						className: styles.sidePop,
						"data-peak": peak !== null ? String(peak.active) : undefined,
						role: "dialog",
						children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
							children: [(0, react_jsx_runtime.jsx)("div", {
								className: styles.sidePopHead,
								children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: styles.sidePopTitle,
										children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
											children: [t("title"), peak !== null && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
												label: peak.active
													? t("peak.tooltip.active", { input: peak.inputMiss, output: peak.output })
													: t("peak.tooltip.offpeak", { input: peak.inputMiss, output: peak.output }),
												side: "top",
												delayMs: 200,
												children: (0, react_jsx_runtime.jsx)("span", {
													className: styles.peakTag,
													"data-peak": String(peak.active),
													children: peak.active ? t("peak.active") : t("peak.offpeak")
												})
											})]
										})
									}), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: styles.sidePopClose,
										"aria-label": t("close"),
										onClick: () => setOpen(false),
										children: "×"
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
										"data-level": level > 0 ? level : undefined,
										children: loading ? "…" : balance !== null ? `${balance.symbol}${balance.total.toFixed(2)}` : "—"
									})]
								})
							}), level > 0 && (0, react_jsx_runtime.jsx)("div", {
								className: styles.err,
								role: "status",
								children: t(`warn.text.${level}`)
							}), (0, react_jsx_runtime.jsx)("div", {
								className: styles.row,
								children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: styles.label,
										children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
											children: [t("lastPrompt"), (0, react_jsx_runtime.jsx)(ExplainIcon, {
												label: t("explain.lastPrompt"),
												t
											})]
										})
									}), (0, react_jsx_runtime.jsx)("span", {
										className: styles.val,
										children: loading ? "…" : lastPrompt !== null ? formatCny(lastPrompt) : "—"
									})]
								})
							}), sessionTitle !== null && sessionTitle !== "" && (0, react_jsx_runtime.jsx)("div", {
								className: styles.sessionNote,
								title: sessionTitle,
								children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
									children: [(0, react_jsx_runtime.jsx)("span", {
										children: t("sessionNote")
									}), (0, react_jsx_runtime.jsx)("span", {
										className: styles.sessionName,
										children: sessionTitle
									})]
								})
							}), (0, react_jsx_runtime.jsx)("div", {
								className: styles.row,
								children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: styles.label,
										children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
											children: [t("todaySession"), (0, react_jsx_runtime.jsx)(ExplainIcon, {
												label: t("explain.todaySession"),
												t
											})]
										})
									}), (0, react_jsx_runtime.jsx)("span", {
										className: styles.val,
										children: loading ? "…" : todaySession !== null ? formatCny(todaySession) : "—"
									})]
								})
							}), (0, react_jsx_runtime.jsx)("div", {
								className: styles.row,
								children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: styles.label,
										children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
											children: [t("todayWs"), (0, react_jsx_runtime.jsx)(ExplainIcon, {
												label: t("explain.todayWs"),
												t
											})]
										})
									}), (0, react_jsx_runtime.jsx)("span", {
										className: styles.val,
										children: loading ? "…" : todayWs !== null ? formatCny(todayWs) : "—"
									})]
								})
							}), (0, react_jsx_runtime.jsx)("div", {
								className: styles.row,
								children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: styles.label,
										children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
											children: [t("todayAll"), (0, react_jsx_runtime.jsx)(ExplainIcon, {
												label: t("explain.todayAll"),
												t
											})]
										})
									}), (0, react_jsx_runtime.jsx)("span", {
										className: styles.val,
										children: loading ? "…" : todayAll !== null ? formatCny(todayAll) : "—"
									})]
								})
							}), error !== null && (0, react_jsx_runtime.jsx)("div", {
								className: styles.err,
								role: "status",
								children: error
							}), (0, react_jsx_runtime.jsx)("div", {
								className: styles.sidePopFoot,
								children: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, {
									children: [(0, react_jsx_runtime.jsx)("a", {
										className: styles.link,
										href: TOP_UP_URL,
										target: "_blank",
										rel: "noreferrer",
										children: t("topUp")
									}), (0, react_jsx_runtime.jsx)("button", {
										type: "button",
										className: styles.sidePopRefresh,
										"aria-label": t("refresh.aria"),
										title: t("refresh.title"),
										onClick: () => refresh(true),
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutline14, {})
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
			"lastPrompt": "最近一次提问",
			"todaySession": "今日·本会话",
			"todayWs": "今日·本工作区",
			"todayAll": "今日·所有工作区",
			"explain.aria": "解释",
			"explain.balance": "DeepSeek 账户可用余额，实时查询官方接口。",
			"explain.lastPrompt": "最近活跃会话的最后一个问题（含 AI 回复）的费用估算。",
			"explain.todaySession": "当前会话今天产生的费用估算（从会话开始累计到今天）。",
			"explain.todayWs": "当前工作区今天所有会话的费用合计估算。",
			"explain.todayAll": "所有工作区今天所有会话的费用合计估算（含其他项目）。",
			"warn.title.1": "余额不足 ¥5，建议及时充值",
			"warn.title.2": "余额低于 ¥1，即将耗尽！",
			"warn.text.1": "⚠️ 余额不足 ¥5，建议及时充值。",
			"warn.text.2": "⛔ 余额低于 ¥1，即将耗尽，请立即充值！",
			"todayCostShort": "今日",
			"peak.active": "峰时",
			"peak.offpeak": "谷时",
			"peak.tooltip.active": "当前为峰时（09:00-12:00、14:00-18:00，价格翻倍）：输入 ¥{input}/M · 输出 ¥{output}/M",
			"peak.tooltip.offpeak": "当前为谷时（其余时段，半价）：输入 ¥{input}/M · 输出 ¥{output}/M",
			"sessionNote": "基于最近活跃会话：",
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
			"lastPrompt": "Last prompt",
			"todaySession": "Today · this session",
			"todayWs": "Today · this workspace",
			"todayAll": "Today · all workspaces",
			"explain.aria": "Explain",
			"explain.balance": "DeepSeek account balance, fetched live from the official API.",
			"explain.lastPrompt": "Estimated cost of the latest question (incl. the AI reply) in the most recent session.",
			"explain.todaySession": "Estimated cost of today's usage in the current session.",
			"explain.todayWs": "Estimated total cost of today's sessions in the current workspace.",
			"explain.todayAll": "Estimated total cost of today's sessions across all workspaces.",
			"warn.title.1": "Balance below ¥5, consider topping up",
			"warn.title.2": "Balance below ¥1, almost exhausted!",
			"warn.text.1": "⚠️ Balance below ¥5, consider topping up.",
			"warn.text.2": "⛔ Balance below ¥1, almost exhausted — top up now!",
			"todayCostShort": "Today",
			"peak.active": "Peak",
			"peak.offpeak": "Off-peak",
			"peak.tooltip.active": "Peak hours now (09:00-12:00, 14:00-18:00, 2× price): input ¥{input}/M · output ¥{output}/M",
			"peak.tooltip.offpeak": "Off-peak hours now (rest of day, half price): input ¥{input}/M · output ¥{output}/M",
			"sessionNote": "Based on most recent session:",
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
		* Client plugin body: register the sidebar footer balance card (the
		* single entry point since v0.4.1; the former header widget is removed
		* to avoid duplicate always-visible balances).
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "dsh-balance-widget: dictionaries");
			ctx.slots.inject("sidebar.footer.action", () => ctx.slots.register({
				name: "sidebar.footer.action",
				id: "balance-widget",
				order: 10,
				locale: NS
			}, SidebarBalanceCard));
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});
