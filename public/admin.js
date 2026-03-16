const runtimeStatusEl = document.querySelector("#runtime-status");
const llmConfigForm = document.querySelector("#llm-config-form");
const llmConfigStatusEl = document.querySelector("#llm-config-status");
const llmConfigReloadBtn = document.querySelector("#llm-config-reload-btn");
const llmConfigSaveBtn = document.querySelector("#llm-config-save-btn");
const serviceIndicatorEl = document.querySelector("#service-indicator");
const serviceIndicatorTextEl = document.querySelector("#service-indicator-text");
const serviceRetryBtn = document.querySelector("#service-retry-btn");
const historyList = document.querySelector("#history-list");
const historySearch = document.querySelector("#history-search");
const historyStatusFilter = document.querySelector("#history-status-filter");
const historySort = document.querySelector("#history-sort");
const historyStarredFilter = document.querySelector("#history-starred-filter");
const historySummary = document.querySelector("#history-summary");
const historyBody = document.querySelector("#history-body");
const historyToggleBtn = document.querySelector("#history-toggle-btn");
const adminNavLinks = Array.from(document.querySelectorAll("[data-admin-section-target]"));
const adminSections = Array.from(document.querySelectorAll("[data-admin-section]"));
const adminSectionTitle = document.querySelector("#admin-section-title");
const adminSectionDescription = document.querySelector("#admin-section-description");
const adminOverviewSummary = document.querySelector("#admin-overview-summary");
const adminProviderSummary = document.querySelector("#admin-provider-summary");

const ADMIN_SECTION_META = {
  overview: {
    title: "系统概览",
    description: "先确认本地服务、导出环境和远程链路是否在线，再进入供应商和策略配置。",
  },
  models: {
    title: "模型与供应商",
    description: "集中维护文案、分镜、即梦图片和豆包语音，减少在生产页来回切换。",
  },
  risk: {
    title: "风控策略",
    description: "把医疗预检、OCR 风险和误判说明单独抽出来，让合规配置更清楚。",
  },
  drafts: {
    title: "草稿与资产",
    description: "从后台查看草稿、状态和导出资产，再一键跳回生产页继续处理。",
  },
};

let runtimeStatusTimer = null;
let llmConfigLoaded = false;
let historyCollapsed = false;
let currentDraftId = new URL(window.location.href).searchParams.get("draft") || "";
let runtimeSnapshot = null;
let latestDraftsSnapshot = [];

boot();

function boot() {
  attachEvents();
  initAdminSectionNav();
  initHistoryCollapse();
  loadRuntimeStatus();
  loadLlmConfig();
  startRuntimeStatusPolling();
  loadDraftHistory();
}

function attachEvents() {
  historySearch?.addEventListener("input", debounce(() => loadDraftHistory(), 180));
  historyStatusFilter?.addEventListener("change", () => loadDraftHistory());
  historySort?.addEventListener("change", () => loadDraftHistory());
  historyStarredFilter?.addEventListener("change", () => loadDraftHistory());
  historyToggleBtn?.addEventListener("click", toggleHistoryPanel);
  serviceRetryBtn?.addEventListener("click", handleServiceRetry);
  llmConfigReloadBtn?.addEventListener("click", handleReloadLlmConfig);
  llmConfigSaveBtn?.addEventListener("click", handleSaveLlmConfig);
  llmConfigForm?.addEventListener("click", handleLlmConfigClick);
  adminNavLinks.forEach((button) => {
    button.addEventListener("click", () => {
      const target = String(button.dataset.adminSectionTarget || "").trim();
      setActiveAdminSection(target);
    });
  });
  window.addEventListener("hashchange", () => {
    const target = getAdminSectionFromHash();
    if (target) {
      setActiveAdminSection(target, { updateHash: false });
    }
  });
}

function initAdminSectionNav() {
  const initialSection = getAdminSectionFromHash() || "overview";
  setActiveAdminSection(initialSection, { updateHash: false });
}

function getAdminSectionFromHash() {
  const hash = String(window.location.hash || "").replace(/^#/, "").trim();
  return ADMIN_SECTION_META[hash] ? hash : "";
}

function setActiveAdminSection(sectionId, options = {}) {
  const { updateHash = true } = options;
  const nextSection = ADMIN_SECTION_META[sectionId] ? sectionId : "overview";
  adminNavLinks.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.adminSectionTarget === nextSection);
  });
  adminSections.forEach((section) => {
    section.classList.toggle("is-active", section.dataset.adminSection === nextSection);
  });
  if (adminSectionTitle) {
    adminSectionTitle.textContent = ADMIN_SECTION_META[nextSection].title;
  }
  if (adminSectionDescription) {
    adminSectionDescription.textContent = ADMIN_SECTION_META[nextSection].description;
  }
  if (updateHash) {
    window.history.replaceState(null, "", `#${nextSection}`);
  }
}

