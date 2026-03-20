export function buildScriptViewHtml({ draft, currentEditorFocus, getDraftScriptSource, escapeHtml }) {
  const script = getDraftScriptSource(draft);
  const blocks = [
    { key: "hook", label: "开头 Hook", text: script.hook || "" },
    { key: "section-1", label: "第 1 段", text: script.sections?.[0] || "" },
    { key: "section-2", label: "第 2 段", text: script.sections?.[1] || "" },
    { key: "section-3", label: "第 3 段", text: script.sections?.[2] || "" },
    { key: "cta", label: "结尾引导", text: script.cta || "" },
  ];

  return blocks
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

export function buildSubtitleViewModel({ entries, formatTime, escapeHtml }) {
  const hasEstimatedEntries = entries.some((entry) => entry?.estimated);
  const metaText = entries.length
    ? hasEstimatedEntries
      ? `预计切分 ${entries.length} 条`
      : `共 ${entries.length} 条字幕`
    : "还没有字幕结果";

  const html = entries.length
    ? entries
        .map(
          (entry, index) => `
            <div class="subtitle-row">
              <span class="subtitle-index">${index + 1}</span>
              <div>
                <div class="subtitle-time">${entry.estimated ? "预计切分" : `${formatTime(entry.startSec)} - ${formatTime(entry.endSec)}`}</div>
                <div class="subtitle-text">${escapeHtml(entry.text)}</div>
              </div>
            </div>
          `,
        )
        .join("")
    : `<div class="subtitle-empty">当前还没有口播与字幕结果。先从左侧第一步开始生成。</div>`;

  return { html, metaText };
}

export function buildStoryboardViewModel({
  storyboard,
  assetVersion,
  currentStoryboardIndex,
  currentProductionStage,
  toVersionedMediaUrl,
  escapeHtml,
  clampStoryboardIndex,
  getVisualTypeLabel,
  buildVisualTypeOptions,
}) {
  if (!storyboard?.length) {
    return {
      html: buildLockedStoryboardScaffold({ currentProductionStage }),
      currentStoryboardIndex,
    };
  }

  const nextStoryboardIndex = clampStoryboardIndex(currentStoryboardIndex, storyboard.length);
  const currentScene = storyboard[nextStoryboardIndex] || storyboard[0];
  const preview = currentScene?.assetPath ? toVersionedMediaUrl(currentScene.assetPath, assetVersion) : "";
  const totalDuration = storyboard.reduce((sum, scene) => sum + Number(scene.durationSec || 0), 0);
  const sceneDuration = Number(currentScene.durationSec || 0);
  const sceneShare = totalDuration ? Math.round((sceneDuration / totalDuration) * 100) : 0;
  const voiceoverLength = String(currentScene.voiceover || "").trim().length;
  const pendingSceneCount = storyboard.filter((scene) => !scene?.assetPath).length;
  const hasPendingScenes = pendingSceneCount > 0;
  const currentSceneReady = Boolean(currentScene?.assetPath);
  const sceneReview = getSceneReviewFocus(currentScene, {
    totalDuration,
    sceneShare,
    index: nextStoryboardIndex,
    storyboardLength: storyboard.length,
  });

  return {
    currentStoryboardIndex: nextStoryboardIndex,
    html: `
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
                return `<span class="storyboard-timeline-segment${index === nextStoryboardIndex ? " active" : ""} ${signal.segmentClass}" style="flex:${Math.max(1, Number(scene.durationSec || 1))}"></span>`;
              })
              .join("")}
          </div>
          <div class="storyboard-scene-list">
            ${storyboard
              .map((scene, index) => {
                const isActive = index === nextStoryboardIndex ? " active" : "";
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

        <article class="storyboard-card" data-scene-id="${escapeHtml(currentScene.id || `scene-${nextStoryboardIndex + 1}`)}">
          <div class="storyboard-decision-bar">
            <div class="storyboard-decision-copy">
              <span class="storyboard-section-label">当前镜头判断</span>
              <strong>${escapeHtml(sceneReview.title)}</strong>
              <p>${escapeHtml(sceneReview.text)}</p>
            </div>
            <div class="storyboard-decision-metrics">
              <div class="storyboard-decision-metric">
                <span>当前镜头</span>
                <strong>第 ${nextStoryboardIndex + 1} / ${storyboard.length} 个</strong>
              </div>
              <div class="storyboard-decision-metric">
                <span>待补镜头</span>
                <strong>${pendingSceneCount} 个</strong>
              </div>
              <div class="storyboard-decision-metric">
                <span>当前镜头</span>
                <strong>${currentSceneReady ? "素材已就绪" : "等待补素材"}</strong>
              </div>
            </div>
          </div>
          <div class="storyboard-card-head">
            <div class="storyboard-card-head-main">
              <div>
                <span class="storyboard-card-kicker">当前镜头</span>
                <strong>${escapeHtml(currentScene.sceneTitle || `镜头 ${nextStoryboardIndex + 1}`)}</strong>
                <span>Scene ${nextStoryboardIndex + 1} · ${escapeHtml(getVisualTypeLabel(currentScene.visualType))}</span>
              </div>
              <span class="storyboard-card-meta">${Number(currentScene.durationSec || 0)} 秒</span>
            </div>
            <div class="storyboard-card-actions">
              <div class="storyboard-action-group">
                <span class="storyboard-action-label">结构</span>
                <button type="button" class="switch-btn storyboard-add-btn" data-scene-index="${nextStoryboardIndex}">新增镜头</button>
                <button type="button" class="switch-btn storyboard-move-btn" data-scene-move="up" data-scene-index="${nextStoryboardIndex}" ${nextStoryboardIndex === 0 ? "disabled" : ""}>上移</button>
                <button type="button" class="switch-btn storyboard-move-btn" data-scene-move="down" data-scene-index="${nextStoryboardIndex}" ${nextStoryboardIndex === storyboard.length - 1 ? "disabled" : ""}>下移</button>
              </div>
              <div class="storyboard-action-group storyboard-action-group-danger">
                <span class="storyboard-action-label">维护</span>
                <button type="button" class="switch-btn storyboard-delete-btn" data-scene-index="${nextStoryboardIndex}" ${storyboard.length <= 1 ? "disabled" : ""}>删除镜头</button>
              </div>
            </div>
          </div>
          <div class="storyboard-card-body">
            <div class="storyboard-visual-panel storyboard-panel-block">
              <div class="storyboard-panel-head">
                <div>
                  <div class="storyboard-section-label">镜头预览</div>
                  <strong>先看画面和停留感</strong>
                </div>
                <span class="storyboard-panel-chip">${preview ? "已有素材" : "等待素材"}</span>
              </div>
              <div class="storyboard-thumb-shell">
                ${preview ? `<img src="${preview}" alt="${escapeHtml(currentScene.sceneTitle || `Scene ${nextStoryboardIndex + 1}`)}" class="storyboard-thumb" />` : `<div class="storyboard-thumb-empty">暂无素材</div>`}
              </div>
              <div class="storyboard-visual-caption">先看这一镜是否真的在支撑当前段落。</div>
            </div>
            <div class="storyboard-fields">
              <div class="storyboard-fields-group storyboard-panel-block">
                <div class="storyboard-panel-head">
                  <div>
                    <div class="storyboard-section-label">镜头参数</div>
                    <strong>再改标题、类型和时长</strong>
                  </div>
                </div>
                <label>
                  <span>镜头标题</span>
                  <input data-storyboard-index="${nextStoryboardIndex}" data-scene-field="sceneTitle" value="${escapeHtml(currentScene.sceneTitle || "")}" />
                </label>
                <div class="storyboard-inline-fields">
                  <label>
                    <span>镜头类型</span>
                    <select data-storyboard-index="${nextStoryboardIndex}" data-scene-field="visualType">
                      ${buildVisualTypeOptions(currentScene.visualType)}
                    </select>
                  </label>
                  <label>
                    <span>时长</span>
                    <input data-storyboard-index="${nextStoryboardIndex}" data-scene-field="durationSec" type="number" min="4" max="40" step="1" value="${Number(currentScene.durationSec || 6)}" />
                  </label>
                </div>
              </div>
              <div class="storyboard-fields-group storyboard-panel-block">
                <div class="storyboard-panel-head">
                  <div>
                    <div class="storyboard-section-label">镜头口播</div>
                    <strong>最后再决定要不要同步</strong>
                  </div>
                  <span class="storyboard-panel-chip">${voiceoverLength} 字</span>
                </div>
                <label>
                  <span>口播文案</span>
                  <textarea data-storyboard-index="${nextStoryboardIndex}" data-scene-field="voiceover" rows="8">${escapeHtml(currentScene.voiceover || "")}</textarea>
                </label>
                <div class="storyboard-action-note">
                  <p>${hasPendingScenes ? "先把待补镜头依次补齐；每补完一镜，系统会自动带你跳到下一个待补镜头。" : "这一轮镜头素材已经补齐。现在更适合逐镜精修，而不是继续盲目重跑。"}</p>
                  <div class="storyboard-action-note-buttons">
                    <button type="button" class="switch-btn storyboard-refresh-btn" data-scene-id="${escapeHtml(currentScene.id || "")}">${hasPendingScenes ? (currentSceneReady ? "重做当前镜头并继续" : "补当前镜头并继续") : "重做当前镜头"}</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </article>
      </div>
    `,
  };
}

function buildLockedStoryboardScaffold({ currentProductionStage }) {
  const stageReady = currentProductionStage !== "script";
  const summaryTitle = stageReady ? "还没有可操作的 scene，先补第一轮镜头生成" : "脚本期先锁结构，镜头工作台后置进入";
  const summaryText = stageReady
    ? "你已经进入生产阶段，但当前还没有生成可编辑镜头。先完成一轮镜头生成，这里就会切换成真正的逐镜工作台。"
    : "先把口播脚本和分段节奏确认下来。镜头层会在脚本确认后生成可编辑版本，再按镜头逐一精修。";
  const stageLabel = stageReady ? "生产期" : "脚本期";
  const pendingLabel = stageReady ? "待生成镜头列表" : "镜头列表 + 顺序";
  const enterLabel = stageReady ? "先跑第一轮镜头" : "确认脚本后";
  const actionLabel = stageReady ? "先生成镜头" : "先确认脚本";
  const actionDisabled = stageReady ? "" : "disabled";

  return `
    <div class="storyboard-shell storyboard-shell-locked">
      <article class="storyboard-card storyboard-card-locked">
        <div class="storyboard-decision-bar">
          <div class="storyboard-decision-copy">
            <span class="storyboard-section-label">当前镜头判断</span>
            <strong>${summaryTitle}</strong>
            <p>${summaryText}</p>
          </div>
          <div class="storyboard-decision-metrics">
            <div class="storyboard-decision-metric">
              <span>当前阶段</span>
              <strong>${stageLabel}</strong>
            </div>
            <div class="storyboard-decision-metric">
              <span>待生成内容</span>
              <strong>${pendingLabel}</strong>
            </div>
            <div class="storyboard-decision-metric">
              <span>进入条件</span>
              <strong>${enterLabel}</strong>
            </div>
          </div>
        </div>
        <div class="storyboard-card-body storyboard-card-body-locked">
          <div class="storyboard-visual-panel storyboard-panel-block storyboard-placeholder-panel">
            <div class="storyboard-panel-head">
              <div>
                <div class="storyboard-section-label">镜头预演</div>
                <strong>这里会显示当前镜头的预览素材</strong>
              </div>
              <span class="storyboard-panel-chip">等待生成</span>
            </div>
            <div class="storyboard-thumb-shell storyboard-thumb-shell-locked">
              <div class="storyboard-thumb-empty storyboard-thumb-empty-locked">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
            <div class="storyboard-visual-caption">脚本确认后，会先生成一版镜头顺序与当前镜头预览。</div>
          </div>
          <div class="storyboard-fields">
            <div class="storyboard-fields-group storyboard-panel-block storyboard-placeholder-panel">
              <div class="storyboard-panel-head">
                <div>
                  <div class="storyboard-section-label">镜头参数</div>
                  <strong>后续可改标题、类型和停留时长</strong>
                </div>
              </div>
              <div class="storyboard-placeholder-lines">
                <span class="storyboard-placeholder-line w-72"></span>
                <span class="storyboard-placeholder-line w-56"></span>
                <span class="storyboard-placeholder-line w-64"></span>
              </div>
            </div>
            <div class="storyboard-fields-group storyboard-panel-block storyboard-placeholder-panel">
              <div class="storyboard-panel-head">
                <div>
                  <div class="storyboard-section-label">镜头口播</div>
                  <strong>逐镜修订会在这里进行</strong>
                </div>
                <span class="storyboard-panel-chip">待进入</span>
              </div>
              <div class="storyboard-placeholder-copy">
                脚本确认后，这里会带入当前镜头口播、镜头类型和顺序建议。只有这时才值得进入逐镜调整。
              </div>
              <div class="storyboard-action-note">
                <p>${stageReady ? "先补一轮镜头生成，生成后就在这里逐镜调整顺序、口播和镜头停留。" : "建议顺序：先确认脚本，再生成口播/字幕与封面，最后再回来精修镜头。"}</p>
                <div class="storyboard-action-note-buttons">
                  <button type="button" class="switch-btn" ${actionDisabled}>${actionLabel}</button>
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
