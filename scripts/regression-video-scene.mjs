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
  runDynamicTrial,
  regenerateDraftScene,
  regenerateDraftDynamicScene,
  checkDraftQuality,
  exportDraft,
  buildStoryboardFfmpegScript,
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
let mode = "success";
const originalFetch = globalThis.fetch;

function buildMockVideoAssetBase64() {
  return Buffer.from("mock-video-scene-asset", "utf8").toString("base64");
}

function installMockFetch() {
  globalThis.fetch = async (url, options = {}) => {
    const requestUrl = String(url || "");
    if (!requestUrl.startsWith("https://mock.video.scene/scene-video")) {
      return originalFetch(url, options);
    }

    if (mode === "fail") {
      return new Response(JSON.stringify({ error: "forced failure" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({
      video_base64: buildMockVideoAssetBase64(),
      video_type: "mp4",
      providerMeta: {
        provider: "mock-video-scene",
        model: "mock-scene-v1",
        requestId: "req-mock",
      },
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  };
}

function buildVideoSceneConfig() {
  return {
    ...disabledLlmConfig,
    video_scene: {
      enabled: true,
      provider: "mock-video-scene",
      apiKind: "native",
      baseURL: "https://mock.video.scene",
      endpoint: "/scene-video",
      apiKey: "mock-token",
      model: "mock-scene-v1",
      timeoutSec: "10",
      authHeader: "Authorization",
      authScheme: "Bearer",
    },
  };
}

try {
  originalConfig = existsSync(llmConfigPath) ? await fs.readFile(llmConfigPath, "utf8") : null;
  installMockFetch();
  await fs.writeFile(llmConfigPath, `${JSON.stringify(buildVideoSceneConfig(), null, 2)}\n`, "utf8");

  const created = await createDraft({
    topic: "动态镜头回归主题",
    angle: "验证 scene 级动态镜头生成与静态回退",
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

  assert.ok((updated.draft?.storyboard || []).length > 0, "静态试产未生成 storyboard");
  assert.ok((updated.draft.storyboard || []).every((scene) => !scene.videoPath), "旧静态试产不应默认生成动态 scene");
  assert.equal(updated.draft.materialType, "static_asset", "旧静态试产 materialType 应保持 static_asset");
  console.log("video-scene-static-trial: ok");

  const dynamicTrial = await runDynamicTrial({
    draftId,
    content: {
      title: updated.draft.title,
      titleVariantA: updated.draft.titleVariants?.a || updated.draft.title,
      titleVariantB: updated.draft.titleVariants?.b || updated.draft.title,
      coverTitle: updated.draft.coverTitle,
      coverSubtitle: updated.draft.coverSubtitle,
      hook: updated.draft.hook,
      sections: updated.draft.sections,
      cta: updated.draft.cta,
      durationMode: updated.draft.durationMode,
      storyboard: updated.draft.storyboard,
    },
  });

  const dynamicScenes = (dynamicTrial.draft?.storyboard || []).filter((scene) => scene.videoPath);
  assert.ok(dynamicScenes.length > 0, "动态试产未生成任何动态 scene");
  assert.ok(dynamicScenes.every((scene) => scene.videoScene?.status === "success"), "动态 scene 状态未写入 success");
  assert.ok(dynamicScenes.every((scene) => existsSync(path.join(rootDir, scene.videoPath))), "动态 scene 视频文件不存在");
  assert.ok(dynamicScenes.every((scene) => scene.assetPath), "动态 scene 缺少静态参考 assetPath");
  assert.ok(dynamicScenes.every((scene) => scene.materialType === "mixed"), "动态试产 scene 应记录 mixed materialType");
  assert.equal(dynamicTrial.draft.materialType, "mixed", "动态试产 draft 应记录 mixed materialType");
  console.log(`video-scene-success: ok (${dynamicScenes.length} scenes)`);

  const exportScript = buildStoryboardFfmpegScript({
    ffmpegPath: "/usr/bin/ffmpeg",
    storyboard: dynamicTrial.draft.storyboard,
    timeline: dynamicTrial.draft.timeline,
    audioPath: path.join(rootDir, dynamicTrial.draft.assets.voicePath),
    subtitlePath: path.join(rootDir, dynamicTrial.draft.assets.subtitlePath),
    outputPath: path.join(rootDir, "tmp-video-scene-output.mp4"),
  });
  assert.match(exportScript, /\.mp4"/, "导出脚本未接入动态 scene 视频输入");
  console.log("video-scene-export-priority: ok");

  const checkResult = await checkDraftQuality(draftId);
  assert.ok(checkResult.sceneAssetReport, "导出前检查未返回 sceneAssetReport");
  assert.ok(checkResult.sceneAssetReport.summary.dynamic >= 1, "sceneAssetReport 未统计动态镜头");
  const exportResult = await exportDraft(draftId);
  assert.ok(exportResult.sceneAssetReport, "导出结果未返回 sceneAssetReport");
  console.log("video-scene-asset-report: ok");

  mode = "fail";
  const targetScene = dynamicTrial.draft.storyboard.find((scene) => scene.videoPath);
  assert.ok(targetScene?.id, "缺少可重建的动态 scene");
  const regenerated = await regenerateDraftDynamicScene({
    draftId,
    sceneId: targetScene.id,
  });
  const regeneratedScene = regenerated.draft.storyboard.find((scene) => scene.id === targetScene.id);
  assert.ok(regeneratedScene, "局部重建后未返回目标 scene");
  assert.equal(regeneratedScene.videoPath, "", "动态镜头失败回退后不应继续保留 videoPath");
  assert.equal(regeneratedScene.videoScene?.status, "fallback", "动态镜头失败后状态应写为 fallback");
  assert.ok(regeneratedScene.videoScene?.error, "动态镜头失败后应记录错误信息");
  assert.ok(regeneratedScene.assetPath, "动态镜头失败回退后应保留静态素材");
  assert.equal(regeneratedScene.materialType, "static_asset", "动态镜头失败回退后 scene 应退回 static_asset");
  assert.ok(existsSync(path.join(rootDir, regeneratedScene.assetPath)), "动态镜头失败回退后的静态素材不存在");
  console.log(`video-scene-fallback: ok (${regeneratedScene.id})`);

  mode = "success";
  const autoRegenerated = await regenerateDraftScene({
    draftId,
    sceneId: regeneratedScene.id,
  });
  const autoScene = autoRegenerated.draft.storyboard.find((scene) => scene.id === regeneratedScene.id);
  assert.ok(autoScene?.videoPath, "已有动态镜头历史的 scene 在 auto 重建下应优先走动态");
  assert.ok(["mixed", "dynamic_video_asset"].includes(autoScene.materialType), "auto 动态重建后 materialType 未恢复为动态");
  assert.ok(Array.isArray(autoRegenerated.draft.sceneReviews), "draft 未记录 sceneReviews");
  assert.ok(Array.isArray(autoRegenerated.draft.sceneRepairs), "draft 未记录 sceneRepairs");
  assert.ok(autoRegenerated.draft.sceneReviews.some((item) => item.sceneId === regeneratedScene.id), "scene review 历史未写回当前 scene");
  const latestRepair = [...autoRegenerated.draft.sceneRepairs].reverse().find((item) => item.sceneId === regeneratedScene.id);
  assert.ok(latestRepair, "scene repair 历史未写回当前 scene");
  assert.ok(["repaired", "skipped"].includes(latestRepair.status), "scene repair 状态异常");
  assert.ok(typeof latestRepair.beforeScore === "number" && typeof latestRepair.afterScore === "number", "scene repair 未记录 review score");
  console.log(`video-scene-auto-regenerate: ok (${autoScene.id})`);
} finally {
  globalThis.fetch = originalFetch;

  if (originalConfig === null) {
    await fs.rm(llmConfigPath, { force: true });
  } else {
    await fs.writeFile(llmConfigPath, originalConfig, "utf8");
  }

  if (draftId) {
    await fs.rm(path.join(rootDir, "data", "drafts", draftId), { recursive: true, force: true });
  }
}