async function loadRuntimeStatus() {
  try {
    setServiceIndicator("pending", "连接检查中");
    const data = await fetchJson("/api/status");
    const runtime = data.runtime || {};
    runtimeSnapshot = runtime;
    const modeLabel = runtime.mode === "api" ? "API 模式" : "本地兜底模式";
    const readinessLabel = runtime.ffmpegInstalled ? "可直接导出" : "仅可生成脚本";
    runtimeStatusEl.innerHTML = `
      <article class="runtime-overview-card">
        <div class="runtime-overview-head">
          <span class="runtime-overview-kicker">状态概览</span>
          <strong>${modeLabel}</strong>
        </div>
        <div class="runtime-overview-metrics">
          <div class="runtime-overview-pill">
            <span>服务</span>
            <strong>${serviceIndicatorTextEl?.textContent || "在线"}</strong>
          </div>
          <div class="runtime-overview-pill">
            <span>导出</span>
            <strong>${readinessLabel}</strong>
          </div>
        </div>
      </article>
    `;
    setServiceIndicator("online", "本地服务在线");
    renderAdminOverviewSummary();
    renderAdminProviderSummary();
  } catch (error) {
    setServiceIndicator("offline", "本地服务离线");
    runtimeSnapshot = null;
    runtimeStatusEl.innerHTML = `
      <article class="runtime-overview-card runtime-overview-card-error">
        <div class="runtime-overview-head">
          <span class="runtime-overview-kicker">状态概览</span>
          <strong>读取失败</strong>
        </div>
        <p class="runtime-overview-error">${escapeHtml(error.message || "无法读取运行状态")}</p>
      </article>
    `;
    renderAdminOverviewSummary();
    renderAdminProviderSummary();
  }
}

async function loadLlmConfig() {
  if (!llmConfigForm) {
    return;
  }

  try {
    setLlmConfigStatus("正在加载 LLM 配置...", "working");
    const data = await fetchJson("/api/llm-config");
    renderLlmConfig(data.config || {});
    llmConfigLoaded = true;
    setLlmConfigStatus("LLM 配置已加载。后台页按系统概览、供应商配置和草稿资产来管理。", "success");
  } catch (error) {
    setLlmConfigStatus(error.message || "加载 LLM 配置失败", "error");
  }
}

function startRuntimeStatusPolling() {
  if (runtimeStatusTimer) {
    window.clearInterval(runtimeStatusTimer);
  }

  runtimeStatusTimer = window.setInterval(() => {
    loadRuntimeStatus();
  }, 15000);

  window.addEventListener("online", () => {
    loadRuntimeStatus();
  });

  window.addEventListener("offline", () => {
    setServiceIndicator("offline", "网络已断开");
  });
}

function getRuntimeRouteActiveLabel(title, route) {
  if (!route?.enabled) {
    return "";
  }

  const provider = String(route?.provider || "").trim().toLowerCase();
  if (title === "封面模型") {
    if (provider === "volcengine-jimeng-image") return "即梦远程生效";
    if (provider === "openai-compatible") return "图片远程生效";
  }
  if (title === "配音模型") {
    if (provider === "volcengine-doubao-tts" || provider === "doubao-tts" || provider === "volcengine-doubao") return "豆包远程生效";
    if (provider === "openai-compatible") return "配音远程生效";
  }
  if (title === "文案模型" || title === "分镜模型") {
    if (provider === "openai-compatible") return "文本远程生效";
  }
  if (title === "风控策略" && provider.includes("volcengine")) {
    return "火山风控生效";
  }
  return route?.enabled ? "远程生效" : "";
}

