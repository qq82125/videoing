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
const scriptEl = document.querySelector("#script-view");
const subtitleEl = document.querySelector("#subtitle-view");
const audioEl = document.querySelector("#audio-player");
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
const editCoverSubtitleEl = document.querySelector("#edit-cover-subtitle");
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
const lightTrialBtn = document.querySelector("#light-trial-btn");
const partialAudioBtn = document.querySelector("#partial-audio-btn");
const partialCoverBtn = document.querySelector("#partial-cover-btn");
const partialSceneBtn = document.querySelector("#partial-scene-btn");
const fullTrialBtn = document.querySelector("#full-trial-btn");
const partialAudioMetaEl = document.querySelector("#partial-audio-meta");
const partialCoverMetaEl = document.querySelector("#partial-cover-meta");
const partialSceneMetaEl = document.querySelector("#partial-scene-meta");
const editorAudioBtn = document.querySelector("#editor-audio-btn");
const editorCoverBtn = document.querySelector("#editor-cover-btn");
const editorLightTrialBtn = document.querySelector("#editor-light-trial-btn");
const storyboardPartialBtn = document.querySelector("#storyboard-partial-btn");
const storyboardFullTrialBtn = document.querySelector("#storyboard-full-trial-btn");
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
  editTitleBEl,
  editCoverTitleEl,
  editCoverSubtitleEl,
  editHookEl,
  editSection1El,
  editSection2El,
  editSection3El,
  editCtaEl,
  durationModeEl,
];

let currentDraftId = "";
let currentCoverStyle = "report";
let currentTitleVariant = "a";
let currentDraft = null;
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
let runtimeStatusTimer = null;
let llmConfigLoaded = false;
let generateProgressTimer = null;
let generateProgressStartedAt = 0;
let statusHideTimer = null;
const PREVIEW_DRAFT_ID = "__preview__";
const DRAFT_STAGE_STORAGE_KEY = "draftStages";

const GENERATE_PROGRESS_STEPS = [
  "生成文案",
  "生成分镜",
  "生成图片",
  "生成配音",
  "整理草稿",
];

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
  checkBtn.addEventListener("click", handleQualityCheck);
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
  railDrawerToggleBtn?.addEventListener("click", handleRailDrawerToggle);
  railDrawerBackdropEl?.addEventListener("click", () => setInputDrawerOpen(false));
  previewWorkspaceBtn?.addEventListener("click", handlePreviewWorkspace);
  workflowRecommendBtn?.addEventListener("click", handleRecommendAction);
  manageRecommendBtn?.addEventListener("click", handleRecommendAction);
  lightTrialBtn?.addEventListener("click", handleLightTrial);
  partialAudioBtn?.addEventListener("click", handlePartialAudioRebuild);
  partialCoverBtn?.addEventListener("click", handlePartialCoverRebuild);
  partialSceneBtn?.addEventListener("click", handlePartialSceneRebuild);
  fullTrialBtn?.addEventListener("click", handleFullTrial);
  editorAudioBtn?.addEventListener("click", handlePartialAudioRebuild);
  editorCoverBtn?.addEventListener("click", handlePartialCoverRebuild);
  editorLightTrialBtn?.addEventListener("click", handleLightTrial);
  storyboardPartialBtn?.addEventListener("click", handlePartialSceneRebuild);
  storyboardFullTrialBtn?.addEventListener("click", handleFullTrial);
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
  storyboardListEl?.addEventListener("input", handleStoryboardInput);
  storyboardListEl?.addEventListener("click", handleStoryboardClick);
  bindEditorFocus(editTitleAEl, "title");
  bindEditorFocus(editTitleBEl, "title");
  bindEditorFocus(editCoverTitleEl, "cover");
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
  if (!confirmDiscardChanges()) {
    return;
  }
  setStatus("准备生成草稿...", "working");
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
    setStatus("正在生成文案结构...", "working");
    const data = await postJson("/api/generate", payload);
    currentDraftId = data.draft.id;
    setStatus("正在刷新预览和历史...", "working");
    setGenerateProgressStep(4);
    renderDraft(data.draft);
    await loadDraftHistory();
    setStatus(data.ffmpegInstalled ? "草稿已生成，确认后可直接导出视频。" : "草稿已生成。当前未检测到 ffmpeg，确认后会先生成导出脚本。", "success");
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

  togglePrimaryActions(true);
  try {
    setStatus("正在执行轻量试产：同步文案并重建口播、字幕、封面...", "working");
    const data = await postJson("/api/drafts/update", {
      draftId: currentDraftId,
      content: {
        title: currentDraft?.title || "",
        titleVariantA: editTitleAEl.value.trim(),
        titleVariantB: editTitleBEl.value.trim(),
        coverTitle: editCoverTitleEl.value.trim(),
        coverSubtitle: editCoverSubtitleEl.value.trim(),
        hook: editHookEl.value.trim(),
        sections: [editSection1El.value.trim(), editSection2El.value.trim(), editSection3El.value.trim()],
        cta: editCtaEl.value.trim(),
        durationMode: durationModeEl.value,
        storyboard: collectStoryboardPayload(),
      },
    });
    renderDraft(data.draft);
    await loadDraftHistory();
    setStatus("轻量试产已完成：文案已同步，口播、字幕和封面已重建。", "success");
    resultEl.scrollIntoView({ behavior: "smooth", block: "start" });
    pulseResult();
  } catch (error) {
    setStatus(error.message || "保存失败", "error");
  } finally {
    togglePrimaryActions(false);
  }
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
  currentDraft = draft;
  currentDraftId = draft.id;
  currentProductionStage = draft.productionStage || getStoredDraftStage(currentDraftId) || deriveProductionStage(draft);
  syncProductionStage();
  currentCoverStyle = draft.coverStyle || "report";
  currentTitleVariant = draft.activeTitleVariant || "a";
  storyboardDraftState = cloneStoryboard(draft.storyboard || []);
  currentStoryboardIndex = clampStoryboardIndex(currentStoryboardIndex, storyboardDraftState.length);
  durationModeEl.value = String(draft.durationMode || 90);
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
    `${draft.durationMode || 90} 秒`,
    draft.coverStyleLabel || "行业报告风",
    draft.angle || "默认行业视角",
  ].join(" · ");
  currentUpdatedEl.textContent = `最近更新：${formatDateTime(draft.updatedAt || draft.createdAt)}`;
  updateSidebarContext(draft);
  titleEl.textContent = draft.title;
  coverStyleEl.textContent = `${draft.coverStyleLabel || "行业报告风"} · ${draft.durationMode || 90} 秒`;
  previewComboTextEl.textContent = `当前方案：标题 ${String(currentTitleVariant || "a").toUpperCase()} + ${draft.coverStyleLabel || "行业报告风"}`;
  updatePreviewFocusChip();
  const assetVersion = buildAssetVersion(draft);
  setupPreviewImage(draft, assetVersion);
  if (draft.assets?.voicePath) {
    audioEl.src = toVersionedMediaUrl(draft.assets.voicePath, assetVersion);
  } else {
    audioEl.removeAttribute("src");
    audioEl.load();
  }
  renderScriptView(draft);
  renderSubtitleView(draft.subtitleEntries || []);
  renderStoryboardView(storyboardDraftState, assetVersion);

  editTitleAEl.value = draft.titleVariants?.a || "";
  editTitleBEl.value = draft.titleVariants?.b || "";
  editCoverTitleEl.value = draft.coverTitle || "";
  editCoverSubtitleEl.value = draft.coverSubtitle || "";
  editHookEl.value = draft.hook || "";
  editSection1El.value = draft.sections?.[0] || "";
  editSection2El.value = draft.sections?.[1] || "";
  editSection3El.value = draft.sections?.[2] || "";
  editCtaEl.value = draft.cta || "";
  syncDraftSnapshot();

  const productionStage = draft.productionStage || deriveProductionStage(draft);
  activeStageChip.textContent = getProductionStageLabel(productionStage);
  applyProductionStageTone(activeStageChip, productionStage, "active-chip-stage");
  activeTitleChip.textContent = `${draft.durationMode || 90} 秒`;
  activeCoverChip.textContent = draft.coverStyleLabel || "行业报告风";
  workflowStatusSelect.value = draft.workflowStatus || "pending";
  starBtn.textContent = draft.starred ? "取消收藏" : "收藏";

  renderWorkflowMap(draft);
  renderScriptPrep(draft);
  renderCombos(draft);
  renderQualityChecks(draft.qualityChecks || []);
  renderExportSummary(draft.exportInfo || null);
  renderReleaseControl(draft);
  syncExportLinks(draft);
  highlightActiveHistoryItem();
  syncPreviewButton();
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

  [workflowRecommendBtn, manageRecommendBtn].forEach((button) => {
    if (!button) {
      return;
    }
    button.textContent = recommendation.buttonLabel;
    button.dataset.recommendAction = recommendation.action;
    button.dataset.recommendTarget = recommendation.target || "";
  });

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
      editorRecommendTextEl.textContent = "这一轮改动会影响口播和字幕。先同步音频层，再听节奏和停顿是否顺，再决定要不要继续精修。";
    } else if (hasUnsavedChanges && currentDirtyState.script) {
      editorRecommendTextEl.textContent = "这一轮主要是文案层改动。先保存当前草稿，再判断下一步是回听口播还是直接看预览。";
    } else {
      editorRecommendTextEl.textContent = "当前文案层已经同步。这里更适合复核表达、顺口程度和字幕切分，而不是继续盲改。";
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
      storyboardRecommendTextEl.textContent = "分镜是后置精修层。先确认脚本，再进入试产，最后才值得花时间做镜头级修改。";
    } else if (hasUnsavedChanges && currentDirtyState.storyboard) {
      storyboardRecommendTextEl.textContent = "你已经改了镜头内容或节奏。先保存当前分镜，再决定是否重建当前镜头，不要立刻整条重跑。";
    } else if (storyboardDraftState.length) {
      storyboardRecommendTextEl.textContent = `如果只是 ${sceneLabel} 这一段节奏或素材有问题，优先重建当前镜头；只有整体不顺，才考虑完整试产。`;
    } else {
      storyboardRecommendTextEl.textContent = "当前还没有可操作的 scene。先在上游确认脚本和试产方向。";
    }
  }
}

