import assert from "node:assert/strict";
import { existsSync, promises as fs } from "node:fs";
import path from "node:path";

process.env.NO_LISTEN = "1";

const {
  rootDir,
  llmConfigPath,
  createDraft,
  saveDraftContent,
  syncDraftAudio,
  syncDraftCover,
} = await import("../src/server.js");
const { createAppServer } = await import("../src/server/http.js");

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
const summary = [];
const server = createAppServer();

try {
  originalConfig = existsSync(llmConfigPath) ? await fs.readFile(llmConfigPath, "utf8") : null;
  await fs.writeFile(llmConfigPath, `${JSON.stringify(disabledLlmConfig, null, 2)}\n`, "utf8");

  const generated = await createDraft({
    topic: "预听播放器回归测试",
    angle: "验证第一步生成后可直接试听",
    audience: "测试用户",
    durationMode: 60,
  });
  draftId = generated.draft?.id || "";
  assert.ok(draftId, "createDraft 未返回 draftId");

  const saved = await saveDraftContent({
    draftId,
    content: {
      title: "预听播放器回归测试标题",
      titleVariantA: "预听播放器回归测试标题",
      titleVariantB: "预听播放器回归测试标题",
      coverTitle: "预听播放器回归",
      coverSubtitle: "验证第一步结果",
      hook: "第一步完成后，这里必须能直接看到播放器。",
      sections: [
        "这一步只验证口播和字幕是否已经就绪。",
        "不要求正式封面已经生成。",
        "页面必须能基于现成草稿直接提供试听。",
      ],
      cta: "回归完成。",
      durationMode: 60,
    },
  });

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

  assert.ok(audioOnly.draft?.assets?.voicePath, "syncDraftAudio 未生成 voicePath");
  assert.ok((audioOnly.draft?.subtitleEntries || []).length > 0, "syncDraftAudio 未生成字幕");
  summary.push(`sync-audio: ok (${audioOnly.draft.subtitleEntries.length} subtitles)`);

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  assert.ok(address && typeof address === "object" && address.port, "回归服务未拿到可用端口");
  const baseUrl = `http://127.0.0.1:${address.port}`;

  const draftResponse = await fetch(`${baseUrl}/api/drafts/${draftId}`);
  const draftPayload = await draftResponse.json();
  assert.equal(draftResponse.status, 200, "草稿接口返回异常");
  assert.equal(draftPayload.draft?.productionStage, "production", "第一步完成后草稿应处于 production 阶段");
  assert.ok(draftPayload.draft?.assets?.voicePath, "草稿接口未返回 voicePath");
  summary.push("draft-api: ok");

  const mediaUrl = `${baseUrl}/media/${draftPayload.draft.assets.voicePath}`;
  const mediaResponse = await fetch(mediaUrl);
  const mediaBuffer = Buffer.from(await mediaResponse.arrayBuffer());
  assert.equal(mediaResponse.status, 200, "音频资源 URL 无法访问");
  assert.ok(mediaBuffer.length > 0, "音频资源为空");
  summary.push(`audio-url: ok (${mediaBuffer.length} bytes)`);

  const coverOnly = await syncDraftCover({
    draftId,
    content: {
      title: draftPayload.draft.title,
      titleVariantA: draftPayload.draft.titleVariants?.a || draftPayload.draft.title,
      titleVariantB: draftPayload.draft.titleVariants?.b || draftPayload.draft.title,
      coverTitle: draftPayload.draft.coverTitle,
      coverSubtitle: draftPayload.draft.coverSubtitle,
      hook: draftPayload.draft.hook,
      sections: draftPayload.draft.sections,
      cta: draftPayload.draft.cta,
      durationMode: draftPayload.draft.durationMode,
      storyboard: draftPayload.draft.storyboard,
    },
  });
  assert.ok(coverOnly.draft?.assets?.coverPath, "syncDraftCover 未生成 coverPath");

  const coverResponse = await fetch(`${baseUrl}/media/${coverOnly.draft.assets.coverPath}`);
  const coverBuffer = Buffer.from(await coverResponse.arrayBuffer());
  assert.equal(coverResponse.status, 200, "封面资源 URL 无法访问");
  assert.ok(coverBuffer.length > 0, "封面资源为空");
  summary.push(`cover-url: ok (${coverBuffer.length} bytes)`);

  const appResponse = await fetch(`${baseUrl}/app.js?v=regression-preview-audio`);
  const appSource = await appResponse.text();
  assert.equal(appResponse.status, 200, "前台 app.js 返回异常");
  assert.ok(appSource.includes("function syncPreviewAudioPlayer"), "app.js 缺少播放器同步逻辑");
  assert.ok(appSource.includes("setupPreviewImage(currentDraft, buildAssetVersion(currentDraft));"), "app.js 缺少封面预览稳定刷新兜底");
  assert.ok(appSource.includes("previewAudioEmptyEl.hidden = true"), "app.js 缺少空态隐藏兜底");
  assert.ok(appSource.includes("safeRenderRegion(\"preview-audio-player\""), "app.js 缺少预听播放器渲染入口");
  summary.push("app-shell: ok");

  const indexResponse = await fetch(`${baseUrl}/`);
  const indexHtml = await indexResponse.text();
  assert.equal(indexResponse.status, 200, "首页返回异常");
  assert.ok(indexHtml.includes('id="audio-player"'), "首页缺少 audio-player 挂点");
  summary.push("index-hook: ok");

  for (const line of summary) {
    console.log(line);
  }
} finally {
  await new Promise((resolve) => server.close(resolve));

  if (originalConfig === null) {
    await fs.rm(llmConfigPath, { force: true });
  } else {
    await fs.writeFile(llmConfigPath, originalConfig, "utf8");
  }

  if (draftId) {
    await fs.rm(path.join(rootDir, "data", "drafts", draftId), { recursive: true, force: true });
  }
}