function renderLlmConfig(config) {
  setCheckboxValue("llm-script-enabled", config.script?.enabled !== false);
  setInputValue("llm-script-provider", config.script?.provider || "");
  setInputValue("llm-script-base-url", config.script?.baseURL || "");
  setInputValue("llm-script-auth-header", config.script?.authHeader || "");
  setInputValue("llm-script-auth-scheme", config.script?.authScheme || "");
  setInputValue("llm-script-timeout-sec", config.script?.timeoutSec || "");
  setInputValue("llm-script-api-key", config.script?.apiKey ? "***" : "");
  setTextValue("llm-script-api-key-status", config.script?.apiKey ? "API Key：已配置" : "API Key：未配置");
  setInputValue("llm-script-api-kind", config.script?.apiKind || "responses");
  setInputValue("llm-script-model", config.script?.model || "");
  setInputValue("llm-script-endpoint", config.script?.endpoint || "");

  setCheckboxValue("llm-storyboard-enabled", config.storyboard?.enabled !== false);
  setInputValue("llm-storyboard-provider", config.storyboard?.provider || "");
  setInputValue("llm-storyboard-base-url", config.storyboard?.baseURL || "");
  setInputValue("llm-storyboard-auth-header", config.storyboard?.authHeader || "");
  setInputValue("llm-storyboard-auth-scheme", config.storyboard?.authScheme || "");
  setInputValue("llm-storyboard-timeout-sec", config.storyboard?.timeoutSec || "");
  setInputValue("llm-storyboard-api-key", config.storyboard?.apiKey ? "***" : "");
  setTextValue("llm-storyboard-api-key-status", config.storyboard?.apiKey ? "API Key：已配置" : "API Key：未配置");
  setInputValue("llm-storyboard-api-kind", config.storyboard?.apiKind || config.script?.apiKind || "responses");
  setInputValue("llm-storyboard-model", config.storyboard?.model || "");
  setInputValue("llm-storyboard-endpoint", config.storyboard?.endpoint || "");

  setCheckboxValue("llm-image-enabled", config.image?.enabled !== false);
  setInputValue("llm-image-provider", config.image?.provider || "volcengine-jimeng-image");
  setInputValue("llm-image-base-url", config.image?.baseURL || "https://visual.volcengineapi.com");
  setInputValue("llm-image-auth-header", config.image?.authHeader || "Authorization");
  setInputValue("llm-image-auth-scheme", config.image?.authScheme || "HMAC-SHA256");
  setInputValue("llm-image-timeout-sec", config.image?.timeoutSec || "45");
  setInputValue("llm-image-api-key", config.image?.apiKey ? "***" : "");
  setInputValue("llm-image-secret-key", config.image?.secretKey ? "***" : "");
  setInputValue("llm-image-region", config.image?.region || "cn-north-1");
  setInputValue("llm-image-service", config.image?.service || "cv");
  setInputValue("llm-image-poll-interval-ms", config.image?.pollIntervalMs || "1200");
  setInputValue("llm-image-poll-attempts", config.image?.pollAttempts || "15");
  setTextValue("llm-image-api-key-status", config.image?.apiKey && config.image?.secretKey ? "Access Key ID / Secret Key：已配置" : "Access Key ID / Secret Key：未配置");
  setInputValue("llm-image-api-kind", config.image?.apiKind || "native");
  setInputValue("llm-image-model", config.image?.model || "jimeng_t2i_v40");
  setInputValue("llm-image-quality", config.image?.quality || "high");
  setInputValue("llm-image-size", config.image?.size || "1024x1536");
  setInputValue("llm-image-format", config.image?.outputFormat || "png");
  setInputValue("llm-image-endpoint", config.image?.endpoint || "/?Action=CVProcess&Version=2022-08-31");
  setInputValue("llm-image-query-endpoint", config.image?.queryEndpoint || "/?Action=CVSync2AsyncGetResult&Version=2022-08-31");

  setCheckboxValue("llm-tts-enabled", config.tts?.enabled !== false);
  setInputValue("llm-tts-provider", config.tts?.provider || "volcengine-doubao-tts");
  setInputValue("llm-tts-base-url", config.tts?.baseURL || "https://openspeech.bytedance.com");
  setInputValue("llm-tts-app-id", config.tts?.appId || "");
  setInputValue("llm-tts-resource-id", config.tts?.resourceId || "seed-tts-2.0");
  setInputValue("llm-tts-auth-header", config.tts?.authHeader || "Authorization");
  setInputValue("llm-tts-auth-scheme", config.tts?.authScheme || "Bearer");
  setInputValue("llm-tts-timeout-sec", config.tts?.timeoutSec || "45");
  setInputValue("llm-tts-api-key", config.tts?.apiKey ? "***" : "");
  setTextValue("llm-tts-api-key-status", config.tts?.apiKey ? "Access Token：已配置" : "Access Token：未配置");
  setInputValue("llm-tts-api-kind", config.tts?.apiKind || "native");
  setInputValue("llm-tts-model", config.tts?.model || "seed-tts-2.0");
  setInputValue("llm-tts-voice", config.tts?.voice || "zh_female_wanwanxiaohe_moon_bigtts");
  setInputValue("llm-tts-format", config.tts?.format || "mp3");
  setInputValue("llm-tts-endpoint", config.tts?.endpoint || "/api/v3/tts/unidirectional");

  setCheckboxValue("llm-moderation-enabled", config.moderation?.enabled !== false);
  setInputValue("llm-moderation-provider", config.moderation?.provider || "volcengine-medical-risk");
  setInputValue("llm-moderation-base-url", config.moderation?.baseURL || "https://visual.volcengineapi.com");
  setInputValue("llm-moderation-auth-header", config.moderation?.authHeader || "Authorization");
  setInputValue("llm-moderation-auth-scheme", config.moderation?.authScheme || "HMAC-SHA256");
  setInputValue("llm-moderation-timeout-sec", config.moderation?.timeoutSec || "15");
  setInputValue("llm-moderation-api-key", config.moderation?.apiKey ? "***" : "");
  setInputValue("llm-moderation-secret-key", config.moderation?.secretKey ? "***" : "");
  setInputValue("llm-moderation-region", config.moderation?.region || "cn-north-1");
  setInputValue("llm-moderation-service", config.moderation?.service || "cv");
  setTextValue("llm-moderation-api-key-status", config.moderation?.apiKey && config.moderation?.secretKey ? "Access Key ID / Secret Key：已配置" : "Access Key ID / Secret Key：未配置");
  setInputValue("llm-moderation-api-kind", config.moderation?.apiKind || "native");
  setInputValue("llm-moderation-model", config.moderation?.model || "text_risk");
  setInputValue("llm-moderation-service-name", config.moderation?.serviceName || "text_risk");
  setInputValue("llm-moderation-scene", config.moderation?.scene || "ad_compliance");
  setInputValue("llm-moderation-strategy-id", config.moderation?.strategyId || "");
  setInputValue("llm-moderation-text-checkers", config.moderation?.textCheckers || "medical_fake_ad,drug_forbidden,doctor_qualification");
  setInputValue("llm-moderation-image-checkers", config.moderation?.imageCheckers || "uncomfortable,ocr");
  setInputValue("llm-moderation-endpoint", config.moderation?.endpoint || "/?Action=TextRisk&Version=2022-08-31");
}

