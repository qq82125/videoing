import assert from "node:assert/strict";
import { existsSync, promises as fs } from "node:fs";
import path from "node:path";

process.env.NO_LISTEN = "1";

const {
  rootDir,
  llmConfigPath,
  createDraft,
  syncDraftAudio,
  syncDraftCover,
  updateDraftContent,
  getDraft,
  regenerateDraftScene,
} = await import("../src/server.js");

const disabledLlmConfig = {
  script: { enabled: false },
  storyboard: { enabled: false },
  image: { enabled: false },
  tts: { enabled: false },
  transcription: { enabled: false },
  moderation: { enabled: false },
};

let draftId = "";
let originalConfig = null;

try {
  originalConfig = existsSync(llmConfigPath) ? await fs.readFile(llmConfigPath, "utf8") : null;
  await fs.writeFile(llmConfigPath, `${JSON.stringify(disabledLlmConfig, null, 2)}\n`, "utf8");

  const created = await createDraft({
    topic: "镜头回归测试主题",
    angle: "验证局部镜头生成与第四步工作台联动",
    audience: "测试用户",
    durationMode: 60,
  });
  draftId = created.draft?.id || "";
  assert.ok(draftId, "createDraft 未返回 draftId");

  const audioOnly = await syncDraftAudio({
    draftId,
    content: {
      title: created.draft.title,
      titleVariantA: created.draft.titleVariants?.a || created.draft.title,
      titleVariantB: created.draft.titleVariants?.b || created.draft.title,
      coverTitle: created.draft.coverTitle,
      coverSubtitle: created.draft.coverSubtitle,
      hook: created.draft.hook,
      sections: created.draft.sections,
      cta: created.draft.cta,
      durationMode: created.draft.durationMode,
      storyboard: created.draft.storyboard,
    },
  });
  assert.equal(audioOnly.draft?.productionStage, "production", "syncDraftAudio 未进入 production 阶段");

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

  assert.ok(Array.isArray(updated.draft?.storyboard) && updated.draft.storyboard.length === 6, "updateDraftContent 未生成 6 个首轮镜头");
  assert.ok(updated.draft.storyboard.every((scene) => scene.assetPath), "updateDraftContent 后仍有镜头缺素材");

  const hydrated = await getDraft(draftId);
  assert.ok(Array.isArray(hydrated.draft?.storyboard) && hydrated.draft.storyboard.length === 6, "getDraft 未返回完整 storyboard");
  assert.ok(hydrated.draft.storyboard.every((scene) => scene.assetPath), "getDraft 返回的 storyboard 仍有镜头缺素材");
  console.log(`storyboard-hydrated: ok (${hydrated.draft.storyboard.length} scenes)`);

  const sceneToRegenerate = hydrated.draft.storyboard[0];
  const beforeAssetPath = sceneToRegenerate.assetPath;
  assert.ok(beforeAssetPath, "首镜头缺少原始 assetPath");

  const regenerated = await regenerateDraftScene({
    draftId,
    sceneId: sceneToRegenerate.id,
  });

  assert.ok(Array.isArray(regenerated.draft?.storyboard), "regenerateDraftScene 未返回 storyboard");
  assert.equal(regenerated.draft.storyboard.length, hydrated.draft.storyboard.length, "局部镜头重建后 storyboard 长度不应变化");
  assert.ok(regenerated.draft.storyboard[0]?.assetPath, "局部镜头重建后首镜头缺少 assetPath");
  assert.ok(
    existsSync(path.join(rootDir, regenerated.draft.storyboard[0].assetPath)),
    "局部镜头重建后的素材文件不存在",
  );
  console.log(`scene-regenerate: ok (${regenerated.draft.storyboard[0].id})`);

  const appSource = await fs.readFile(path.join(rootDir, "public", "app.js"), "utf8");
  assert.ok(appSource.includes("buildStoryboardFallbackHtml"), "app.js 未包含 storyboard fallback 兜底逻辑");
  assert.ok(appSource.includes("resolveRenderableStoryboard"), "app.js 未包含 storyboard 渲染归一化逻辑");
  console.log("storyboard-ui-guards: ok");
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
