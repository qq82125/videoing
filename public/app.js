import { fetchJson, postJson } from "./shared/api-client.js";
import {
  buildCoverComposedSvgDocument,
  escapeXml,
} from "./shared/cover-layout.js";
import {
  buildScriptViewHtml,
  buildSubtitleViewModel,
  buildStoryboardViewModel,
} from "./app/content-panels.js";
import { buildEditorDirtyState, buildEditorSnapshotPayload, cloneStoryboard } from "./app/editor-state.js";
import {
  buildHistoryReadiness as buildHistoryReadinessView,
  renderHistory as renderHistoryView,
  renderHistorySummary as renderHistorySummaryView,
} from "./app/history-panel.js";
import {
  renderQualityChecks as renderQualityChecksView,
  renderQualityOverview as renderQualityOverviewView,
  renderReleaseControl as renderReleaseControlView,
} from "./app/quality-panel.js";

const form = document.querySelector("#draft-form");
const appShellEl = document.querySelector("#app-shell");
const statusEl = document.querySelector("#status");
const emptyStateEl = document.querySelector("#empty-state");
const resultEl = document.querySelector("#result");
const titleEl = document.querySelector("#title-text");
const coverStyleEl = document.querySelector("#cover-style-text");
const previewComboTextEl = document.querySelector("#preview-combo-text");
const previewFocusChip = document.querySelector("#preview-focus-chip");
const previewRecommendTitleEl = document.querySelector("#preview-recommend-title");
const previewRecommendTextEl = document.querySelector("#preview-recommend-text");
const coverEl = document.querySelector("#cover-image");
const coverSafeOverlayEl = document.querySelector("#cover-safe-overlay");
const coverSafeKickerEl = document.querySelector("#cover-safe-kicker");
const coverSafeFrameEl = document.querySelector("#cover-safe-frame");
const coverSafeTitleEl = document.querySelector("#cover-safe-title");
const coverSafeSubtitleEl = document.querySelector("#cover-safe-subtitle");
const jumpCoverEditorBtn = document.querySelector("#jump-cover-editor-btn");
const coverBackgroundHistoryMetaEl = document.querySelector("#cover-background-history-meta");
const coverBackgroundHistoryGridEl = document.querySelector("#cover-background-history-grid");
const coverBackgroundCompareEl = document.querySelector("#cover-background-compare");
const coverBackgroundCompareMetaEl = document.querySelector("#cover-background-compare-meta");
const coverBackgroundCompareGridEl = document.querySelector("#cover-background-compare-grid");
const scriptEl = document.querySelector("#script-view");
const subtitleEl = document.querySelector("#subtitle-view");
const audioEl = document.querySelector("#audio-player");
const previewAudioLinkEl = document.querySelector("#preview-audio-link");
const previewAudioStatusEl = document.querySelector("#preview-audio-status");
const previewAudioTextEl = document.querySelector("#preview-audio-text");
const previewAudioMetaEl = document.querySelector("#preview-audio-meta");
const previewAudioEmptyEl = document.querySelector("#preview-audio-empty");
const exportBtn = document.querySelector("#export-btn");
const videoLink = document.querySelector("#video-link");
const scriptLink = document.querySelector("#script-link");
const comboGrid = document.querySelector("#combo-grid");
const workflowMapEl = document.querySelector("#workflow-map");
const workflowPhaseTitleEl = document.querySelector("#workflow-phase-title");
const workflowPhaseTextEl = document.querySelector("#workflow-phase-text");
const workflowPhaseCardEl = document.querySelector(".workflow-phase-card.is-primary");
const workflowDirtyChipsEl = document.querySelector("#workflow-dirty-chips");
const workflowRecommendTitleEl = document.querySelector("#workflow-recommend-title");
const workflowRecommendTextEl = document.querySelector("#workflow-recommend-text");
const workflowRecommendBtn = document.querySelector("#workflow-recommend-btn");
const scriptPrepSummaryEl = document.querySelector("#script-prep-summary");
const scriptPrepMetricsEl = document.querySelector("#script-prep-metrics");
const scriptPrepListEl = document.querySelector("#script-prep-list");
const confirmScriptBtn = document.querySelector("#confirm-script-btn");
const activeStageChip = document.querySelector("#active-stage-chip");
const activeTitleChip = document.querySelector("#active-title-chip");
const activeCoverChip = document.querySelector("#active-cover-chip");
const historyList = document.querySelector("#history-list");
const historySearch = document.querySelector("#history-search");
const historyStatusFilter = document.querySelector("#history-status-filter");
const historySort = document.querySelector("#history-sort");
const historyStarredFilter = document.querySelector("#history-starred-filter");
const historySummary = document.querySelector("#history-summary");
const historyBody = document.querySelector("#history-body");
const historyToggleBtn = document.querySelector("#history-toggle-btn");
const runtimeStatusEl = document.querySelector("#runtime-status");
const llmConfigForm = document.querySelector("#llm-config-form");
const llmConfigStatusEl = document.querySelector("#llm-config-status");
const llmConfigReloadBtn = document.querySelector("#llm-config-reload-btn");
const llmConfigSaveBtn = document.querySelector("#llm-config-save-btn");
const serviceIndicatorEl = document.querySelector("#service-indicator");
const serviceIndicatorTextEl = document.querySelector("#service-indicator-text");
const serviceRetryBtn = document.querySelector("#service-retry-btn");
const railDrawerToggleBtn = document.querySelector("#rail-drawer-toggle");
const railDrawerBackdropEl = document.querySelector("#rail-drawer-backdrop");
const frontNavLinkEl = document.querySelector("#front-nav-link");
const previewWorkspaceBtn = document.querySelector("#preview-workspace-btn");
const randomExampleBtn = document.querySelector("#random-example-btn");
const clearFormBtn = document.querySelector("#clear-form-btn");
const sourceTypeEls = document.querySelectorAll('input[name="sourceType"]');
const topicFieldEl = document.querySelector("#topic-field");
const rawContentFieldEl = document.querySelector("#raw-content-field");
const topicInputEl = document.querySelector("#topic");
const rawContentEl = document.querySelector("#raw-content");
const angleInputEl = document.querySelector("#angle");
const rewriteStyleEl = document.querySelector("#rewrite-style");
const audienceInputEl = document.querySelector("#audience");
const durationModeEl = document.querySelector("#duration-mode");
const coverStyleSelectEl = document.querySelector("#cover-style-select");
const editTitleAEl = document.querySelector("#edit-title-a");
const editTitleBEl = document.querySelector("#edit-title-b");
const editCoverTitleEl = document.querySelector("#edit-cover-title");
const editCoverVisualPromptEl = document.querySelector("#edit-cover-visual-prompt");
const editCoverNegativePromptEl = document.querySelector("#edit-cover-negative-prompt");
const editCoverPositionEl = document.querySelector("#edit-cover-position");
const editCoverAlignEl = document.querySelector("#edit-cover-align");
const editCoverSizeEl = document.querySelector("#edit-cover-size");
const editCoverTitleWidthEl = document.querySelector("#edit-cover-title-width");
const editCoverTitleOffsetEl = document.querySelector("#edit-cover-title-offset");
const editCoverTitleXOffsetEl = document.querySelector("#edit-cover-title-x-offset");
const editCoverTitleSpacingEl = document.querySelector("#edit-cover-title-spacing");
const editCoverSubtitleEl = document.querySelector("#edit-cover-subtitle");
const editCoverSubtitlePositionEl = document.querySelector("#edit-cover-subtitle-position");
const editCoverSubtitleSizeEl = document.querySelector("#edit-cover-subtitle-size");
const editCoverSubtitleAlignEl = document.querySelector("#edit-cover-subtitle-align");
const editCoverSubtitleOffsetEl = document.querySelector("#edit-cover-subtitle-offset");
const editCoverSubtitleXOffsetEl = document.querySelector("#edit-cover-subtitle-x-offset");
const editCoverSubtitleWidthEl = document.querySelector("#edit-cover-subtitle-width");
const editHookEl = document.querySelector("#edit-hook");
const editSection1El = document.querySelector("#edit-section-1");
const editSection2El = document.querySelector("#edit-section-2");
const editSection3El = document.querySelector("#edit-section-3");
const editCtaEl = document.querySelector("#edit-cta");
const saveDraftBtn = document.querySelector("#save-draft-btn");
const checkBtn = document.querySelector("#check-btn");
const starBtn = document.querySelector("#star-btn");
const workflowStatusSelect = document.querySelector("#workflow-status-select");
const qualityList = document.querySelector("#quality-list");
const qualityOverviewEl = document.querySelector("#quality-overview");
const qualityOverviewTitleEl = document.querySelector("#quality-overview-title");
const qualityOverviewTextEl = document.querySelector("#quality-overview-text");
const qualityOverviewActionsEl = document.querySelector("#quality-overview-actions");
const markReadyBtn = document.querySelector("#mark-ready-btn");
const manageRecommendTitleEl = document.querySelector("#manage-recommend-title");
const manageRecommendTextEl = document.querySelector("#manage-recommend-text");
const manageRecommendBtn = document.querySelector("#manage-recommend-btn");
const lightTrialCardEl = document.querySelector("#light-trial-card");
const partialRebuildCardEl = document.querySelector("#partial-rebuild-card");
const fullTrialCardEl = document.querySelector("#full-trial-card");
const partialAudioBtn = document.querySelector("#partial-audio-btn");
const partialCoverBtn = document.querySelector("#partial-cover-btn");
const rerollCoverBackgroundBtn = document.querySelector("#reroll-cover-background-btn");
const partialSceneBtn = document.querySelector("#partial-scene-btn");
const fullTrialBtn = document.querySelector("#full-trial-btn");
const partialAudioStatusEl = document.querySelector("#partial-audio-status");
const partialCoverStatusEl = document.querySelector("#partial-cover-status");
const partialSceneStatusEl = document.querySelector("#partial-scene-status");
const fullTrialStatusEl = document.querySelector("#full-trial-status");
const partialAudioMetaEl = document.querySelector("#partial-audio-meta");
const partialCoverMetaEl = document.querySelector("#partial-cover-meta");
const partialSceneMetaEl = document.querySelector("#partial-scene-meta");
const productionStartTitleEl = document.querySelector("#production-start-title");
const productionStartTextEl = document.querySelector("#production-start-text");
const productionProgressStripEl = document.querySelector("#production-progress-strip");
const editorAudioBtn = document.querySelector("#editor-audio-btn");
const editorCoverBtn = document.querySelector("#editor-cover-btn");
const storyboardPartialBtn = document.querySelector("#storyboard-partial-btn");
const editorRecommendTitleEl = document.querySelector("#editor-recommend-title");
const editorRecommendTextEl = document.querySelector("#editor-recommend-text");
const storyboardRecommendTitleEl = document.querySelector("#storyboard-recommend-title");
const storyboardRecommendTextEl = document.querySelector("#storyboard-recommend-text");
const exportRecommendTitleEl = document.querySelector("#export-recommend-title");
const exportRecommendTextEl = document.querySelector("#export-recommend-text");
const releaseControlEl = document.querySelector("#release-control");
const releaseControlTitleEl = document.querySelector("#release-control-title");
const releaseControlTextEl = document.querySelector("#release-control-text");
const releaseControlMetaEl = document.querySelector("#release-control-meta");
const scriptReviewTitleEl = document.querySelector("#script-review-title");
const scriptReviewLeadEl = document.querySelector("#script-review-lead");
const scriptReviewTextEl = document.querySelector("#script-review-text");
const scriptViewTitleEl = document.querySelector("#script-view-title");
const subtitleViewTitleEl = document.querySelector("#subtitle-view-title");
const currentTopicEl = document.querySelector("#current-topic");
const currentMetaEl = document.querySelector("#current-meta");
const currentUpdatedEl = document.querySelector("#current-updated");
const editorStateEl = document.querySelector("#editor-state");
const editorGroupTitleEl = document.querySelector("#editor-group-title");
const editorGroupCoverEl = document.querySelector("#editor-group-cover");
const editorGroupBodyEl = document.querySelector("#editor-group-body");
const editorGroupCtaEl = document.querySelector("#editor-group-cta");
const editorGroupTitleStatusEl = document.querySelector("#editor-group-title-status");
const editorGroupCoverStatusEl = document.querySelector("#editor-group-cover-status");
const editorGroupBodyStatusEl = document.querySelector("#editor-group-body-status");
const editorGroupCtaStatusEl = document.querySelector("#editor-group-cta-status");
const exportSummaryEl = document.querySelector("#export-summary");
const exportSummaryTitleEl = document.querySelector("#export-summary-title");
const exportSummaryTimeEl = document.querySelector("#export-summary-time");
const exportSummaryMessageEl = document.querySelector("#export-summary-message");
const exportSummaryMetaEl = document.querySelector("#export-summary-meta");
const exportLinksEl = document.querySelector("#export-links");
const copyScriptBtn = document.querySelector("#copy-script-btn");
const copySubtitleBtn = document.querySelector("#copy-subtitle-btn");
const subtitleMetaEl = document.querySelector("#subtitle-meta");
const storyboardListEl = document.querySelector("#storyboard-list");
const storyboardSectionEl = document.querySelector("#section-storyboard");
const finalStepSectionEl = document.querySelector(".workspace-final-step");
const resumeCard = document.querySelector("#resume-card");
const resumeCardText = document.querySelector("#resume-card-text");
const resumeLastDraftBtn = document.querySelector("#resume-last-draft-btn");
const suggestTopicButtons = document.querySelectorAll(".suggest-topic-btn");
const sidebarContextEl = document.querySelector("#sidebar-context");
const sidebarContextTitleEl = document.querySelector("#sidebar-context-title");
const sidebarContextMetaEl = document.querySelector("#sidebar-context-meta");
const sidebarContextTagsEl = document.querySelector("#sidebar-context-tags");
const generateProgressEl = document.querySelector("#generate-progress");
const generateProgressTitleEl = document.querySelector("#generate-progress-title");
const generateProgressStepCountEl = document.querySelector("#generate-progress-step-count");
const generateProgressElapsedEl = document.querySelector("#generate-progress-elapsed");
const generateProgressNoteEl = document.querySelector("#generate-progress-note");
const generateProgressFillEl = document.querySelector("#generate-progress-fill");
const generateProgressStepsEl = document.querySelector("#generate-progress-steps");

const editableFields = [
  editTitleAEl,
  editCoverTitleEl,
  editCoverSubtitleEl,
  editCoverVisualPromptEl,
  editCoverNegativePromptEl,
  editCoverPositionEl,
  editCoverAlignEl,
  editCoverSizeEl,
  editCoverTitleWidthEl,
  editCoverTitleOffsetEl,
  editCoverTitleXOffsetEl,
  editCoverTitleSpacingEl,
  editCoverSubtitlePositionEl,
  editCoverSubtitleSizeEl,
  editCoverSubtitleAlignEl,
  editCoverSubtitleOffsetEl,
  editCoverSubtitleXOffsetEl,
  editCoverSubtitleWidthEl,
  editHookEl,
  editSection1El,
  editSection2El,
  editSection3El,
  editCtaEl,
  durationModeEl,
].filter(Boolean);

let currentDraftId = "";
let currentCoverStyle = "report";
let currentTitleVariant = "a";
let currentDraft = null;
let coverBackgroundCompareIds = [];
let currentProductionStage = "script";
let currentDirtyState = {
  script: false,
  audio: false,
  storyboard: false,
  cover: false,
};
let draftSnapshot = null;
let storyboardDraftState = [];
let currentStoryboardIndex = 0;
let hasUnsavedChanges = false;
let comboBusy = false;
let historyCollapsed = false;
let lastDraftId = "";
let currentEditorFocus = "overview";
let currentPreviewReviewLabel = "整体成片";
let activeProductionTask = "";
let runtimeStatusTimer = null;
let llmConfigLoaded = false;
let generateProgressTimer = null;
let generateProgressStartedAt = 0;
let statusHideTimer = null;
const PREVIEW_DRAFT_ID = "__preview__";
const DRAFT_STAGE_STORAGE_KEY = "draftStages";
const CURRENT_DRAFT_STORAGE_KEY = "currentDraftId";

const GENERATE_PROGRESS_STEPS = [
  "生成脚本",
  "整理分段",
  "建立草稿",
];
const PRODUCTION_ACTIONS_STORAGE_KEY = "ivd-production-actions";

const RANDOM_EXAMPLE_PRESETS = [
  {
    topic: "集采后 IVD 渠道的下一轮机会在哪里",
    angle: "从终端实验室价值出发",
    audience: "",
    rewriteStyle: "industry_observation",
  },
  {
    topic: "IVD 出海最容易被低估的门槛",
    angle: "从渠道策略和本地化执行切入",
    audience: "",
    rewriteStyle: "deep_analysis",
  },
  {
    topic: "终端实验室为什么重新变重要了",
    angle: "从服务能力和长期采购逻辑切入",
    audience: "",
    rewriteStyle: "point_breakdown",
  },
];

function getDraftScriptSource(draft) {
  const script = draft?.script || {};
  const draftSections = Array.isArray(draft?.sections)
    ? draft.sections.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  const scriptSections = Array.isArray(script?.sections)
    ? script.sections.map((item) => String(item || "").trim()).filter(Boolean)
    : [];
  return {
    title: draft?.title || script.title || "",
    titleVariants: draft?.titleVariants || script.titleVariants || {},
    coverTitle: draft?.coverTitle || script.coverTitle || "",
    coverSubtitle: draft?.coverSubtitle || script.coverSubtitle || "",
    coverVisualPrompt: draft?.coverVisualPrompt || "",
    coverNegativePrompt: draft?.coverNegativePrompt || "",
    coverTitlePosition: draft?.coverTitlePosition || script.coverTitlePosition || "middle",
    coverTitleAlign: draft?.coverTitleAlign || script.coverTitleAlign || "left",
    coverTitleSize: draft?.coverTitleSize || script.coverTitleSize || "large",
    coverTitleWidth: draft?.coverTitleWidth || script.coverTitleWidth || "normal",
    coverTitleOffset: String(draft?.coverTitleOffset ?? script.coverTitleOffset ?? "0"),
    coverTitleXOffset: String(draft?.coverTitleXOffset ?? script.coverTitleXOffset ?? "0"),
    coverTitleSpacing: draft?.coverTitleSpacing || script.coverTitleSpacing || "normal",
    coverSubtitlePosition: draft?.coverSubtitlePosition || script.coverSubtitlePosition || "below-title",
    coverSubtitleSize: draft?.coverSubtitleSize || script.coverSubtitleSize || "small",
    coverSubtitleAlign: draft?.coverSubtitleAlign || script.coverSubtitleAlign || "follow",
    coverSubtitleOffset: String(draft?.coverSubtitleOffset ?? script.coverSubtitleOffset ?? "0"),
    coverSubtitleXOffset: String(draft?.coverSubtitleXOffset ?? script.coverSubtitleXOffset ?? "0"),
    coverSubtitleWidth: draft?.coverSubtitleWidth || script.coverSubtitleWidth || "normal",
    hook: draft?.hook || script.hook || "",
    sections: draftSections.length ? draftSections : scriptSections,
    cta: draft?.cta || script.cta || "",
    narrationText: draft?.narrationText || script.narrationText || "",
  };
}

function splitEstimatedSubtitleText(text) {
  const normalized = String(text || "").trim();
  if (!normalized) {
    return [];
  }

  return normalized
    .replace(/([，。！？；：])/g, "$1\n")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .flatMap((item) => {
      if (item.length <= 16) {
        return [item];
      }

      const parts = [];
      let cursor = item;
      while (cursor.length > 16) {
        parts.push(cursor.slice(0, 16));
        cursor = cursor.slice(16);
      }
      if (cursor) {
        parts.push(cursor);
      }
      return parts;
    });
}

function buildEstimatedSubtitleEntries(draft) {
  const script = getDraftScriptSource(draft);
  const blocks = [script.hook, ...(script.sections || []), script.cta].filter(Boolean);
  const parts = blocks.flatMap((block) => splitEstimatedSubtitleText(block));
  return parts.map((text, index) => ({
    startSec: null,
    endSec: null,
    text,
    estimated: true,
    index,
  }));
}

boot();

function boot() {
  attachEvents();
  updateInputSourceUI();
  if (historyList && historyBody && historyToggleBtn) {
    initHistoryCollapse();
  }
  if (runtimeStatusEl && serviceIndicatorEl && serviceIndicatorTextEl) {
    loadRuntimeStatus();
    startRuntimeStatusPolling();
  }
  if (llmConfigForm && llmConfigStatusEl) {
    loadLlmConfig();
  }
  if (historyList && historySearch && historyStatusFilter && historySort && historyStarredFilter) {
    loadDraftHistory().then(() => {
      bootstrapInitialDraftFromUrl();
    });
    return;
  }
  bootstrapInitialDraftFromUrl();
}

function attachEvents() {
  form.addEventListener("submit", handleGenerate);
  exportBtn.addEventListener("click", handleExport);
  saveDraftBtn.addEventListener("click", handleSaveDraft);
  checkBtn?.addEventListener("click", handleQualityCheck);
  starBtn.addEventListener("click", handleStarToggle);
  workflowStatusSelect.addEventListener("change", handleWorkflowStatusChange);
  markReadyBtn.addEventListener("click", handleMarkReady);
  historySearch?.addEventListener("input", debounce(() => loadDraftHistory(), 180));
  historyStatusFilter?.addEventListener("change", () => loadDraftHistory());
  historySort?.addEventListener("change", () => loadDraftHistory());
  historyStarredFilter?.addEventListener("change", () => loadDraftHistory());
  historyToggleBtn?.addEventListener("click", toggleHistoryPanel);
  activeStageChip?.addEventListener("click", handleActiveStageChipClick);
  workflowPhaseCardEl?.addEventListener("click", handleActiveStageChipClick);
  workflowDirtyChipsEl?.addEventListener("click", handleDirtyChipClick);
  serviceRetryBtn?.addEventListener("click", handleServiceRetry);
  railDrawerBackdropEl?.addEventListener("click", () => setInputDrawerOpen(false));
  frontNavLinkEl?.addEventListener("click", (event) => {
    if (window.location.pathname === "/" && appShellEl?.classList.contains("is-production")) {
      event.preventDefault();
      try {
        window.localStorage.removeItem(CURRENT_DRAFT_STORAGE_KEY);
      } catch {
        // ignore storage errors
      }
      window.location.assign("/?front=1");
    }
  });
  previewWorkspaceBtn?.addEventListener("click", handlePreviewWorkspace);
  workflowRecommendBtn?.addEventListener("click", handleRecommendAction);
  manageRecommendBtn?.addEventListener("click", handleRecommendAction);
  partialAudioBtn?.addEventListener("click", handlePartialAudioRebuild);
  partialCoverBtn?.addEventListener("click", handlePartialCoverRebuild);
  rerollCoverBackgroundBtn?.addEventListener("click", handleRerollCoverBackground);
  partialSceneBtn?.addEventListener("click", handlePartialSceneRebuild);
  fullTrialBtn?.addEventListener("click", handleFullTrial);
  editorAudioBtn?.addEventListener("click", handlePartialAudioRebuild);
  editorCoverBtn?.addEventListener("click", handlePartialCoverRebuild);
  storyboardPartialBtn?.addEventListener("click", handlePartialSceneRebuild);
  confirmScriptBtn?.addEventListener("click", handleConfirmScriptStage);
  llmConfigReloadBtn?.addEventListener("click", handleReloadLlmConfig);
  llmConfigSaveBtn?.addEventListener("click", handleSaveLlmConfig);
  llmConfigForm?.addEventListener("click", handleLlmConfigClick);
  randomExampleBtn.addEventListener("click", handleRandomExample);
  clearFormBtn.addEventListener("click", handleClearForm);
  sourceTypeEls.forEach((field) => field.addEventListener("change", updateInputSourceUI));
  rawContentEl.addEventListener("input", handleRawContentInput);
  rewriteStyleEl.addEventListener("change", updateInputSourceUI);
  copyScriptBtn.addEventListener("click", handleCopyScript);
  copySubtitleBtn.addEventListener("click", handleCopySubtitles);
  resumeLastDraftBtn.addEventListener("click", handleResumeLastDraft);
  suggestTopicButtons.forEach((button) => button.addEventListener("click", handleSuggestTopic));
  editableFields.forEach((field) => field.addEventListener("input", handleEditorInput));
  jumpCoverEditorBtn?.addEventListener("click", handleJumpCoverEditor);
  storyboardListEl?.addEventListener("input", handleStoryboardInput);
  storyboardListEl?.addEventListener("click", handleStoryboardClick);
  bindEditorFocus(editTitleAEl, "title");
  bindEditorFocus(editTitleBEl, "title");
  bindEditorFocus(editCoverTitleEl, "cover");
  bindEditorFocus(editCoverVisualPromptEl, "cover");
  bindEditorFocus(editCoverNegativePromptEl, "cover");
  bindEditorFocus(editCoverSubtitleEl, "cover");
  bindEditorFocus(editHookEl, "hook");
  bindEditorFocus(editSection1El, "section-1");
  bindEditorFocus(editSection2El, "section-2");
  bindEditorFocus(editSection3El, "section-3");
  bindEditorFocus(editCtaEl, "cta");
  durationModeEl?.addEventListener("change", handleEditorInput);
  coverStyleSelectEl?.addEventListener("change", updateInputSourceUI);
  window.addEventListener("keydown", handleGlobalKeydown);
  window.addEventListener("beforeunload", handleBeforeUnload);
}