function setServiceIndicator(state, text) {
  if (!serviceIndicatorEl || !serviceIndicatorTextEl) return;
  serviceIndicatorEl.className = `service-indicator service-indicator-${state}`;
  serviceIndicatorTextEl.textContent = text;
  serviceRetryBtn?.classList.toggle("hidden", state !== "offline");
}

async function handleServiceRetry() {
  serviceRetryBtn.disabled = true;
  setServiceIndicator("pending", "重新连接中");
  await loadRuntimeStatus();
  serviceRetryBtn.disabled = false;
}

async function handleReloadLlmConfig() {
  llmConfigReloadBtn.disabled = true;
  await loadLlmConfig();
  llmConfigReloadBtn.disabled = false;
}

async function handleSaveLlmConfig() {
  if (!llmConfigLoaded) {
    setLlmConfigStatus("配置尚未加载完成，请稍后再试。", "error");
    return;
  }
  llmConfigSaveBtn.disabled = true;
  try {
    setLlmConfigStatus("正在保存 LLM 配置...", "working");
    const data = await postJson("/api/llm-config", { config: collectLlmConfig() });
    renderLlmConfig(data.config || {});
    await loadRuntimeStatus();
    setLlmConfigStatus("LLM 配置已保存。后续生成会按新的调用点配置执行。", "success");
  } catch (error) {
    setLlmConfigStatus(error.message || "保存 LLM 配置失败", "error");
  } finally {
    llmConfigSaveBtn.disabled = false;
  }
}

async function handleLlmConfigClick(event) {
  const button = event.target.closest("[data-llm-test-route]");
  if (!button) return;
  const routeName = String(button.dataset.llmTestRoute || "").trim();
  if (!routeName) return;
  const statusId = `llm-${routeName}-test-status`;
  button.disabled = true;
  setLlmRouteTestStatus(statusId, "正在测试连接...", "working");
  try {
    const data = await postJson("/api/llm-config/test", { routeName, config: collectLlmConfig() });
    const debugSummary = buildLlmRouteDebugSummary(routeName);
    setLlmRouteTestStatus(
      statusId,
      `${data.title}：${data.message}${debugSummary ? ` ${debugSummary}` : ""}`,
      data.tone || (data.ok ? "success" : "warning"),
    );
  } catch (error) {
    setLlmRouteTestStatus(statusId, error.message || "连接测试失败。", "error");
  } finally {
    button.disabled = false;
  }
}

function buildLlmRouteDebugSummary(routeName) {
  const authScheme = getInputValue(`llm-${routeName}-auth-scheme`);
  const timeoutSec = getInputValue(`llm-${routeName}-timeout-sec`);
  const apiKind = getInputValue(`llm-${routeName}-api-kind`);
  const parts = [];
  if (apiKind) parts.push(`接口类型：${apiKind}`);
  parts.push(`鉴权：${authScheme || "Raw Token"}`);
  parts.push(`超时：${timeoutSec || getDefaultRouteTimeoutSec(routeName)} 秒`);
  return `（${parts.join(" · ")}）`;
}

function getDefaultRouteTimeoutSec(routeName) {
  if (routeName === "image" || routeName === "tts") return "45";
  if (routeName === "moderation") return "15";
  if (routeName === "storyboard") return "25";
  return "20";
}

