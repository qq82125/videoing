import assert from "node:assert/strict";
import { existsSync, promises as fs } from "node:fs";
import path from "node:path";

process.env.NO_LISTEN = "1";

const {
  rootDir,
  llmConfigPath,
  createDraft,
  updateDraftContent,
  syncDraftAudio,
  syncDraftCover,
  saveDraftContent,
  checkDraftQuality,
  exportDraft,
} = await import("../src/server.js");

const disabledLlmConfig = {
  script: { enabled: false },
  storyboard: { enabled: false },
  video_scene: { enabled: false },
  image: { enabled: false },
  tts: { enabled: false },
  transcription: { enabled: false },
  moderation: { enabled: false },
};

let draftId = "";
let originalConfig = null;
const summary = [];

try {
  originalConfig = existsSync(llmConfigPath) ? await fs.readFile(llmConfigPath, "utf8") : null;
  await fs.writeFile(llmConfigPath, `${JSON.stringify(disabledLlmConfig, null, 2)}\n`, "utf8");

  const generated = await createDraft({
    topic: "阶段 1 回归测试主题",
    angle: "验证生成到导出链路",
    audience: "测试用户",
    durationMode: 60,
  });

  draftId = generated.draft?.id || "";
  assert.ok(draftId, "createDraft 未返回 draftId");
  summary.push(`generate: ok (${draftId})`);

  const saved = await saveDraftContent({
    draftId,
    content: {
      title: "阶段 1 回归测试标题",
      coverTitle: "阶段 1 回归",
      coverSubtitle: "验证保存、质检与导出",
      hook: "这是一条用于验证本地工作流最小闭环的测试文案。",
      sections: [
        "第一段用于验证保存后能生成完整内容结构。",
        "第二段用于验证口播、字幕、封面和分镜资产会一起补齐。",
        "第三段用于验证后续质检和导出链路可继续执行。",
      ],
      cta: "测试完成后无需对外发布。",
      durationMode: 60,
    },
  });

  assert.equal(saved.draft?.productionStage, "script", "saveDraftContent 不应直接推进 production 阶段");
  assert.equal(saved.draft?.hook, "这是一条用于验证本地工作流最小闭环的测试文案。", "saveDraftContent 未持久化 hook");
  summary.push("save-content: ok");

  const audioOnly = await syncDraftAudio({
    draftId,
    content: {
      title: saved.draft.title,
      titleVariantA: saved.draft.titleVariants?.a || saved.draft.title,
      titleVariantB: saved.draft.titleVariants?.b || saved.draft.title,
      coverTitle: saved.draft.coverTitle,
      coverSubtitle: saved.draft.coverSubtitle,
      hook: saved.draft.hook,
      sections: saved.draft.sections,
      cta: saved.draft.cta,
      durationMode: saved.draft.durationMode,
      storyboard: saved.draft.storyboard,
    },
  });

  assert.equal(audioOnly.draft?.productionStage, "production", "syncDraftAudio 未进入 production 阶段");
  assert.ok(audioOnly.draft?.assets?.voicePath, "syncDraftAudio 未生成 voicePath");
  assert.ok(Array.isArray(audioOnly.draft?.subtitleEntries) && audioOnly.draft.subtitleEntries.length > 0, "syncDraftAudio 未生成字幕");
  assert.equal(audioOnly.draft?.assets?.coverPath || "", "", "syncDraftAudio 不应生成正式 coverPath");
  summary.push(`sync-audio: ok (${audioOnly.draft.subtitleEntries.length} subtitles)`);

  const voicePath = path.join(rootDir, audioOnly.draft.assets.voicePath);
  assert.ok(existsSync(voicePath), "syncDraftAudio 生成的音频文件不存在");
  const voiceStatBeforeCover = await fs.stat(voicePath);

  const coverOnly = await syncDraftCover({
    draftId,
    content: {
      title: audioOnly.draft.title,
      titleVariantA: audioOnly.draft.titleVariants?.a || audioOnly.draft.title,
      titleVariantB: audioOnly.draft.titleVariants?.b || audioOnly.draft.title,
      coverTitle: audioOnly.draft.coverTitle,
      coverSubtitle: audioOnly.draft.coverSubtitle,
      hook: audioOnly.draft.hook,
      sections: audioOnly.draft.sections,
      cta: audioOnly.draft.cta,
      durationMode: audioOnly.draft.durationMode,
      storyboard: audioOnly.draft.storyboard,
    },
  });

  assert.ok(coverOnly.draft?.assets?.coverPath, "syncDraftCover 未生成 coverPath");
  const coverPath = path.join(rootDir, coverOnly.draft.assets.coverPath);
  assert.ok(existsSync(coverPath), "syncDraftCover 生成的封面文件不存在");
  const voiceStatAfterCover = await fs.stat(voicePath);
  assert.equal(voiceStatAfterCover.mtimeMs, voiceStatBeforeCover.mtimeMs, "syncDraftCover 不应重写音频文件");
  summary.push("sync-cover: ok");

  const updated = await updateDraftContent({
    draftId,
    content: {
      title: coverOnly.draft.title,
      titleVariantA: coverOnly.draft.titleVariants?.a || coverOnly.draft.title,
      titleVariantB: coverOnly.draft.titleVariants?.b || coverOnly.draft.title,
      coverTitle: coverOnly.draft.coverTitle,
      coverSubtitle: coverOnly.draft.coverSubtitle,
      hook: coverOnly.draft.hook,
      sections: coverOnly.draft.sections,
      cta: coverOnly.draft.cta,
      durationMode: coverOnly.draft.durationMode,
      storyboard: coverOnly.draft.storyboard,
    },
  });

  assert.equal(updated.draft?.productionStage, "production", "updateDraftContent 未进入 production 阶段");
  assert.ok(updated.draft?.assets?.voicePath, "updateDraftContent 未生成 voicePath");
  assert.ok(updated.draft?.assets?.coverPath, "updateDraftContent 未生成 coverPath");
  assert.ok(Array.isArray(updated.draft?.storyboard) && updated.draft.storyboard.length > 0, "updateDraftContent 未生成 storyboard");
  summary.push(`update-content: ok (${updated.draft.storyboard.length} scenes)`);

  const quality = await checkDraftQuality(draftId);
  assert.ok(Array.isArray(quality.checks), "checkDraftQuality 未返回 checks");
  assert.equal(
    quality.checks.some((item) => item.level === "error"),
    false,
    `checkDraftQuality 返回阻塞项: ${quality.checks.map((item) => item.label).join(", ")}`,
  );
  summary.push(`check: ok (${quality.checks.length} checks)`);

  const exported = await exportDraft(draftId);
  assert.equal(exported.blocked, false, `exportDraft 被阻塞: ${exported.message || "unknown"}`);
  assert.ok(exported.exportInfo?.scriptReady, "exportDraft 未生成导出脚本");

  const exportScriptPath = path.join(rootDir, exported.exportScriptPath);
  assert.ok(existsSync(exportScriptPath), "导出脚本文件不存在");

  if (exported.exported) {
    const outputVideoPath = path.join(rootDir, exported.outputVideoPath);
    assert.ok(existsSync(outputVideoPath), "导出成功但未找到输出视频");
    summary.push(`export: ok (${exported.outputVideoPath})`);
  } else {
    summary.push(`export: ok-script-only (${exported.exportScriptPath})`);
  }

  for (const line of summary) {
    console.log(line);
  }
} finally {
  if (originalConfig === null) {
    await fs.rm(llmConfigPath, { force: true });
  } else {
    await fs.writeFile(llmConfigPath, originalConfig, "utf8");
  }

  if (draftId) {
    await fs.rm(path.join(rootDir, "data", "drafts", draftId), { recursive: true, force: true });
  }
}