async function handleGenerate(event) {
  event.preventDefault();
  if (isPreviewDraft()) {
    currentDraftId = "";
    currentDraft = null;
    persistCurrentDraftId("");
    syncDraftUrl("");
  }
  if (!confirmDiscardChanges()) {
    return;
  }
  setStatus("准备生成预制脚本...", "working");
  togglePrimaryActions(true);
  hideExportLinks();

  const payload = {
    sourceType: getSelectedSourceType(),
    topic: topicInputEl.value.trim(),
    rawContent: rawContentEl.value.trim(),
    angle: angleInputEl.value.trim(),
    rewriteStyle: rewriteStyleEl.value,
    audience: audienceInputEl?.value?.trim() || "",
    coverStyle: coverStyleSelectEl?.value || "report",
    durationMode: durationModeEl.value,
  };

  try {
    startGenerateProgress();
    setStatus("正在生成口播脚本...", "working");
    const data = await postJson("/api/generate", payload);
    currentDraftId = data.draft.id;
    setStatus("正在整理脚本分段...", "working");
    setGenerateProgressStep(2);
    renderDraft(data.draft);
    await loadDraftHistory();
    setStatus("预制脚本已生成，先确认脚本和分段节奏，再进入后续生产。", "success");
  } catch (error) {
    setStatus(error.message || "生成失败", "error");
  } finally {
    stopGenerateProgress();
    togglePrimaryActions(false);
  }
}

async function handleExport() {
  if (!currentDraftId) {
    setStatus("请先生成或打开一个草稿。", "error");
    return;
  }
  if (isPreviewDraft()) {
    setStatus("当前是布局预览模式，不会执行真实导出。", "info");
    return;
  }

  setStatus("正在执行导出前质检...", "working");
  exportBtn.disabled = true;
  renderExportSummary({
    status: "working",
    title: "正在准备导出",
    message: "先检查音频、字幕、封面和 ffmpeg 状态，再决定是否直接出片。",
    attemptedAt: new Date().toISOString(),
    scriptReady: false,
    videoReady: false,
  });

  try {
    const data = await postJson("/api/export", { draftId: currentDraftId });
    if (data.checks) {
      renderQualityChecks(data.checks);
    }
    setStatus(data.message, data.exported ? "success" : "info");
    if (data.exportInfo) {
      renderExportSummary(data.exportInfo);
    }
    if (currentDraft) {
      currentDraft.exportInfo = data.exportInfo || currentDraft.exportInfo;
      currentDraft.assets = {
        ...currentDraft.assets,
        exportScriptPath: data.exportScriptPath || currentDraft.assets?.exportScriptPath,
        outputVideoPath: data.outputVideoPath || currentDraft.assets?.outputVideoPath,
      };
      if (data.exported) {
        currentDraft.workflowStatus = "exported";
        currentDraft.workflowStatusLabel = "已导出";
      }
      syncExportLinks(currentDraft);
    }

    if (data.exported) {
      await loadDraftHistory();
      pulseResult();
    }
  } catch (error) {
    setStatus(error.message || "导出失败", "error");
    renderExportSummary({
      status: "error",
      title: "导出失败",
      message: error.message || "导出过程中出现错误。",
      attemptedAt: new Date().toISOString(),
      scriptReady: false,
      videoReady: false,
    });
  } finally {
    exportBtn.disabled = false;
  }
}

async function handleSaveDraft() {
  if (!currentDraftId) {
    setStatus("请先生成或打开一个草稿。", "error");
    return;
  }
  if (isPreviewDraft()) {
    setStatus("当前是布局预览模式，不会保存到真实草稿。", "info");
    return;
  }
  if (!hasUnsavedChanges) {
    setStatus("当前没有新的修改需要保存。", "info");
    return;
  }

  togglePrimaryActions(true);
  try {
    setStatus("正在保存本轮文案修订...", "working");
    const data = await saveDraftEditorContentToServer();
    renderDraft(data.draft);
    await loadDraftHistory();
    flushSavedEditorState(data.draft);
    updateEditorState();
    renderWorkflowMap(data.draft);
    renderReleaseControl(data.draft);
    setStatus("文案修订已保存。需要时再进入生产区按需同步口播、封面或镜头。", "success");
    resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
    pulseResult();
  } catch (error) {
    setStatus(error.message || "保存失败", "error");
  } finally {
    togglePrimaryActions(false);
  }
}

function buildDraftUpdateContent() {
  return {
    title: currentDraft?.title || "",
    titleVariantA: editTitleAEl.value.trim(),
    titleVariantB: editTitleBEl?.value?.trim() || editTitleAEl.value.trim(),
    coverTitle: editCoverTitleEl.value.trim(),
    coverSubtitle: editCoverSubtitleEl?.value?.trim() || "",
    coverVisualPrompt: editCoverVisualPromptEl?.value?.trim() || "",
    coverNegativePrompt: editCoverNegativePromptEl?.value?.trim() || "",
    coverTitlePosition: editCoverPositionEl?.value || "middle",
    coverTitleAlign: editCoverAlignEl?.value || "left",
    coverTitleSize: editCoverSizeEl?.value || "large",
    coverTitleWidth: editCoverTitleWidthEl?.value || "normal",
    coverTitleOffset: editCoverTitleOffsetEl?.value || "0",
    coverTitleXOffset: editCoverTitleXOffsetEl?.value || "0",
    coverTitleSpacing: editCoverTitleSpacingEl?.value || "normal",
    coverSubtitlePosition: editCoverSubtitlePositionEl?.value || "below-title",
    coverSubtitleSize: editCoverSubtitleSizeEl?.value || "small",
    coverSubtitleAlign: editCoverSubtitleAlignEl?.value || "follow",
    coverSubtitleOffset: editCoverSubtitleOffsetEl?.value || "0",
    coverSubtitleXOffset: editCoverSubtitleXOffsetEl?.value || "0",
    coverSubtitleWidth: editCoverSubtitleWidthEl?.value || "normal",
    hook: editHookEl.value.trim(),
    sections: [editSection1El.value.trim(), editSection2El.value.trim(), editSection3El.value.trim()],
    cta: editCtaEl.value.trim(),
    durationMode: durationModeEl.value,
    storyboard: collectStoryboardPayload(),
  };
}

async function syncDraftContentToServer() {
  return postJson("/api/drafts/update", {
    draftId: currentDraftId,
    content: buildDraftUpdateContent(),
  });
}

async function syncDraftAudioToServer() {
  return postJson("/api/drafts/sync-audio", {
    draftId: currentDraftId,
    content: buildDraftUpdateContent(),
  });
}

async function syncDraftCoverToServer() {
  return postJson("/api/drafts/sync-cover", {
    draftId: currentDraftId,
    content: buildDraftUpdateContent(),
  });
}

async function rerollCoverBackgroundOnServer() {
  return postJson("/api/drafts/sync-cover", {
    draftId: currentDraftId,
    rerollBackground: true,
    content: buildDraftUpdateContent(),
  });
}

async function selectCoverBackgroundOnServer(backgroundId) {
  return postJson("/api/drafts/select-cover-background", {
    draftId: currentDraftId,
    backgroundId,
    content: buildDraftUpdateContent(),
  });
}

async function toggleCoverBackgroundStarOnServer(backgroundId, starred) {
  return postJson("/api/drafts/toggle-cover-background-star", {
    draftId: currentDraftId,
    backgroundId,
    starred,
  });
}

async function saveDraftEditorContentToServer() {
  const content = buildDraftUpdateContent();
  delete content.storyboard;
  return postJson("/api/drafts/save-content", {
    draftId: currentDraftId,
    content,
  });
}

async function handleQualityCheck() {
  if (!currentDraftId) {
    setStatus("请先生成或打开一个草稿。", "error");
    return;
  }
  if (isPreviewDraft()) {
    setStatus("当前是布局预览模式，不会触发真实质检。", "info");
    return;
  }

  try {
    setStatus("正在执行导出前质检...", "working");
    const data = await postJson("/api/drafts/check", { draftId: currentDraftId });
    renderQualityChecks(data.checks || []);
    currentDraft = data.draft;
    setStatus("质检已完成。", "success");
  } catch (error) {
    setStatus(error.message || "质检失败", "error");
  }
}

async function handleStarToggle() {
  if (!currentDraftId || !currentDraft) {
    return;
  }
  if (isPreviewDraft()) {
    setStatus("预览模式不支持收藏操作。", "info");
    return;
  }

  try {
    const data = await postJson("/api/drafts/meta", {
      draftId: currentDraftId,
      starred: !currentDraft.starred,
    });
    renderDraft(data.draft);
    await loadDraftHistory();
    setStatus(data.draft.starred ? "已收藏当前草稿。" : "已取消收藏。", "success");
  } catch (error) {
    setStatus(error.message || "更新收藏状态失败", "error");
  }
}

async function handleWorkflowStatusChange() {
  if (!currentDraftId) {
    return;
  }
  if (isPreviewDraft()) {
    setStatus("预览模式不记录真实工作流状态。", "info");
    return;
  }

  try {
    const data = await postJson("/api/drafts/meta", {
      draftId: currentDraftId,
      workflowStatus: workflowStatusSelect.value,
    });
    renderDraft(data.draft);
    await loadDraftHistory();
    setStatus(`已更新状态为${data.draft.workflowStatusLabel}。`, "success");
  } catch (error) {
    setStatus(error.message || "更新状态失败", "error");
  }
}

async function handleMarkReady() {
  if (!currentDraftId) {
    return;
  }

  workflowStatusSelect.value = "ready";
  await handleWorkflowStatusChange();
}

function renderDraft(draft) {
  const scriptSource = getDraftScriptSource(draft);
  const normalizedDurationMode = Number(draft.durationMode || 90);
  const renderableStoryboard = resolveRenderableStoryboard(draft);
  currentDraft = draft;
  currentDraftId = draft.id;
  persistCurrentDraftId(currentDraftId);
  syncDraftUrl(currentDraftId);
  applyProductionShell(true);
  currentProductionStage = draft.productionStage || deriveProductionStage(draft) || getStoredDraftStage(currentDraftId) || "script";
  syncProductionStage();
  currentCoverStyle = draft.coverStyle || "report";
  currentTitleVariant = draft.activeTitleVariant || "a";
  storyboardDraftState = renderableStoryboard;
  currentStoryboardIndex = clampStoryboardIndex(currentStoryboardIndex, storyboardDraftState.length);
  durationModeEl.value = String(normalizedDurationMode);
  if (coverStyleSelectEl) {
    coverStyleSelectEl.value = draft.coverStyle || "report";
  }
  rewriteStyleEl.value = draft.rewriteStyle || "industry_observation";
  emptyStateEl.classList.add("hidden");
  resultEl.classList.remove("hidden");
  currentTopicEl.textContent = draft.topic || draft.title || "未命名草稿";
  currentMetaEl.textContent = [
    draft.sourceType === "article" ? "来自标题 / 正文改写" : "来自主题直生",
    getRewriteStyleLabel(draft.rewriteStyle),
    `${normalizedDurationMode} 秒`,
    draft.coverStyleLabel || "行业报告风",
    draft.angle || "默认行业视角",
  ].join(" · ");
  currentUpdatedEl.textContent = `最近更新：${formatDateTime(draft.updatedAt || draft.createdAt)}`;
  activeStageChip.textContent = getProductionStageLabel(currentProductionStage);
  applyProductionStageTone(activeStageChip, currentProductionStage, "active-chip-stage");
  activeTitleChip.textContent = `${normalizedDurationMode} 秒`;
  activeCoverChip.textContent = draft.coverStyleLabel || "行业报告风";
  updateSidebarContext(draft);

  // Render the script-first areas early so they still show up even if a later
  // preview or production subsection hits a runtime issue.
  renderScriptPrep(draft);
  hydrateScriptEditor(scriptSource);
  safeRenderRegion("script-view", () => renderScriptView(draft));
  safeRenderRegion(
    "subtitle-view",
    () => renderSubtitleView((draft.subtitleEntries || []).length ? draft.subtitleEntries || [] : currentProductionStage === "script" ? buildEstimatedSubtitleEntries(draft) : []),
  );
  syncDraftSnapshot();

  titleEl.textContent = "";
  coverStyleEl.textContent = `${draft.coverStyleLabel || "行业报告风"} · ${normalizedDurationMode} 秒`;
  previewComboTextEl.textContent = `当前方案：标题 ${String(currentTitleVariant || "a").toUpperCase()} + ${draft.coverStyleLabel || "行业报告风"}`;
  updatePreviewFocusChip();
  const assetVersion = buildAssetVersion(draft);
  safeRenderRegion("preview-image", () => setupPreviewImage(draft, assetVersion));
  safeRenderRegion("preview-safe-overlay", () => renderCoverSafeOverlay());
  safeRenderRegion("cover-background-history", () => renderCoverBackgroundHistory(draft, assetVersion));
  safeRenderRegion("cover-background-compare", () => renderCoverBackgroundCompare(draft, assetVersion));
  safeRenderRegion("preview-audio-player", () => syncPreviewAudioPlayer(draft, assetVersion));
  safeRenderRegion("storyboard-view", () => renderStoryboardView(storyboardDraftState, assetVersion));

  workflowStatusSelect.value = draft.workflowStatus || "pending";
  starBtn.textContent = draft.starred ? "取消收藏" : "收藏";

  safeRenderRegion("workflow-map", () => renderWorkflowMap(draft));
  safeRenderRegion("production-progress", () => renderProductionProgress(draft));
  safeRenderRegion("combos", () => renderCombos(draft));
  safeRenderRegion("quality-checks", () => renderQualityChecks(draft.qualityChecks || []));
  safeRenderRegion("export-summary", () => renderExportSummary(draft.exportInfo || null));
  safeRenderRegion("release-control", () => renderReleaseControl(draft));
  safeRenderRegion("export-links", () => syncExportLinks(draft));
  highlightActiveHistoryItem();
  syncPreviewButton();
}

function safeRenderRegion(label, renderFn) {
  try {
    renderFn();
  } catch (error) {
    console.error(`[render:${label}]`, error);
  }
}

function hydrateScriptEditor(scriptSource) {
  if (editTitleAEl) {
    editTitleAEl.value = scriptSource.titleVariants?.a || scriptSource.title || "";
  }
  if (editTitleBEl) {
    editTitleBEl.value = scriptSource.titleVariants?.b || scriptSource.titleVariants?.a || scriptSource.title || "";
  }
  if (editCoverTitleEl) {
    editCoverTitleEl.value = scriptSource.coverTitle || "";
  }
  if (editCoverVisualPromptEl) {
    editCoverVisualPromptEl.value = scriptSource.coverVisualPrompt || "";
  }
  if (editCoverNegativePromptEl) {
    editCoverNegativePromptEl.value = scriptSource.coverNegativePrompt || "";
  }
  if (editCoverSubtitleEl) {
    editCoverSubtitleEl.value = scriptSource.coverSubtitle || "";
  }
  if (editCoverPositionEl) {
    editCoverPositionEl.value = scriptSource.coverTitlePosition || "middle";
  }
  if (editCoverAlignEl) {
    editCoverAlignEl.value = scriptSource.coverTitleAlign || "left";
  }
  if (editCoverSizeEl) {
    editCoverSizeEl.value = scriptSource.coverTitleSize || "large";
  }
  if (editCoverTitleWidthEl) {
    editCoverTitleWidthEl.value = scriptSource.coverTitleWidth || "normal";
  }
  if (editCoverTitleOffsetEl) {
    editCoverTitleOffsetEl.value = String(scriptSource.coverTitleOffset ?? "0");
  }
  if (editCoverTitleXOffsetEl) {
    editCoverTitleXOffsetEl.value = String(scriptSource.coverTitleXOffset ?? "0");
  }
  if (editCoverTitleSpacingEl) {
    editCoverTitleSpacingEl.value = scriptSource.coverTitleSpacing || "normal";
  }
  if (editCoverSubtitlePositionEl) {
    editCoverSubtitlePositionEl.value = scriptSource.coverSubtitlePosition || "below-title";
  }
  if (editCoverSubtitleSizeEl) {
    editCoverSubtitleSizeEl.value = scriptSource.coverSubtitleSize || "small";
  }
  if (editCoverSubtitleAlignEl) {
    editCoverSubtitleAlignEl.value = scriptSource.coverSubtitleAlign || "follow";
  }
  if (editCoverSubtitleOffsetEl) {
    editCoverSubtitleOffsetEl.value = String(scriptSource.coverSubtitleOffset ?? "0");
  }
  if (editCoverSubtitleXOffsetEl) {
    editCoverSubtitleXOffsetEl.value = String(scriptSource.coverSubtitleXOffset ?? "0");
  }
  if (editCoverSubtitleWidthEl) {
    editCoverSubtitleWidthEl.value = scriptSource.coverSubtitleWidth || "normal";
  }
  if (editHookEl) {
    editHookEl.value = scriptSource.hook || "";
  }
  if (editSection1El) {
    editSection1El.value = scriptSource.sections?.[0] || "";
  }
  if (editSection2El) {
    editSection2El.value = scriptSource.sections?.[1] || "";
  }
  if (editSection3El) {
    editSection3El.value = scriptSource.sections?.[2] || "";
  }
  if (editCtaEl) {
    editCtaEl.value = scriptSource.cta || "";
  }
}

function syncPreviewAudioPlayer(draft, assetVersion) {
  if (!audioEl) {
    return;
  }

  const fallbackVoicePath = draft?.id ? `data/drafts/${draft.id}/voice.mp3` : "";
  const resolvedVoicePath = draft?.assets?.voicePath || ((draft?.subtitleEntries || []).length ? fallbackVoicePath : "");

  if (resolvedVoicePath) {
    const mediaUrl = toVersionedMediaUrl(resolvedVoicePath, assetVersion);
    audioEl.src = mediaUrl;
    audioEl.classList.remove("is-hidden");
    audioEl.hidden = false;
    audioEl.removeAttribute("hidden");
    audioEl.style.display = "block";
    previewAudioEmptyEl?.classList.add("hidden");
    if (previewAudioEmptyEl) {
      previewAudioEmptyEl.hidden = true;
      previewAudioEmptyEl.setAttribute("hidden", "hidden");
      previewAudioEmptyEl.style.display = "none";
    }
    previewAudioLinkEl?.classList.remove("is-hidden");
    if (previewAudioLinkEl) {
      previewAudioLinkEl.href = mediaUrl;
    }
    audioEl.load();
    return;
  }

  audioEl.removeAttribute("src");
  audioEl.load();
  audioEl.classList.add("is-hidden");
  audioEl.hidden = true;
  audioEl.setAttribute("hidden", "hidden");
  audioEl.style.display = "none";
  previewAudioLinkEl?.classList.add("is-hidden");
  if (previewAudioLinkEl) {
    previewAudioLinkEl.removeAttribute("href");
  }
  previewAudioEmptyEl?.classList.remove("hidden");
  if (previewAudioEmptyEl) {
    previewAudioEmptyEl.hidden = false;
    previewAudioEmptyEl.removeAttribute("hidden");
    previewAudioEmptyEl.style.display = "";
  }
}

function renderProductionProgress(draft) {
  if (productionProgressStripEl) {
    const hasAudioAssets = Boolean(draft?.assets?.voicePath) || Boolean((draft?.subtitleEntries || []).length);
    const hasCoverAssets = Boolean(draft?.assets?.coverPath) || Boolean(draft?.coverImage);
    const hasSceneAssets = Boolean((draft?.storyboard || []).some((scene) => scene?.assetPath));

    productionProgressStripEl.querySelectorAll("[data-production-progress]").forEach((node) => {
      const step = node.dataset.productionProgress;
      const active =
        step === "script" ||
        (step === "audio" && hasAudioAssets) ||
        (step === "cover" && hasCoverAssets) ||
        (step === "scene" && hasSceneAssets);
      node.classList.toggle("is-active", active);
    });
  }

  if (scriptReviewTitleEl) {
    scriptReviewTitleEl.textContent = "当前口播文稿参考";
  }
  if (scriptReviewLeadEl) {
    scriptReviewLeadEl.textContent = currentProductionStage === "script" ? "展开文稿参考" : "展开当前文稿";
  }
  if (scriptReviewTextEl) {
    scriptReviewTextEl.textContent = currentProductionStage === "script"
      ? "这里只保留当前文稿参考，方便先改表达和节奏；真实口播与字幕结果进入第二步后再统一复核。"
      : "这里只保留当前文稿参考，方便边改边对照；口播试听、字幕切分和封面结果请回第二步查看。";
  }
  if (scriptViewTitleEl) {
    scriptViewTitleEl.textContent = currentProductionStage === "script" ? "当前脚本文稿" : "当前口播文稿";
  }
  if (subtitleViewTitleEl) {
    subtitleViewTitleEl.textContent = currentProductionStage === "script" ? "预计切分" : "字幕切分";
  }
  if (subtitleMetaEl && currentProductionStage === "script" && !(draft?.subtitleEntries || []).length) {
    subtitleMetaEl.textContent = "脚本期只显示预计切分，尚未生成真实字幕时间轴";
  }
}