async function loadDraftHistory() {
  try {
    const query = new URLSearchParams({
      q: historySearch?.value.trim() || "",
      workflowStatus: historyStatusFilter?.value || "all",
      sort: historySort?.value || "updated-desc",
      starred: historyStarredFilter?.checked ? "true" : "",
    });
    const data = await fetchJson(`/api/drafts?${query.toString()}`);
    latestDraftsSnapshot = Array.isArray(data.drafts) ? data.drafts : [];
    renderHistory(data.drafts || []);
  } catch (error) {
    latestDraftsSnapshot = [];
    renderAdminOverviewSummary();
    historySummary.innerHTML = "";
    historyList.innerHTML = `<p class="status">${escapeHtml(error.message || "加载草稿历史失败")}</p>`;
  }
}

function renderHistory(drafts) {
  renderAdminOverviewSummary();
  renderHistorySummary(drafts);
  if (!drafts.length) {
    historyList.innerHTML = `<p class="status">当前筛选条件下没有草稿。</p>`;
    return;
  }
  historyList.innerHTML = drafts.map((draft) => {
    const isActive = draft.id === currentDraftId ? " active" : "";
    const readiness = buildHistoryReadiness(draft);
    return `
      <a class="history-item${isActive}" href="/?draft=${encodeURIComponent(draft.id)}">
        <div class="history-head">
          <strong>${draft.starred ? "★ " : ""}${escapeHtml(draft.title)}</strong>
          <span class="history-updated">${formatDateTime(draft.updatedAt || draft.createdAt)} · 打开生产页</span>
        </div>
        <div class="history-compact">
          <span>${escapeHtml(draft.topic)}</span>
          <div class="history-tags">
            <span>${escapeHtml(draft.coverStyleLabel)}</span>
            <span>${escapeHtml(draft.durationMode)} 秒</span>
          </div>
        </div>
        <div class="history-detail">
          <span>${escapeHtml(draft.topic)}</span>
          <div class="history-tags">
            <span>${escapeHtml(draft.coverStyleLabel)}</span>
            <span>${escapeHtml(draft.durationMode)} 秒</span>
            <span>${escapeHtml(draft.workflowStatusLabel)}</span>
            <span>${escapeHtml(draft.exportStatusLabel)}</span>
          </div>
          <div class="history-foot">
            <span>${escapeHtml(readiness)}</span>
            <span>${draft.blockingIssueCount ? `${draft.blockingIssueCount} 个阻塞问题` : draft.qualityCheckCount ? `${draft.qualityCheckCount} 个检查项` : "未运行质检"}</span>
          </div>
        </div>
      </a>
    `;
  }).join("");
}

function renderAdminOverviewSummary() {
  if (!adminOverviewSummary) return;
  const drafts = Array.isArray(latestDraftsSnapshot) ? latestDraftsSnapshot : [];
  const latestDraft = drafts[0] || null;
  const latestExported = drafts.find((draft) => draft.workflowStatus === "exported" || draft.exportStatus === "success") || null;
  const latestRiskDraft = drafts.find((draft) => draft.blockingIssueCount > 0 || draft.qualityCheckCount > 0) || null;
  const providers = buildActiveProviderList(runtimeSnapshot);

  adminOverviewSummary.innerHTML = `
    <article class="admin-overview-card">
      <span class="admin-overview-label">最近一次生成</span>
      <strong>${escapeHtml(buildOverviewHeadline(latestDraft?.title, "暂无新草稿"))}</strong>
      <p>${escapeHtml(latestDraft?.topic || "生成新草稿后，这里会显示最新记录。")}</p>
      <div class="admin-overview-tags">
        ${latestDraft
          ? `
            <span class="admin-overview-tag">${escapeHtml(formatShortDateTime(latestDraft.updatedAt || latestDraft.createdAt))}</span>
            <span class="admin-overview-tag">${escapeHtml(latestDraft.durationMode || "90")} 秒</span>
          `
          : `<span class="admin-overview-tag">等待生成</span>`}
      </div>
    </article>
    <article class="admin-overview-card">
      <span class="admin-overview-label">最近一次导出</span>
      <strong>${escapeHtml(buildOverviewHeadline(latestExported?.title, "尚无导出记录"))}</strong>
      <p>${escapeHtml(latestExported?.topic || "导出成功后，这里会显示最近一次成片记录。")}</p>
      <div class="admin-overview-tags">
        ${latestExported
          ? `
            <span class="admin-overview-tag">${escapeHtml(formatShortDateTime(latestExported.updatedAt || latestExported.createdAt))}</span>
            <span class="admin-overview-tag">${escapeHtml(latestExported.exportStatusLabel || "已导出")}</span>
          `
          : `<span class="admin-overview-tag">暂无成片</span>`}
      </div>
    </article>
    <article class="admin-overview-card">
      <span class="admin-overview-label">最近一次风控结果</span>
      <strong>${escapeHtml(buildLatestRiskLabel(latestRiskDraft))}</strong>
      <p>${escapeHtml(latestRiskDraft?.topic || "运行导出前检查后，这里会显示最近一次医疗风控结果。")}</p>
      <div class="admin-overview-tags">
        ${latestRiskDraft
          ? `
            <span class="admin-overview-tag">${escapeHtml(formatShortDateTime(latestRiskDraft.updatedAt || latestRiskDraft.createdAt))}</span>
            <span class="admin-overview-tag">${latestRiskDraft.blockingIssueCount ? `${latestRiskDraft.blockingIssueCount} 个阻塞` : `${latestRiskDraft.qualityCheckCount} 个检查项`}</span>
          `
          : `<span class="admin-overview-tag">未运行风控</span>`}
      </div>
    </article>
    <article class="admin-overview-card">
      <span class="admin-overview-label">当前启用供应商</span>
      <strong>${escapeHtml(providers.primary)}</strong>
      <p>${escapeHtml(providers.summary)}</p>
      <div class="admin-overview-tags">
        ${providers.tags.length
          ? providers.tags.map((tag) => `<span class="admin-overview-tag">${escapeHtml(tag)}</span>`).join("")
          : `<span class="admin-overview-tag">本地兜底</span>`}
      </div>
    </article>
  `;
}

