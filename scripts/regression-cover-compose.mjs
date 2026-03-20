import assert from "node:assert/strict";
import { existsSync, promises as fs } from "node:fs";
import path from "node:path";

process.env.NO_LISTEN = "1";

const {
  rootDir,
  llmConfigPath,
  createDraft,
  saveDraftContent,
  selectDraftCoverBackground,
  syncDraftCover,
  toggleDraftCoverBackgroundStar,
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

  const generated = await createDraft({
    topic: "封面背景与标题叠加回归",
    angle: "验证标题排版和视觉提示词",
    audience: "测试用户",
    durationMode: 60,
    coverStyle: "report",
  });
  draftId = generated.draft?.id || "";
  assert.ok(draftId, "createDraft 未返回 draftId");

  const content = {
    title: "封面背景与标题叠加回归",
    titleVariantA: "封面背景与标题叠加回归",
    titleVariantB: "封面背景与标题叠加回归",
    coverTitle: "硬叠标题验证",
    coverSubtitle: "冷色实验室场景",
    coverVisualPrompt: "不要人物，保留中上留白，冷色玻璃质感和数据流。",
    coverNegativePrompt: "不要英文大字、不要 logo、不要卡通人物。",
    coverTitlePosition: "top",
    coverTitleAlign: "right",
    coverTitleSize: "small",
    hook: "测试",
    sections: ["一", "二", "三"],
    cta: "完成",
    durationMode: 60,
  };

  await saveDraftContent({ draftId, content });
  const coverOnly = await syncDraftCover({ draftId, content });
  const draftDir = path.join(rootDir, "data", "drafts", draftId);

  assert.ok(coverOnly.draft?.assets?.coverPath, "syncDraftCover 未生成 coverPath");
  assert.ok((coverOnly.draft?.coverBackgroundHistory || []).length > 0, "未生成背景版本历史");
  const historyCountAfterFirstBuild = (coverOnly.draft?.coverBackgroundHistory || []).length;
  const syncedDraft = await syncDraftCover({ draftId, content: { ...content, coverTitle: "只重合成，不新增背景" } });
  assert.equal(
    (syncedDraft.draft?.coverBackgroundHistory || []).length,
    historyCountAfterFirstBuild,
    "同步封面时不应新增背景版本",
  );
  const rerolledDraft = await syncDraftCover({ draftId, rerollBackground: true, content });
  assert.ok(
    (rerolledDraft.draft?.coverBackgroundHistory || []).length > historyCountAfterFirstBuild,
    "只重抽背景时应新增背景版本",
  );
  const historyCountBeforeSelect = (rerolledDraft.draft?.coverBackgroundHistory || []).length;
  const firstBackgroundId = rerolledDraft.draft.coverBackgroundHistory[0]?.id;
  assert.ok(firstBackgroundId, "缺少背景版本 id");
  const selectedDraft = await selectDraftCoverBackground({ draftId, backgroundId: firstBackgroundId, content });
  assert.equal(
    (selectedDraft.draft?.coverBackgroundHistory || []).length,
    historyCountBeforeSelect,
    "切换背景底图时不应新增背景版本",
  );
  const starredDraft = await toggleDraftCoverBackgroundStar({ draftId, backgroundId: firstBackgroundId, starred: true });
  assert.equal(starredDraft.draft.coverBackgroundHistory[0]?.starred, true, "未成功收藏背景版本");
  assert.equal(coverOnly.draft?.coverVisualPrompt, content.coverVisualPrompt, "draft 未保存封面视觉提示词");
  assert.equal(coverOnly.draft?.coverNegativePrompt, content.coverNegativePrompt, "draft 未保存封面负向提示词");
  assert.match(coverOnly.draft?.coverPrompt || "", /不要在图片中直接渲染任何中文/, "封面 prompt 缺少无字背景约束");
  assert.match(coverOnly.draft?.coverPrompt || "", /额外视觉要求：不要人物，保留中上留白，冷色玻璃质感和数据流。/, "封面 prompt 缺少视觉提示词");
  assert.match(coverOnly.draft?.coverPrompt || "", /额外负向要求：不要英文大字、不要 logo、不要卡通人物。/, "封面 prompt 缺少负向提示词");

  const coverSvg = await fs.readFile(path.join(draftDir, "cover.svg"), "utf8");
  assert.match(coverSvg, /text-anchor="end"/, "成品封面未按右对齐叠字");
  assert.match(coverSvg, /<tspan x="960" dy="0">硬叠标题验证<\/tspan>/, "成品封面缺少硬叠标题");

  const resolvedCoverPath = path.join(rootDir, coverOnly.draft.assets.coverPath);
  assert.ok(existsSync(resolvedCoverPath), "coverPath 指向的正式封面不存在");

  const indexHtml = await fs.readFile(path.join(rootDir, "public", "index.html"), "utf8");
  const appSource = await fs.readFile(path.join(rootDir, "public", "app.js"), "utf8");
  assert.match(indexHtml, /cover-background-compare-grid/, "前台缺少背景并排比较挂点");
  assert.match(appSource, /function renderCoverBackgroundCompare/, "前台缺少背景并排比较渲染逻辑");
  assert.match(appSource, /toVersionedMediaUrl\(item\.backgroundPath, assetVersion\)/, "背景图库应展示纯背景缩略图");

  console.log("cover-compose: ok");
  console.log(`cover-asset: ok (${coverOnly.draft.assets.coverPath})`);
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