function renderCombos(draft) {
  if (!comboGrid) {
    return;
  }
  const activeComboId = `${draft.activeTitleVariant || "a"}-${draft.coverStyle || "report"}`;
  const assetVersion = buildAssetVersion(draft);
  comboGrid.innerHTML = (draft.comboOptions || [])
    .map((combo) => {
      const isActive = combo.id === activeComboId ? " active" : "";
      const titleVariantLabel = combo.id.startsWith("a-") ? "标题 A" : "标题 B";
      const buttonLabel = combo.id === activeComboId ? "当前使用中" : "切换到这版";
      return `
        <article class="combo-card${isActive}">
          <div class="combo-applied-flag">已应用</div>
          <div class="combo-card-top">
            <span class="combo-badge">${titleVariantLabel}</span>
            <span class="combo-badge combo-badge-muted">${combo.coverStyleLabel}</span>
          </div>
          <div class="combo-thumb-shell">
            <div class="combo-thumb-placeholder"></div>
            <img src="${toVersionedMediaUrl(combo.coverPath, assetVersion)}" alt="${combo.label}" class="combo-thumb is-hidden" data-fallback-src="${toVersionedMediaUrl(draft.assets.coverPath, assetVersion)}" />
          </div>
          <p class="combo-title">${combo.title}</p>
          <button type="button" class="switch-btn combo-apply" data-combo-id="${combo.id}" ${combo.id === activeComboId ? "disabled" : ""}>${buttonLabel}</button>
        </article>
      `;
    })
    .join("");

  comboGrid.querySelectorAll("img[data-fallback-src]").forEach((image) => {
    image.addEventListener("load", () => {
      image.closest(".combo-card")?.classList.remove("combo-card-no-image");
      image.closest(".combo-thumb-shell")?.classList.add("is-ready");
      image.classList.remove("is-hidden");
      image.dataset.fallbackApplied = "false";
    });
    image.addEventListener("error", () => {
      const fallbackSrc = image.dataset.fallbackSrc;
      const fallbackApplied = image.dataset.fallbackApplied === "true";
      if (fallbackSrc && !fallbackApplied) {
        image.dataset.fallbackApplied = "true";
        image.src = fallbackSrc;
      } else {
        image.closest(".combo-card")?.classList.add("combo-card-no-image");
        image.closest(".combo-thumb-shell")?.classList.remove("is-ready");
        image.classList.add("is-hidden");
      }
    });
  });

  comboGrid.querySelectorAll("[data-combo-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      await applyCombo(button.dataset.comboId);
    });
  });
}

function renderWorkflowMap(draft) {
  if (!workflowMapEl) {
    return;
  }

  const checks = draft.qualityChecks || [];
  const exportInfo = draft.exportInfo || {};
  const hasUnsaved = hasUnsavedChanges;
  const hasChecks = checks.length > 0;
  const hasBlockingCheck = checks.some((item) => item.level === "error");
  const exportReady = hasChecks && !hasBlockingCheck;
  const videoReady = Boolean(exportInfo.videoReady);

  const recommendation = getWorkflowRecommendation(draft, {
    hasUnsaved,
    hasChecks,
    hasBlockingCheck,
    exportReady,
    videoReady,
    stage: currentProductionStage,
  });

  const steps = [
    {
      index: "1",
      title: "脚本确认",
      detail: "先确认口播稿、段落作用和预计时长。",
      state: recommendation.phase === "script" ? "current" : "ready",
      label: recommendation.phase === "script" ? "进行中" : "已确认",
    },
    {
      index: "2",
      title: "试产预览",
      detail: "确认脚本后，再看当前半成品方向是否成立。",
      state: recommendation.phase === "preview" ? "current" : currentProductionStage === "script" ? "waiting" : "ready",
      label: recommendation.phase === "preview" ? "进行中" : currentProductionStage === "script" ? "未开始" : "已进入",
    },
    {
      index: "3",
      title: "文案修订",
      detail: hasUnsaved ? "你有未保存的文案修改，建议先保存。" : "需要时再调整正文、标题和结尾引导。",
      state: hasUnsaved ? "current" : "waiting",
      label: hasUnsaved ? "待保存" : "按需进行",
    },
    {
      index: "4",
      title: "分镜精修",
      detail: "当节奏、镜头顺序或表达结构不顺时，再进入这里。",
      state: "waiting",
      label: "后置处理",
    },
    {
      index: "5",
      title: "导出检查",
      detail: exportReady ? "检查已通过，可以进入最终导出。" : "导出前先跑一次检查，确认素材和结构可用。",
      state: exportReady ? "ready" : hasChecks ? "current" : "waiting",
      label: exportReady ? "已通过" : hasChecks ? "待处理" : "未开始",
    },
    {
      index: "6",
      title: "生成成片",
      detail: videoReady ? "已经产出成片，可以继续复核或回改。" : "通过检查后，再执行最终导出。",
      state: videoReady ? "ready" : "waiting",
      label: videoReady ? "已完成" : "未开始",
    },
  ];

  workflowMapEl.innerHTML = steps.map((step) => `
    <article class="workflow-step">
      <div class="workflow-step-head">
        <span class="workflow-step-index">${step.index}</span>
        <span class="workflow-step-state is-${step.state}">${step.label}</span>
      </div>
      <strong>${step.title}</strong>
      <p>${step.detail}</p>
    </article>
  `).join("");

  renderWorkflowControl(recommendation, draft);
}

function renderWorkflowControl(recommendation, draft) {
  if (workflowPhaseTitleEl) {
    workflowPhaseTitleEl.textContent = recommendation.phaseTitle;
  }
  if (workflowPhaseTextEl) {
    workflowPhaseTextEl.textContent = recommendation.phaseText;
  }
  applyProductionStageTone(workflowPhaseCardEl, currentProductionStage, "workflow-phase-card");
  if (workflowDirtyChipsEl) {
    workflowDirtyChipsEl.innerHTML = recommendation.dirtyChips.map((chip) => (
      `<button type="button" class="workflow-dirty-chip is-${chip.tone}" data-dirty-target="${chip.target || "#section-preview"}">${chip.label}</button>`
    )).join("");
  }
  if (workflowRecommendTitleEl) {
    workflowRecommendTitleEl.textContent = recommendation.title;
  }
  if (workflowRecommendTextEl) {
    workflowRecommendTextEl.textContent = recommendation.text;
  }
  if (manageRecommendTitleEl) {
    manageRecommendTitleEl.textContent = recommendation.title;
  }
  if (manageRecommendTextEl) {
    manageRecommendTextEl.textContent = recommendation.text;
  }

  const isStartActionTarget = ["#partial-audio-btn", "#partial-cover-btn", "#partial-scene-btn", "#full-trial-btn"].includes(recommendation.target || "");
  [workflowRecommendBtn, manageRecommendBtn].forEach((button) => {
    if (!button) {
      return;
    }
    button.textContent = recommendation.buttonLabel;
    button.dataset.recommendAction = recommendation.action;
    button.dataset.recommendTarget = recommendation.target || "";
  });
  if (manageRecommendBtn) {
    manageRecommendBtn.classList.toggle("hidden", isStartActionTarget);
  }

  updateTrialActionState(recommendation);
  renderSectionRecommendations(recommendation, draft);
  renderPreviewRecommendations(recommendation, draft);
  renderExportRecommendations(recommendation, draft);
}

function renderSectionRecommendations(recommendation, draft) {
  const sceneLabel = storyboardDraftState[currentStoryboardIndex]?.sceneTitle || `Scene ${currentStoryboardIndex + 1 || 1}`;

  if (editorRecommendTitleEl) {
    if (currentProductionStage === "script") {
      editorRecommendTitleEl.textContent = "先确认预制脚本";
    } else if (hasUnsavedChanges && currentDirtyState.cover && !currentDirtyState.audio && !currentDirtyState.storyboard) {
      editorRecommendTitleEl.textContent = "先同步封面";
    } else if (hasUnsavedChanges && currentDirtyState.audio) {
      editorRecommendTitleEl.textContent = "先同步口播 / 字幕";
    } else if (hasUnsavedChanges && currentDirtyState.script) {
      editorRecommendTitleEl.textContent = "先保存当前文案修改";
    } else {
      editorRecommendTitleEl.textContent = "先回听当前口播";
    }
  }

  if (editorRecommendTextEl) {
    if (currentProductionStage === "script") {
      editorRecommendTextEl.textContent = "当前还在脚本门禁阶段。先把段落作用和预计时长确认下来，再进入文案同步和试产。";
    } else if (hasUnsavedChanges && currentDirtyState.cover && !currentDirtyState.audio && !currentDirtyState.storyboard) {
      editorRecommendTextEl.textContent = "这一轮主要影响封面层。先同步封面，再回看预览里标题和封面是否还在一个方向上。";
    } else if (hasUnsavedChanges && currentDirtyState.audio) {
      editorRecommendTextEl.textContent = "这一轮改动会影响口播和字幕。先同步音频层，并自动校准字幕时间，再听节奏和停顿是否顺。";
    } else if (hasUnsavedChanges && currentDirtyState.script) {
      editorRecommendTextEl.textContent = "这一轮主要是文案层改动。先保存当前草稿，再判断下一步是回听口播还是直接看预览。";
    } else {
      editorRecommendTextEl.textContent = "当前文案层已经同步。这里更适合复核表达、顺口程度和字幕时间切分，而不是继续盲改。";
    }
  }

  if (storyboardRecommendTitleEl) {
    if (currentProductionStage === "script") {
      storyboardRecommendTitleEl.textContent = "先别急着动分镜";
    } else if (hasUnsavedChanges && currentDirtyState.storyboard) {
      storyboardRecommendTitleEl.textContent = "先保存分镜修改";
    } else if (storyboardDraftState.length) {
      storyboardRecommendTitleEl.textContent = `优先看 ${sceneLabel}`;
    } else {
      storyboardRecommendTitleEl.textContent = "等待分镜进入可编辑状态";
    }
  }

  if (storyboardRecommendTextEl) {
    if (currentProductionStage === "script") {
      storyboardRecommendTextEl.textContent = "分镜是后置精修层。先确认脚本，再进入生产，最后才值得花时间做镜头级修改。";
    } else if (hasUnsavedChanges && currentDirtyState.storyboard) {
      storyboardRecommendTextEl.textContent = "你已经改了镜头内容或节奏。先保存当前分镜，再决定是否重建当前镜头，不要立刻整条重跑。";
    } else if (storyboardDraftState.length) {
      storyboardRecommendTextEl.textContent = `如果只是 ${sceneLabel} 这一段节奏或素材有问题，优先补当前镜头素材；只有整体不顺，才继续进入逐镜精修和顺序微调。`;
    } else {
      storyboardRecommendTextEl.textContent = "当前还没有可操作的镜头素材。先从上面那一步补当前镜头，再进入这里做逐镜精修。";
    }
  }
}

function renderPreviewRecommendations(recommendation, draft) {
  if (!previewRecommendTitleEl || !previewRecommendTextEl || !previewComboTextEl) {
    return;
  }

  const sceneLabel = storyboardDraftState[currentStoryboardIndex]?.sceneTitle || `Scene ${currentStoryboardIndex + 1 || 1}`;
  const coverStyleLabel = draft?.coverStyleLabel || "行业报告风";

  if (currentProductionStage === "script") {
    currentPreviewReviewLabel = "预制脚本门禁";
    previewRecommendTitleEl.textContent = "先别急着看成片";
    previewRecommendTextEl.textContent = "当前还在脚本确认阶段。先看段落作用、时长和整体节奏，确认后再进入封面、口播和成片预览。";
    previewComboTextEl.textContent = "脚本还没放行到试产，这里先不用判断成片方向。";
    updatePreviewFocusChip();
    return;
  }

  if (hasUnsavedChanges && currentDirtyState.cover && !currentDirtyState.audio && !currentDirtyState.storyboard) {
    currentPreviewReviewLabel = "标题与封面匹配";
    previewRecommendTitleEl.textContent = "先看标题和封面是否还同向";
    previewRecommendTextEl.textContent = `这一轮主要动了封面层。先看封面标题、副标题和 ${coverStyleLabel} 是否仍然支撑当前标题判断。`;
    previewComboTextEl.textContent = "这次先复核第一屏冲击力，不急着听整段口播。";
    updatePreviewFocusChip();
    return;
  }

  if (hasUnsavedChanges && currentDirtyState.audio) {
    currentPreviewReviewLabel = "口播节奏";
    previewRecommendTitleEl.textContent = "先听 Hook 和停顿节奏";
    previewRecommendTextEl.textContent = "这一轮主要影响口播和字幕。先听开头 10-15 秒是否顺耳、停顿是否自然，再决定要不要继续改正文。";
    previewComboTextEl.textContent = "这一轮优先判断口播节奏，不需要先盯分镜细节。";
    updatePreviewFocusChip();
    return;
  }

  if (hasUnsavedChanges && currentDirtyState.storyboard) {
    currentPreviewReviewLabel = sceneLabel;
    previewRecommendTitleEl.textContent = `先看 ${sceneLabel} 是否破坏整体节奏`;
    previewRecommendTextEl.textContent = "这一轮主要影响镜头层。先判断局部 scene 是否让整体断掉，再决定是重建当前镜头还是继续完整试产。";
    previewComboTextEl.textContent = `先盯住 ${sceneLabel} 的视觉节奏，不必马上回看整条。`;
    updatePreviewFocusChip();
    return;
  }

  if (recommendation?.phase === "export") {
    currentPreviewReviewLabel = "导出前复核";
    previewRecommendTitleEl.textContent = "先做导出前最后复核";
    previewRecommendTextEl.textContent = "现在重点不是继续改，而是确认第一屏、口播结尾和关键信息表达是否都已经能直接发。";
    previewComboTextEl.textContent = "这轮预览更像发布前复核：确认整体没有明显短板即可。";
    updatePreviewFocusChip();
    return;
  }

  if (recommendation?.phase === "ready") {
    currentPreviewReviewLabel = "最终成片";
    previewRecommendTitleEl.textContent = "先复核已生成成片";
    previewRecommendTextEl.textContent = "成片已经出来了。先看整体完成度和发布感，再决定是否回到文案、口播或分镜层继续微调。";
    previewComboTextEl.textContent = "当前已经有成片结果，这里优先做发布视角的整体复核。";
    updatePreviewFocusChip();
    return;
  }

  currentPreviewReviewLabel = "整体成片";
  previewRecommendTitleEl.textContent = "先看标题、封面和口播是否同向";
  previewRecommendTextEl.textContent = "先判断这版的第一屏冲击力、标题表达和口播语气是不是在一个方向上，再决定要不要继续精修。";
  previewComboTextEl.textContent = `当前方案：标题 ${String(currentTitleVariant || "a").toUpperCase()} + ${coverStyleLabel}，先判断这一版值不值得继续推进。`;
  updatePreviewFocusChip();
}

function renderExportRecommendations(recommendation, draft) {
  if (exportRecommendTitleEl) {
    if (currentProductionStage === "script") {
      exportRecommendTitleEl.textContent = "先别急着进导出";
    } else if (hasUnsavedChanges) {
      exportRecommendTitleEl.textContent = "先同步当前修改";
    } else if (!draft?.qualityChecks?.length) {
      exportRecommendTitleEl.textContent = "先跑一次导出前检查";
    } else if ((draft.qualityChecks || []).some((item) => item.level === "error")) {
      exportRecommendTitleEl.textContent = "先处理阻塞项";
    } else if (draft?.exportInfo?.videoReady) {
      exportRecommendTitleEl.textContent = "先复核已导出的成片";
    } else {
      exportRecommendTitleEl.textContent = "可以进入最终导出";
    }
  }

  if (exportRecommendTextEl) {
    if (currentProductionStage === "script") {
      exportRecommendTextEl.textContent = "当前还在脚本门禁阶段。导出区现在只需要作为后续目标，不需要提前判断。";
    } else if (hasUnsavedChanges) {
      exportRecommendTextEl.textContent = "导出判断建立在最新草稿之上。先同步当前修改，再看检查和导出决策会更准。";
    } else if (!draft?.qualityChecks?.length) {
      exportRecommendTextEl.textContent = "先拿到一次检查结论，系统才能明确告诉你现在是可导出、待修改还是建议人工复核。";
    } else if ((draft.qualityChecks || []).some((item) => item.level === "error")) {
      exportRecommendTextEl.textContent = "当前还有阻塞项，不适合直接出片。先回到文案或分镜区处理，再回来做最终判断。";
    } else if (draft?.exportInfo?.videoReady) {
      exportRecommendTextEl.textContent = "现在重点不是再跑流程，而是从发布视角复核这条成片是否已经可以直接发。";
    } else {
      exportRecommendTextEl.textContent = "检查已经基本通过。这里主要做最后确认：要不要立刻导出，还是再看一眼成片预览。";
    }
  }
}

function renderReleaseControl(draft) {
  return renderReleaseControlView(draft, {
    releaseControlEl,
    releaseControlTitleEl,
    releaseControlTextEl,
    releaseControlMetaEl,
    currentProductionStage,
    hasUnsavedChanges,
  });
}

function getWorkflowRecommendation(draft, state) {
  const checks = draft?.qualityChecks || [];
  const exportInfo = draft?.exportInfo || {};
  const hasAudioAssets = Boolean(draft?.assets?.voicePath) || Boolean((draft?.subtitleEntries || []).length);
  const hasCoverAssets = Boolean(draft?.assets?.coverPath) || Boolean(draft?.coverImage);
  const hasSceneAssets = Boolean((draft?.storyboard || []).length);
  const hasCoreProductionAssets = hasAudioAssets && hasCoverAssets && hasSceneAssets;
  const coverDirty = currentDirtyState.cover;
  const storyboardDirty = currentDirtyState.storyboard;
  const scriptDirty = currentDirtyState.script;
  const audioDirty = currentDirtyState.audio;
  const coverOnlyDirty = coverDirty && !scriptDirty && !audioDirty && !storyboardDirty;
  const audioOnlyDirty = audioDirty && !coverDirty && !storyboardDirty;
  const titleOnlyDirty = scriptDirty && !audioDirty && !coverDirty && !storyboardDirty;
  const dirtyChips = [
    { label: scriptDirty ? "文案待同步" : "文案已同步", tone: scriptDirty ? "dirty" : "clean", target: "#section-script" },
    {
      label: state.stage === "script" || audioDirty
        ? "口播待同步"
        : "口播已同步",
      tone: state.stage === "script"
        ? "dirty"
        : audioDirty
          ? "dirty"
          : "clean",
      target: "#section-script",
    },
    { label: storyboardDirty ? "分镜待同步" : "分镜已同步", tone: storyboardDirty ? "dirty" : "clean", target: "#section-storyboard" },
    { label: coverDirty ? "封面待同步" : "封面已同步", tone: coverDirty ? "dirty" : "clean", target: "#section-preview" },
  ];

  if (state.stage === "script") {
    return {
      phase: "script",
      phaseTitle: "预制脚本确认",
      phaseText: "先确认口播脚本、段落时长和节奏结构。确认之前，不进入正式试产。",
      dirtyChips,
      title: "先确认预制脚本",
      text: "这一步先把脚本和节奏定下来。这里的保存只是保存修订，不会自动开始口播、封面或镜头生产。",
      buttonLabel: "确认脚本并进入生产",
      action: "click",
      target: "#confirm-script-btn",
      recommendedAction: "light",
    };
  }

  if (state.videoReady || exportInfo.videoReady) {
    return {
      phase: "ready",
      phaseTitle: "可导出复核",
      phaseText: "成片已经生成，接下来主要做复核、回改或直接用于发布。",
      dirtyChips,
      title: "查看导出成片",
      text: "当前已经有成片结果，先复核最终效果，再决定是否继续回改。",
      buttonLabel: "查看导出区",
      action: "scroll",
      target: "#section-export",
      recommendedAction: "full",
    };
  }

  if (hasUnsavedChanges) {
    const prioritizeStoryboard = storyboardDirty && !scriptDirty && !audioDirty;
    const prioritizeCover = coverOnlyDirty;
    const prioritizeAudio = audioOnlyDirty;
    const prioritizeTitle = titleOnlyDirty;
    return {
      phase: prioritizeStoryboard ? "storyboard" : prioritizeCover ? "cover" : prioritizeAudio ? "audio" : "script",
      phaseTitle: prioritizeStoryboard ? "分镜修订中" : prioritizeCover ? "封面修订中" : prioritizeAudio ? "口播修订中" : "文案修订中",
      phaseText: prioritizeStoryboard
        ? "当前有未保存的分镜修改，建议先同步当前草稿，再决定是否局部重建镜头。"
        : prioritizeCover
          ? "当前只有封面层发生变化，建议先同步封面，再决定是否继续做轻量试产。"
        : prioritizeAudio
          ? "当前改动主要影响口播和字幕，建议先同步音频层，再决定要不要继续完整试产。"
        : "当前有未保存的修改，先保存这轮文案修订，再决定什么时候开始口播、封面或镜头生产。",
      dirtyChips,
      title: prioritizeStoryboard
        ? "先保存当前分镜修改"
        : prioritizeCover
          ? "先同步封面修改"
          : prioritizeAudio
            ? "先同步口播 / 字幕"
            : prioritizeTitle
              ? "先同步标题修改"
              : "先保存文案修改",
      text: prioritizeStoryboard
        ? "你刚调整了镜头内容或节奏，建议先保存草稿，再执行局部重建。"
        : prioritizeCover
          ? "你刚修改了封面标题或副标题。当前实现会复用轻量同步路径刷新封面，不必先跑完整试产。"
        : prioritizeAudio
          ? "你刚改动了正文、CTA 或时长。先同步口播和字幕，再听这一版是否顺，再决定要不要动分镜。"
        : prioritizeTitle
          ? "你刚改的是标题层，先同步当前草稿，再回看预览里标题和封面是否匹配。"
              : "你刚改动了文案。先把这轮修订存下来，不要急着整包同步，确认后再按需开始生产。",
      buttonLabel: prioritizeCover
        ? "同步封面"
        : prioritizeAudio
          ? "同步口播 / 字幕"
          : prioritizeTitle
            ? "同步标题修改"
            : "保存当前修改",
      action: "click",
      target: prioritizeStoryboard
        ? "#save-draft-btn"
        : prioritizeCover
          ? "#partial-cover-btn"
          : prioritizeAudio
            ? "#partial-audio-btn"
            : "#save-draft-btn",
      recommendedAction: prioritizeStoryboard || prioritizeCover || prioritizeAudio ? "partial" : "light",
    };
  }

  if (storyboardDirty) {
    return {
      phase: "storyboard",
      phaseTitle: "分镜待同步",
      phaseText: "分镜结构已经发生变化，建议先同步受影响镜头，再决定是否完整试产。",
      dirtyChips,
      title: "先同步当前镜头",
      text: "如果只是局部镜头有问题，优先同步当前镜头，不要直接整条完整试产。",
      buttonLabel: "同步当前镜头",
      action: "click",
      target: "#partial-scene-btn",
      recommendedAction: "partial",
    };
  }

  if (!state.hasChecks) {
    return {
      phase: "preview",
      phaseTitle: hasCoreProductionAssets ? "已完成首轮生产" : "已进入生产",
      phaseText: hasCoreProductionAssets
        ? "当前草稿已经有封面、口播、字幕和分镜。下一步更适合先做导出前检查，而不是重新从头开始。"
        : "现在进入按需生产阶段。先做口播与字幕，再看封面，镜头生产后置。",
      dirtyChips,
      title: hasCoreProductionAssets ? "先做导出前检查" : "先开始这一轮生产",
      text: hasCoreProductionAssets
        ? "这条草稿的生产资产已经基本齐了。先做一次导出前检查，确认现在离可出片还差什么。"
        : "如果你刚进入生产阶段，先生成口播与字幕，再决定是否补封面；镜头生产放到后面，准备判断能否出片时再做导出前检查。",
      buttonLabel: hasCoreProductionAssets ? "导出前检查" : "查看当前预览",
      action: hasCoreProductionAssets ? "click" : "scroll",
      target: hasCoreProductionAssets ? "#full-trial-btn" : "#section-preview",
      recommendedAction: hasCoreProductionAssets ? "full" : "partial",
    };
  }

  if (state.hasBlockingCheck) {
    return {
      phase: "revise",
      phaseTitle: "回改处理中",
      phaseText: "检查已发现阻塞项，建议先回到文案或分镜区处理问题，再继续试产。",
      dirtyChips,
      title: "先回到文案区处理问题",
      text: "当前还不适合直接导出，先解决阻塞项，再重新检查会更高效。",
      buttonLabel: "去改文案",
      action: "scroll",
      target: "#section-script",
      recommendedAction: "light",
    };
  }

  if (state.exportReady) {
    return {
      phase: "export",
      phaseTitle: "准备导出",
      phaseText: "关键检查已经通过，接下来可以进入最终导出，也可以在导出前再做一次复核。",
      dirtyChips,
      title: "可以执行最终导出",
      text: "当前没有明显阻塞项，如果这版已经满意，就可以直接导出成片。",
      buttonLabel: "确认并导出",
      action: "click",
      target: "#export-btn",
      recommendedAction: "full",
    };
  }

  return {
    phase: "preview",
    phaseTitle: "试产打磨",
    phaseText: "先用当前半成品判断最大问题，再决定进入文案、口播还是分镜修订。",
    dirtyChips,
    title: "先看当前预览",
    text: "先确认方向是否成立，再决定下一步进入哪种修订，不要一开始就扎进细节。",
    buttonLabel: "查看预览",
    action: "scroll",
    target: "#section-preview",
    recommendedAction: "light",
  };
}

