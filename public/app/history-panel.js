export function buildHistoryReadiness(draft) {
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

export function renderHistorySummary(drafts, { historySummary, deriveProductionStage }) {
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

export function renderHistory(drafts, deps) {
  const {
    historyList,
    currentDraftId,
    renderHistorySummary: renderHistorySummaryFn,
    buildHistoryReadiness: buildHistoryReadinessFn,
    getProductionStageLabel,
    deriveProductionStage,
    formatDateTime,
    loadDraft,
  } = deps;

  if (!historyList) {
    return;
  }
  renderHistorySummaryFn(drafts);

  if (!drafts.length) {
    historyList.innerHTML = `<p class="status">当前筛选条件下没有草稿。</p>`;
    return;
  }

  historyList.innerHTML = drafts
    .map((draft) => {
      const isActive = draft.id === currentDraftId ? " active" : "";
      const readiness = buildHistoryReadinessFn(draft);
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