function renderAdminProviderSummary() {
  if (!adminProviderSummary) return;
  if (!runtimeSnapshot?.llm) {
    adminProviderSummary.innerHTML = `
      <article class="admin-provider-card admin-provider-card-empty">
        <span class="admin-provider-kicker">供应商状态</span>
        <strong>等待运行状态加载</strong>
        <p>读取运行状态后，这里会显示文本、即梦、豆包和火山风控的生效状态。</p>
      </article>
    `;
    return;
  }

  const storyboardModelLabel = runtimeSnapshot.storyboardModel && runtimeSnapshot.storyboardModel !== "-"
    ? runtimeSnapshot.storyboardModel
    : runtimeSnapshot.textModel && runtimeSnapshot.textModel !== "-"
      ? runtimeSnapshot.textModel
      : "未配置";

  adminProviderSummary.innerHTML = [
    buildProviderSummaryCard("文本生成", runtimeSnapshot.llm.script, runtimeSnapshot.textModel || "-", "文案"),
    buildProviderSummaryCard("分镜生成", runtimeSnapshot.llm.storyboard, storyboardModelLabel, "分镜"),
    buildProviderSummaryCard("即梦图片", runtimeSnapshot.llm.image, runtimeSnapshot.imageModel || "-", "封面 / 分镜"),
    buildProviderSummaryCard("豆包语音", runtimeSnapshot.llm.tts, runtimeSnapshot.ttsModel || "-", "配音"),
    buildProviderSummaryCard("火山风控", runtimeSnapshot.llm.moderation, runtimeSnapshot.moderationModel || "-", "合规"),
  ].join("");
}

function buildProviderSummaryCard(title, route, modelLabel, category) {
  const enabled = Boolean(route?.enabled);
  const provider = String(route?.provider || "").trim() || "未配置";
  const activeLabel = getRuntimeRouteActiveLabel(`${title.includes("风控") ? "风控策略" : title.includes("语音") ? "配音模型" : title.includes("图片") ? "封面模型" : title.includes("分镜") ? "分镜模型" : "文案模型"}`, route) || (enabled ? "远程已启用" : "未启用");
  const endpoint = String(route?.effectiveUrl || route?.endpoint || "-").trim();
  const toneClass = enabled ? "is-online" : "is-idle";

  return `
    <article class="admin-provider-card ${toneClass}">
      <div class="admin-provider-head">
        <span class="admin-provider-kicker">${escapeHtml(category)}</span>
        <span class="admin-provider-state">${escapeHtml(activeLabel)}</span>
      </div>
      <strong>${escapeHtml(title)}</strong>
      <p class="admin-provider-model">${escapeHtml(modelLabel || "未配置")}</p>
      <p class="admin-provider-meta">${escapeHtml(provider)}</p>
      <code class="admin-provider-endpoint">${escapeHtml(endpoint)}</code>
    </article>
  `;
}

function buildLatestRiskLabel(draft) {
  if (!draft) return "尚未运行风控";
  if (draft.blockingIssueCount > 0 || draft.exportStatus === "blocked") return "医疗合规未通过";
  if (draft.qualityCheckCount > 0) return "建议人工复核";
  return "已通过预检";
}

function buildActiveProviderList(runtime) {
  if (!runtime?.llm) {
    return {
      primary: "等待连接",
      summary: "运行状态加载完成后，这里会显示当前实际生效的供应商。",
      tags: [],
    };
  }

  const tags = [
    getRuntimeRouteActiveLabel("文案模型", runtime.llm.script) ? `文案 ${runtime.textModel || "-"}` : "",
    getRuntimeRouteActiveLabel("分镜模型", runtime.llm.storyboard) ? `分镜 ${runtime.storyboardModel || runtime.textModel || "-"}` : "",
    getRuntimeRouteActiveLabel("封面模型", runtime.llm.image) ? "即梦图片" : "",
    getRuntimeRouteActiveLabel("配音模型", runtime.llm.tts) ? "豆包语音" : "",
    getRuntimeRouteActiveLabel("风控策略", runtime.llm.moderation) ? "火山风控" : "",
  ].filter(Boolean);

  return {
    primary: tags.length ? `${tags.length} 条远程链路已启用` : "当前以本地兜底为主",
    summary: tags.length ? "文本、图片、配音和风控链路已进入后台统一管理。" : "尚未启用远程供应商，当前会优先使用本地兜底链路。",
    tags,
  };
}