function updateTrialActionState(recommendation) {
  const sceneLabel = storyboardDraftState[currentStoryboardIndex]?.sceneTitle || `Scene ${currentStoryboardIndex + 1 || 1}`;
  const actionState = getProductionActionState(currentDraftId);
  const sceneDisabled = currentProductionStage === "script" || !currentDraftId || !storyboardDraftState.length || isPreviewDraft();
  const audioNeedsSync = !currentDraft?.assets?.voicePath || !(currentDraft?.subtitleEntries || []).length;
  const coverNeedsSync = !currentDraft?.assets?.coverPath && !currentDraft?.coverImage;
  const hasAudioAssets = !audioNeedsSync;
  const hasCoverAssets = !coverNeedsSync;
  const hasSceneAssets = Boolean(storyboardDraftState.length) || Boolean((currentDraft?.storyboard || []).some((scene) => scene?.assetPath));
  const coverHasRun = Boolean(actionState.cover);
  const sceneHasRun = Boolean(actionState.scene);
  const hasCoreProductionAssets = hasAudioAssets && hasCoverAssets && hasSceneAssets;
  const audioDisabled = currentProductionStage === "script" || !currentDraftId || isPreviewDraft();
  const coverDisabled = currentProductionStage === "script" || !currentDraftId || isPreviewDraft();

  if (productionStartTitleEl) {
    productionStartTitleEl.textContent = currentProductionStage === "script"
      ? "脚本确认后再开始生产"
      : hasCoreProductionAssets
        ? "当前草稿已具备首轮资产"
        : hasAudioAssets || hasCoverAssets || hasSceneAssets
          ? "继续补齐这一轮生产"
          : "先口播字幕，再封面，镜头后置";
  }

  if (productionStartTextEl) {
    productionStartTextEl.textContent = currentProductionStage === "script"
      ? "先确认脚本，再进入口播、封面、镜头和导出前检查。"
      : hasCoreProductionAssets
        ? "现在更建议先做导出前检查；如果这版还不满意，再按需重新同步口播、封面或镜头。"
          : hasAudioAssets || hasCoverAssets || hasSceneAssets
            ? "当前已有部分产物。继续补齐剩余部分，或者先做一次导出前检查。"
            : "先生成口播与字幕，再决定是否补封面，镜头生产后置。";
  }

  if (partialAudioBtn) {
    partialAudioBtn.disabled = audioDisabled;
    partialAudioBtn.textContent = currentProductionStage === "script"
      ? "先确认脚本"
      : audioNeedsSync
        ? "开始口播 / 字幕"
      : hasUnsavedChanges && currentDirtyState.audio
        ? "同步口播 / 字幕"
        : "重新同步口播 / 字幕";
  }
  if (editorAudioBtn) {
    editorAudioBtn.disabled = audioDisabled;
    editorAudioBtn.textContent = currentProductionStage === "script"
      ? "先确认脚本"
      : audioNeedsSync
        ? "开始口播 / 字幕"
      : hasUnsavedChanges && currentDirtyState.audio
        ? "同步口播 / 字幕"
        : "重新同步口播 / 字幕";
  }
  if (partialCoverBtn) {
    partialCoverBtn.disabled = coverDisabled;
    partialCoverBtn.textContent = currentProductionStage === "script"
      ? "脚本确认后再做封面"
      : !coverHasRun
        ? "生成封面"
      : coverNeedsSync
        ? "生成封面"
      : hasUnsavedChanges && currentDirtyState.cover
        ? "仅更新叠字，不重抽背景"
        : "重新同步封面";
  }
  if (editorCoverBtn) {
    editorCoverBtn.disabled = coverDisabled;
    editorCoverBtn.textContent = currentProductionStage === "script"
      ? "脚本确认后再做封面"
      : !coverHasRun
        ? "生成封面"
      : coverNeedsSync
        ? "生成封面"
      : hasUnsavedChanges && currentDirtyState.cover
        ? "仅更新叠字，不重抽背景"
        : "重新同步封面";
  }
  if (rerollCoverBackgroundBtn) {
    rerollCoverBackgroundBtn.disabled = coverDisabled;
    rerollCoverBackgroundBtn.textContent = currentProductionStage === "script" ? "脚本确认后可重抽背景" : "只重抽背景";
  }
  if (partialSceneBtn) {
    partialSceneBtn.disabled = sceneDisabled;
    partialSceneBtn.textContent = currentProductionStage === "script"
      ? "脚本确认后可同步镜头"
      : storyboardDraftState.length
        ? `补当前镜头并继续：${sceneLabel}`
        : "当前无可同步镜头";
  }
  if (storyboardPartialBtn) {
    storyboardPartialBtn.disabled = sceneDisabled;
    storyboardPartialBtn.textContent = currentProductionStage === "script"
      ? "脚本确认后可同步镜头"
      : storyboardDraftState.length
        ? `补当前镜头并继续：${sceneLabel}`
        : "当前无可同步镜头";
  }
  if (fullTrialBtn) {
    fullTrialBtn.disabled = currentProductionStage === "script";
    fullTrialBtn.textContent = hasCoreProductionAssets ? "先做导出前检查" : "导出前检查";
  }

  if (partialAudioMetaEl) {
    partialAudioMetaEl.textContent = currentProductionStage === "script"
      ? "这一步现在还没解锁。先确认脚本，进入生产后再从这里生成真实口播与字幕。"
      : audioNeedsSync
        ? "还没有口播和字幕。从这里开始第一轮生成，并自动校准字幕时间"
        : hasUnsavedChanges && currentDirtyState.audio
          ? "正文或时长变了，先重生成口播和字幕，再听这一版是否顺"
          : "当前已生成口播和字幕，如需重做这一轮听感，可从这里重新同步并校准时间";
    partialAudioMetaEl.classList.toggle("is-dirty", audioNeedsSync || (hasUnsavedChanges && currentDirtyState.audio));
    partialAudioMetaEl.classList.toggle("is-clean", !(audioNeedsSync || (hasUnsavedChanges && currentDirtyState.audio)));
  }
  if (partialAudioStatusEl) {
    partialAudioStatusEl.textContent = currentProductionStage === "script"
      ? "当前状态：脚本确认后解锁"
      : activeProductionTask === "audio"
        ? "当前状态：生成中"
        : hasAudioAssets
          ? (hasUnsavedChanges && currentDirtyState.audio ? "当前状态：待更新" : "当前状态：已完成")
          : "当前状态：未开始";
    partialAudioStatusEl.classList.toggle("is-active", activeProductionTask === "audio");
    partialAudioStatusEl.classList.toggle("is-ready", hasAudioAssets && !(hasUnsavedChanges && currentDirtyState.audio));
  }
  if (previewAudioStatusEl) {
    previewAudioStatusEl.textContent = currentProductionStage === "script"
      ? "当前状态：仅脚本预演"
      : activeProductionTask === "audio"
        ? "当前状态：生成中"
        : hasAudioAssets
          ? (hasUnsavedChanges && currentDirtyState.audio ? "当前状态：待更新" : "当前状态：已完成")
          : "当前状态：未开始";
    previewAudioStatusEl.classList.toggle("is-active", activeProductionTask === "audio");
    previewAudioStatusEl.classList.toggle("is-ready", hasAudioAssets && !(hasUnsavedChanges && currentDirtyState.audio));
  }
  if (previewAudioTextEl) {
    previewAudioTextEl.textContent = currentProductionStage === "script"
      ? "当前这里只展示口播稿预演和预计切分，不会自动生成真实音频。"
      : activeProductionTask === "audio"
        ? "正在生成口播并校准字幕时间，完成后这里会直接出现可播放音频和新的字幕切分。"
        : hasAudioAssets
          ? (hasUnsavedChanges && currentDirtyState.audio
            ? "当前已有上一版口播与字幕结果，但这轮文案修改后需要重新同步。"
            : "口播和字幕结果已生成。先听口播，再看字幕切分是否顺。")
          : "还没有口播与字幕结果。先从左侧第一步开始生成，完成后就在这里复核。";
  }
  if (previewAudioMetaEl) {
    previewAudioMetaEl.textContent = currentProductionStage === "script"
      ? "确认脚本并进入生产后，真实口播会生成在这里，播放器也会在这里直接试听。"
      : activeProductionTask === "audio"
        ? "这一轮口播 / 字幕正在生成，完成后会自动刷新这里的播放器和切分列表。"
        : hasAudioAssets
          ? (hasUnsavedChanges && currentDirtyState.audio
            ? "当前显示的是上一版结果，等待这轮文案重新同步。"
            : `最近结果更新时间：${formatDateTime(currentDraft?.updatedAt || currentDraft?.createdAt)}`)
          : "还没有口播与字幕结果。";
  }
  if (partialCoverMetaEl) {
    partialCoverMetaEl.textContent = !coverHasRun
      ? "这一步你还没执行。即使系统已有默认封面，也建议在这里手动确认并生成一次正式封面。"
      : coverNeedsSync
      ? "当前还没有封面。建议在口播方向成立后，再从这里开始第一轮生成"
      : hasUnsavedChanges && currentDirtyState.cover
      ? "封面标题或布局变了，先单独同步封面，不必动口播和镜头"
      : "当前已生成封面，如需重做首屏效果，可从这里重新同步";
    partialCoverMetaEl.classList.toggle("is-dirty", coverNeedsSync || (hasUnsavedChanges && currentDirtyState.cover));
    partialCoverMetaEl.classList.toggle("is-clean", !(coverNeedsSync || (hasUnsavedChanges && currentDirtyState.cover)));
  }
  if (partialCoverStatusEl) {
    partialCoverStatusEl.textContent = currentProductionStage === "script"
      ? "当前状态：等待脚本确认"
      : activeProductionTask === "cover"
        ? "当前状态：生成中"
        : !coverHasRun
          ? "当前状态：未开始"
        : hasCoverAssets
          ? (hasUnsavedChanges && currentDirtyState.cover ? "当前状态：待更新" : "当前状态：已完成")
          : "当前状态：未开始";
    partialCoverStatusEl.classList.toggle("is-active", activeProductionTask === "cover");
    partialCoverStatusEl.classList.toggle("is-ready", hasCoverAssets && !(hasUnsavedChanges && currentDirtyState.cover));
  }
  if (partialSceneMetaEl) {
    partialSceneMetaEl.textContent = currentProductionStage === "script"
      ? "镜头层：脚本确认后再进入 scene 级同步"
      : !sceneHasRun
        ? "这一步你还没执行。默认镜头草案不算正式镜头生产，建议在前两步稳定后再手动开始。"
      : storyboardDraftState.length
        ? `镜头层：建议在口播和封面稳定后，再对 ${sceneLabel} 做局部同步`
        : "镜头层：当前没有可同步的 scene";
    partialSceneMetaEl.classList.toggle("is-dirty", !sceneDisabled && Boolean(storyboardDraftState.length));
    partialSceneMetaEl.classList.toggle("is-clean", sceneDisabled || !storyboardDraftState.length);
  }
  if (partialSceneStatusEl) {
    partialSceneStatusEl.textContent = currentProductionStage === "script"
      ? "当前状态：等待脚本确认"
      : activeProductionTask === "scene"
        ? "当前状态：生成中"
        : !sceneHasRun
          ? "当前状态：未开始"
        : hasSceneAssets
          ? "当前状态：可同步 / 已有镜头"
          : "当前状态：后置未开始";
    partialSceneStatusEl.classList.toggle("is-active", activeProductionTask === "scene");
    partialSceneStatusEl.classList.toggle("is-ready", hasSceneAssets && currentProductionStage !== "script");
  }
  if (fullTrialStatusEl) {
    const hasChecks = Boolean((currentDraft?.qualityChecks || []).length);
    fullTrialStatusEl.textContent = currentProductionStage === "script"
      ? "当前状态：等待脚本确认"
      : activeProductionTask === "check"
        ? "当前状态：检查中"
        : hasChecks
          ? "当前状态：已有检查结论"
          : "当前状态：未开始";
    fullTrialStatusEl.classList.toggle("is-active", activeProductionTask === "check");
    fullTrialStatusEl.classList.toggle("is-ready", hasChecks);
  }

  partialAudioBtn?.closest(".trial-action-card")?.classList.toggle("is-ready", hasAudioAssets && !(hasUnsavedChanges && currentDirtyState.audio));
  partialCoverBtn?.closest(".trial-action-card")?.classList.toggle("is-ready", coverHasRun && hasCoverAssets && !(hasUnsavedChanges && currentDirtyState.cover));

  [
    [partialAudioBtn?.closest(".trial-action-card"), false, audioDisabled],
    [partialCoverBtn?.closest(".trial-action-card"), false, coverDisabled],
    [partialRebuildCardEl, recommendation?.recommendedAction === "partial", sceneDisabled],
    [fullTrialCardEl, recommendation?.recommendedAction === "full" || hasCoreProductionAssets, currentProductionStage === "script"],
  ].forEach(([card, isRecommended, isDisabled]) => {
    card?.classList.toggle("is-recommended", Boolean(isRecommended));
    card?.classList.toggle("is-disabled", Boolean(isDisabled));
  });

  // Re-apply the preview player and release summary on the stable state-update
  // path so these regions do not stay stuck on their HTML defaults even if an
  // earlier render step was skipped or failed.
  if (currentDraft) {
    const assetVersion = buildAssetVersion(currentDraft);
    setupPreviewImage(currentDraft, assetVersion);
    renderCoverSafeOverlay();
    renderCoverBackgroundHistory(currentDraft, assetVersion);
    renderCoverBackgroundCompare(currentDraft, assetVersion);
    syncPreviewAudioPlayer(currentDraft, assetVersion);
    renderReleaseControl(currentDraft);
  }
}

