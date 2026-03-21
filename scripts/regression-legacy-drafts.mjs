import assert from "node:assert/strict";
import { existsSync, promises as fs } from "node:fs";
import path from "node:path";

process.env.NO_LISTEN = "1";

const {
  rootDir,
  llmConfigPath,
  getDraft,
  updateDraftMeta,
  checkDraftQuality,
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

const scriptDraftId = `legacy-script-${Date.now().toString(36)}`;
const productionDraftId = `legacy-production-${(Date.now() + 1).toString(36)}`;
const draftIds = [scriptDraftId, productionDraftId];
const summary = [];
let originalConfig = null;

try {
  originalConfig = existsSync(llmConfigPath) ? await fs.readFile(llmConfigPath, "utf8") : null;
  await fs.writeFile(llmConfigPath, `${JSON.stringify(disabledLlmConfig, null, 2)}\n`, "utf8");

  await seedLegacyScriptDraft(scriptDraftId);
  await seedLegacyProductionDraft(productionDraftId);

  const scriptDraftData = await getDraft(scriptDraftId);
  const scriptDraft = scriptDraftData.draft;
  assert.equal(scriptDraft.productionStage, "script");
  assert.equal(scriptDraft.workflowStatus, "pending");
  assert.ok(scriptDraft.assets.subtitlePath.endsWith("/subtitles.srt"));
  assert.ok(Array.isArray(scriptDraft.qualityChecks));
  assert.equal(scriptDraft.starred, false);
  summary.push(`legacy-script: ok (${scriptDraft.id})`);

  await updateDraftMeta({ draftId: scriptDraftId, starred: true, workflowStatus: "ready" });
  const updatedScriptDraft = (await getDraft(scriptDraftId)).draft;
  assert.equal(updatedScriptDraft.starred, true);
  assert.equal(updatedScriptDraft.workflowStatus, "ready");
  assert.equal(updatedScriptDraft.workflowStatusLabel, "可导出");
  summary.push("legacy-script-meta: ok");

  const productionDraft = (await getDraft(productionDraftId)).draft;
  assert.equal(productionDraft.productionStage, "production");
  assert.ok(Array.isArray(productionDraft.storyboard) && productionDraft.storyboard.length > 0);
  assert.ok(Array.isArray(productionDraft.timeline) && productionDraft.timeline.length > 0);
  assert.ok(productionDraft.assets.exportScriptPath.endsWith("/export-video.sh"));
  summary.push(`legacy-production: ok (${productionDraft.storyboard.length} scenes)`);

  const quality = await checkDraftQuality(productionDraftId);
  assert.ok(Array.isArray(quality.checks));
  summary.push(`legacy-production-check: ok (${quality.checks.length} checks)`);

  for (const line of summary) {
    console.log(line);
  }
} finally {
  if (originalConfig === null) {
    await fs.rm(llmConfigPath, { force: true });
  } else {
    await fs.writeFile(llmConfigPath, originalConfig, "utf8");
  }

  for (const draftId of draftIds) {
    await fs.rm(path.join(rootDir, "data", "drafts", draftId), { recursive: true, force: true });
  }
}

async function seedLegacyScriptDraft(draftId) {
  const draftDir = path.join(rootDir, "data", "drafts", draftId);
  await fs.mkdir(draftDir, { recursive: true });

  const legacyDraft = {
    id: draftId,
    createdAt: "2026-03-01T08:00:00.000Z",
    topic: "历史脚本草稿兼容测试",
    title: "历史脚本草稿兼容测试标题",
    coverTitle: "历史脚本草稿",
    coverSubtitle: "只保留早期核心字段",
    hook: "这是一条只保留旧字段的草稿，用来验证归一化是否能补齐缺失结构。",
    sections: [
      "第一段来自历史结构。",
      "第二段仍然只有正文内容。",
      "第三段用于触发脚本重建。",
    ],
    cta: "这里是旧草稿 CTA。",
  };

  await fs.writeFile(path.join(draftDir, "draft.json"), JSON.stringify(legacyDraft, null, 2), "utf8");
}

async function seedLegacyProductionDraft(draftId) {
  const draftDir = path.join(rootDir, "data", "drafts", draftId);
  await fs.mkdir(draftDir, { recursive: true });

  const coverPath = path.join(draftDir, "cover.svg");
  const subtitlePath = path.join(draftDir, "subtitles.srt");
  const voicePath = path.join(draftDir, "voice.aiff");

  await fs.writeFile(coverPath, `<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920"><rect width="1080" height="1920" fill="#10212d"/><text x="100" y="240" fill="#ffffff" font-size="72">legacy</text></svg>\n`, "utf8");
  await fs.writeFile(subtitlePath, "1\n00:00:00,000 --> 00:00:03,000\n历史字幕测试\n", "utf8");
  await fs.writeFile(voicePath, "", "utf8");

  const legacyDraft = {
    id: draftId,
    createdAt: "2026-03-01T09:00:00.000Z",
    topic: "历史生产草稿兼容测试",
    title: "历史生产草稿兼容测试标题",
    coverTitle: "历史生产草稿",
    coverSubtitle: "保留旧资产字段",
    hook: "这是一条带旧资产字段的草稿。",
    sections: [
      "第一段验证 stage 推导。",
      "第二段验证 storyboard 自动补齐。",
      "第三段验证 timeline 自动补齐。",
    ],
    cta: "这里是旧生产草稿 CTA。",
    assets: {
      coverPath: path.relative(rootDir, coverPath).split(path.sep).join("/"),
      subtitlePath: path.relative(rootDir, subtitlePath).split(path.sep).join("/"),
      voicePath: path.relative(rootDir, voicePath).split(path.sep).join("/"),
      voiceFormat: "aiff",
    },
  };

  await fs.writeFile(path.join(draftDir, "draft.json"), JSON.stringify(legacyDraft, null, 2), "utf8");
}