function renderPreviewRecommendations(recommendation, draft) {
  if (!previewRecommendTitleEl || !previewRecommendTextEl || !previewComboTextEl || !previewFocusChip) {
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
  if (!releaseControlEl || !releaseControlTitleEl || !releaseControlTextEl || !releaseControlMetaEl) {
    return;
  }

  const checks = draft?.qualityChecks || [];
  const exportInfo = draft?.exportInfo || {};
  const hasError = checks.some((item) => item.level === "error");
  const hasWarning = checks.some((item) => item.level === "warning");
  const videoReady = Boolean(exportInfo.videoReady);

  let status = "idle";
  let title = "还不能判断是否可导出";
  let text = "先跑一次导出前检查，系统才知道当前离成片还差什么。";

  if (currentProductionStage === "script") {
    title = "还没进入试产导出阶段";
    text = "当前还在脚本确认阶段。先确认讲什么、怎么讲、讲多久，再回来判断是否能出片。";
  } else if (hasUnsavedChanges) {
    status = "warning";
    title = "先同步当前修改，再做发布判断";
    text = "你手上这版还没有同步到草稿。先保存或做轻量同步，再决定是否检查、试产或导出。";
  } else if (!checks.length) {
    title = "缺少导出判断依据";
    text = "还没有检查结果。先跑一次导出前检查，确认阻塞项、提醒项和系统状态。";
  } else if (videoReady) {
    status = "exported";
    title = "成片已生成，当前进入发布复核";
    text = "已经有可用成片。现在更适合从发布视角做整体复核，而不是继续盲目重跑。";
  } else if (hasError) {
    status = "blocked";
    title = "当前还不能导出";
    text = "检查里还有阻塞项。先处理文案、素材或结构问题，再回来做最终导出判断。";
  } else if (hasWarning) {
    status = "warning";
    title = "可以继续推进，但建议先复核";
    text = "当前没有硬阻塞，但还有提醒项。建议先做一轮人工复核，再决定是否直接出片。";
  } else {
    status = "ready";
    title = "当前可以进入最终导出";
    text = draft?.workflowStatus === "ready"
      ? "系统检查和人工状态都已经比较顺，可以直接进入最终导出。"
      : "系统检查已经通过。若你也确认没问题，可以先把状态标记为可导出，再执行最终导出。";
  }

  releaseControlEl.className = `release-control release-control-${status}`;
  releaseControlTitleEl.textContent = title;
  releaseControlTextEl.textContent = text;

  const meta = [
    hasUnsavedChanges ? "当前有未同步修改" : "当前草稿已同步",
    checks.length ? `检查 ${checks.length} 项` : "尚未检查",
    draft?.workflowStatusLabel || "待处理",
    videoReady ? "成片已生成" : "成片未生成",
  ];
  releaseControlMetaEl.innerHTML = meta.map((item) => `<span>${item}</span>`).join("");
}

function getWorkflowRecommendation(draft, state) {
  const checks = draft?.qualityChecks || [];
  const exportInfo = draft?.exportInfo || {};
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
      text: "这一步只处理最便宜的文案层，确认后再进入试产，会明显降低返工成本。",
      buttonLabel: "确认进入试产",
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
        : "当前有未保存的修改，优先把文案同步，再进入下一轮试产或检查。",
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
              : "你刚改动了文案，这会影响口播、字幕和后续检查结果，建议先保存同步。",
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
      phaseTitle: "试产打磨",
      phaseText: "先确认当前草稿方向成立，再跑一次导出前检查，看看离成片还差什么。",
      dirtyChips,
      title: "先做导出前检查",
      text: "如果当前预览方向没问题，就先跑一次检查，明确阻塞项和下一步动作。",
      buttonLabel: "导出前检查",
      action: "click",
      target: "#check-btn",
      recommendedAction: "full",
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
  const sceneDisabled = currentProductionStage === "script" || !currentDraftId || !storyboardDraftState.length || isPreviewDraft();
  const audioDisabled = currentProductionStage === "script" || !currentDraftId || isPreviewDraft() || (!hasUnsavedChanges && !currentDirtyState.audio);
  const coverDisabled = currentProductionStage === "script" || !currentDraftId || isPreviewDraft() || (!hasUnsavedChanges && !currentDirtyState.cover);

  if (lightTrialBtn) {
    lightTrialBtn.disabled = currentProductionStage === "script" && recommendation?.recommendedAction !== "light";
  }
  if (editorLightTrialBtn) {
    editorLightTrialBtn.disabled = currentProductionStage === "script" && recommendation?.recommendedAction !== "light";
  }
  if (partialAudioBtn) {
    partialAudioBtn.disabled = audioDisabled;
    partialAudioBtn.textContent = currentProductionStage === "script"
      ? "脚本确认后可同步口播"
      : hasUnsavedChanges && currentDirtyState.audio
        ? "同步口播 / 字幕"
        : "口播 / 字幕已同步";
  }
  if (editorAudioBtn) {
    editorAudioBtn.disabled = audioDisabled;
    editorAudioBtn.textContent = currentProductionStage === "script"
      ? "脚本确认后可同步口播"
      : hasUnsavedChanges && currentDirtyState.audio
        ? "同步口播 / 字幕"
        : "口播 / 字幕已同步";
  }
  if (partialCoverBtn) {
    partialCoverBtn.disabled = coverDisabled;
    partialCoverBtn.textContent = currentProductionStage === "script"
      ? "脚本确认后可同步封面"
      : hasUnsavedChanges && currentDirtyState.cover
        ? "同步封面"
        : "封面已同步";
  }
  if (editorCoverBtn) {
    editorCoverBtn.disabled = coverDisabled;
    editorCoverBtn.textContent = currentProductionStage === "script"
      ? "脚本确认后可同步封面"
      : hasUnsavedChanges && currentDirtyState.cover
        ? "同步封面"
        : "封面已同步";
  }
  if (partialSceneBtn) {
    partialSceneBtn.disabled = sceneDisabled;
    partialSceneBtn.textContent = currentProductionStage === "script"
      ? "脚本确认后可同步镜头"
      : storyboardDraftState.length
        ? `同步当前镜头：${sceneLabel}`
        : "当前无可同步镜头";
  }
  if (storyboardPartialBtn) {
    storyboardPartialBtn.disabled = sceneDisabled;
    storyboardPartialBtn.textContent = currentProductionStage === "script"
      ? "脚本确认后可同步镜头"
      : storyboardDraftState.length
        ? `同步当前镜头：${sceneLabel}`
        : "当前无可同步镜头";
  }
  if (fullTrialBtn) {
    fullTrialBtn.disabled = currentProductionStage === "script";
  }
  if (storyboardFullTrialBtn) {
    storyboardFullTrialBtn.disabled = currentProductionStage === "script";
  }

  if (partialAudioMetaEl) {
    partialAudioMetaEl.textContent = hasUnsavedChanges && currentDirtyState.audio
      ? "口播层：检测到正文或时长变动，适合先同步口播和字幕"
      : "口播层：当前没有待同步的正文或时长改动";
    partialAudioMetaEl.classList.toggle("is-dirty", hasUnsavedChanges && currentDirtyState.audio);
    partialAudioMetaEl.classList.toggle("is-clean", !(hasUnsavedChanges && currentDirtyState.audio));
  }
  if (partialCoverMetaEl) {
    partialCoverMetaEl.textContent = hasUnsavedChanges && currentDirtyState.cover
      ? "封面层：检测到封面标题或副标题修改，适合先同步封面"
      : "封面层：当前没有待同步的封面修改";
    partialCoverMetaEl.classList.toggle("is-dirty", hasUnsavedChanges && currentDirtyState.cover);
    partialCoverMetaEl.classList.toggle("is-clean", !(hasUnsavedChanges && currentDirtyState.cover));
  }
  if (partialSceneMetaEl) {
    partialSceneMetaEl.textContent = currentProductionStage === "script"
      ? "镜头层：脚本确认后再进入 scene 级同步"
      : storyboardDraftState.length
        ? `镜头层：当前可对 ${sceneLabel} 做局部同步`
        : "镜头层：当前没有可同步的 scene";
    partialSceneMetaEl.classList.toggle("is-dirty", !sceneDisabled && Boolean(storyboardDraftState.length));
    partialSceneMetaEl.classList.toggle("is-clean", sceneDisabled || !storyboardDraftState.length);
  }

  [
    [lightTrialCardEl, recommendation?.recommendedAction === "light", false],
    [partialRebuildCardEl, recommendation?.recommendedAction === "partial", sceneDisabled && audioDisabled && coverDisabled],
    [fullTrialCardEl, recommendation?.recommendedAction === "full", currentProductionStage === "script"],
  ].forEach(([card, isRecommended, isDisabled]) => {
    card?.classList.toggle("is-recommended", Boolean(isRecommended));
    card?.classList.toggle("is-disabled", Boolean(isDisabled));
  });
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
  if (currentProductionStage === "script") {
    setStatus("请先确认预制脚本，再进入试产。", "info");
    document.querySelector("#section-prep")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (hasUnsavedChanges) {
    await handleSaveDraft();
    if (currentDraft) {
      renderWorkflowMap(currentDraft);
    }
    return;
  }

  setStatus("当前文案已同步，可以直接继续看预览或进入完整试产。", "success");
  if (currentDraft) {
    renderWorkflowMap(currentDraft);
  }
  document.querySelector("#section-preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

async function handlePartialAudioRebuild() {
  if (currentProductionStage === "script") {
    setStatus("脚本阶段先确认文案结构，还不建议进入口播同步。", "info");
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

  if (!(hasUnsavedChanges && currentDirtyState.audio)) {
    setStatus("当前口播和字幕已经是最新，无需单独重建。", "info");
    return;
  }

  partialAudioBtn && (partialAudioBtn.disabled = true);
  editorAudioBtn && (editorAudioBtn.disabled = true);
  try {
    await handleSaveDraft();
    setStatus("口播 / 字幕已通过轻量同步更新。当前实现会连带刷新封面，但不会重建分镜。", "success");
    document.querySelector("#section-preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } finally {
    if (currentDraft) {
      renderWorkflowMap(currentDraft);
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

  if (!(hasUnsavedChanges && currentDirtyState.cover)) {
    setStatus("当前封面已经是最新，无需单独重建。", "info");
    return;
  }

  partialCoverBtn && (partialCoverBtn.disabled = true);
  editorCoverBtn && (editorCoverBtn.disabled = true);
  try {
    await handleSaveDraft();
    setStatus("封面已通过轻量同步更新。当前实现会复用同一条同步路径，同时刷新关联口播和字幕。", "success");
    document.querySelector("#section-preview")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } finally {
    if (currentDraft) {
      renderWorkflowMap(currentDraft);
    }
  }
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
    renderDraft(data.draft);
    await loadDraftHistory();
    setStatus("当前镜头已完成局部重建。", "success");
    document.querySelector("#section-storyboard")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } catch (error) {
    setStatus(error.message || "局部重建失败", "error");
  } finally {
    if (currentDraft) {
      renderWorkflowMap(currentDraft);
    }
  }
}

async function handleFullTrial() {
  if (currentProductionStage === "script") {
    setStatus("请先确认预制脚本，再进入完整试产。", "info");
    document.querySelector("#section-prep")?.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  if (!currentDraftId) {
    setStatus("请先生成或打开一个草稿。", "error");
    return;
  }

  if (isPreviewDraft()) {
    setStatus("预览模式下不会执行真实完整试产。", "info");
    return;
  }

  try {
    fullTrialBtn.disabled = true;
    fullTrialBtn.textContent = "试产中...";
    if (hasUnsavedChanges) {
      await handleSaveDraft();
    }
    await handleQualityCheck();
    setStatus("完整试产已完成：草稿已同步，并已完成导出前检查。", "success");
    document.querySelector("#section-export")?.scrollIntoView({ behavior: "smooth", block: "start" });
  } finally {
    fullTrialBtn.disabled = false;
    if (currentDraft) {
      renderWorkflowMap(currentDraft);
    }
  }
}

function renderScriptPrep(draft) {
  if (!scriptPrepListEl || !scriptPrepMetricsEl || !scriptPrepSummaryEl) {
    return;
  }

  if (confirmScriptBtn) {
    confirmScriptBtn.textContent = currentProductionStage === "script" ? "脚本确认，进入试产" : "已进入试产";
    confirmScriptBtn.disabled = currentProductionStage !== "script";
  }

  const segments = buildScriptPrepSegments(draft);
  const totalDuration = segments.reduce((sum, segment) => sum + segment.durationSec, 0);
  scriptPrepSummaryEl.textContent = currentProductionStage === "script"
    ? "先确认每段作用、预计时长和整体节奏，再进入后续试产。"
    : "脚本已经确认。后续如需回改，建议先回到这里重新校正节奏，再继续试产。";

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
          <span>进入试产前检查点</span>
          <strong>${segment.checkpoint}</strong>
        </div>
      </div>
    </article>
  `).join("");
}

function buildScriptPrepSegments(draft) {
  const blocks = [
    { tag: "Hook", title: "开场判断", text: draft.hook || "", purpose: "先建立抓力和判断感", checkpoint: "确认开头是否足够抓人" },
    { tag: "展开 1", title: "第一段展开", text: draft.sections?.[0] || "", purpose: "开始解释核心逻辑", checkpoint: "确认是不是一上来就进入有效信息" },
    { tag: "展开 2", title: "第二段展开", text: draft.sections?.[1] || "", purpose: "承接并补足观点", checkpoint: "确认信息密度是否过高" },
    { tag: "展开 3", title: "第三段展开", text: draft.sections?.[2] || "", purpose: "完成判断闭环", checkpoint: "确认节奏是否开始拖慢" },
    { tag: "CTA", title: "结尾引导", text: draft.cta || "", purpose: "完成收束并给出动作", checkpoint: "确认结尾是否收得住" },
  ].filter((block) => block.text.trim());

  return blocks.map((block, index) => ({
    index: index + 1,
    ...block,
    durationSec: estimateScriptDuration(block.text),
  }));
}

function estimateScriptDuration(text) {
  const length = String(text || "").replace(/\s+/g, "").length;
  return Math.max(5, Math.min(26, Math.round(length / 8)));
}

function handleConfirmScriptStage() {
  if (!currentDraftId) {
    return;
  }

  setProductionStage("production");
  setStatus("预制脚本已确认，接下来进入试产打磨。", "success");
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
  if (draft?.qualityChecks?.length || draft?.workflowStatus === "ready" || draft?.workflowStatus === "exported") {
    return "production";
  }
  return "script";
}

function syncProductionStage() {
  appShellEl?.classList.toggle("is-script-stage", currentProductionStage === "script");
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

function renderQualityChecks(checks) {
  if (currentDraft) {
    currentDraft.qualityChecks = checks || [];
    renderWorkflowMap(currentDraft);
    renderReleaseControl(currentDraft);
  }
  renderQualityOverview(checks, currentDraft);

  if (!checks.length) {
    qualityList.innerHTML = `<div class="quality-item info"><strong>暂无检查项</strong><span>点击“导出前检查”后，这里会展示具体的阻塞项、提醒项和说明项。</span></div>`;
    return;
  }

  const medicalChecks = checks.filter(isMedicalQualityItem);
  const exportChecks = checks.filter((item) => !isMedicalQualityItem(item));
  const groups = [
    { title: "医疗风控", items: medicalChecks, emptyText: "当前未返回医疗风控检查项。" },
    { title: "导出条件", items: exportChecks, emptyText: "当前未返回导出条件检查项。" },
  ].filter((group) => group.items.length);

  qualityList.innerHTML = groups
    .map((group) => {
      const toneClass = group.title === "医疗风控" ? "quality-group-medical" : "quality-group-export";
      return `
        <section class="quality-group ${toneClass}">
          <div class="quality-group-head">
            <strong>${group.title}</strong>
            <span>${group.items.length} 项</span>
          </div>
          <div class="quality-group-list">
            ${group.items.map(renderQualityItem).join("")}
          </div>
        </section>
      `;
    })
    .join("");
}

function renderQualityItem(item) {
  return `<div class="quality-item ${item.level}">
    <strong>${item.label}</strong>
    <span>${item.detail}</span>
  </div>`;
}

function isMedicalQualityItem(item) {
  const label = String(item?.label || "");
  return label.includes("医疗") || label.includes("OCR") || label.includes("医学科普");
}

function renderQualityOverview(checks, draft) {
  const hasError = checks.some((item) => item.level === "error");
  const hasWarning = checks.some((item) => item.level === "warning");
  const medicalBlocked = checks.some((item) => String(item.label || "").includes("医疗文案预检未通过"));
  const medicalReview = checks.some((item) => String(item.label || "").includes("医疗文案建议人工复核") || String(item.label || "").includes("医疗合规预检失败"));
  const medicalPass = checks.some((item) => String(item.label || "").includes("医疗文案预检通过"));

  let status = "idle";
  let title = "还没有检查结论";
  let text = "先运行一次导出前检查，这里会告诉你当前是否可以导出，以及建议的下一步动作。";

  if (checks.length) {
    if (medicalBlocked) {
      status = "blocked";
      title = "医疗合规未通过";
      text = "火山风控策略已拦截当前文案，建议先修改功效承诺、违规表述或医疗广告风险点，再继续导出。";
    } else if (hasError) {
      status = "blocked";
      title = "暂时不能导出";
      text = "当前存在阻塞问题，建议先处理缺失素材或结构问题，并把工作流状态标记为“待修改”。";
    } else if (medicalReview) {
      status = "warning";
      title = "建议人工复核";
      text = "火山风控策略建议人工复核当前文案。即使其他素材齐全，也建议先确认医疗表述、适应症和功效承诺是否合规。";
    } else if (hasWarning) {
      status = "warning";
      title = "可以继续，但有提醒";
      text = "目前可以继续推进，但建议先处理提醒项，再决定是否直接导出。";
    } else {
      status = "ready";
      title = medicalPass ? "医疗预检已通过，可继续导出" : "检查通过，可以导出";
      text = medicalPass
        ? (
          draft?.workflowStatus === "ready"
            ? "火山医疗文案预检已通过，当前草稿也已标记为“可导出”，可以直接执行导出。"
            : "火山医疗文案预检已通过，建议将工作流状态改为“可导出”，再执行导出。"
        )
        : (
          draft?.workflowStatus === "ready"
            ? "当前草稿已经标记为“可导出”，可以直接执行导出。"
            : "当前没有阻塞问题，建议将工作流状态改为“可导出”，再执行导出。"
        );
    }
  }

  qualityOverviewEl.className = `quality-overview quality-overview-${status}`;
  qualityOverviewTitleEl.textContent = title;
  qualityOverviewTextEl.textContent = text;
  const showReadyAction = status === "ready" && draft?.workflowStatus !== "ready";
  qualityOverviewActionsEl.classList.toggle("hidden", !showReadyAction);
}

function renderScriptView(draft) {
  const blocks = [
    { key: "hook", label: "开头 Hook", text: draft.hook },
    { key: "section-1", label: "第 1 段", text: draft.sections?.[0] || "" },
    { key: "section-2", label: "第 2 段", text: draft.sections?.[1] || "" },
    { key: "section-3", label: "第 3 段", text: draft.sections?.[2] || "" },
    { key: "cta", label: "结尾引导", text: draft.cta },
  ];

  scriptEl.innerHTML = blocks
    .map(
      (block) => `
        <article class="script-block${currentEditorFocus === block.key ? " active" : ""}">
          <span class="script-label">${block.label}</span>
          <p>${escapeHtml(block.text)}</p>
        </article>
      `,
    )
    .join("");
}

function renderSubtitleView(entries) {
  subtitleMetaEl.textContent = entries.length ? `共 ${entries.length} 条字幕` : "还没有字幕内容";

  subtitleEl.innerHTML = entries.length
    ? entries
        .map(
          (entry, index) => `
            <div class="subtitle-row">
              <span class="subtitle-index">${index + 1}</span>
              <div>
                <div class="subtitle-time">${formatTime(entry.startSec)} - ${formatTime(entry.endSec)}</div>
                <div class="subtitle-text">${escapeHtml(entry.text)}</div>
              </div>
            </div>
          `,
        )
        .join("")
    : `<div class="subtitle-empty">当前没有可显示的字幕时间轴。</div>`;
}

function renderStoryboardView(storyboard, assetVersion) {
  if (!storyboardListEl) {
    return;
  }

  if (!storyboard?.length) {
    storyboardListEl.innerHTML = `<div class="subtitle-empty">当前还没有可编辑的分镜内容。</div>`;
    return;
  }

  currentStoryboardIndex = clampStoryboardIndex(currentStoryboardIndex, storyboard.length);
  const currentScene = storyboard[currentStoryboardIndex] || storyboard[0];
  const preview = currentScene?.assetPath ? toVersionedMediaUrl(currentScene.assetPath, assetVersion) : "";
  const totalDuration = storyboard.reduce((sum, scene) => sum + Number(scene.durationSec || 0), 0);
  const sceneDuration = Number(currentScene.durationSec || 0);
  const sceneShare = totalDuration ? Math.round((sceneDuration / totalDuration) * 100) : 0;
  const voiceoverLength = String(currentScene.voiceover || "").trim().length;
  const sceneReview = getSceneReviewFocus(currentScene, {
    totalDuration,
    sceneShare,
    index: currentStoryboardIndex,
    storyboardLength: storyboard.length,
  });

  storyboardListEl.innerHTML = `
    <div class="storyboard-shell">
      <aside class="storyboard-nav">
        <div class="storyboard-nav-head">
          <strong>镜头列表</strong>
          <span>${storyboard.length} 个镜头 · ${totalDuration} 秒</span>
        </div>
        <div class="storyboard-timeline">
          ${storyboard
            .map((scene, index) => {
              const durationSec = Number(scene.durationSec || 0);
              const share = totalDuration ? Math.round((durationSec / totalDuration) * 100) : 0;
              const signal = getSceneNavSignal(scene, {
                index,
                storyboardLength: storyboard.length,
                share,
              });
              return `<span class="storyboard-timeline-segment${index === currentStoryboardIndex ? " active" : ""} ${signal.segmentClass}" style="flex:${Math.max(1, Number(scene.durationSec || 1))}"></span>`;
            })
            .join("")}
        </div>
        <div class="storyboard-scene-list">
          ${storyboard
            .map((scene, index) => {
              const isActive = index === currentStoryboardIndex ? " active" : "";
              const durationSec = Number(scene.durationSec || 0);
              const share = totalDuration ? Math.round((durationSec / totalDuration) * 100) : 0;
              const signal = getSceneNavSignal(scene, {
                index,
                storyboardLength: storyboard.length,
                share,
              });
              return `
                <button type="button" class="storyboard-scene-item${isActive} ${signal.itemClass}" data-scene-select="${index}">
                  <div class="storyboard-scene-top">
                    <span class="storyboard-scene-index">Scene ${index + 1}</span>
                    <span class="storyboard-scene-flag ${signal.flagClass}">${signal.flag}</span>
                  </div>
                  <strong>${escapeHtml(scene.sceneTitle || `镜头 ${index + 1}`)}</strong>
                  <div class="storyboard-scene-meta">
                    <span>${escapeHtml(getVisualTypeLabel(scene.visualType))}</span>
                    <span>${durationSec} 秒</span>
                    <span>${share}% 占比</span>
                  </div>
                  <div class="storyboard-scene-note">${escapeHtml(signal.note)}</div>
                </button>
              `;
            })
            .join("")}
        </div>
      </aside>

      <article class="storyboard-card" data-scene-id="${escapeHtml(currentScene.id || `scene-${currentStoryboardIndex + 1}`)}">
        <div class="storyboard-decision-bar">
          <div class="storyboard-decision-copy">
            <span class="storyboard-section-label">当前镜头判断</span>
            <strong>${escapeHtml(sceneReview.title)}</strong>
            <p>${escapeHtml(sceneReview.text)}</p>
          </div>
          <div class="storyboard-decision-metrics">
            <div class="storyboard-decision-metric">
              <span>当前镜头</span>
              <strong>第 ${currentStoryboardIndex + 1} / ${storyboard.length} 个</strong>
            </div>
            <div class="storyboard-decision-metric">
              <span>时长占比</span>
              <strong>${sceneShare}%</strong>
            </div>
            <div class="storyboard-decision-metric">
              <span>口播长度</span>
              <strong>${voiceoverLength} 字</strong>
            </div>
          </div>
        </div>
        <div class="storyboard-card-head">
          <div class="storyboard-card-head-main">
            <div>
              <strong>Scene ${currentStoryboardIndex + 1}</strong>
              <span>${escapeHtml(getVisualTypeLabel(currentScene.visualType))} · 当前正在编辑</span>
            </div>
            <span class="storyboard-card-meta">${Number(currentScene.durationSec || 0)} 秒</span>
          </div>
          <div class="storyboard-card-actions">
            <div class="storyboard-action-group">
              <span class="storyboard-action-label">结构</span>
              <button type="button" class="switch-btn storyboard-add-btn" data-scene-index="${currentStoryboardIndex}">新增镜头</button>
              <button type="button" class="switch-btn storyboard-move-btn" data-scene-move="up" data-scene-index="${currentStoryboardIndex}" ${currentStoryboardIndex === 0 ? "disabled" : ""}>上移</button>
              <button type="button" class="switch-btn storyboard-move-btn" data-scene-move="down" data-scene-index="${currentStoryboardIndex}" ${currentStoryboardIndex === storyboard.length - 1 ? "disabled" : ""}>下移</button>
            </div>
            <div class="storyboard-action-group storyboard-action-group-danger">
              <span class="storyboard-action-label">维护</span>
              <button type="button" class="switch-btn storyboard-delete-btn" data-scene-index="${currentStoryboardIndex}" ${storyboard.length <= 1 ? "disabled" : ""}>删除镜头</button>
            </div>
          </div>
        </div>
        <div class="storyboard-card-summary">
          <div class="storyboard-summary-item">
            <span>当前镜头</span>
            <strong>第 ${currentStoryboardIndex + 1} / ${storyboard.length} 个</strong>
          </div>
          <div class="storyboard-summary-item">
            <span>镜头类型</span>
            <strong>${escapeHtml(getVisualTypeLabel(currentScene.visualType))}</strong>
          </div>
          <div class="storyboard-summary-item">
            <span>时长</span>
            <strong>${Number(currentScene.durationSec || 0)} 秒</strong>
          </div>
        </div>
        <div class="storyboard-card-body">
          <div class="storyboard-visual-panel storyboard-panel-block">
            <div class="storyboard-panel-head">
              <div>
                <div class="storyboard-section-label">镜头预览</div>
                <strong>先看当前镜头画面和停留感</strong>
              </div>
              <span class="storyboard-panel-chip">${preview ? "已有素材" : "等待素材"}</span>
            </div>
            <div class="storyboard-thumb-shell">
              ${preview ? `<img src="${preview}" alt="${escapeHtml(currentScene.sceneTitle || `Scene ${currentStoryboardIndex + 1}`)}" class="storyboard-thumb" />` : `<div class="storyboard-thumb-empty">暂无素材</div>`}
            </div>
            <div class="storyboard-visual-caption">${escapeHtml(currentScene.sceneTitle || `镜头 ${currentStoryboardIndex + 1}`)}</div>
          </div>
          <div class="storyboard-fields">
            <div class="storyboard-fields-group storyboard-panel-block">
              <div class="storyboard-panel-head">
                <div>
                  <div class="storyboard-section-label">镜头参数</div>
                  <strong>再改结构、类型和时长</strong>
                </div>
              </div>
              <label>
                <span>镜头标题</span>
                <input data-storyboard-index="${currentStoryboardIndex}" data-scene-field="sceneTitle" value="${escapeHtml(currentScene.sceneTitle || "")}" />
              </label>
              <div class="storyboard-inline-fields">
                <label>
                  <span>镜头类型</span>
                  <select data-storyboard-index="${currentStoryboardIndex}" data-scene-field="visualType">
                    ${buildVisualTypeOptions(currentScene.visualType)}
                  </select>
                </label>
                <label>
                  <span>时长</span>
                  <input data-storyboard-index="${currentStoryboardIndex}" data-scene-field="durationSec" type="number" min="4" max="40" step="1" value="${Number(currentScene.durationSec || 6)}" />
                </label>
              </div>
            </div>
            <div class="storyboard-fields-group storyboard-panel-block">
              <div class="storyboard-panel-head">
                <div>
                  <div class="storyboard-section-label">镜头口播</div>
                  <strong>最后再判断要不要重建</strong>
                </div>
                <span class="storyboard-panel-chip">${voiceoverLength} 字</span>
              </div>
              <label>
                <span>口播文案</span>
                <textarea data-storyboard-index="${currentStoryboardIndex}" data-scene-field="voiceover" rows="8">${escapeHtml(currentScene.voiceover || "")}</textarea>
              </label>
              <div class="storyboard-action-note">
                <p>如果只是这一镜不顺，先保存当前分镜，再重建当前镜头；只有连续几镜都不顺，才考虑完整试产。</p>
                <div class="storyboard-action-note-buttons">
                  <button type="button" class="switch-btn storyboard-refresh-btn" data-scene-id="${escapeHtml(currentScene.id || "")}">重做素材</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </div>
  `;
}

function getSceneReviewFocus(scene, context) {
  const durationSec = Number(scene?.durationSec || 0);
  const voiceover = String(scene?.voiceover || "").trim();
  const visualType = String(scene?.visualType || "image");
  const isOpening = context.index === 0;
  const isClosing = context.index === context.storyboardLength - 1;

  if (isOpening) {
    return {
      title: "先看这一镜能不能把人留下来",
      text: "这是开场镜头。优先判断第一句口播、画面类型和标题承接是否足够抓人，再决定要不要重建当前镜头。",
    };
  }

  if (isClosing) {
    return {
      title: "先看这一镜能不能把结尾收住",
      text: "这是结尾镜头。优先判断 CTA、情绪收束和停留时长是否自然，避免结尾突然断掉或拖尾。",
    };
  }

  if (durationSec >= 10 || context.sceneShare >= 22) {
    return {
      title: "先看这段会不会拖慢整体节奏",
      text: "这一镜头占比偏高。先判断它的信息密度和视觉变化是否支撑这么长的停留，不够就优先缩时长或拆镜头。",
    };
  }

  if (voiceover.length >= 70) {
    return {
      title: "先看这段口播会不会压垮画面",
      text: "这段口播偏长。先判断一句话里承载的信息是不是太多，必要时先回文案层拆句，再决定是否改镜头。",
    };
  }

  if (visualType === "quote" || visualType === "chart") {
    return {
      title: "先看画面是否真的在支撑判断",
      text: "这类镜头更依赖信息可读性。优先判断观众能不能一眼读懂，而不是先追求更复杂的视觉效果。",
    };
  }

  return {
    title: "先看这镜头有没有打断整体流动",
    text: "优先判断当前镜头的时长、口播和画面切换是否顺着前后文流动。只有它真的掉链子，才值得单独重建。",
  };
}

function getSceneNavSignal(scene, context) {
  const durationSec = Number(scene?.durationSec || 0);
  const voiceoverLength = String(scene?.voiceover || "").trim().length;
  const isOpening = context.index === 0;
  const isClosing = context.index === context.storyboardLength - 1;

  if (isOpening) {
    return {
      flag: "开场",
      flagClass: "is-anchor",
      itemClass: "is-anchor",
      segmentClass: "is-anchor",
      note: "先看第一屏抓力和开头承接。",
    };
  }

  if (isClosing) {
    return {
      flag: "结尾",
      flagClass: "is-anchor",
      itemClass: "is-anchor",
      segmentClass: "is-anchor",
      note: "先看结尾收束和 CTA 是否自然。",
    };
  }

  if (durationSec >= 10 || context.share >= 22) {
    return {
      flag: "偏长",
      flagClass: "is-heavy",
      itemClass: "is-heavy",
      segmentClass: "is-heavy",
      note: "这段占比偏高，优先看会不会拖节奏。",
    };
  }

  if (voiceoverLength >= 70) {
    return {
      flag: "偏密",
      flagClass: "is-dense",
      itemClass: "is-dense",
      segmentClass: "is-dense",
      note: "口播偏密，优先看信息是否过载。",
    };
  }

  return {
    flag: "正常",
    flagClass: "is-normal",
    itemClass: "is-normal",
    segmentClass: "is-normal",
    note: "优先看是否顺着前后文自然流动。",
  };
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
  if (!historyList) {
    return;
  }
  renderHistorySummary(drafts);

  if (!drafts.length) {
    historyList.innerHTML = `<p class="status">当前筛选条件下没有草稿。</p>`;
    return;
  }

  historyList.innerHTML = drafts
    .map((draft) => {
      const isActive = draft.id === currentDraftId ? " active" : "";
      const readiness = buildHistoryReadiness(draft);
      const activeStateLabel = draft.id === currentDraftId ? "当前展开" : "点击展开";
      const productionStageLabel = getProductionStageLabel(draft.productionStage || deriveProductionStage(draft));
      return `
        <button type="button" class="history-item${isActive}" data-draft-id="${draft.id}">
          <div class="history-head">
            <strong>${draft.starred ? "★ " : ""}${draft.title}</strong>
            <span class="history-updated">${formatDateTime(draft.updatedAt || draft.createdAt)} · ${activeStateLabel}</span>
          </div>
          <div class="history-compact">
            <span>${draft.topic}</span>
            <div class="history-tags">
              <span>${productionStageLabel}</span>
              <span>${draft.coverStyleLabel}</span>
              <span>${draft.durationMode} 秒</span>
            </div>
          </div>
          <div class="history-detail">
            <span>${draft.topic}</span>
            <div class="history-tags">
              <span>${productionStageLabel}</span>
              <span>${draft.coverStyleLabel}</span>
              <span>${draft.durationMode} 秒</span>
              <span>${draft.workflowStatusLabel}</span>
              <span>${draft.exportStatusLabel}</span>
            </div>
            <div class="history-foot">
              <span>${readiness}</span>
              <span>${draft.blockingIssueCount ? `${draft.blockingIssueCount} 个阻塞问题` : draft.qualityCheckCount ? `${draft.qualityCheckCount} 个检查项` : "未运行质检"}</span>
            </div>
          </div>
        </button>
      `;
    })
    .join("");

  historyList.querySelectorAll("[data-draft-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      await loadDraft(button.dataset.draftId);
    });
  });
}

function renderHistorySummary(drafts) {
  if (!historySummary) {
    return;
  }
  if (!drafts.length) {
    historySummary.innerHTML = "";
    return;
  }

  const exported = drafts.filter((draft) => draft.workflowStatus === "exported").length;
  const blocked = drafts.filter((draft) => draft.exportStatus === "blocked" || draft.blockingIssueCount > 0).length;
  const pending = drafts.filter((draft) => draft.workflowStatus === "pending" || draft.workflowStatus === "revised").length;
  const ready = drafts.filter((draft) => draft.workflowStatus === "ready").length;
  const scriptStageCount = drafts.filter((draft) => (draft.productionStage || deriveProductionStage(draft)) === "script").length;
  const productionStageCount = drafts.filter((draft) => (draft.productionStage || deriveProductionStage(draft)) === "production").length;
  const exportStageCount = drafts.filter((draft) => (draft.productionStage || deriveProductionStage(draft)) === "export").length;

  historySummary.innerHTML = [
    `
      <article class="history-overview-card">
        <div class="history-overview-head">
          <span class="history-overview-kicker">历史概览</span>
          <strong>${drafts.length} 条草稿</strong>
        </div>
        <div class="history-overview-metrics">
          <div class="history-overview-pill">
            <span>待推进</span>
            <strong>${pending} 条</strong>
          </div>
          <div class="history-overview-pill">
            <span>可导出</span>
            <strong>${ready} 条</strong>
          </div>
          <div class="history-overview-pill">
            <span>有阻塞</span>
            <strong>${blocked} 条</strong>
          </div>
          <div class="history-overview-pill">
            <span>已导出</span>
            <strong>${exported} 条</strong>
          </div>
        </div>
        <div class="history-overview-stage">
          <span class="history-overview-section-label">生产阶段</span>
          <div class="history-overview-metrics history-overview-metrics-stage">
            <div class="history-overview-pill">
              <span>脚本期</span>
              <strong>${scriptStageCount} 条</strong>
            </div>
            <div class="history-overview-pill">
              <span>试产中</span>
              <strong>${productionStageCount} 条</strong>
            </div>
            <div class="history-overview-pill">
              <span>已成片</span>
              <strong>${exportStageCount} 条</strong>
            </div>
          </div>
        </div>
      </article>
    `,
  ].join("");
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
  appShellEl?.classList.toggle("is-production", hasActiveDraft);
  setInputDrawerOpen(false);
  emptyStateEl.classList.toggle("hidden", hasActiveDraft);
  resultEl.classList.toggle("hidden", !hasActiveDraft);
  railDrawerToggleBtn?.classList.toggle("hidden", !hasActiveDraft);

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

function handleRailDrawerToggle() {
  if (!appShellEl?.classList.contains("is-production")) {
    return;
  }

  setInputDrawerOpen(!appShellEl.classList.contains("is-rail-open"));
}

function setInputDrawerOpen(isOpen) {
  const enabled = Boolean(isOpen && appShellEl?.classList.contains("is-production"));
  appShellEl?.classList.toggle("is-rail-open", enabled);
  railDrawerBackdropEl?.classList.toggle("hidden", !enabled);
  if (railDrawerToggleBtn) {
    railDrawerToggleBtn.setAttribute("aria-expanded", String(enabled));
    railDrawerToggleBtn.querySelector(".rail-drawer-toggle-label").textContent = enabled ? "收起输入" : "编辑输入";
  }
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

async function postJson(url, payload) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "请求失败");
    }
    return data;
  } catch (error) {
    throw new Error(normalizeRequestError(error));
  }
}

async function fetchJson(url) {
  try {
    const response = await fetch(url);
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "请求失败");
    }
    return data;
  } catch (error) {
    throw new Error(normalizeRequestError(error));
  }
}

function normalizeRequestError(error) {
  const message = String(error?.message || "");
  const normalized = message.toLowerCase();

  if (message === "timeout" || normalized === "timeout") {
    return "请求超时，请稍后重试。";
  }

  if (message.includes("Failed to fetch") || normalized.includes("fetch failed")) {
    return "本地服务未连接，请刷新页面或重启网站。";
  }

  if (message.includes("NetworkError")) {
    return "网络请求失败，请检查本地服务是否正常运行。";
  }

  return message || "请求失败";
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
    generateProgressNoteEl.textContent = "当前链路偏慢，请继续等待，通常不是卡死。";
    return;
  }
  generateProgressEl?.classList.remove("generate-progress-slow");
  if (elapsedSec >= 30) {
    generateProgressNoteEl.textContent = "远程图片和配音生成通常会稍慢一些。";
    return;
  }
  generateProgressNoteEl.textContent = "远程模型较慢时通常需要 30 到 90 秒。";
}

function handleEditorInput() {
  updateEditorState();
}

function bindEditorFocus(field, focusKey) {
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
  const presets = [...suggestTopicButtons];
  if (!presets.length) {
    return;
  }

  const picked = presets[Math.floor(Math.random() * presets.length)];
  picked.click();
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
  previewFocusChip.textContent = `当前查看：${currentEditorFocus === "overview" ? currentPreviewReviewLabel : getFocusLabel(currentEditorFocus)}`;
}

function setupPreviewImage(draft, assetVersion) {
  const previewCanvas = coverEl.closest(".preview-canvas");
  if (!previewCanvas) {
    coverEl.src = toVersionedMediaUrl(draft.assets.coverPath, assetVersion);
    return;
  }

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
  coverEl.src = toVersionedMediaUrl(draft.assets.coverPath, assetVersion);
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
  const draftId = new URL(window.location.href).searchParams.get("draft");
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
    titleVariantB: editTitleBEl.value.trim(),
    coverTitle: editCoverTitleEl.value.trim(),
    coverSubtitle: editCoverSubtitleEl.value.trim(),
    hook: editHookEl.value.trim(),
    sections: [editSection1El.value.trim(), editSection2El.value.trim(), editSection3El.value.trim()],
    cta: editCtaEl.value.trim(),
    durationMode: String(durationModeEl.value || ""),
    storyboard: collectStoryboardPayload(),
  };
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

function cloneStoryboard(storyboard) {
  return (storyboard || []).map((scene) => ({ ...scene }));
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

function updateEditorState() {
  if (!currentDraftId || !draftSnapshot) {
    hasUnsavedChanges = false;
    currentDirtyState = {
      script: false,
      audio: false,
      storyboard: false,
      cover: false,
    };
    saveDraftBtn.textContent = "保存文案并执行轻量试产";
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

  hasUnsavedChanges = JSON.stringify(currentPayload) !== draftSnapshot;
  saveDraftBtn.textContent = hasUnsavedChanges ? "保存修改并执行轻量试产" : "当前已保存";
  saveDraftBtn.disabled = !hasUnsavedChanges;
  editorStateEl.textContent = hasUnsavedChanges ? "你有未保存的修改。" : "当前内容已同步。";
  editorStateEl.className = hasUnsavedChanges ? "editor-state editor-state-dirty" : "editor-state editor-state-synced";

  editableFields.forEach((field) => {
    const key = getFieldKey(field);
    const currentValue = key === "sections"
      ? ""
      : String(currentPayload[key] ?? "");
    const snapshotValue = key === "sections"
      ? ""
      : String(snapshot[key] ?? "");
    field.classList.toggle("field-dirty", currentValue !== snapshotValue);
  });

  [editSection1El, editSection2El, editSection3El].forEach((field, index) => {
    field.classList.toggle("field-dirty", currentPayload.sections[index] !== snapshot.sections[index]);
  });

  const titleDirty = currentPayload.titleVariantA !== snapshot.titleVariantA || currentPayload.titleVariantB !== snapshot.titleVariantB;
  const coverDirty = currentPayload.coverTitle !== snapshot.coverTitle || currentPayload.coverSubtitle !== snapshot.coverSubtitle;
  const bodyDirty =
    currentPayload.hook !== snapshot.hook ||
    currentPayload.sections[0] !== snapshot.sections[0] ||
    currentPayload.sections[1] !== snapshot.sections[1] ||
    currentPayload.sections[2] !== snapshot.sections[2];
  const ctaDirty = currentPayload.cta !== snapshot.cta;
  const storyboardDirty = JSON.stringify(currentPayload.storyboard || []) !== JSON.stringify(snapshot.storyboard || []);

  currentDirtyState = {
    script: titleDirty || bodyDirty || ctaDirty,
    audio: bodyDirty || ctaDirty || currentPayload.durationMode !== snapshot.durationMode,
    storyboard: storyboardDirty,
    cover: coverDirty,
  };

  updateEditorGroupStatus({
    title: titleDirty,
    cover: coverDirty,
    body: bodyDirty,
    cta: ctaDirty,
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
    case editTitleBEl:
      return "titleVariantB";
    case editCoverTitleEl:
      return "coverTitle";
    case editCoverSubtitleEl:
      return "coverSubtitle";
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
  if (draft.workflowStatus === "exported") {
    return "已完成导出";
  }

  if (draft.workflowStatus === "ready") {
    return "已就绪，可直接导出";
  }

  if (draft.blockingIssueCount > 0) {
    return "先处理阻塞问题";
  }

  if (draft.exportStatus === "script-only") {
    return "可先执行导出脚本";
  }

  if (draft.qualityCheckCount > 0) {
    return "已检查，可继续导出";
  }

  return "建议先运行质检";
}

function debounce(fn, wait) {
  let timer = 0;
  return () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => fn(), wait);
  };
}