function handleRecommendAction(event) {
  const action = event.currentTarget?.dataset?.recommendAction;
  const target = event.currentTarget?.dataset?.recommendTarget;
  if (!action || !target) {
    return;
  }

  if (action === "scroll") {
    document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (action === "click") {
    document.querySelector(target)?.click();
  }
}

async function handleLightTrial() {
  document.querySelector("#section-preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function handlePartialAudioRebuild() {
  if (currentProductionStage === "script") {
    setStatus("当前还是脚本期。先点“确认脚本并进入生产”，之后第一步才会生成真实口播与字幕。", "info");
    document.querySelector("#section-prep")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (isPreviewDraft()) {
    setStatus("预览模式下不执行真实口播同步。", "info");
    return;
  }

  if (!currentDraftId) {
    setStatus("请先生成或打开一个草稿。", "error");
    return;
  }

  const needsFirstAudioBuild = !currentDraft?.assets?.voicePath || !(currentDraft?.subtitleEntries || []).length;
  partialAudioBtn && (partialAudioBtn.disabled = true);
  editorAudioBtn && (editorAudioBtn.disabled = true);
  try {
    activeProductionTask = "audio";
    updateTrialActionState(getWorkflowRecommendation(currentDraft, {
      hasUnsaved: hasUnsavedChanges,
      hasChecks: Boolean((currentDraft?.qualityChecks || []).length),
      hasBlockingCheck: (currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
      exportReady: Boolean((currentDraft?.qualityChecks || []).length) && !(currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
      videoReady: Boolean(currentDraft?.exportInfo?.videoReady),
      stage: currentProductionStage,
    }));
    setStatus(
      needsFirstAudioBuild
        ? "正在开始生成口播、字幕并校准时间..."
        : hasUnsavedChanges && currentDirtyState.audio
          ? "正在同步最新口播、字幕并校准时间..."
          : "正在重新同步这一轮口播、字幕并校准时间...",
      "working",
    );
    const data = await syncDraftAudioToServer();
    const latestData = await fetchJson(`/api/drafts/${currentDraftId}`);
    markProductionAction(currentDraftId, "audio");
    renderDraft(latestData.draft || data.draft);
    await loadDraftHistory();
    flushSavedEditorState(latestData.draft || data.draft);
    renderWorkflowMap(latestData.draft || data.draft);
    renderReleaseControl(latestData.draft || data.draft);
    setStatus(
      needsFirstAudioBuild
        ? "口播 / 字幕已开始生成，并已进入字幕时间校准。"
        : "口播 / 字幕已同步更新，并已重新校准字幕时间。当前不会顺手重刷封面或分镜。",
      "success",
    );
    document.querySelector("#preview-review-workbench")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } finally {
    activeProductionTask = "";
    if (currentDraft) {
      renderWorkflowMap(currentDraft);
      updateTrialActionState(getWorkflowRecommendation(currentDraft, {
        hasUnsaved: hasUnsavedChanges,
        hasChecks: Boolean((currentDraft?.qualityChecks || []).length),
        hasBlockingCheck: (currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
        exportReady: Boolean((currentDraft?.qualityChecks || []).length) && !(currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
        videoReady: Boolean(currentDraft?.exportInfo?.videoReady),
        stage: currentProductionStage,
      }));
    }
  }
}

async function handlePartialCoverRebuild() {
  if (currentProductionStage === "script") {
    setStatus("脚本阶段先确认文案结构，还不建议进入封面同步。", "info");
    document.querySelector("#section-prep")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (isPreviewDraft()) {
    setStatus("预览模式下不执行真实封面同步。", "info");
    return;
  }

  if (!currentDraftId) {
    setStatus("请先生成或打开一个草稿。", "error");
    return;
  }

  const needsFirstCoverBuild = !currentDraft?.assets?.coverPath && !currentDraft?.coverImage;
  partialCoverBtn && (partialCoverBtn.disabled = true);
  editorCoverBtn && (editorCoverBtn.disabled = true);
  try {
    activeProductionTask = "cover";
    updateTrialActionState(getWorkflowRecommendation(currentDraft, {
      hasUnsaved: hasUnsavedChanges,
      hasChecks: Boolean((currentDraft?.qualityChecks || []).length),
      hasBlockingCheck: (currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
      exportReady: Boolean((currentDraft?.qualityChecks || []).length) && !(currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
      videoReady: Boolean(currentDraft?.exportInfo?.videoReady),
      stage: currentProductionStage,
    }));
    setStatus(
      needsFirstCoverBuild
        ? "正在开始生成封面..."
        : hasUnsavedChanges && currentDirtyState.cover
          ? "正在用当前背景重合成封面叠字，不会重抽背景..."
          : "正在重新同步当前封面...",
      "working",
    );
    const data = await syncDraftCoverToServer();
    markProductionAction(currentDraftId, "cover");
    renderDraft(data.draft);
    await loadDraftHistory();
    flushSavedEditorState(data.draft);
    renderWorkflowMap(data.draft);
    renderReleaseControl(data.draft);
    setStatus(
      needsFirstCoverBuild
        ? "封面已开始生成并同步到当前草稿。"
        : hasUnsavedChanges && currentDirtyState.cover
          ? "封面叠字已更新，当前背景未重抽。"
          : "封面已同步更新。当前不会顺手重刷口播、字幕或分镜。",
      "success",
    );
    document.querySelector("#section-preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } finally {
    activeProductionTask = "";
    if (currentDraft) {
      renderWorkflowMap(currentDraft);
      updateTrialActionState(getWorkflowRecommendation(currentDraft, {
        hasUnsaved: hasUnsavedChanges,
        hasChecks: Boolean((currentDraft?.qualityChecks || []).length),
        hasBlockingCheck: (currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
        exportReady: Boolean((currentDraft?.qualityChecks || []).length) && !(currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
        videoReady: Boolean(currentDraft?.exportInfo?.videoReady),
        stage: currentProductionStage,
      }));
    }
  }
}

async function handleRerollCoverBackground() {
  if (currentProductionStage === "script") {
    setStatus("脚本阶段先确认文案结构，还不建议进入封面背景重抽。", "info");
    return;
  }

  if (isPreviewDraft()) {
    setStatus("预览模式下不执行真实封面背景重抽。", "info");
    return;
  }

  if (!currentDraftId) {
    setStatus("请先生成或打开一个草稿。", "error");
    return;
  }

  rerollCoverBackgroundBtn && (rerollCoverBackgroundBtn.disabled = true);
  partialCoverBtn && (partialCoverBtn.disabled = true);
  editorCoverBtn && (editorCoverBtn.disabled = true);

  try {
    activeProductionTask = "cover";
    updateTrialActionState(getWorkflowRecommendation(currentDraft, {
      hasUnsaved: hasUnsavedChanges,
      hasChecks: Boolean((currentDraft?.qualityChecks || []).length),
      hasBlockingCheck: (currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
      exportReady: Boolean((currentDraft?.qualityChecks || []).length) && !(currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
      videoReady: Boolean(currentDraft?.exportInfo?.videoReady),
      stage: currentProductionStage,
    }));
    setStatus("正在只重抽封面背景，当前标题排版会按编辑器设置重新硬叠。", "working");
    const data = await rerollCoverBackgroundOnServer();
    markProductionAction(currentDraftId, "cover");
    renderDraft(data.draft);
    await loadDraftHistory();
    flushSavedEditorState(data.draft);
    renderWorkflowMap(data.draft);
    renderReleaseControl(data.draft);
    setStatus("封面背景已重抽，并按当前标题设置重新合成正式封面。", "success");
  } finally {
    activeProductionTask = "";
    rerollCoverBackgroundBtn && (rerollCoverBackgroundBtn.disabled = false);
    if (currentDraft) {
      renderWorkflowMap(currentDraft);
      updateTrialActionState(getWorkflowRecommendation(currentDraft, {
        hasUnsaved: hasUnsavedChanges,
        hasChecks: Boolean((currentDraft?.qualityChecks || []).length),
        hasBlockingCheck: (currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
        exportReady: Boolean((currentDraft?.qualityChecks || []).length) && !(currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
        videoReady: Boolean(currentDraft?.exportInfo?.videoReady),
        stage: currentProductionStage,
      }));
    }
  }
}

async function handleSelectCoverBackground(backgroundId) {
  if (!backgroundId || !currentDraftId || isPreviewDraft()) {
    return;
  }

  try {
    activeProductionTask = "cover";
    updateTrialActionState(getWorkflowRecommendation(currentDraft, {
      hasUnsaved: hasUnsavedChanges,
      hasChecks: Boolean((currentDraft?.qualityChecks || []).length),
      hasBlockingCheck: (currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
      exportReady: Boolean((currentDraft?.qualityChecks || []).length) && !(currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
      videoReady: Boolean(currentDraft?.exportInfo?.videoReady),
      stage: currentProductionStage,
    }));
    setStatus("正在切换背景底图，并重新套用当前标题排版...", "working");
    const data = await selectCoverBackgroundOnServer(backgroundId);
    renderDraft(data.draft);
    await loadDraftHistory();
    flushSavedEditorState(data.draft);
    renderWorkflowMap(data.draft);
    renderReleaseControl(data.draft);
    setStatus("已切换背景底图，并重新合成当前正式封面。", "success");
  } finally {
    activeProductionTask = "";
    if (currentDraft) {
      renderWorkflowMap(currentDraft);
      updateTrialActionState(getWorkflowRecommendation(currentDraft, {
        hasUnsaved: hasUnsavedChanges,
        hasChecks: Boolean((currentDraft?.qualityChecks || []).length),
        hasBlockingCheck: (currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
        exportReady: Boolean((currentDraft?.qualityChecks || []).length) && !(currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
        videoReady: Boolean(currentDraft?.exportInfo?.videoReady),
        stage: currentProductionStage,
      }));
    }
  }
}

async function handleToggleCoverBackgroundStar(backgroundId, starred) {
  if (!backgroundId || !currentDraftId || isPreviewDraft()) {
    return;
  }

  const data = await toggleCoverBackgroundStarOnServer(backgroundId, starred);
  renderDraft(data.draft);
  await loadDraftHistory();
  flushSavedEditorState(data.draft);
  renderWorkflowMap(data.draft);
  renderReleaseControl(data.draft);
  setStatus(starred ? "已收藏这张背景版本，后续重抽也会优先保留。" : "已取消收藏这张背景版本。", "success");
}

async function handlePartialSceneRebuild() {
  if (currentProductionStage === "script") {
    setStatus("脚本阶段还不建议重建镜头素材。请先完成脚本确认。", "info");
    return;
  }

  if (isPreviewDraft()) {
    setStatus("预览模式下不执行真实局部重建。", "info");
    return;
  }

  const currentScene = storyboardDraftState[currentStoryboardIndex];
  if (!currentDraftId || !currentScene?.id) {
    setStatus("当前没有可局部重建的镜头。", "error");
    return;
  }

  try {
    activeProductionTask = "scene";
    updateTrialActionState(getWorkflowRecommendation(currentDraft, {
      hasUnsaved: hasUnsavedChanges,
      hasChecks: Boolean((currentDraft?.qualityChecks || []).length),
      hasBlockingCheck: (currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
      exportReady: Boolean((currentDraft?.qualityChecks || []).length) && !(currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
      videoReady: Boolean(currentDraft?.exportInfo?.videoReady),
      stage: currentProductionStage,
    }));
    const nextPendingIndexAfterCurrent = findNextPendingStoryboardIndex(storyboardDraftState, currentStoryboardIndex + 1);
    if (partialSceneBtn) {
      partialSceneBtn.disabled = true;
      partialSceneBtn.textContent = "重建中...";
    }
    if (storyboardPartialBtn) {
      storyboardPartialBtn.disabled = true;
      storyboardPartialBtn.textContent = "重建中...";
    }
    setStatus("正在局部重建当前镜头素材...", "working");
    const data = await postJson("/api/drafts/scene-regenerate", {
      draftId: currentDraftId,
      sceneId: currentScene.id,
    });
    markProductionAction(currentDraftId, "scene");
    const nextStoryboard = Array.isArray(data?.draft?.storyboard) ? data.draft.storyboard : [];
    if (nextStoryboard.length) {
      const nextPendingIndex = findNextPendingStoryboardIndex(nextStoryboard, nextPendingIndexAfterCurrent);
      currentStoryboardIndex = nextPendingIndex >= 0
        ? nextPendingIndex
        : clampStoryboardIndex(currentStoryboardIndex, nextStoryboard.length);
    }
    renderDraft(data.draft);
    await loadDraftHistory();
    const remainingPending = countPendingStoryboardScenes(data?.draft?.storyboard);
    setStatus(
      remainingPending > 0
        ? `当前镜头已完成补素材，已自动切到下一个待补镜头。剩余 ${remainingPending} 个待补镜头。`
        : "当前镜头已完成补素材，这一轮待补镜头已经全部齐了，可以继续逐镜精修。",
      "success",
    );
    document.querySelector("#section-storyboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    setStatus(error.message || "局部重建失败", "error");
  } finally {
    activeProductionTask = "";
    if (currentDraft) {
      renderWorkflowMap(currentDraft);
      updateTrialActionState(getWorkflowRecommendation(currentDraft, {
        hasUnsaved: hasUnsavedChanges,
        hasChecks: Boolean((currentDraft?.qualityChecks || []).length),
        hasBlockingCheck: (currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
        exportReady: Boolean((currentDraft?.qualityChecks || []).length) && !(currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
        videoReady: Boolean(currentDraft?.exportInfo?.videoReady),
        stage: currentProductionStage,
      }));
    }
  }
}

function countPendingStoryboardScenes(storyboard) {
  return Array.isArray(storyboard)
    ? storyboard.filter((scene) => !scene?.assetPath).length
    : 0;
}

function findNextPendingStoryboardIndex(storyboard, startIndex = 0) {
  if (!Array.isArray(storyboard) || !storyboard.length) {
    return -1;
  }

  const normalizedStart = clampStoryboardIndex(startIndex, storyboard.length);
  for (let offset = 0; offset < storyboard.length; offset += 1) {
    const index = (normalizedStart + offset) % storyboard.length;
    if (!storyboard[index]?.assetPath) {
      return index;
    }
  }
  return -1;
}

async function handleFullTrial() {
  if (currentProductionStage === "script") {
    setStatus("请先确认预制脚本，再进入导出前检查。", "info");
    document.querySelector("#section-prep")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (!currentDraftId) {
    setStatus("请先生成或打开一个草稿。", "error");
    return;
  }

  if (isPreviewDraft()) {
    setStatus("预览模式下不会执行真实导出前检查。", "info");
    return;
  }

  try {
    activeProductionTask = "check";
    updateTrialActionState(getWorkflowRecommendation(currentDraft, {
      hasUnsaved: hasUnsavedChanges,
      hasChecks: Boolean((currentDraft?.qualityChecks || []).length),
      hasBlockingCheck: (currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
      exportReady: Boolean((currentDraft?.qualityChecks || []).length) && !(currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
      videoReady: Boolean(currentDraft?.exportInfo?.videoReady),
      stage: currentProductionStage,
    }));
    fullTrialBtn.disabled = true;
    fullTrialBtn.textContent = "检查中...";
    if (hasUnsavedChanges) {
      await handleSaveDraft();
    }
    await handleQualityCheck();
    setStatus("导出前检查已完成，可以继续判断是否出片。", "success");
    document.querySelector("#section-export")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } finally {
    activeProductionTask = "";
    fullTrialBtn.disabled = false;
    fullTrialBtn.textContent = "导出前检查";
    if (currentDraft) {
      renderWorkflowMap(currentDraft);
      updateTrialActionState(getWorkflowRecommendation(currentDraft, {
        hasUnsaved: hasUnsavedChanges,
        hasChecks: Boolean((currentDraft?.qualityChecks || []).length),
        hasBlockingCheck: (currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
        exportReady: Boolean((currentDraft?.qualityChecks || []).length) && !(currentDraft?.qualityChecks || []).some((item) => item.level === "error"),
        videoReady: Boolean(currentDraft?.exportInfo?.videoReady),
        stage: currentProductionStage,
      }));
    }
  }
}

function renderScriptPrep(draft) {
  if (!scriptPrepListEl || !scriptPrepMetricsEl || !scriptPrepSummaryEl) {
    return;
  }

  if (confirmScriptBtn) {
    confirmScriptBtn.textContent = currentProductionStage === "script" ? "确认脚本并进入生产" : "已进入生产";
    confirmScriptBtn.disabled = currentProductionStage !== "script";
  }

  const segments = buildScriptPrepSegments(draft);
  const totalDuration = segments.reduce((sum, segment) => sum + segment.durationSec, 0);
  scriptPrepSummaryEl.textContent = currentProductionStage === "script"
    ? "先确认每段作用、预计时长和整体节奏，再进入后续生产。"
    : "脚本已经确认。后续如需回改，建议先回到这里重新校正节奏，再继续生产打磨。";

  scriptPrepMetricsEl.innerHTML = `
    <div class="script-prep-metric">
      <span>脚本结构</span>
      <strong>${segments.length} 段</strong>
    </div>
    <div class="script-prep-metric">
      <span>预估口播时长</span>
      <strong>${totalDuration} 秒</strong>
    </div>
    <div class="script-prep-metric">
      <span>当前门禁</span>
      <strong>${currentProductionStage === "script" ? "待脚本确认" : "已放行到试产"}</strong>
    </div>
  `;

  scriptPrepListEl.innerHTML = segments.map((segment) => `
    <article class="script-prep-item">
      <div class="script-prep-item-copy">
        <div class="script-prep-item-head">
          <span class="script-prep-item-index">第 ${segment.index} 段</span>
          <span class="script-prep-item-tag">${segment.tag}</span>
        </div>
        <strong>${segment.title}</strong>
        <p>${escapeHtml(segment.text)}</p>
      </div>
      <div class="script-prep-item-meta">
        <div>
          <span>预计时长</span>
          <strong>${segment.durationSec} 秒</strong>
        </div>
        <div>
          <span>节奏作用</span>
          <strong>${segment.purpose}</strong>
        </div>
        <div>
          <span>进入生产前检查点</span>
          <strong>${segment.checkpoint}</strong>
        </div>
      </div>
    </article>
  `).join("");
}

function buildScriptPrepSegments(draft) {
  const script = getDraftScriptSource(draft);
  const blocks = [
    { tag: "Hook", title: "开场判断", text: script.hook || "", purpose: "先建立抓力和判断感", checkpoint: "确认开头是否足够抓人" },
    { tag: "展开 1", title: "第一段展开", text: script.sections?.[0] || "", purpose: "开始解释核心逻辑", checkpoint: "确认是不是一上来就进入有效信息" },
    { tag: "展开 2", title: "第二段展开", text: script.sections?.[1] || "", purpose: "承接并补足观点", checkpoint: "确认信息密度是否过高" },
    { tag: "展开 3", title: "第三段展开", text: script.sections?.[2] || "", purpose: "完成判断闭环", checkpoint: "确认节奏是否开始拖慢" },
    { tag: "CTA", title: "结尾引导", text: script.cta || "", purpose: "完成收束并给出动作", checkpoint: "确认结尾是否收得住" },
  ].filter((block) => block.text.trim());
  const durationByBlock = estimateScriptPrepDurations(blocks, Number(draft?.durationMode || 90));

  return blocks.map((block, index) => ({
    index: index + 1,
    ...block,
    durationSec: durationByBlock[index] || 0,
  }));
}

function estimateScriptPrepDurations(blocks, durationMode) {
  const profile = getPrepDurationProfile(durationMode);
  const lengths = blocks.map((block) => String(block.text || "").replace(/\s+/g, "").length);
  const totalChars = Math.max(lengths.reduce((sum, length) => sum + length, 0), 1);
  const totalDuration = clampValue(Math.round(totalChars / profile.charRate), profile.minSec, profile.maxSec);
  const durations = [];
  let allocated = 0;

  lengths.forEach((length, index) => {
    const remaining = lengths.length - index - 1;
    const remainingMin = remaining * profile.minSegmentSec;
    const proportional = Math.round((length / totalChars) * totalDuration);
    const duration = index === lengths.length - 1
      ? Math.max(profile.minSegmentSec, totalDuration - allocated)
      : clampValue(
          proportional,
          profile.minSegmentSec,
          Math.max(profile.minSegmentSec, totalDuration - allocated - remainingMin),
        );
    durations.push(duration);
    allocated += duration;
  });

  return durations;
}

function getPrepDurationProfile(durationMode) {
  if (Number(durationMode) === 60) {
    return { charRate: 3.7, minSec: 48, maxSec: 66, minSegmentSec: 4 };
  }
  if (Number(durationMode) === 120) {
    return { charRate: 3.05, minSec: 108, maxSec: 132, minSegmentSec: 5 };
  }
  return { charRate: 3.2, minSec: 78, maxSec: 102, minSegmentSec: 4 };
}

function clampValue(value, min, max) {
  return Math.max(min, Math.min(max, Number(value || 0)));
}

async function handleConfirmScriptStage() {
  if (!currentDraftId) {
    return;
  }

  if (currentDraft) {
    currentDraft.productionStage = "production";
    renderDraft({ ...currentDraft, productionStage: "production" });
  }
  setProductionStage("production");
  try {
    const data = await postJson("/api/drafts/meta", {
      draftId: currentDraftId,
      productionStage: "production",
    });
    renderDraft(data.draft);
    setStatus("脚本已确认，接下来进入生产打磨。", "success");
  } catch (error) {
    setStatus(error.message || "脚本确认已在本地生效，但后台写回失败。", "error");
  }
  document.querySelector("#section-preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getProductionStageTarget(stage) {
  if (stage === "export") {
    return "#section-export";
  }
  if (stage === "production") {
    return "#section-preview";
  }
  return "#section-prep";
}

function handleActiveStageChipClick() {
  if (!currentDraftId) {
    return;
  }
  document.querySelector(getProductionStageTarget(currentProductionStage))?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function handleDirtyChipClick(event) {
  const button = event.target?.closest?.("[data-dirty-target]");
  const target = button?.dataset?.dirtyTarget;
  if (!target || !currentDraftId) {
    return;
  }
  document.querySelector(target)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function deriveProductionStage(draft) {
  if (draft?.productionStage === "script" || draft?.productionStage === "production" || draft?.productionStage === "export") {
    return draft.productionStage;
  }
  if (draft?.exportInfo?.videoReady) {
    return "export";
  }
  const hasPreviewAssets =
    Boolean(draft?.assets?.coverPath) ||
    Boolean(draft?.assets?.voicePath) ||
    Boolean(draft?.coverImage) ||
    Boolean(draft?.audioUrl) ||
    Boolean((draft?.subtitleEntries || []).length) ||
    Boolean((draft?.storyboard || []).length);
  const hasDraftOutput = Boolean((draft?.timeline || []).length);
  if (draft?.qualityChecks?.length || draft?.workflowStatus === "ready" || draft?.workflowStatus === "exported") {
    return "production";
  }
  if (hasPreviewAssets || hasDraftOutput) {
    return "production";
  }
  return "script";
}

function syncProductionStage() {
  const isScriptStage = currentProductionStage === "script";
  appShellEl?.classList.toggle("is-script-stage", isScriptStage);
  storyboardSectionEl?.classList.toggle("is-stage-locked", isScriptStage);
  finalStepSectionEl?.classList.toggle("is-stage-locked", isScriptStage);
}

function setProductionStage(stage) {
  currentProductionStage = stage;
  if (currentDraft) {
    currentDraft.productionStage = stage;
  }
  syncProductionStage();
  storeDraftStage(currentDraftId, stage);
  persistProductionStage(currentDraftId, stage);
  if (currentDraft) {
    renderWorkflowMap(currentDraft);
    renderScriptPrep(currentDraft);
    renderReleaseControl(currentDraft);
    renderPreviewRecommendations(getWorkflowRecommendation(currentDraft, {
      hasUnsaved: hasUnsavedChanges,
      hasChecks: Boolean((currentDraft.qualityChecks || []).length),
      hasBlockingCheck: (currentDraft.qualityChecks || []).some((item) => item.level === "error"),
      exportReady: Boolean((currentDraft.qualityChecks || []).length) && !(currentDraft.qualityChecks || []).some((item) => item.level === "error"),
      videoReady: Boolean(currentDraft.exportInfo?.videoReady),
      stage: currentProductionStage,
    }), currentDraft);
  }
}

async function persistProductionStage(draftId, stage) {
  if (!draftId || isPreviewDraft()) {
    return;
  }
  try {
    await postJson("/api/drafts/meta", {
      draftId,
      productionStage: stage,
    });
  } catch {
    // keep local fallback behavior if persistence fails
  }
}

function getStoredDraftStage(draftId) {
  if (!draftId) {
    return "";
  }
  try {
    const raw = window.localStorage.getItem(DRAFT_STAGE_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return String(map[draftId] || "");
  } catch {
    return "";
  }
}

function storeDraftStage(draftId, stage) {
  if (!draftId) {
    return;
  }
  try {
    const raw = window.localStorage.getItem(DRAFT_STAGE_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[draftId] = stage;
    window.localStorage.setItem(DRAFT_STAGE_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

function getProductionActionState(draftId) {
  if (!draftId) {
    return { audio: false, cover: false, scene: false };
  }
  try {
    const raw = window.localStorage.getItem(PRODUCTION_ACTIONS_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return {
      audio: Boolean(map?.[draftId]?.audio),
      cover: Boolean(map?.[draftId]?.cover),
      scene: Boolean(map?.[draftId]?.scene),
    };
  } catch {
    return { audio: false, cover: false, scene: false };
  }
}

function markProductionAction(draftId, action) {
  if (!draftId || !action) {
    return;
  }
  try {
    const raw = window.localStorage.getItem(PRODUCTION_ACTIONS_STORAGE_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[draftId] = {
      audio: Boolean(map?.[draftId]?.audio),
      cover: Boolean(map?.[draftId]?.cover),
      scene: Boolean(map?.[draftId]?.scene),
      [action]: true,
    };
    window.localStorage.setItem(PRODUCTION_ACTIONS_STORAGE_KEY, JSON.stringify(map));
  } catch {
    // ignore storage errors
  }
}

function renderQualityChecks(checks) {
  return renderQualityChecksView(checks, {
    currentDraft,
    setCurrentDraftQualityChecks(nextChecks) {
      currentDraft.qualityChecks = nextChecks;
    },
    renderWorkflowMap,
    renderReleaseControl,
    renderQualityOverview,
    qualityList,
  });
}

function renderQualityOverview(checks, draft) {
  return renderQualityOverviewView(checks, draft, {
    qualityOverviewEl,
    qualityOverviewTitleEl,
    qualityOverviewTextEl,
    qualityOverviewActionsEl,
  });
}

function renderScriptView(draft) {
  scriptEl.innerHTML = buildScriptViewHtml({
    draft,
    currentEditorFocus,
    getDraftScriptSource,
    escapeHtml,
  });
}

function renderSubtitleView(entries) {
  const view = buildSubtitleViewModel({
    entries,
    formatTime,
    escapeHtml,
  });
  subtitleMetaEl.textContent = view.metaText;
  subtitleEl.innerHTML = view.html;
}

function renderStoryboardView(storyboard, assetVersion) {
  if (!storyboardListEl) {
    return;
  }
  try {
    const view = buildStoryboardViewModel({
      storyboard,
      assetVersion,
      currentStoryboardIndex,
      currentProductionStage,
      toVersionedMediaUrl,
      escapeHtml,
      clampStoryboardIndex,
      getVisualTypeLabel,
      buildVisualTypeOptions,
    });
    currentStoryboardIndex = view.currentStoryboardIndex;
    storyboardListEl.innerHTML = view.html;
  } catch (error) {
    console.error("[storyboard-view]", error);
    storyboardListEl.innerHTML = storyboard?.length
      ? buildStoryboardFallbackHtml(storyboard, assetVersion, currentStoryboardIndex)
      : storyboardListEl.innerHTML;
  }

  if (storyboard?.length && storyboardListEl.innerHTML.includes("storyboard-shell-locked")) {
    storyboardListEl.innerHTML = buildStoryboardFallbackHtml(storyboard, assetVersion, currentStoryboardIndex);
  }
}

function resolveRenderableStoryboard(draft) {
  const directStoryboard = cloneStoryboard(draft?.storyboard || []);
  if (directStoryboard.length) {
    return directStoryboard;
  }

  if (currentDraft?.id === draft?.id) {
    const currentStoryboard = cloneStoryboard(currentDraft?.storyboard || []);
    if (currentStoryboard.length) {
      return currentStoryboard;
    }
  }

  const timeline = Array.isArray(draft?.timeline) ? draft.timeline : [];
  if (!timeline.length) {
    return [];
  }

  return timeline.map((item, index) => ({
    id: item.sceneId || `scene-${index + 1}`,
    sceneTitle: item.overlay || `镜头 ${index + 1}`,
    visualType: item.visualType || "image",
    durationSec: Math.max(1, Math.round(Number(item.endSec || 0) - Number(item.startSec || 0))),
    voiceover: "",
    visualPrompt: "",
    assetPath: item.assetPath || "",
    assetType: item.assetType || "",
  }));
}

function buildStoryboardFallbackHtml(storyboard, assetVersion, index) {
  const safeIndex = clampStoryboardIndex(index, storyboard.length);
  const currentScene = storyboard[safeIndex] || storyboard[0];
  const preview = currentScene?.assetPath ? toVersionedMediaUrl(currentScene.assetPath, assetVersion) : "";
  const pendingCount = countPendingStoryboardScenes(storyboard);

  return `
    <div class="storyboard-shell">
      <aside class="storyboard-nav">
        <div class="storyboard-nav-head">
          <strong>镜头列表</strong>
          <span>${storyboard.length} 个镜头${pendingCount ? ` · 待补 ${pendingCount} 个` : " · 已全部就绪"}</span>
        </div>
        <div class="storyboard-scene-list">
          ${storyboard.map((scene, sceneIndex) => `
            <button type="button" class="storyboard-scene-item${sceneIndex === safeIndex ? " active" : ""}" data-scene-select="${sceneIndex}">
              <div class="storyboard-scene-top">
                <span class="storyboard-scene-index">Scene ${sceneIndex + 1}</span>
                <span class="storyboard-scene-flag ${scene?.assetPath ? "is-anchor" : "is-normal"}">${scene?.assetPath ? "就绪" : "待补"}</span>
              </div>
              <strong>${escapeHtml(scene.sceneTitle || `镜头 ${sceneIndex + 1}`)}</strong>
              <div class="storyboard-scene-meta">
                <span>${escapeHtml(getVisualTypeLabel(scene.visualType))}</span>
                <span>${Number(scene.durationSec || 0)} 秒</span>
              </div>
            </button>
          `).join("")}
        </div>
      </aside>
      <article class="storyboard-card" data-scene-id="${escapeHtml(currentScene?.id || "")}">
        <div class="storyboard-decision-bar">
          <div class="storyboard-decision-copy">
            <span class="storyboard-section-label">当前镜头</span>
            <strong>${escapeHtml(currentScene?.sceneTitle || `镜头 ${safeIndex + 1}`)}</strong>
            <p>${currentScene?.assetPath ? "这一镜已经有素材，先看画面，再决定是否重做。" : "这一镜还没有素材，先补这一镜，系统会自动带你继续补后面的待补镜头。"}</p>
          </div>
          <div class="storyboard-decision-metrics">
            <div class="storyboard-decision-metric">
              <span>当前镜头</span>
              <strong>第 ${safeIndex + 1} / ${storyboard.length} 个</strong>
            </div>
            <div class="storyboard-decision-metric">
              <span>待补镜头</span>
              <strong>${pendingCount} 个</strong>
            </div>
            <div class="storyboard-decision-metric">
              <span>当前状态</span>
              <strong>${currentScene?.assetPath ? "素材已就绪" : "等待补素材"}</strong>
            </div>
          </div>
        </div>
        <div class="storyboard-card-body">
          <div class="storyboard-visual-panel storyboard-panel-block">
            <div class="storyboard-panel-head">
              <div>
                <div class="storyboard-section-label">镜头预览</div>
                <strong>先确认当前镜头有没有出来</strong>
              </div>
              <span class="storyboard-panel-chip">${currentScene?.assetPath ? "已有素材" : "等待素材"}</span>
            </div>
            <div class="storyboard-thumb-shell">
              ${preview ? `<img src="${preview}" alt="${escapeHtml(currentScene.sceneTitle || `Scene ${safeIndex + 1}`)}" class="storyboard-thumb" />` : `<div class="storyboard-thumb-empty">暂无素材</div>`}
            </div>
            <div class="storyboard-visual-caption">${escapeHtml(currentScene?.visualPrompt || "这里会先展示当前镜头素材。")}</div>
          </div>
          <div class="storyboard-fields">
            <div class="storyboard-fields-group storyboard-panel-block">
              <div class="storyboard-panel-head">
                <div>
                  <div class="storyboard-section-label">镜头参数</div>
                  <strong>至少先能看到 scene 和当前素材</strong>
                </div>
              </div>
              <label>
                <span>镜头标题</span>
                <input data-storyboard-index="${safeIndex}" data-scene-field="sceneTitle" value="${escapeHtml(currentScene?.sceneTitle || "")}" />
              </label>
              <div class="storyboard-inline-fields">
                <label>
                  <span>镜头类型</span>
                  <select data-storyboard-index="${safeIndex}" data-scene-field="visualType">
                    ${buildVisualTypeOptions(currentScene?.visualType)}
                  </select>
                </label>
                <label>
                  <span>时长</span>
                  <input data-storyboard-index="${safeIndex}" data-scene-field="durationSec" type="number" min="4" max="40" step="1" value="${Number(currentScene?.durationSec || 6)}" />
                </label>
              </div>
            </div>
            <div class="storyboard-fields-group storyboard-panel-block">
              <div class="storyboard-panel-head">
                <div>
                  <div class="storyboard-section-label">镜头口播</div>
                  <strong>重做或继续补下一镜</strong>
                </div>
              </div>
              <label>
                <span>口播文案</span>
                <textarea data-storyboard-index="${safeIndex}" data-scene-field="voiceover" rows="8">${escapeHtml(currentScene?.voiceover || "")}</textarea>
              </label>
              <div class="storyboard-action-note">
                <p>${pendingCount > 0 ? "当前工作台已切回真实镜头视图。你现在可以补当前镜头，补完后系统会继续推进。" : "这一轮镜头都已出来，可以开始逐镜微调。"}</p>
                <div class="storyboard-action-note-buttons">
                  <button type="button" class="switch-btn storyboard-refresh-btn" data-scene-id="${escapeHtml(currentScene?.id || "")}">${pendingCount > 0 ? "补当前镜头并继续" : "重做当前镜头"}</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  `;
}

function renderExportSummary(info) {
  const state = info || {
    status: "idle",
    title: "还没有导出记录",
    message: "点击“确认并导出”后，这里会显示导出结果、脚本和视频产物状态。",
    attemptedAt: null,
    scriptReady: false,
    videoReady: false,
  };

  exportSummaryEl.className = `export-summary export-summary-${state.status || "idle"}`;
  exportSummaryTitleEl.textContent = state.title || "导出状态";
  exportSummaryTimeEl.textContent = state.attemptedAt ? formatDateTime(state.attemptedAt) : "等待第一次导出";
  exportSummaryMessageEl.textContent = state.message || "";

  const meta = [
    state.scriptReady ? "导出脚本已就绪" : "导出脚本未生成",
    state.videoReady ? "成片已生成" : "成片尚未生成",
  ];

  exportSummaryMetaEl.innerHTML = meta.map((item) => `<span>${item}</span>`).join("");
  if (currentDraft) {
    currentDraft.exportInfo = state;
    if (state.videoReady && currentProductionStage !== "export") {
      currentProductionStage = "export";
      syncProductionStage();
      storeDraftStage(currentDraftId, currentProductionStage);
    }
    renderWorkflowMap(currentDraft);
    renderReleaseControl(currentDraft);
  }
}

async function applyCombo(comboId) {
  if (!currentDraftId || !comboId || comboBusy) {
    return;
  }
  if (isPreviewDraft()) {
    renderDraft(createPreviewDraft(comboId));
    setStatus(`已切换到 ${comboId.toUpperCase()} 预览方案。`, "success");
    pulseResult();
    return;
  }

  try {
    comboBusy = true;
    comboGrid.classList.add("is-busy");
    const pendingButton = comboGrid.querySelector(`[data-combo-id="${comboId}"]`);
    if (pendingButton) {
      pendingButton.textContent = "切换中...";
      pendingButton.disabled = true;
    }
    setStatus("正在应用组合方案...", "working");
    const data = await postJson("/api/combo", { draftId: currentDraftId, comboId });
    renderDraft(data.draft);
    await loadDraftHistory();
    setStatus(`已应用 ${comboId.toUpperCase()} 方案。`, "success");
    pulseResult();
  } catch (error) {
    setStatus(error.message || "应用方案失败", "error");
  } finally {
    comboBusy = false;
    comboGrid.classList.remove("is-busy");
  }
}

async function loadRuntimeStatus() {
  if (!runtimeStatusEl) {
    return;
  }
  try {
    setServiceIndicator("pending", "连接检查中");
    const data = await fetchJson("/api/status");
    const runtime = data.runtime || {};
    const storyboardModelLabel = runtime.storyboardModel && runtime.storyboardModel !== "-"
      ? runtime.storyboardModel
      : runtime.textModel && runtime.textModel !== "-"
        ? runtime.textModel
        : "未配置";
    const modeLabel = runtime.mode === "api" ? "API 模式" : "本地兜底模式";
    const readinessLabel = runtime.ffmpegInstalled ? "可直接导出" : "仅可生成脚本";
    const systemLabel = `${runtime.apiKeyConfigured ? "已配置 API Key" : "未配置 API Key"} / ${runtime.ffmpegInstalled ? "已安装 ffmpeg" : "未安装 ffmpeg"}`;
    const environmentLabel = runtime.runtimeEnvironment === "docker" ? "Docker 容器" : "本机环境";
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
          <div class="runtime-overview-pill">
            <span>系统</span>
            <strong>${systemLabel}</strong>
          </div>
          <div class="runtime-overview-pill">
            <span>运行</span>
            <strong>${environmentLabel}</strong>
          </div>
        </div>
      </article>
      <details class="runtime-details" open>
        <summary>模型与依赖明细</summary>
        <div class="runtime-details-grid">
          ${[
            runtimeRouteCard("文案模型", runtime.llm?.script, runtime.textModel || "-"),
            runtimeRouteCard("分镜模型", runtime.llm?.storyboard, storyboardModelLabel),
            runtimeRouteCard("封面模型", runtime.llm?.image, runtime.imageModel || "-"),
            runtimeRouteCard("配音模型", runtime.llm?.tts, runtime.ttsModel || "-"),
            runtimeRouteCard("风控策略", runtime.llm?.moderation, runtime.moderationModel || "-"),
            runtimeCard("运行环境", environmentLabel),
            runtimeCard("系统状态", systemLabel),
          ].join("")}
        </div>
      </details>
    `;
    setServiceIndicator("online", "本地服务在线");
  } catch (error) {
    setServiceIndicator("offline", "本地服务离线");
    runtimeStatusEl.innerHTML = `
      <article class="runtime-overview-card runtime-overview-card-error">
        <div class="runtime-overview-head">
          <span class="runtime-overview-kicker">状态概览</span>
          <strong>读取失败</strong>
        </div>
        <p class="runtime-overview-error">${error.message || "无法读取运行状态"}</p>
      </article>
    `;
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
  setLlmConfigStatus("LLM 配置已加载。支持 5 个调用点独立配置，其中审核为火山风控策略。", "success");
  } catch (error) {
    setLlmConfigStatus(error.message || "加载 LLM 配置失败", "error");
  }
}

function startRuntimeStatusPolling() {
  if (!runtimeStatusEl) {
    return;
  }
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

function runtimeCard(title, detail) {
  return `
    <div class="runtime-card">
      <span class="runtime-card-label">${title}</span>
      <strong class="runtime-card-value">${detail}</strong>
    </div>
  `;
}

function runtimeRouteCard(title, route, fallbackModel = "-") {
  const primaryValue = title === "风控策略"
    ? escapeHtml(route?.serviceName || route?.model || fallbackModel || "-")
    : escapeHtml(route?.model || fallbackModel || "-");
  const apiKind = escapeHtml(route?.apiKind || "native");
  const effectiveUrl = escapeHtml(route?.effectiveUrl || route?.endpoint || "-");
  const statusLabel = route?.enabled ? "已启用" : "未启用";
  const activeLabel = getRuntimeRouteActiveLabel(title, route);
  const moderationMeta = title === "风控策略"
    ? [
        route?.scene ? `场景：${escapeHtml(route.scene)}` : "",
        route?.strategyId ? `策略 ID：${escapeHtml(route.strategyId)}` : "策略 ID：未配置",
      ].filter(Boolean)
    : [];
  return `
    <div class="runtime-card runtime-card-route">
      <div class="runtime-card-head">
        <span class="runtime-card-label">${title}</span>
        <div class="runtime-card-chip-group">
          ${activeLabel ? `<span class="runtime-card-chip runtime-card-chip-secondary">${escapeHtml(activeLabel)}</span>` : ""}
          <span class="runtime-card-chip">${statusLabel}</span>
        </div>
      </div>
      <strong class="runtime-card-value">${primaryValue}</strong>
      <div class="runtime-card-meta">
        <span class="runtime-card-meta-item">接口类型：${apiKind}</span>
        ${moderationMeta.map((item) => `<span class="runtime-card-meta-item">${item}</span>`).join("")}
        <code class="runtime-card-endpoint">${effectiveUrl}</code>
      </div>
    </div>
  `;
}

function getRuntimeRouteActiveLabel(title, route) {
  if (!route?.enabled) {
    return "";
  }

  const provider = String(route?.provider || "").trim().toLowerCase();

  if (title === "封面模型") {
    if (provider === "volcengine-jimeng-image") {
      return "即梦远程生效";
    }
    if (provider === "openai-compatible") {
      return "图片远程生效";
    }
  }

  if (title === "配音模型") {
    if (provider === "volcengine-doubao-tts" || provider === "doubao-tts" || provider === "volcengine-doubao") {
      return "豆包远程生效";
    }
    if (provider === "openai-compatible") {
      return "配音远程生效";
    }
  }

  if (title === "文案模型" || title === "分镜模型") {
    if (provider === "openai-compatible") {
      return "文本远程生效";
    }
  }

  if (title === "转写模型") {
    if (provider === "volcengine-doubao-asr" || provider === "doubao-asr" || provider.includes("bigasr")) {
      return "火山转写生效";
    }
  }

  if (title === "风控策略") {
    if (provider.includes("volcengine")) {
      return "火山风控生效";
    }
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
  if (!serviceIndicatorEl || !serviceIndicatorTextEl) {
    return;
  }

  serviceIndicatorEl.className = `service-indicator service-indicator-${state}`;
  serviceIndicatorTextEl.textContent = text;
  serviceRetryBtn.classList.toggle("hidden", state !== "offline");
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
  if (!button) {
    return;
  }

  const routeName = String(button.dataset.llmTestRoute || "").trim();
  if (!routeName) {
    return;
  }

  const statusId = `llm-${routeName}-test-status`;
  button.disabled = true;
  setLlmRouteTestStatus(statusId, "正在测试连接...", "working");

  try {
    const data = await postJson("/api/llm-config/test", {
      routeName,
      config: collectLlmConfig(),
    });
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

  if (apiKind) {
    parts.push(`接口类型：${apiKind}`);
  }
  parts.push(`鉴权：${authScheme || "Raw Token"}`);
  parts.push(`超时：${timeoutSec || getDefaultRouteTimeoutSec(routeName)} 秒`);

  return `（${parts.join(" · ")}）`;
}

function getDefaultRouteTimeoutSec(routeName) {
  if (routeName === "image" || routeName === "tts") {
    return "45";
  }
  if (routeName === "moderation") {
    return "15";
  }
  if (routeName === "storyboard") {
    return "25";
  }
  return "20";
}

function historySummaryCard(label, value) {
  return `<div class="history-summary-card"><strong>${value}</strong><span>${label}</span></div>`;
}

function getProductionStageLabel(stage) {
  if (stage === "export") {
    return "已成片";
  }
  if (stage === "production") {
    return "试产中";
  }
  return "脚本期";
}

function applyProductionStageTone(element, stage, baseClass) {
  if (!element) {
    return;
  }
  element.classList.remove(`${baseClass}-script`, `${baseClass}-production`, `${baseClass}-export`);
  element.classList.add(`${baseClass}-${stage || "script"}`);
}

async function loadDraftHistory() {
  if (!historyList || !historySummary || !historySearch || !historyStatusFilter || !historySort || !historyStarredFilter) {
    return;
  }
  try {
    const query = new URLSearchParams({
      q: historySearch.value.trim(),
      workflowStatus: historyStatusFilter.value,
      sort: historySort.value,
      starred: historyStarredFilter.checked ? "true" : "",
    });
    const data = await fetchJson(`/api/drafts?${query.toString()}`);
    renderHistory(data.drafts || []);
    syncEmptyState(data.drafts || []);
  } catch (error) {
    historySummary.innerHTML = "";
    historyList.innerHTML = `<p class="status">${error.message || "加载草稿历史失败"}</p>`;
    syncEmptyState([]);
  }
}

function renderHistory(drafts) {
  return renderHistoryView(drafts, {
    historyList,
    currentDraftId,
    renderHistorySummary,
    buildHistoryReadiness,
    getProductionStageLabel,
    deriveProductionStage,
    formatDateTime,
    loadDraft,
  });
}

function renderHistorySummary(drafts) {
  return renderHistorySummaryView(drafts, {
    historySummary,
    deriveProductionStage,
  });
}

function initHistoryCollapse() {
  if (!historyBody || !historyToggleBtn) {
    return;
  }
  try {
    historyCollapsed = window.localStorage.getItem("historyCollapsed") === "true";
  } catch {
    historyCollapsed = false;
  }

  applyHistoryCollapse();
}

function toggleHistoryPanel() {
  if (!historyBody || !historyToggleBtn) {
    return;
  }
  historyCollapsed = !historyCollapsed;

  try {
    window.localStorage.setItem("historyCollapsed", String(historyCollapsed));
  } catch {
    // ignore storage errors
  }

  applyHistoryCollapse();
}

function applyHistoryCollapse() {
  if (!historyBody || !historyToggleBtn) {
    return;
  }
  historyBody.classList.toggle("hidden", historyCollapsed);
  historyToggleBtn.textContent = historyCollapsed ? "展开历史" : "收起历史";
  historyToggleBtn.setAttribute("aria-expanded", String(!historyCollapsed));
}

function syncEmptyState(drafts) {
  const hasActiveDraft = Boolean(currentDraftId && currentDraft);
  applyProductionShell(hasActiveDraft);

  const lastDraft = drafts[0] || null;
  lastDraftId = lastDraft?.id || "";
  resumeCard.classList.toggle("hidden", !lastDraft);

  if (lastDraft) {
    resumeCardText.textContent = `${lastDraft.title} · ${lastDraft.workflowStatusLabel} · ${lastDraft.durationMode} 秒`;
  } else {
    resumeCardText.textContent = "";
  }

  if (!hasActiveDraft) {
    updateSidebarContext(null);
  }
  syncPreviewButton();
}

function applyProductionShell(enabled) {
  const active = Boolean(enabled);
  appShellEl?.classList.toggle("is-production", active);
  setInputDrawerOpen(false);
  emptyStateEl?.classList.toggle("hidden", active);
  resultEl?.classList.toggle("hidden", !active);
  railDrawerToggleBtn?.classList.toggle("hidden", !active);
}

function updateSidebarContext(draft) {
  if (!sidebarContextEl || !sidebarContextTitleEl || !sidebarContextMetaEl || !sidebarContextTagsEl) {
    return;
  }

  if (!draft) {
    sidebarContextTitleEl.textContent = "等待生成";
    sidebarContextMetaEl.textContent = "生成后，这里会显示当前草稿的基础信息和生产状态。";
    sidebarContextTagsEl.innerHTML = "";
    return;
  }

  sidebarContextTitleEl.textContent = draft.topic || draft.title || "未命名草稿";
  sidebarContextMetaEl.textContent = draft.sourceType === "article" ? "来自标题 / 正文改写" : "来自主题直生";
  sidebarContextTagsEl.innerHTML = [
    getRewriteStyleLabel(draft.rewriteStyle),
    `${draft.durationMode || 90} 秒`,
    draft.coverStyleLabel || "行业报告风",
    draft.workflowStatusLabel || "待处理",
  ]
    .filter(Boolean)
    .map((item) => `<span>${escapeHtml(item)}</span>`)
    .join("");
}

function setInputDrawerOpen(isOpen) {
  const enabled = Boolean(isOpen && appShellEl?.classList.contains("is-production"));
  appShellEl?.classList.toggle("is-rail-open", enabled);
  railDrawerBackdropEl?.classList.toggle("hidden", !enabled);
}

function handleGlobalKeydown(event) {
  if (event.key === "Escape" && appShellEl?.classList.contains("is-rail-open")) {
    setInputDrawerOpen(false);
  }
}

function handlePreviewWorkspace() {
  if (isPreviewDraft()) {
    exitPreviewWorkspace();
    return;
  }
  if (!confirmDiscardChanges()) {
    return;
  }

  renderDraft(createPreviewDraft());
  syncEmptyState([]);
  setStatus("已进入生产态布局预览，不会消耗真实生成次数。", "success");
  resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
  pulseResult();
}

function exitPreviewWorkspace() {
  currentDraft = null;
  currentDraftId = "";
  persistCurrentDraftId("");
  syncDraftUrl("");
  draftSnapshot = null;
  storyboardDraftState = [];
  currentStoryboardIndex = 0;
  emptyStateEl.classList.remove("hidden");
  resultEl.classList.add("hidden");
  syncEmptyState([]);
  setStatus("已返回输入态。", "success");
}

function isPreviewDraft() {
  return currentDraftId === PREVIEW_DRAFT_ID || currentDraft?.id === PREVIEW_DRAFT_ID;
}

function persistCurrentDraftId(draftId) {
  try {
    if (draftId) {
      window.localStorage.setItem(CURRENT_DRAFT_STORAGE_KEY, draftId);
    } else {
      window.localStorage.removeItem(CURRENT_DRAFT_STORAGE_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

function getStoredCurrentDraftId() {
  try {
    return String(window.localStorage.getItem(CURRENT_DRAFT_STORAGE_KEY) || "");
  } catch {
    return "";
  }
}

function syncDraftUrl(draftId) {
  try {
    const url = new URL(window.location.href);
    if (draftId && draftId !== PREVIEW_DRAFT_ID) {
      url.searchParams.set("draft", draftId);
    } else {
      url.searchParams.delete("draft");
    }
    window.history.replaceState({}, "", url);
  } catch {
    // ignore history errors
  }
}

function syncPreviewButton() {
  if (!previewWorkspaceBtn) {
    return;
  }
  previewWorkspaceBtn.textContent = isPreviewDraft() ? "退出预览" : "预览";
}

function createPreviewDraft(comboId = "a-report") {
  const now = new Date().toISOString();
  const topic = topicInputEl.value.trim() || "集采后 IVD 渠道的下一轮机会在哪里";
  const angle = angleInputEl.value.trim() || "从终端实验室价值、渠道效率和利润结构变化切入";
  const rewriteStyle = rewriteStyleEl.value || "industry_observation";
  const durationMode = Number(durationModeEl.value || 90);
  const titleVariants = {
    a: topic,
    b: "IVD 渠道真正该重看的，不只是价格",
  };
  const comboMap = {
    "a-report": { titleVariant: "a", coverStyle: "report", coverStyleLabel: "行业报告风" },
    "a-viral": { titleVariant: "a", coverStyle: "viral", coverStyleLabel: "爆款短视频风" },
    "b-report": { titleVariant: "b", coverStyle: "report", coverStyleLabel: "行业报告风" },
    "b-viral": { titleVariant: "b", coverStyle: "viral", coverStyleLabel: "爆款短视频风" },
  };
  const activeCombo = comboMap[comboId] || comboMap["a-report"];
  const activeTitle = titleVariants[activeCombo.titleVariant];
  const combos = Object.entries(comboMap).map(([id, combo]) => ({
    id,
    label: `${combo.titleVariant.toUpperCase()}-${combo.coverStyleLabel}`,
    title: titleVariants[combo.titleVariant],
    coverStyleLabel: combo.coverStyleLabel,
    coverPath: buildPreviewSvg(combo.coverStyle, combo.coverStyleLabel, titleVariants[combo.titleVariant]),
  }));

  return {
    id: PREVIEW_DRAFT_ID,
    title: activeTitle,
    topic,
    sourceType: "topic",
    angle,
    rewriteStyle,
    audience: "IVD 企业管理层、市场负责人、渠道负责人",
    durationMode,
    workflowStatus: "preview",
    workflowStatusLabel: "布局预览",
    coverStyle: activeCombo.coverStyle,
    coverStyleLabel: activeCombo.coverStyleLabel,
    activeTitleVariant: activeCombo.titleVariant,
    titleVariants,
    coverTitle: activeTitle,
    coverSubtitle: "用于查看生产态布局，不触发真实生成",
    hook: "如果你还把渠道竞争理解成单纯的价格战，这条视频会提醒你漏掉了真正影响下一轮分化的变量。",
    sections: [
      "第一，集采之后的渠道效率竞争，核心不只是拿货价格，而是交付速度、临床支持和终端覆盖能力。",
      "第二，真正能放大利润空间的，不是粗放铺货，而是把重点实验室、重点科室和服务能力重新绑定。",
      "第三，下一轮渠道机会，往往出现在那些愿意做深终端协同、而不是只卷代理层级的公司。",
    ],
    cta: "如果你想继续把这条视频做成成片，后面就直接在这里微调文案、分镜和导出节奏。",
    createdAt: now,
    updatedAt: now,
    starred: false,
    comboOptions: combos,
    qualityChecks: [
      { level: "warning", label: "预览模式", detail: "当前内容仅用于查看生产态布局，不对应真实素材状态。" },
    ],
    exportInfo: {
      status: "idle",
      title: "预览模式未导出",
      message: "这里用于感受生产态布局，未触发真实导出链路。",
      attemptedAt: now,
      scriptReady: false,
      videoReady: false,
    },
    assets: {
      coverPath: buildPreviewSvg(activeCombo.coverStyle, activeCombo.coverStyleLabel, activeTitle),
      voicePath: "",
      exportScriptPath: "",
      outputVideoPath: "",
    },
    subtitleEntries: [
      { startSec: 0, endSec: 3.2, text: "集采之后，IVD 渠道真正该重看的，不只是价格。" },
      { startSec: 3.2, endSec: 7.4, text: "效率、终端服务和利润结构，才决定下一轮机会。" },
      { startSec: 7.4, endSec: 12.1, text: "这份页面现在只是生产态预览，不会消耗真实生成次数。" },
    ],
    storyboard: [
      {
        id: "scene-1",
        sceneTitle: "开场判断",
        visualType: "cover",
        durationSec: 6,
        voiceover: "先把集采后渠道竞争的判断抛出来，建立第一屏冲击力。",
        assetPath: buildPreviewSvg("report", "Scene 1", "先抛判断"),
      },
      {
        id: "scene-2",
        sceneTitle: "结构拆解",
        visualType: "data",
        durationSec: 8,
        voiceover: "把价格、效率、终端服务拆成三层，让页面看起来像真的在生产。",
        assetPath: buildPreviewSvg("viral", "Scene 2", "拆成三层"),
      },
      {
        id: "scene-3",
        sceneTitle: "收束与导向",
        visualType: "cta",
        durationSec: 6,
        voiceover: "用一段结尾引导去承接导出、编辑和下一步迭代。",
        assetPath: buildPreviewSvg("report", "Scene 3", "进入下一步"),
      },
    ],
  };
}

function buildPreviewSvg(style, kicker, headline) {
  const palette = style === "viral"
    ? { bg1: "#1a2733", bg2: "#0b1017", stroke: "#4fc3ff", accent: "#7ae6ff" }
    : { bg1: "#15202b", bg2: "#0a1119", stroke: "#6faec7", accent: "#d8f4ff" };
  const safeKicker = escapeHtml(kicker);
  const safeHeadline = escapeHtml(headline);
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
      <defs>
        <linearGradient id="bg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${palette.bg1}" />
          <stop offset="100%" stop-color="${palette.bg2}" />
        </linearGradient>
      </defs>
      <rect width="1080" height="1920" fill="url(#bg)" />
      <rect x="72" y="72" width="936" height="1776" rx="48" fill="none" stroke="${palette.stroke}" stroke-opacity="0.28" />
      <text x="116" y="208" fill="${palette.stroke}" font-size="44" font-family="Arial, sans-serif" letter-spacing="10">${safeKicker}</text>
      <foreignObject x="116" y="280" width="848" height="840">
        <div xmlns="http://www.w3.org/1999/xhtml" style="color:${palette.accent};font-family:Arial,sans-serif;font-size:88px;line-height:1.08;font-weight:700;">
          ${safeHeadline}
        </div>
      </foreignObject>
      <rect x="116" y="1440" width="848" height="2" fill="${palette.stroke}" fill-opacity="0.32" />
      <text x="116" y="1528" fill="${palette.accent}" fill-opacity="0.76" font-size="34" font-family="Arial, sans-serif">Production layout preview only</text>
    </svg>
  `;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

async function loadDraft(draftId) {
  if (!draftId) {
    return;
  }

  if (!confirmDiscardChanges()) {
    return;
  }

  try {
    setStatus("正在加载历史草稿...", "working");
    const data = await fetchJson(`/api/drafts/${draftId}`);
    renderDraft(data.draft);
    setStatus("历史草稿已加载。", "success");
    resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
    pulseResult();
  } catch (error) {
    setStatus(error.message || "加载草稿失败", "error");
  }
}

function togglePrimaryActions(disabled) {
  exportBtn.disabled = disabled;
  saveDraftBtn.disabled = disabled || !currentDraftId || !hasUnsavedChanges;
}

function hideExportLinks() {
  videoLink.removeAttribute("href");
  videoLink.removeAttribute("aria-disabled");
  videoLink.removeAttribute("download");
  scriptLink.removeAttribute("href");
  scriptLink.removeAttribute("aria-disabled");
  scriptLink.removeAttribute("download");
  videoLink.classList.add("hidden");
  scriptLink.classList.add("hidden");
  exportLinksEl.classList.add("hidden");
}

function syncExportLinks(draft) {
  hideExportLinks();

  if (!draft?.assets || !draft?.exportInfo) {
    return;
  }

  if (draft.exportInfo.scriptReady && draft.assets.exportScriptPath) {
    scriptLink.href = `/media/${draft.assets.exportScriptPath}`;
    scriptLink.setAttribute("download", "export-video.sh");
    scriptLink.classList.remove("hidden");
  }

  if (draft.exportInfo.videoReady && draft.assets.outputVideoPath) {
    videoLink.href = `/media/${draft.assets.outputVideoPath}`;
    videoLink.classList.remove("hidden");
  }

  if (!videoLink.classList.contains("hidden") || !scriptLink.classList.contains("hidden")) {
    exportLinksEl.classList.remove("hidden");
  }
}

function setStatus(message, tone = "info") {
  clearTimeout(statusHideTimer);
  statusEl.textContent = message;
  statusEl.className = `status status-${tone}`;

  const shouldHide = tone === "idle" || tone === "info";
  statusEl.classList.toggle("hidden", shouldHide);

  if (tone === "success") {
    statusHideTimer = window.setTimeout(() => {
      statusEl.textContent = "";
      statusEl.className = "status status-idle hidden";
    }, 2400);
  }
}

function startGenerateProgress() {
  if (!generateProgressEl || !generateProgressStepsEl) {
    return;
  }
  clearInterval(generateProgressTimer);
  generateProgressEl.classList.remove("hidden");
  generateProgressEl.classList.remove("generate-progress-slow");
  generateProgressStartedAt = Date.now();
  setGenerateProgressStep(0);
  updateGenerateProgressElapsed();
  let stepIndex = 0;
  generateProgressTimer = window.setInterval(() => {
    updateGenerateProgressElapsed();
    stepIndex = Math.min(stepIndex + 1, GENERATE_PROGRESS_STEPS.length - 1);
    setGenerateProgressStep(stepIndex);
    if (stepIndex >= GENERATE_PROGRESS_STEPS.length - 1) {
      clearInterval(generateProgressTimer);
      generateProgressTimer = null;
    }
  }, 2200);
}

function stopGenerateProgress() {
  clearInterval(generateProgressTimer);
  generateProgressTimer = null;
  generateProgressStartedAt = 0;
  generateProgressEl?.classList.add("hidden");
  generateProgressEl?.classList.remove("generate-progress-slow");
}

function setGenerateProgressStep(index) {
  const safeIndex = Math.max(0, Math.min(index, GENERATE_PROGRESS_STEPS.length - 1));
  if (generateProgressTitleEl) {
    generateProgressTitleEl.textContent = `正在${GENERATE_PROGRESS_STEPS[safeIndex]}...`;
  }
  if (generateProgressStepCountEl) {
    generateProgressStepCountEl.textContent = `${safeIndex + 1} / ${GENERATE_PROGRESS_STEPS.length}`;
  }
  if (generateProgressFillEl) {
    generateProgressFillEl.style.width = `${((safeIndex + 1) / GENERATE_PROGRESS_STEPS.length) * 100}%`;
  }
  if (generateProgressStepsEl) {
    [...generateProgressStepsEl.children].forEach((item, itemIndex) => {
      item.classList.toggle("is-complete", itemIndex < safeIndex);
      item.classList.toggle("is-active", itemIndex === safeIndex);
    });
  }
}

function updateGenerateProgressElapsed() {
  if (!generateProgressStartedAt || !generateProgressElapsedEl || !generateProgressNoteEl) {
    return;
  }
  const elapsedSec = Math.max(0, Math.floor((Date.now() - generateProgressStartedAt) / 1000));
  generateProgressElapsedEl.textContent = `已耗时 ${elapsedSec} 秒`;
  if (elapsedSec >= 60) {
    generateProgressEl?.classList.add("generate-progress-slow");
    generateProgressNoteEl.textContent = "脚本整理偏慢时请继续等待，通常不是卡死。";
    return;
  }
  generateProgressEl?.classList.remove("generate-progress-slow");
  if (elapsedSec >= 30) {
    generateProgressNoteEl.textContent = "远程脚本生成较慢时，分段整理会稍后完成。";
    return;
  }
  generateProgressNoteEl.textContent = "通常只需要先完成脚本生成和节奏整理。";
}

function handleEditorInput() {
  updateEditorState();
  if (currentDraft) {
    setupPreviewImage(currentDraft, buildAssetVersion(currentDraft));
    renderCoverSafeOverlay();
  }
}

function handleJumpCoverEditor() {
  document.querySelector("#section-script")?.scrollIntoView({ behavior: "smooth", block: "start" });
  editorGroupCoverEl?.setAttribute("open", "open");
  window.setTimeout(() => {
    editCoverTitleEl?.focus();
  }, 180);
}

function bindEditorFocus(field, focusKey) {
  if (!field) {
    return;
  }

  field.addEventListener("focus", () => {
    currentEditorFocus = focusKey;
    updatePreviewFocusChip();
    if (currentDraft) {
      renderScriptView(currentDraft);
    }
  });

  field.addEventListener("blur", () => {
    currentEditorFocus = "overview";
    updatePreviewFocusChip();
    if (currentDraft) {
      renderScriptView(currentDraft);
    }
  });
}

function handleBeforeUnload(event) {
  if (!hasUnsavedChanges) {
    return;
  }

  event.preventDefault();
  event.returnValue = "";
}

async function handleCopyScript() {
  if (!currentDraft) {
    setStatus("请先生成或打开一个草稿。", "error");
    return;
  }

  const text = [
    `开头 Hook：${currentDraft.hook}`,
    `第 1 段：${currentDraft.sections?.[0] || ""}`,
    `第 2 段：${currentDraft.sections?.[1] || ""}`,
    `第 3 段：${currentDraft.sections?.[2] || ""}`,
    `结尾引导：${currentDraft.cta}`,
  ].join("\n\n");

  const copied = await copyText(text);
  setStatus(copied ? "口播文案已复制。" : "复制失败，请检查浏览器权限。", copied ? "success" : "error");
}

async function handleCopySubtitles() {
  if (!currentDraft) {
    setStatus("请先生成或打开一个草稿。", "error");
    return;
  }

  const text = (currentDraft.subtitleEntries || [])
    .map((entry) => `${formatTime(entry.startSec)} - ${formatTime(entry.endSec)}  ${entry.text}`)
    .join("\n");

  const copied = await copyText(text);
  setStatus(copied ? "字幕时间轴已复制。" : "复制失败，请检查浏览器权限。", copied ? "success" : "error");
}

async function handleResumeLastDraft() {
  if (!lastDraftId) {
    return;
  }

  await loadDraft(lastDraftId);
}

async function handleStoryboardClick(event) {
  const selectButton = event.target.closest("[data-scene-select]");
  if (selectButton) {
    persistStoryboardFieldChanges();
    currentStoryboardIndex = Number(selectButton.dataset.sceneSelect || 0);
    renderStoryboardView(storyboardDraftState, buildAssetVersion(currentDraft || {}));
    return;
  }

  const addButton = event.target.closest(".storyboard-add-btn");
  if (addButton) {
    handleStoryboardAdd(addButton);
    return;
  }

  const moveButton = event.target.closest(".storyboard-move-btn");
  if (moveButton) {
    handleStoryboardMove(moveButton);
    return;
  }

  const deleteButton = event.target.closest(".storyboard-delete-btn");
  if (deleteButton) {
    handleStoryboardDelete(deleteButton);
    return;
  }

  const button = event.target.closest(".storyboard-refresh-btn");
  if (!button || !currentDraftId) {
    return;
  }

  const sceneId = button.dataset.sceneId;
  if (!sceneId) {
    return;
  }

  try {
    button.disabled = true;
    button.textContent = "重做中...";
    setStatus("正在重做当前镜头素材...", "working");
    const data = await postJson("/api/drafts/scene-regenerate", { draftId: currentDraftId, sceneId });
    renderDraft(data.draft);
    await loadDraftHistory();
    setStatus("当前镜头已重做。", "success");
  } catch (error) {
    setStatus(error.message || "重做镜头失败", "error");
  } finally {
    button.disabled = false;
    button.textContent = "重做这个镜头";
  }
}

function handleStoryboardAdd(button) {
  const index = Number(button.dataset.sceneIndex);
  if (!Number.isInteger(index)) {
    return;
  }
  persistStoryboardFieldChanges();
  const newSceneId = `scene-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
  storyboardDraftState.splice(index + 1, 0, {
    id: newSceneId,
    sceneTitle: "新增镜头",
    visualType: "image",
    durationSec: 6,
    voiceover: "",
    visualPrompt: "",
    assetPath: "",
  });
  currentStoryboardIndex = index + 1;
  renderStoryboardView(storyboardDraftState, buildAssetVersion(currentDraft || {}));
  handleEditorInput();
  storyboardListEl.querySelector('[data-scene-field="sceneTitle"]')?.focus();
}

function handleStoryboardMove(button) {
  const direction = button.dataset.sceneMove;
  const index = Number(button.dataset.sceneIndex);

  if (!Number.isInteger(index)) {
    return;
  }

  persistStoryboardFieldChanges();
  if (direction === "up" && index > 0) {
    [storyboardDraftState[index - 1], storyboardDraftState[index]] = [storyboardDraftState[index], storyboardDraftState[index - 1]];
    currentStoryboardIndex = index - 1;
  }

  if (direction === "down" && index < storyboardDraftState.length - 1) {
    [storyboardDraftState[index + 1], storyboardDraftState[index]] = [storyboardDraftState[index], storyboardDraftState[index + 1]];
    currentStoryboardIndex = index + 1;
  }

  renderStoryboardView(storyboardDraftState, buildAssetVersion(currentDraft || {}));
  handleEditorInput();
}

function handleStoryboardDelete(button) {
  if (storyboardDraftState.length <= 1) {
    return;
  }

  const index = Number(button.dataset.sceneIndex);
  if (!Number.isInteger(index)) {
    return;
  }

  persistStoryboardFieldChanges();
  storyboardDraftState.splice(index, 1);
  currentStoryboardIndex = clampStoryboardIndex(currentStoryboardIndex > index ? currentStoryboardIndex - 1 : currentStoryboardIndex, storyboardDraftState.length);
  renderStoryboardView(storyboardDraftState, buildAssetVersion(currentDraft || {}));
  handleEditorInput();
}

function handleSuggestTopic(event) {
  const topic = event.currentTarget?.dataset?.topic || "";
  const angle = event.currentTarget?.dataset?.angle || "";
  const audience = event.currentTarget?.dataset?.audience || "";
  if (!topic) {
    return;
  }

  setSelectedSourceType("topic");
  topicInputEl.value = topic;
  rawContentEl.value = "";
  angleInputEl.value = angle;
  rewriteStyleEl.value = "industry_observation";
  if (audienceInputEl) {
    audienceInputEl.value = audience;
  }
  updateInputSourceUI();
  setStatus("已填入推荐预设，可以直接生成草稿。", "success");
}

function handleRandomExample() {
  if (!RANDOM_EXAMPLE_PRESETS.length) {
    return;
  }

  const picked = RANDOM_EXAMPLE_PRESETS[Math.floor(Math.random() * RANDOM_EXAMPLE_PRESETS.length)];
  setSelectedSourceType("topic");
  topicInputEl.value = picked.topic || "";
  rawContentEl.value = "";
  angleInputEl.value = picked.angle || "";
  rewriteStyleEl.value = picked.rewriteStyle || "industry_observation";
  if (audienceInputEl) {
    audienceInputEl.value = picked.audience || "";
  }
  updateInputSourceUI();
  setStatus("已填入示例主题，可以直接开始制片。", "success");
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

function handleClearForm() {
  setSelectedSourceType("topic");
  topicInputEl.value = "";
  rawContentEl.value = "";
  angleInputEl.value = "";
  rewriteStyleEl.value = "industry_observation";
  if (audienceInputEl) {
    audienceInputEl.value = "IVD 企业管理层、市场负责人、渠道商、实验室管理者";
  }
  durationModeEl.value = "90";
  if (coverStyleSelectEl) {
    coverStyleSelectEl.value = "report";
  }

  updateInputSourceUI();
  setStatus("已清空当前输入。", "success");
}

function handleRawContentInput() {
  if (getSelectedSourceType() === "article") {
    setStatus(`已识别输入内容，将按${getRewriteStyleLabel(rewriteStyleEl.value)}风格提炼并改写。`, "info");
  }
}


function getSelectedSourceType() {
  return [...sourceTypeEls].find((field) => field.checked)?.value || "topic";
}

function setSelectedSourceType(nextType) {
  sourceTypeEls.forEach((field) => {
    field.checked = field.value === nextType;
  });
}

function updateInputSourceUI() {
  const sourceType = getSelectedSourceType();
  const useArticle = sourceType === "article";

  topicFieldEl?.classList.toggle("hidden", useArticle);
  rawContentFieldEl?.classList.toggle("hidden", !useArticle);
  topicInputEl.required = !useArticle;
  rawContentEl.required = useArticle;

  if (useArticle) {
    rawContentEl.placeholder = "可以直接粘贴文章标题、一段正文，或标题加正文。系统会先提炼核心信息，再改写成适合视频号的视频文案。";
    setStatus(`当前按标题 / 正文生成，会先提炼内容，再改写成${getRewriteStyleLabel(rewriteStyleEl.value)}风格文案。`, "info");
    return;
  }

  topicInputEl.placeholder = "例如：集采后 IVD 渠道的下一轮机会在哪里";
  setStatus(`当前按主题直接生成草稿，输出风格为${getRewriteStyleLabel(rewriteStyleEl.value)}。`, "info");
}

function getRewriteStyleLabel(style) {
  switch (style) {
    case "deep_analysis":
      return "深度解读";
    case "point_breakdown":
      return "观点拆解";
    default:
      return "行业观察";
  }
}

function formatTime(seconds) {
  return `${Number(seconds || 0).toFixed(2)}s`;
}

function formatDateTime(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleString("zh-CN");
}

function updatePreviewFocusChip() {
  if (!previewFocusChip) {
    return;
  }
  previewFocusChip.textContent = `当前查看：${currentEditorFocus === "overview" ? currentPreviewReviewLabel : getFocusLabel(currentEditorFocus)}`;
}

function setupPreviewImage(draft, assetVersion) {
  const previewCanvas = coverEl.closest(".preview-canvas");
  const previewPath = resolvePreviewCoverPath(draft);
  if (!previewCanvas) {
    coverEl.src = toVersionedMediaUrl(previewPath || draft.assets.coverPath, assetVersion);
    return;
  }

  if (!previewPath && !draft?.assets?.coverPath) {
    previewCanvas.classList.add("preview-canvas-empty");
    coverEl.classList.add("is-hidden");
    coverEl.removeAttribute("src");
    return;
  }

  const liveCompose = Boolean(previewPath && currentDirtyState.cover);
  previewCanvas.classList.toggle("is-live-compose", liveCompose);
  previewCanvas.classList.remove("preview-canvas-empty");
  coverEl.classList.remove("is-hidden");
  coverEl.onload = () => {
    previewCanvas.classList.remove("preview-canvas-empty");
    coverEl.classList.remove("is-hidden");
  };
  coverEl.onerror = () => {
    previewCanvas.classList.add("preview-canvas-empty");
    coverEl.classList.add("is-hidden");
  };
  coverEl.src = liveCompose
    ? buildLiveComposedCoverPreviewUrl(draft, assetVersion)
    : toVersionedMediaUrl(previewPath || draft.assets.coverPath, assetVersion);
}

function buildLiveComposedCoverPreviewUrl(draft, assetVersion) {
  const source = getDraftScriptSource(draft);
  const script = {
    coverTitle: editCoverTitleEl?.value?.trim() || source.coverTitle || "",
    coverSubtitle: editCoverSubtitleEl?.value?.trim() || source.coverSubtitle || "",
    coverTitlePosition: editCoverPositionEl?.value || source.coverTitlePosition || "middle",
    coverTitleAlign: editCoverAlignEl?.value || source.coverTitleAlign || "left",
    coverTitleSize: editCoverSizeEl?.value || source.coverTitleSize || "large",
    coverTitleWidth: editCoverTitleWidthEl?.value || source.coverTitleWidth || "normal",
    coverTitleOffset: editCoverTitleOffsetEl?.value || String(source.coverTitleOffset ?? "0"),
    coverTitleXOffset: editCoverTitleXOffsetEl?.value || String(source.coverTitleXOffset ?? "0"),
    coverTitleSpacing: editCoverTitleSpacingEl?.value || source.coverTitleSpacing || "normal",
    coverSubtitlePosition: editCoverSubtitlePositionEl?.value || source.coverSubtitlePosition || "below-title",
    coverSubtitleSize: editCoverSubtitleSizeEl?.value || source.coverSubtitleSize || "small",
    coverSubtitleAlign: editCoverSubtitleAlignEl?.value || source.coverSubtitleAlign || "follow",
    coverSubtitleOffset: editCoverSubtitleOffsetEl?.value || String(source.coverSubtitleOffset ?? "0"),
    coverSubtitleXOffset: editCoverSubtitleXOffsetEl?.value || String(source.coverSubtitleXOffset ?? "0"),
    coverSubtitleWidth: editCoverSubtitleWidthEl?.value || source.coverSubtitleWidth || "normal",
  };
  const backgroundUrl = toVersionedMediaUrl(resolvePreviewCoverPath(draft), assetVersion);
  const svg = buildLiveCoverPreviewSvg(script, draft?.coverStyle || "report", backgroundUrl);
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

function buildLiveCoverPreviewSvg(script, coverStyle, backgroundUrl) {
  const backgroundMarkup = `
  <image href="${escapeXml(backgroundUrl)}" x="0" y="0" width="1080" height="1920" preserveAspectRatio="xMidYMid slice"/>
  <rect width="1080" height="1920" fill="#041018" fill-opacity="0.18"/>
`;
  return buildCoverComposedSvgDocument({
    script,
    coverStyle,
    backgroundMarkup,
  });
}

function resolvePreviewCoverPath(draft) {
  if (!draft) {
    return "";
  }

  if (!currentDirtyState.cover) {
    return draft.assets?.coverPath || "";
  }

  const selectedBackground = (draft.coverBackgroundHistory || []).find((item) => item?.selected && item?.backgroundPath);
  return selectedBackground?.backgroundPath || draft.assets?.coverPath || "";
}

function renderCoverSafeOverlay() {
  if (!coverSafeOverlayEl || !coverSafeFrameEl || !coverSafeTitleEl || !coverSafeSubtitleEl) {
    return;
  }

  const source = currentDraft ? getDraftScriptSource(currentDraft) : {};
  const title = editCoverTitleEl?.value?.trim() || source.coverTitle || "";
  const subtitle = editCoverSubtitleEl?.value?.trim() || source.coverSubtitle || "";
  const position = editCoverPositionEl?.value || source.coverTitlePosition || "middle";
  const align = editCoverAlignEl?.value || source.coverTitleAlign || "left";
  const size = editCoverSizeEl?.value || source.coverTitleSize || "large";
  const titleWidth = editCoverTitleWidthEl?.value || source.coverTitleWidth || "normal";
  const titleOffset = editCoverTitleOffsetEl?.value || String(source.coverTitleOffset ?? "0");
  const titleXOffset = editCoverTitleXOffsetEl?.value || String(source.coverTitleXOffset ?? "0");
  const titleSpacing = editCoverTitleSpacingEl?.value || source.coverTitleSpacing || "normal";
  const subtitlePosition = editCoverSubtitlePositionEl?.value || source.coverSubtitlePosition || "below-title";
  const subtitleSize = editCoverSubtitleSizeEl?.value || source.coverSubtitleSize || "small";
  const subtitleAlign = editCoverSubtitleAlignEl?.value || source.coverSubtitleAlign || "follow";
  const subtitleOffset = editCoverSubtitleOffsetEl?.value || String(source.coverSubtitleOffset ?? "0");
  const subtitleXOffset = editCoverSubtitleXOffsetEl?.value || String(source.coverSubtitleXOffset ?? "0");
  const subtitleWidth = editCoverSubtitleWidthEl?.value || source.coverSubtitleWidth || "normal";
  const isLiveCompose = Boolean(currentDirtyState.cover);

  coverSafeOverlayEl.dataset.position = position;
  coverSafeOverlayEl.dataset.align = align;
  coverSafeOverlayEl.dataset.size = size;
  coverSafeOverlayEl.dataset.titleWidth = titleWidth;
  coverSafeOverlayEl.dataset.titleOffset = titleOffset;
  coverSafeOverlayEl.dataset.titleXOffset = titleXOffset;
  coverSafeOverlayEl.dataset.titleSpacing = titleSpacing;
  coverSafeOverlayEl.dataset.subtitlePosition = subtitlePosition;
  coverSafeOverlayEl.dataset.subtitleSize = subtitleSize;
  coverSafeOverlayEl.dataset.subtitleAlign = subtitleAlign === "follow" ? align : subtitleAlign;
  coverSafeOverlayEl.dataset.subtitleOffset = subtitleOffset;
  coverSafeOverlayEl.dataset.subtitleXOffset = subtitleXOffset;
  coverSafeOverlayEl.dataset.subtitleWidth = subtitleWidth;
  coverSafeOverlayEl.classList.toggle("is-live-compose", isLiveCompose);
  if (coverSafeKickerEl) {
    coverSafeKickerEl.textContent = isLiveCompose ? "实时叠字预览" : "标题安全区";
  }
  if (isLiveCompose) {
    coverSafeTitleEl.textContent = "";
    coverSafeSubtitleEl.textContent = "";
    coverSafeFrameEl.classList.remove("is-empty");
  } else {
    coverSafeTitleEl.textContent = title || "这里会按你的标题设置硬叠主标题";
    coverSafeSubtitleEl.textContent = subtitlePosition === "hidden"
      ? ""
      : (subtitle || "这里会按当前副标题和安全区规则预览叠字位置");
    coverSafeFrameEl.classList.toggle("is-empty", !title && (!subtitle || subtitlePosition === "hidden"));
  }
}

function renderCoverBackgroundHistory(draft, assetVersion) {
  if (!coverBackgroundHistoryGridEl || !coverBackgroundHistoryMetaEl) {
    return;
  }

  const items = Array.isArray(draft?.coverBackgroundHistory) ? draft.coverBackgroundHistory : [];
  coverBackgroundCompareIds = coverBackgroundCompareIds.filter((id) => items.some((item) => item.id === id)).slice(0, 2);
  coverBackgroundHistoryMetaEl.textContent = items.length
    ? `当前保留 ${items.length} 张纯背景候选。这里先挑底图，正式封面仍以上方排版预览为准。`
    : "每次重抽背景都会保留最近几张纯背景，可随时回切并重新套用当前标题。";

  if (!items.length) {
    coverBackgroundHistoryGridEl.innerHTML = '<div class="status">还没有背景候选，先点一次“只重抽背景”。</div>';
    return;
  }

  coverBackgroundHistoryGridEl.innerHTML = items.map((item, index) => `
    <article class="cover-background-card${item.selected ? " is-active" : ""}">
      <img class="cover-background-thumb" src="${toVersionedMediaUrl(item.backgroundPath, assetVersion)}" alt="纯背景版本 ${index + 1}" />
      <div class="cover-background-card-meta">
        <strong>${escapeHtml(item.coverStyleLabel || "背景底图")}</strong>
        <span>${item.starred ? "已收藏 · " : ""}${item.selected ? "当前使用中" : formatDateTime(item.createdAt)}</span>
      </div>
      <div class="cover-background-card-actions">
        <button type="button" class="switch-btn" data-cover-background-id="${escapeHtml(item.id)}" ${item.selected ? "disabled" : ""}>${item.selected ? "当前背景" : "设为当前背景"}</button>
        <button type="button" class="switch-btn" data-cover-background-compare-id="${escapeHtml(item.id)}">${coverBackgroundCompareIds.includes(item.id) ? "已加入对比" : "加入对比"}</button>
        <button type="button" class="switch-btn" data-cover-background-star-id="${escapeHtml(item.id)}">${item.starred ? "取消收藏" : "收藏背景"}</button>
      </div>
    </article>
  `).join("");

  coverBackgroundHistoryGridEl.querySelectorAll("[data-cover-background-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      await handleSelectCoverBackground(button.dataset.coverBackgroundId);
    });
  });
  coverBackgroundHistoryGridEl.querySelectorAll("[data-cover-background-compare-id]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleCoverBackgroundCompare(button.dataset.coverBackgroundCompareId);
      renderCoverBackgroundHistory(currentDraft, buildAssetVersion(currentDraft));
      renderCoverBackgroundCompare(currentDraft, buildAssetVersion(currentDraft));
    });
  });
  coverBackgroundHistoryGridEl.querySelectorAll("[data-cover-background-star-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const item = items.find((entry) => entry.id === button.dataset.coverBackgroundStarId);
      await handleToggleCoverBackgroundStar(button.dataset.coverBackgroundStarId, !item?.starred);
    });
  });
}

function toggleCoverBackgroundCompare(backgroundId) {
  if (!backgroundId) {
    return;
  }

  if (coverBackgroundCompareIds.includes(backgroundId)) {
    coverBackgroundCompareIds = coverBackgroundCompareIds.filter((id) => id !== backgroundId);
    return;
  }

  coverBackgroundCompareIds = [...coverBackgroundCompareIds, backgroundId].slice(-2);
}

function renderCoverBackgroundCompare(draft, assetVersion) {
  if (!coverBackgroundCompareEl || !coverBackgroundCompareGridEl || !coverBackgroundCompareMetaEl) {
    return;
  }

  const items = Array.isArray(draft?.coverBackgroundHistory) ? draft.coverBackgroundHistory : [];
  const compareItems = coverBackgroundCompareIds
    .map((id) => items.find((item) => item.id === id))
    .filter(Boolean);

  coverBackgroundCompareEl.classList.toggle("hidden", compareItems.length < 2);
  if (compareItems.length < 2) {
    coverBackgroundCompareGridEl.innerHTML = "";
    return;
  }

  coverBackgroundCompareMetaEl.textContent = "这里对比的是纯背景。选中后只会切换底图，当前标题排版会原样保留在上方正式预览里。";
  coverBackgroundCompareGridEl.innerHTML = compareItems.map((item, index) => `
    <article class="cover-background-compare-card">
      <img class="cover-background-thumb" src="${toVersionedMediaUrl(item.backgroundPath, assetVersion)}" alt="对比背景 ${index + 1}" />
      <div class="cover-background-card-meta">
        <strong>${escapeHtml(item.coverStyleLabel || `背景 ${index + 1}`)}</strong>
        <span>${item.starred ? "已收藏 · " : ""}${item.selected ? "当前使用中" : formatDateTime(item.createdAt)}</span>
      </div>
      <div class="cover-background-compare-actions">
        <button type="button" class="switch-btn" data-cover-background-id="${escapeHtml(item.id)}" ${item.selected ? "disabled" : ""}>${item.selected ? "当前背景" : "设为当前背景"}</button>
        <button type="button" class="switch-btn" data-cover-background-star-id="${escapeHtml(item.id)}">${item.starred ? "取消收藏" : "收藏背景"}</button>
        <button type="button" class="switch-btn" data-cover-background-remove-id="${escapeHtml(item.id)}">移出对比</button>
      </div>
    </article>
  `).join("");

  coverBackgroundCompareGridEl.querySelectorAll("[data-cover-background-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      await handleSelectCoverBackground(button.dataset.coverBackgroundId);
    });
  });
  coverBackgroundCompareGridEl.querySelectorAll("[data-cover-background-star-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const item = compareItems.find((entry) => entry.id === button.dataset.coverBackgroundStarId);
      await handleToggleCoverBackgroundStar(button.dataset.coverBackgroundStarId, !item?.starred);
    });
  });
  coverBackgroundCompareGridEl.querySelectorAll("[data-cover-background-remove-id]").forEach((button) => {
    button.addEventListener("click", () => {
      coverBackgroundCompareIds = coverBackgroundCompareIds.filter((id) => id !== button.dataset.coverBackgroundRemoveId);
      renderCoverBackgroundHistory(currentDraft, buildAssetVersion(currentDraft));
      renderCoverBackgroundCompare(currentDraft, buildAssetVersion(currentDraft));
    });
  });
}

function buildAssetVersion(draft) {
  return encodeURIComponent(String(draft.updatedAt || draft.createdAt || ""));
}

function toVersionedMediaUrl(mediaPath, version) {
  if (!mediaPath) {
    return "";
  }
  if (/^(data:|https?:)/.test(String(mediaPath))) {
    return String(mediaPath);
  }
  return `/media/${mediaPath}?v=${version}`;
}

function getFocusLabel(focusKey) {
  switch (focusKey) {
    case "title":
      return "标题";
    case "cover":
      return "封面文案";
    case "hook":
      return "开头 Hook";
    case "section-1":
      return "第 1 段";
    case "section-2":
      return "第 2 段";
    case "section-3":
      return "第 3 段";
    case "cta":
      return "结尾引导";
    default:
      return "整体成片";
  }
}

function highlightActiveHistoryItem() {
  historyList?.querySelectorAll(".history-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.draftId === currentDraftId);
  });
}

async function bootstrapInitialDraftFromUrl() {
  const url = new URL(window.location.href);
  if (url.searchParams.get("front") === "1") {
    persistCurrentDraftId("");
    currentDraft = null;
    currentDraftId = "";
    applyProductionShell(false);
    return;
  }

  const draftId = url.searchParams.get("draft") || getStoredCurrentDraftId() || lastDraftId;
  if (!draftId) {
    return;
  }

  await loadDraft(draftId);
}

function pulseResult() {
  resultEl.classList.remove("result-focus");
  void resultEl.offsetWidth;
  resultEl.classList.add("result-focus");
}

async function copyText(text) {
  if (!text) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function getEditorPayload() {
  return {
    titleVariantA: editTitleAEl.value.trim(),
    titleVariantB: editTitleBEl?.value?.trim() || editTitleAEl.value.trim(),
    coverTitle: editCoverTitleEl.value.trim(),
    coverSubtitle: editCoverSubtitleEl?.value?.trim() || "",
    coverVisualPrompt: editCoverVisualPromptEl?.value?.trim() || "",
    coverNegativePrompt: editCoverNegativePromptEl?.value?.trim() || "",
    coverTitlePosition: editCoverPositionEl?.value || "middle",
    coverTitleAlign: editCoverAlignEl?.value || "left",
    coverTitleSize: editCoverSizeEl?.value || "large",
    coverTitleWidth: editCoverTitleWidthEl?.value || "normal",
    coverTitleOffset: editCoverTitleOffsetEl?.value || "0",
    coverTitleSpacing: editCoverTitleSpacingEl?.value || "normal",
    coverSubtitlePosition: editCoverSubtitlePositionEl?.value || "below-title",
    coverSubtitleSize: editCoverSubtitleSizeEl?.value || "small",
    coverSubtitleAlign: editCoverSubtitleAlignEl?.value || "follow",
    coverSubtitleOffset: editCoverSubtitleOffsetEl?.value || "0",
    coverSubtitleWidth: editCoverSubtitleWidthEl?.value || "normal",
    hook: editHookEl.value.trim(),
    sections: [editSection1El.value.trim(), editSection2El.value.trim(), editSection3El.value.trim()],
    cta: editCtaEl.value.trim(),
    durationMode: String(durationModeEl.value || ""),
    storyboard: collectStoryboardPayload(),
  };
}

function flushSavedEditorState(draft) {
  syncDraftSnapshotFromDraft(draft);
  resetEditorDirtyState();
  window.requestAnimationFrame(() => {
    syncDraftSnapshotFromDraft(currentDraft || draft);
    resetEditorDirtyState();
  });
}

function collectStoryboardPayload() {
  persistStoryboardFieldChanges();
  return cloneStoryboard(storyboardDraftState);
}

function handleStoryboardInput(event) {
  const field = event.target.closest("[data-storyboard-index][data-scene-field]");
  if (field) {
    updateStoryboardField(field);
  }
  handleEditorInput();
}

function persistStoryboardFieldChanges() {
  if (!storyboardListEl) {
    return;
  }

  storyboardListEl.querySelectorAll("[data-storyboard-index][data-scene-field]").forEach(updateStoryboardField);
}

function updateStoryboardField(field) {
  const index = Number(field.dataset.storyboardIndex || -1);
  const sceneField = String(field.dataset.sceneField || "");
  if (!Number.isInteger(index) || index < 0 || !storyboardDraftState[index]) {
    return;
  }

  if (sceneField === "durationSec") {
    storyboardDraftState[index][sceneField] = Number(field.value || 0);
  } else {
    storyboardDraftState[index][sceneField] = String(field.value || "").trim();
  }
}

function clampStoryboardIndex(index, length) {
  if (!length) {
    return 0;
  }

  return Math.min(Math.max(index || 0, 0), length - 1);
}

function syncDraftSnapshot() {
  draftSnapshot = JSON.stringify(getEditorPayload());
  hasUnsavedChanges = false;
  updateEditorState();
}

function syncDraftSnapshotFromDraft(draft) {
  draftSnapshot = JSON.stringify(buildEditorSnapshotPayload({
    draft,
    durationModeValue: durationModeEl.value,
    getDraftScriptSource,
  }));
  hasUnsavedChanges = false;
}

function resetEditorDirtyState() {
  hasUnsavedChanges = false;
  currentDirtyState = {
    script: false,
    audio: false,
    storyboard: false,
    cover: false,
  };
  saveDraftBtn.textContent = "当前已保存";
  saveDraftBtn.disabled = true;
  editorStateEl.textContent = "当前内容已同步。";
  editorStateEl.className = "editor-state editor-state-synced";
  editableFields.forEach((field) => field.classList.remove("field-dirty"));
  updateEditorGroupStatus({
    title: false,
    cover: false,
    body: false,
    cta: false,
  });
}

function updateEditorState() {
  if (!currentDraftId || !draftSnapshot) {
    hasUnsavedChanges = false;
    currentDirtyState = {
      script: false,
      audio: false,
      storyboard: false,
      cover: false,
    };
    saveDraftBtn.textContent = "保存这轮文案修订";
    saveDraftBtn.disabled = !currentDraftId;
    editorStateEl.textContent = "当前内容已同步。";
    editorStateEl.className = "editor-state editor-state-synced";
    editableFields.forEach((field) => field.classList.remove("field-dirty"));
    updateEditorGroupStatus({
      title: false,
      cover: false,
      body: false,
      cta: false,
    });
    renderWorkflowMap(currentDraft);
    return;
  }

  const currentPayload = getEditorPayload();
  const snapshot = JSON.parse(draftSnapshot);

  const dirtyState = buildEditorDirtyState(currentPayload, snapshot);
  hasUnsavedChanges = dirtyState.hasUnsavedChanges;
  saveDraftBtn.textContent = dirtyState.hasEditorUnsavedChanges ? "保存这轮文案修订" : "当前已保存";
  saveDraftBtn.disabled = !dirtyState.hasEditorUnsavedChanges;
  editorStateEl.textContent = dirtyState.hasEditorUnsavedChanges ? "你有未保存的修改。" : "当前内容已同步。";
  editorStateEl.className = dirtyState.hasEditorUnsavedChanges ? "editor-state editor-state-dirty" : "editor-state editor-state-synced";

  editTitleAEl?.classList.toggle("field-dirty", dirtyState.titleDirty);
  editCoverTitleEl?.classList.toggle("field-dirty", dirtyState.coverDirty);
  editCoverSubtitleEl?.classList.toggle("field-dirty", dirtyState.coverDirty);
  editCoverVisualPromptEl?.classList.toggle("field-dirty", dirtyState.coverDirty);
  editCoverNegativePromptEl?.classList.toggle("field-dirty", dirtyState.coverDirty);
  editCoverTitleWidthEl?.classList.toggle("field-dirty", dirtyState.coverDirty);
  editCoverTitleOffsetEl?.classList.toggle("field-dirty", dirtyState.coverDirty);
  editCoverTitleSpacingEl?.classList.toggle("field-dirty", dirtyState.coverDirty);
  editCoverSubtitlePositionEl?.classList.toggle("field-dirty", dirtyState.coverDirty);
  editCoverSubtitleSizeEl?.classList.toggle("field-dirty", dirtyState.coverDirty);
  editCoverSubtitleAlignEl?.classList.toggle("field-dirty", dirtyState.coverDirty);
  editCoverSubtitleOffsetEl?.classList.toggle("field-dirty", dirtyState.coverDirty);
  editCoverSubtitleWidthEl?.classList.toggle("field-dirty", dirtyState.coverDirty);
  editHookEl?.classList.toggle("field-dirty", currentPayload.hook !== snapshot.hook);
  editSection1El?.classList.toggle("field-dirty", currentPayload.sections[0] !== snapshot.sections[0]);
  editSection2El?.classList.toggle("field-dirty", currentPayload.sections[1] !== snapshot.sections[1]);
  editSection3El?.classList.toggle("field-dirty", currentPayload.sections[2] !== snapshot.sections[2]);
  editCtaEl?.classList.toggle("field-dirty", dirtyState.ctaDirty);
  durationModeEl?.classList.toggle("field-dirty", dirtyState.durationDirty);

  currentDirtyState = {
    script: dirtyState.titleDirty || dirtyState.bodyDirty || dirtyState.ctaDirty,
    audio: dirtyState.bodyDirty || dirtyState.ctaDirty || dirtyState.durationDirty,
    storyboard: dirtyState.storyboardDirty,
    cover: dirtyState.coverDirty,
  };

  updateEditorGroupStatus({
    title: dirtyState.titleDirty,
    cover: dirtyState.coverDirty,
    body: dirtyState.bodyDirty,
    cta: dirtyState.ctaDirty,
  });
  renderWorkflowMap(currentDraft);
}

function updateEditorGroupStatus(groups) {
  setEditorGroupState(editorGroupTitleEl, editorGroupTitleStatusEl, groups.title);
  setEditorGroupState(editorGroupCoverEl, editorGroupCoverStatusEl, groups.cover);
  setEditorGroupState(editorGroupBodyEl, editorGroupBodyStatusEl, groups.body);
  setEditorGroupState(editorGroupCtaEl, editorGroupCtaStatusEl, groups.cta);
}

function setEditorGroupState(groupEl, statusEl, isDirty) {
  groupEl?.classList.toggle("editor-group-dirty", isDirty);
  if (statusEl) {
    statusEl.textContent = isDirty ? "有修改" : "已同步";
    statusEl.classList.toggle("is-dirty", isDirty);
  }
}

function getFieldKey(field) {
  switch (field) {
    case editTitleAEl:
      return "titleVariantA";
    case editCoverTitleEl:
      return "coverTitle";
    case editCoverVisualPromptEl:
      return "coverVisualPrompt";
    case editCoverNegativePromptEl:
      return "coverNegativePrompt";
    case editHookEl:
      return "hook";
    case editCtaEl:
      return "cta";
    case durationModeEl:
      return "durationMode";
    default:
      return "sections";
  }
}

function confirmDiscardChanges() {
  if (!hasUnsavedChanges) {
    return true;
  }

  return window.confirm("当前草稿有未保存的修改，继续操作会丢失这些变更。要继续吗？");
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getVisualTypeLabel(type) {
  switch (type) {
    case "cover":
      return "封面开场";
    case "chart":
      return "变量图表";
    case "quote":
      return "观点卡片";
    case "brand_outro":
      return "结尾收束";
    default:
      return "画面镜头";
  }
}

function buildVisualTypeOptions(currentType) {
  const options = [
    ["cover", "封面开场"],
    ["image", "画面镜头"],
    ["chart", "变量图表"],
    ["quote", "观点卡片"],
    ["brand_outro", "结尾收束"],
  ];

  return options
    .map(([value, label]) => `<option value="${value}" ${currentType === value ? "selected" : ""}>${label}</option>`)
    .join("");
}

function setLlmConfigStatus(message, tone = "info") {
  if (!llmConfigStatusEl) {
    return;
  }

  llmConfigStatusEl.textContent = message;
  llmConfigStatusEl.className = `status status-${tone}`;
}

function setLlmRouteTestStatus(id, message, tone = "idle") {
  const element = document.querySelector(`#${id}`);
  if (!element) {
    return;
  }

  element.textContent = message;
  element.className = `llm-test-status llm-test-status-${tone}`;
}

function setInputValue(id, value) {
  const element = document.querySelector(`#${id}`);
  if (element) {
    element.value = value;
  }
}

function setTextValue(id, value) {
  const element = document.querySelector(`#${id}`);
  if (element) {
    element.textContent = value;
  }
}

function setCheckboxValue(id, checked) {
  const element = document.querySelector(`#${id}`);
  if (element) {
    element.checked = Boolean(checked);
  }
}

function getInputValue(id) {
  const element = document.querySelector(`#${id}`);
  return String(element?.value || "").trim();
}

function getCheckboxValue(id) {
  return Boolean(document.querySelector(`#${id}`)?.checked);
}

function buildHistoryReadiness(draft) {
  return buildHistoryReadinessView(draft);
}

function debounce(fn, wait) {
  let timer = 0;
  return () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(), wait);
  };
}
