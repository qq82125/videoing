export function isMedicalQualityItem(item) {
  const label = String(item?.label || "");
  return label.includes("医疗") || label.includes("OCR") || label.includes("医学科普");
}

export function renderQualityItem(item) {
  return `<div class="quality-item ${item.level}">
    <strong>${item.label}</strong>
    <span>${item.detail}</span>
  </div>`;
}

export function renderReleaseControl(draft, deps) {
  const {
    releaseControlEl,
    releaseControlTitleEl,
    releaseControlTextEl,
    releaseControlMetaEl,
    currentProductionStage,
    hasUnsavedChanges,
  } = deps;

  if (!releaseControlEl || !releaseControlTitleEl || !releaseControlTextEl || !releaseControlMetaEl) {
    return;
  }

  const checks = draft?.qualityChecks || [];
  const exportInfo = draft?.exportInfo || {};
  const hasError = checks.some((item) => item.level === "error");
  const hasWarning = checks.some((item) => item.level === "warning");
  const videoReady = Boolean(exportInfo.videoReady);
  const hasAudioAssets = Boolean(draft?.assets?.voicePath) || Boolean(draft?.audioUrl) || Boolean((draft?.subtitleEntries || []).length);
  const hasCoverAssets = Boolean(draft?.assets?.coverPath) || Boolean(draft?.coverImage);
  const hasSceneAssets = Boolean((draft?.storyboard || []).some((scene) => scene?.videoPath || scene?.assetPath));
  const hasCoreProductionAssets = hasAudioAssets && hasCoverAssets && hasSceneAssets;
  const effectiveStage = currentProductionStage === "script" && (hasAudioAssets || hasCoverAssets || hasSceneAssets)
    ? "production"
    : currentProductionStage;

  let status = "idle";
  let title = "还没进入生产阶段";
  let text = "先确认脚本，再进入后续生产。";

  if (effectiveStage === "script") {
    title = "还没进入生产阶段";
    text = "当前还在脚本确认阶段。先把讲什么、怎么讲、讲多久定下来，再进入后续生产。";
  } else if (hasUnsavedChanges) {
    status = "warning";
    title = "你已进入生产阶段";
    text = "当前有未同步修改。先同步改动，再决定继续做口播、封面、镜头，还是去做导出前检查。";
  } else if (!checks.length) {
    title = hasCoreProductionAssets ? "已完成首轮生产" : "你已进入生产阶段";
    text = hasCoreProductionAssets
      ? "当前草稿已经有封面、口播、字幕和分镜。现在不用重新从头开始，优先做一次导出前检查，再决定是否直接出片。"
      : hasAudioAssets || hasCoverAssets || hasSceneAssets
        ? "当前已经有部分生产资产。可以继续补齐剩余资产，或者先做一次导出前检查。"
        : "现在可以开始第一轮生产。先从口播 / 字幕、封面或镜头里选一个入口开始，准备判断能否出片时再做导出前检查。";
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
    effectiveStage === "script" ? "脚本待确认" : "已进入生产",
    hasUnsavedChanges ? "当前有未同步修改" : "当前草稿已同步",
    checks.length ? `检查 ${checks.length} 项` : "尚未检查",
    draft?.workflowStatusLabel || "待处理",
    videoReady ? "成片已生成" : "成片未生成",
  ];
  releaseControlMetaEl.innerHTML = meta.map((item) => `<span>${item}</span>`).join("");
}

export function renderQualityOverview(checks, draft, deps) {
  const {
    qualityOverviewEl,
    qualityOverviewTitleEl,
    qualityOverviewTextEl,
    qualityOverviewActionsEl,
  } = deps;

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
        ? "当前医疗预检和导出条件都已通过。如果成片预览没有问题，可以直接进入最终导出。"
        : "当前检查未发现阻塞项，可以进入导出或最后复核。";
    }
  }

  const assetSummary = draft?.sceneAssetReport?.summary;
  if (assetSummary && typeof assetSummary === "object") {
    text = `${text} 当前 scene 素材：dynamic ${Number(assetSummary.dynamic || 0)} / static ${Number(assetSummary.static || 0)} / missing ${Number(assetSummary.missing || 0)}。`;
  }

  const showReadyAction = status === "ready" && !draft?.exportInfo?.videoReady;
  qualityOverviewEl.className = `quality-overview quality-overview-${status}`;
  qualityOverviewTitleEl.textContent = title;
  qualityOverviewTextEl.textContent = text;
  qualityOverviewActionsEl.classList.toggle("hidden", !showReadyAction);
}

export function renderQualityChecks(checks, deps) {
  const {
    currentDraft,
    setCurrentDraftQualityChecks,
    renderWorkflowMap,
    renderReleaseControl: renderReleaseControlFn,
    renderQualityOverview: renderQualityOverviewFn,
    qualityList,
  } = deps;

  if (currentDraft) {
    setCurrentDraftQualityChecks(checks || []);
    renderWorkflowMap(currentDraft);
    renderReleaseControlFn(currentDraft);
  }
  renderQualityOverviewFn(checks, currentDraft);

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