function buildOverviewHeadline(value, fallback) {
  const text = String(value || "").trim();
  if (!text) return fallback;
  if (text.length <= 18) return text;
  return `${text.slice(0, 18)}...`;
}

function formatShortDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  return date.toLocaleString("zh-CN", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderHistorySummary(drafts) {
  if (!drafts.length) {
    historySummary.innerHTML = "";
    return;
  }
  const exported = drafts.filter((draft) => draft.workflowStatus === "exported").length;
  const blocked = drafts.filter((draft) => draft.exportStatus === "blocked" || draft.blockingIssueCount > 0).length;
  const pending = drafts.filter((draft) => draft.workflowStatus === "pending" || draft.workflowStatus === "revised").length;
  const ready = drafts.filter((draft) => draft.workflowStatus === "ready").length;
  historySummary.innerHTML = `
    <article class="history-overview-card">
      <div class="history-overview-head">
        <span class="history-overview-kicker">历史概览</span>
        <strong>${drafts.length} 条草稿</strong>
      </div>
      <div class="history-overview-metrics">
        <div class="history-overview-pill"><span>待推进</span><strong>${pending} 条</strong></div>
        <div class="history-overview-pill"><span>可导出</span><strong>${ready} 条</strong></div>
        <div class="history-overview-pill"><span>有阻塞</span><strong>${blocked} 条</strong></div>
        <div class="history-overview-pill"><span>已导出</span><strong>${exported} 条</strong></div>
      </div>
    </article>
  `;
}

function initHistoryCollapse() {
  try {
    historyCollapsed = window.localStorage.getItem("adminHistoryCollapsed") === "true";
  } catch {
    historyCollapsed = false;
  }
  applyHistoryCollapse();
}

function toggleHistoryPanel() {
  historyCollapsed = !historyCollapsed;
  try {
    window.localStorage.setItem("adminHistoryCollapsed", String(historyCollapsed));
  } catch {}
  applyHistoryCollapse();
}

function applyHistoryCollapse() {
  historyBody?.classList.toggle("hidden", historyCollapsed);
  if (historyToggleBtn) {
    historyToggleBtn.textContent = historyCollapsed ? "展开历史" : "收起历史";
    historyToggleBtn.setAttribute("aria-expanded", String(!historyCollapsed));
  }
}

function collectLlmConfig() {
  return {
    script: {
      provider: getInputValue("llm-script-provider"),
      baseURL: getInputValue("llm-script-base-url"),
      authHeader: getInputValue("llm-script-auth-header"),
      authScheme: getInputValue("llm-script-auth-scheme"),
      timeoutSec: getInputValue("llm-script-timeout-sec"),
      apiKey: getInputValue("llm-script-api-key"),
      enabled: getCheckboxValue("llm-script-enabled"),
      apiKind: getInputValue("llm-script-api-kind"),
      model: getInputValue("llm-script-model"),
      endpoint: getInputValue("llm-script-endpoint"),
    },
    storyboard: {
      provider: getInputValue("llm-storyboard-provider"),
      baseURL: getInputValue("llm-storyboard-base-url"),
      authHeader: getInputValue("llm-storyboard-auth-header"),
      authScheme: getInputValue("llm-storyboard-auth-scheme"),
      timeoutSec: getInputValue("llm-storyboard-timeout-sec"),
      apiKey: getInputValue("llm-storyboard-api-key"),
      enabled: getCheckboxValue("llm-storyboard-enabled"),
      apiKind: getInputValue("llm-storyboard-api-kind"),
      model: getInputValue("llm-storyboard-model"),
      endpoint: getInputValue("llm-storyboard-endpoint"),
    },
    image: {
      provider: getInputValue("llm-image-provider"),
      baseURL: getInputValue("llm-image-base-url"),
      authHeader: getInputValue("llm-image-auth-header"),
      authScheme: getInputValue("llm-image-auth-scheme"),
      timeoutSec: getInputValue("llm-image-timeout-sec"),
      apiKey: getInputValue("llm-image-api-key"),
      secretKey: getInputValue("llm-image-secret-key"),
      region: getInputValue("llm-image-region"),
      service: getInputValue("llm-image-service"),
      pollIntervalMs: getInputValue("llm-image-poll-interval-ms"),
      pollAttempts: getInputValue("llm-image-poll-attempts"),
      enabled: getCheckboxValue("llm-image-enabled"),
      apiKind: getInputValue("llm-image-api-kind"),
      model: getInputValue("llm-image-model"),
      quality: getInputValue("llm-image-quality"),
      size: getInputValue("llm-image-size"),
      outputFormat: getInputValue("llm-image-format"),
      endpoint: getInputValue("llm-image-endpoint"),
      queryEndpoint: getInputValue("llm-image-query-endpoint"),
    },
    tts: {
      provider: getInputValue("llm-tts-provider"),
      baseURL: getInputValue("llm-tts-base-url"),
      appId: getInputValue("llm-tts-app-id"),
      resourceId: getInputValue("llm-tts-resource-id"),
      authHeader: getInputValue("llm-tts-auth-header"),
      authScheme: getInputValue("llm-tts-auth-scheme"),
      timeoutSec: getInputValue("llm-tts-timeout-sec"),
      apiKey: getInputValue("llm-tts-api-key"),
      enabled: getCheckboxValue("llm-tts-enabled"),
      apiKind: getInputValue("llm-tts-api-kind"),
      model: getInputValue("llm-tts-model"),
      voice: getInputValue("llm-tts-voice"),
      format: getInputValue("llm-tts-format"),
      endpoint: getInputValue("llm-tts-endpoint"),
    },
    moderation: {
      provider: getInputValue("llm-moderation-provider"),
      baseURL: getInputValue("llm-moderation-base-url"),
      authHeader: getInputValue("llm-moderation-auth-header"),
      authScheme: getInputValue("llm-moderation-auth-scheme"),
      timeoutSec: getInputValue("llm-moderation-timeout-sec"),
      apiKey: getInputValue("llm-moderation-api-key"),
      secretKey: getInputValue("llm-moderation-secret-key"),
      region: getInputValue("llm-moderation-region"),
      service: getInputValue("llm-moderation-service"),
      enabled: getCheckboxValue("llm-moderation-enabled"),
      apiKind: getInputValue("llm-moderation-api-kind"),
      model: getInputValue("llm-moderation-model"),
      serviceName: getInputValue("llm-moderation-service-name"),
      scene: getInputValue("llm-moderation-scene"),
      strategyId: getInputValue("llm-moderation-strategy-id"),
      textCheckers: getInputValue("llm-moderation-text-checkers"),
      imageCheckers: getInputValue("llm-moderation-image-checkers"),
      endpoint: getInputValue("llm-moderation-endpoint"),
    },
  };
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("zh-CN");
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function setLlmConfigStatus(message, tone = "info") {
  if (!llmConfigStatusEl) return;
  llmConfigStatusEl.textContent = message;
  llmConfigStatusEl.className = `status status-${tone}`;
}

function setLlmRouteTestStatus(id, message, tone = "idle") {
  const element = document.querySelector(`#${id}`);
  if (!element) return;
  element.textContent = message;
  element.className = `llm-test-status llm-test-status-${tone}`;
}

function setInputValue(id, value) {
  const element = document.querySelector(`#${id}`);
  if (element) element.value = value;
}

function setTextValue(id, value) {
  const element = document.querySelector(`#${id}`);
  if (element) element.textContent = value;
}

function setCheckboxValue(id, checked) {
  const element = document.querySelector(`#${id}`);
  if (element) element.checked = Boolean(checked);
}

function getInputValue(id) {
  return String(document.querySelector(`#${id}`)?.value || "").trim();
}

function getCheckboxValue(id) {
  return Boolean(document.querySelector(`#${id}`)?.checked);
}

function buildHistoryReadiness(draft) {
  if (draft.workflowStatus === "exported") return "已完成导出";
  if (draft.workflowStatus === "ready") return "已就绪，可直接导出";
  if (draft.blockingIssueCount > 0) return "先处理阻塞问题";
  if (draft.exportStatus === "script-only") return "可先执行导出脚本";
  if (draft.qualityCheckCount > 0) return "已检查，可继续导出";
  return "建议先运行质检";
}

async function postJson(url, payload) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "请求失败");
    return data;
  } catch (error) {
    throw new Error(normalizeRequestError(error));
  }
}

async function fetchJson(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "请求失败");
    return data;
  } catch (error) {
    throw new Error(normalizeRequestError(error));
  }
}

function normalizeRequestError(error) {
  const message = String(error?.message || "");
  const normalized = message.toLowerCase();
  if (message.includes("Failed to fetch") || normalized.includes("fetch failed")) {
    return "本地服务未连接，请刷新页面或重启网站。";
  }
  if (message.includes("NetworkError")) {
    return "网络请求失败，请检查本地服务是否正常运行。";
  }
  return message || "请求失败";
}

function debounce(fn, wait) {
  let timer = 0;
  return () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(), wait);
  };
}
