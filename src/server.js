import { createServer } from "node:http";
import { existsSync, promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import crypto from "node:crypto";
import { createRequire } from "node:module";

const execFileAsync = promisify(execFile);
const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");
const publicDir = path.join(rootDir, "public");
const draftRoot = path.join(rootDir, "data", "drafts");
const configRoot = path.join(rootDir, "data", "config");
const llmConfigPath = path.join(configRoot, "llm-config.json");
const localFfmpegPath = resolveLocalFfmpegPath();
await loadLocalEnv();
const port = Number(envValue("PORT", "3016"));

await fs.mkdir(draftRoot, { recursive: true });
await fs.mkdir(configRoot, { recursive: true });

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);

    if (req.method === "GET" && url.pathname === "/") {
      return serveFile(path.join(publicDir, "index.html"), "text/html; charset=utf-8", res);
    }

    if (req.method === "GET" && url.pathname === "/admin") {
      return serveFile(path.join(publicDir, "admin.html"), "text/html; charset=utf-8", res);
    }

    if (req.method === "GET" && url.pathname === "/app.js") {
      return serveFile(path.join(publicDir, "app.js"), "application/javascript; charset=utf-8", res);
    }

    if (req.method === "GET" && url.pathname === "/admin.js") {
      return serveFile(path.join(publicDir, "admin.js"), "application/javascript; charset=utf-8", res);
    }

    if (req.method === "GET" && url.pathname === "/style.css") {
      return serveFile(path.join(publicDir, "style.css"), "text/css; charset=utf-8", res);
    }

    if (req.method === "GET" && url.pathname.startsWith("/media/")) {
      const filePath = path.join(rootDir, url.pathname.replace(/^\/+/, ""));
      return serveBinary(filePath, res);
    }

    if (req.method === "POST" && url.pathname === "/api/generate") {
      const body = await readJsonBody(req);
      const payload = await createDraft(body);
      return sendJson(res, 200, payload);
    }

    if (req.method === "POST" && url.pathname === "/api/generate-batch") {
      const body = await readJsonBody(req);
      const payload = await generateDraftBatch(body);
      return sendJson(res, 200, payload);
    }

    if (req.method === "POST" && url.pathname === "/api/export") {
      const body = await readJsonBody(req);
      const payload = await exportDraft(body.draftId);
      return sendJson(res, 200, payload);
    }

    if (req.method === "POST" && url.pathname === "/api/cover-style") {
      const body = await readJsonBody(req);
      const payload = await switchDraftCoverStyle(body.draftId, body.coverStyle);
      return sendJson(res, 200, payload);
    }

    if (req.method === "POST" && url.pathname === "/api/title-variant") {
      const body = await readJsonBody(req);
      const payload = await switchDraftTitleVariant(body.draftId, body.titleVariant);
      return sendJson(res, 200, payload);
    }

    if (req.method === "POST" && url.pathname === "/api/combo") {
      const body = await readJsonBody(req);
      const payload = await applyDraftCombo(body.draftId, body.comboId);
      return sendJson(res, 200, payload);
    }

    if (req.method === "GET" && url.pathname === "/api/drafts") {
      const payload = await listDrafts({
        q: url.searchParams.get("q") || "",
        workflowStatus: url.searchParams.get("workflowStatus") || "",
        productionStage: url.searchParams.get("productionStage") || "",
        starred: url.searchParams.get("starred") || "",
        sort: url.searchParams.get("sort") || "",
      });
      return sendJson(res, 200, payload);
    }

    if (req.method === "GET" && url.pathname.startsWith("/api/drafts/")) {
      const draftId = decodeURIComponent(url.pathname.replace("/api/drafts/", ""));
      const payload = await getDraft(draftId);
      return sendJson(res, 200, payload);
    }

    if (req.method === "POST" && url.pathname === "/api/drafts/update") {
      const body = await readJsonBody(req);
      const payload = await updateDraftContent(body);
      return sendJson(res, 200, payload);
    }

    if (req.method === "POST" && url.pathname === "/api/drafts/meta") {
      const body = await readJsonBody(req);
      const payload = await updateDraftMeta(body);
      return sendJson(res, 200, payload);
    }

    if (req.method === "POST" && url.pathname === "/api/drafts/check") {
      const body = await readJsonBody(req);
      const payload = await checkDraftQuality(body.draftId);
      return sendJson(res, 200, payload);
    }

    if (req.method === "POST" && url.pathname === "/api/drafts/scene-regenerate") {
      const body = await readJsonBody(req);
      const payload = await regenerateDraftScene(body);
      return sendJson(res, 200, payload);
    }

    if (req.method === "GET" && url.pathname === "/api/status") {
      const payload = await getRuntimeStatus();
      return sendJson(res, 200, payload);
    }

    if (req.method === "GET" && url.pathname === "/api/llm-config") {
      const payload = await getLlmConfigPayload();
      return sendJson(res, 200, payload);
    }

    if (req.method === "POST" && url.pathname === "/api/llm-config") {
      const body = await readJsonBody(req);
      const payload = await saveLlmConfig(body);
      return sendJson(res, 200, payload);
    }

    if (req.method === "POST" && url.pathname === "/api/llm-config/test") {
      const body = await readJsonBody(req);
      const payload = await testLlmRoute(body);
      return sendJson(res, 200, payload);
    }

    sendJson(res, 404, { error: "Not found" });
  } catch (error) {
    sendJson(res, 500, {
      error: error instanceof Error ? error.message : "Unknown server error",
    });
  }
});

if (envValue("NO_LISTEN") !== "1") {
  server.listen(port, "127.0.0.1", () => {
    console.log(`IVD video workflow running at http://127.0.0.1:${port}`);
  });
}

export async function createDraft(input) {
  const sourceType = normalizeSourceType(input?.sourceType);
  const rawContent = String(input?.rawContent || "").trim();
  const inputTopic = String(input?.topic || "").trim();
  const angle = String(input?.angle || "").trim();
  const rewriteStyle = normalizeRewriteStyle(input?.rewriteStyle);
  const audience = String(input?.audience || "IVD行业从业者、渠道商、实验室管理者").trim();
  const coverStyle = normalizeCoverStyle(input?.coverStyle);
  const durationMode = normalizeDurationMode(input?.durationMode);
  const topic = sourceType === "article" ? inferTopicFromRawContent(rawContent, inputTopic) : inputTopic;

  if (sourceType === "article" && !rawContent) {
    throw new Error("请输入文章标题或正文");
  }

  if (!topic) {
    throw new Error("请输入主题");
  }

  const draftId = `${new Date().toISOString().slice(0, 10)}-${crypto.randomBytes(3).toString("hex")}`;
  const draftDir = path.join(draftRoot, draftId);
  await fs.mkdir(draftDir, { recursive: true });

  const scriptRoute = await resolveLlmRouteConfig("script");
  const script = isLlmRouteEnabled(scriptRoute)
    ? await generateWithLlm({ sourceType, topic, rawContent, angle, rewriteStyle, audience, durationMode })
    : buildLocalDraft({ sourceType, topic, rawContent, angle, rewriteStyle, audience, durationMode });

  const narrationText = [script.hook, ...script.sections, script.cta].join("");
  const subtitleEntries = buildSubtitleEntries(script, narrationText, durationMode);
  const subtitlePath = path.join(draftDir, "subtitles.srt");
  await fs.writeFile(subtitlePath, toSrt(subtitleEntries), "utf8");

  const titleVariants = buildTitleVariants(topic, script.title);
  const coverVariants = await ensureCoverVariants(draftDir, script, { topic, angle, audience });
  const coverAsset = coverVariants[coverStyle];
  await syncCurrentCoverVariant(draftDir, coverAsset);

  const voiceInfo = await generateVoice(draftDir, narrationText);
  const scriptPath = path.join(draftDir, "draft.json");
  const scriptPayload = buildStructuredScript({
    title: titleVariants.a,
    titleVariants,
    coverTitle: script.coverTitle,
    coverSubtitle: script.coverSubtitle,
    hook: script.hook,
    sections: script.sections,
    cta: script.cta,
    narrationText,
  });
  const draftAssets = {
    coverPath: relativeMediaPath(coverAsset.filePath),
    coverType: coverAsset.type,
    subtitlePath: relativeMediaPath(subtitlePath),
    voicePath: relativeMediaPath(voiceInfo.filePath),
    voiceFormat: voiceInfo.format,
    exportScriptPath: relativeMediaPath(path.join(draftDir, "export-video.sh")),
    outputVideoPath: relativeMediaPath(path.join(draftDir, "final-video.mp4")),
  };
  const storyboardSeed = {
    topic,
    angle,
    audience,
    durationMode,
    script: scriptPayload,
  };
  const storyboard = await generateStoryboard({ draft: storyboardSeed });
  const storyboardWithAssets = await generateStoryboardAssets(draftDir, storyboard, {
    topic,
    angle,
    audience,
    coverPath: draftAssets.coverPath,
  });
  const timeline = buildTimelineFromStoryboard(storyboardWithAssets, draftAssets.coverPath);

  const draft = {
    id: draftId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    sourceType,
    rawContent,
    rewriteStyle,
    topic,
    angle,
    audience,
    durationMode,
    productionStage: "script",
    workflowStatus: "pending",
    workflowStatusLabel: getWorkflowStatusLabel("pending"),
    starred: false,
    coverStyle,
    coverStyleLabel: getCoverStyleLabel(coverStyle),
    title: titleVariants.a,
    titleVariants,
    activeTitleVariant: "a",
    coverTitle: script.coverTitle,
    coverSubtitle: script.coverSubtitle,
    hook: script.hook,
    sections: script.sections,
    cta: script.cta,
    script: scriptPayload,
    storyboard: storyboardWithAssets,
    timeline,
    narrationText,
    estimatedDurationSec: subtitleEntries[subtitleEntries.length - 1]?.endSec || durationMode,
    subtitleEntries,
    qualityChecks: [],
    exportInfo: {
      status: "idle",
      title: "还没有导出记录",
      message: "点击确认并导出后，这里会记录本次导出结果。",
      attemptedAt: null,
      scriptReady: false,
      videoReady: false,
    },
    coverPrompt: coverAsset.prompt,
    comboOptions: buildComboOptions(titleVariants, coverVariants),
    assets: draftAssets,
  };

  await fs.writeFile(scriptPath, JSON.stringify(draft, null, 2), "utf8");
  await writeTimelineFile(draftDir, draft.timeline);

  return {
    draft,
    exportReady: false,
    ffmpegInstalled: await hasFfmpeg(),
  };
}

export async function exportDraft(draftId) {
  if (!draftId) {
    throw new Error("缺少 draftId");
  }

  const draftDir = path.join(draftRoot, draftId);
  const draftPath = path.join(draftDir, "draft.json");
  const rawDraft = JSON.parse(await fs.readFile(draftPath, "utf8"));
  const { draft } = ensureDraftStructure(rawDraft);
  const checkResult = await checkDraftQuality(draftId);
  const hasBlockingError = checkResult.checks.some((item) => item.level === "error");

  if (hasBlockingError) {
    draft.exportInfo = {
      status: "blocked",
      title: "导出被质检拦截",
      message: "请先处理错误项，再重新导出。",
      attemptedAt: new Date().toISOString(),
      scriptReady: false,
      videoReady: false,
    };
    draft.updatedAt = new Date().toISOString();
    await fs.writeFile(draftPath, JSON.stringify(draft, null, 2), "utf8");
    return {
      exported: false,
      blocked: true,
      message: "导出前质检未通过，请先处理错误项。",
      checks: checkResult.checks,
      outputVideoPath: draft.assets.outputVideoPath,
      exportScriptPath: draft.assets.exportScriptPath,
      exportInfo: draft.exportInfo,
    };
  }

  const exportScriptPath = path.join(draftDir, "export-video.sh");
  const outputVideoPath = path.join(draftDir, "final-video.mp4");
  await ensureStoryboardRenderableAssets(draft.storyboard || []);

  const scriptContent = buildStoryboardFfmpegScript({
    ffmpegPath: await getFfmpegPath(),
    storyboard: draft.storyboard || [],
    timeline: draft.timeline || [],
    audioPath: path.join(rootDir, draft.assets.voicePath),
    subtitlePath: path.join(rootDir, draft.assets.subtitlePath),
    outputPath: outputVideoPath,
  });

  await fs.writeFile(exportScriptPath, scriptContent, "utf8");
  await fs.chmod(exportScriptPath, 0o755);

  let exported = false;
  let message = "已生成导出脚本，等待 ffmpeg 执行。";

  if (await hasFfmpeg()) {
    try {
      await execFileAsync("sh", [exportScriptPath], { cwd: draftDir });
      exported = true;
      message = "视频已导出。";
      draft.productionStage = "export";
      draft.workflowStatus = "exported";
      draft.workflowStatusLabel = getWorkflowStatusLabel("exported");
      draft.updatedAt = new Date().toISOString();
    } catch (error) {
      const stderr = error instanceof Error && "stderr" in error ? String(error.stderr || "") : "";
      message = `导出脚本已生成，但 ffmpeg 执行失败：${stderr || "未知错误"}`;
    }
  }

  draft.exportInfo = {
    status: exported ? "success" : "script-only",
    title: exported ? "导出成功" : "已生成导出脚本",
    message,
    attemptedAt: new Date().toISOString(),
    scriptReady: true,
    videoReady: exported,
  };
  draft.updatedAt = new Date().toISOString();

  await fs.writeFile(draftPath, JSON.stringify(draft, null, 2), "utf8");
  await writeTimelineFile(draftDir, draft.timeline);

  return {
    exported,
    blocked: false,
    message,
    checks: checkResult.checks,
    outputVideoPath: draft.assets.outputVideoPath,
    exportScriptPath: draft.assets.exportScriptPath,
    exportInfo: draft.exportInfo,
  };
}

export async function switchDraftCoverStyle(draftId, requestedStyle) {
  if (!draftId) {
    throw new Error("缺少 draftId");
  }

  const draftDir = path.join(draftRoot, draftId);
  const draftPath = path.join(draftDir, "draft.json");
  const rawDraft = JSON.parse(await fs.readFile(draftPath, "utf8"));
  const { draft } = ensureDraftStructure(rawDraft);
  const coverStyle = normalizeCoverStyle(requestedStyle);

  const coverVariants = await ensureCoverVariants(draftDir, draft, {
    topic: draft.topic,
    angle: draft.angle,
    audience: draft.audience,
  });
  const coverAsset = coverVariants[coverStyle];
  await syncCurrentCoverVariant(draftDir, coverAsset);

  draft.coverStyle = coverStyle;
  draft.coverStyleLabel = getCoverStyleLabel(coverStyle);
  draft.coverPrompt = coverAsset.prompt;
  draft.assets.coverPath = relativeMediaPath(coverAsset.filePath);
  draft.assets.coverType = coverAsset.type;
  draft.comboOptions = buildComboOptions(draft.titleVariants, coverVariants);
  draft.storyboard = refreshStoryboardCoverAsset(draft.storyboard, draft.assets.coverPath);
  draft.timeline = buildTimelineFromStoryboard(draft.storyboard, draft.assets.coverPath);
  draft.updatedAt = new Date().toISOString();

  await fs.writeFile(draftPath, JSON.stringify(draft, null, 2), "utf8");
  await writeTimelineFile(draftDir, draft.timeline);

  return { draft };
}

export async function switchDraftTitleVariant(draftId, requestedVariant) {
  if (!draftId) {
    throw new Error("缺少 draftId");
  }

  const draftDir = path.join(draftRoot, draftId);
  const draftPath = path.join(draftDir, "draft.json");
  const rawDraft = JSON.parse(await fs.readFile(draftPath, "utf8"));
  const { draft } = ensureDraftStructure(rawDraft);
  const titleVariant = normalizeTitleVariant(requestedVariant);

  draft.activeTitleVariant = titleVariant;
  draft.title = draft.titleVariants?.[titleVariant] || draft.title;
  draft.script = {
    ...(draft.script || {}),
    title: draft.title,
    titleVariants: {
      a: draft.titleVariants?.a || draft.title,
      b: draft.titleVariants?.b || draft.title,
    },
  };
  draft.updatedAt = new Date().toISOString();

  await fs.writeFile(draftPath, JSON.stringify(draft, null, 2), "utf8");
  await writeTimelineFile(draftDir, draft.timeline);

  return { draft };
}

export async function applyDraftCombo(draftId, comboId) {
  if (!draftId) {
    throw new Error("缺少 draftId");
  }

  const [titleVariantRaw, coverStyleRaw] = String(comboId || "").split("-");
  const titleVariant = normalizeTitleVariant(titleVariantRaw);
  const coverStyle = normalizeCoverStyle(coverStyleRaw);
  const draftDir = path.join(draftRoot, draftId);
  const draftPath = path.join(draftDir, "draft.json");
  const rawDraft = JSON.parse(await fs.readFile(draftPath, "utf8"));
  const { draft } = ensureDraftStructure(rawDraft);
  const coverVariants = await ensureCoverVariants(draftDir, draft, {
    topic: draft.topic,
    angle: draft.angle,
    audience: draft.audience,
  });
  const coverAsset = coverVariants[coverStyle];
  await syncCurrentCoverVariant(draftDir, coverAsset);

  draft.activeTitleVariant = titleVariant;
  draft.title = draft.titleVariants?.[titleVariant] || draft.title;
  draft.coverStyle = coverStyle;
  draft.coverStyleLabel = getCoverStyleLabel(coverStyle);
  draft.coverPrompt = coverAsset.prompt;
  draft.assets.coverPath = relativeMediaPath(coverAsset.filePath);
  draft.assets.coverType = coverAsset.type;
  draft.comboOptions = buildComboOptions(draft.titleVariants, coverVariants);
  draft.storyboard = refreshStoryboardCoverAsset(draft.storyboard, draft.assets.coverPath);
  draft.script = {
    ...(draft.script || {}),
    title: draft.title,
    titleVariants: {
      a: draft.titleVariants?.a || draft.title,
      b: draft.titleVariants?.b || draft.title,
    },
  };
  draft.timeline = buildTimelineFromStoryboard(draft.storyboard, draft.assets.coverPath);
  draft.updatedAt = new Date().toISOString();

  await fs.writeFile(draftPath, JSON.stringify(draft, null, 2), "utf8");
  await writeTimelineFile(draftDir, draft.timeline);

  return { draft };
}

export async function listDrafts(filters = {}) {
  const entries = await fs.readdir(draftRoot, { withFileTypes: true });
  const drafts = [];

  for (const entry of entries) {
    if (!entry.isDirectory()) {
      continue;
    }

    const draftPath = path.join(draftRoot, entry.name, "draft.json");
    try {
      const draft = JSON.parse(await fs.readFile(draftPath, "utf8"));
      drafts.push({
        id: draft.id,
        topic: draft.topic,
        title: draft.title,
        createdAt: draft.createdAt,
        updatedAt: draft.updatedAt || draft.createdAt,
        durationMode: draft.durationMode || 90,
        estimatedDurationSec: draft.estimatedDurationSec || draft.durationMode || 90,
        coverStyle: draft.coverStyle,
        coverStyleLabel: draft.coverStyleLabel,
        productionStage: normalizeProductionStage(draft.productionStage || deriveDraftProductionStage(draft)),
        workflowStatus: draft.workflowStatus || "pending",
        workflowStatusLabel: draft.workflowStatusLabel || getWorkflowStatusLabel(draft.workflowStatus || "pending"),
        starred: Boolean(draft.starred),
        qualityCheckCount: Array.isArray(draft.qualityChecks) ? draft.qualityChecks.length : 0,
        blockingIssueCount: Array.isArray(draft.qualityChecks) ? draft.qualityChecks.filter((item) => item.level === "error").length : 0,
        exportStatus: draft.exportInfo?.status || "idle",
        exportStatusLabel: getExportStatusLabel(draft.exportInfo?.status || "idle"),
      });
    } catch {
      continue;
    }
  }

  const q = String(filters.q || "").trim().toLowerCase();
  const workflowStatus = normalizeWorkflowStatus(filters.workflowStatus || "");
  const productionStage = String(filters.productionStage || "").trim();
  const starred = String(filters.starred || "");

  const filtered = drafts.filter((draft) => {
    if (q) {
      const haystack = `${draft.topic} ${draft.title}`.toLowerCase();
      if (!haystack.includes(q)) {
        return false;
      }
    }

    if (workflowStatus && workflowStatus !== "all" && draft.workflowStatus !== workflowStatus) {
      return false;
    }

    if (productionStage && productionStage !== "all" && draft.productionStage !== normalizeProductionStage(productionStage)) {
      return false;
    }

    if (starred === "true" && !draft.starred) {
      return false;
    }

    return true;
  });

  const sort = String(filters.sort || "updated-desc").trim();
  filtered.sort((a, b) => compareDrafts(a, b, sort));
  return { drafts: filtered };
}

export async function getDraft(draftId) {
  if (!draftId) {
    throw new Error("缺少 draftId");
  }

  const draftPath = path.join(draftRoot, draftId, "draft.json");
  const rawDraft = JSON.parse(await fs.readFile(draftPath, "utf8"));
  const draftDir = path.join(draftRoot, draftId);
  const { draft, changed: structureChanged } = ensureDraftStructure(rawDraft);
  const { draft: hydratedDraft, changed: assetChanged } = await ensureDraftSceneAssets(draft, draftDir);
  const changed = structureChanged || assetChanged;
  if (changed) {
    await fs.writeFile(draftPath, JSON.stringify(hydratedDraft, null, 2), "utf8");
    await writeTimelineFile(draftDir, hydratedDraft.timeline);
  }
  return { draft: hydratedDraft };
}

export async function generateDraftBatch(input) {
  const rawTopics = Array.isArray(input?.topics)
    ? input.topics.map((item) => String(item || "").trim()).filter(Boolean)
    : String(input?.topicsText || "")
        .split(/\r?\n/)
        .map((item) => item.trim())
        .filter(Boolean);

  const topics = rawTopics.map((item) => parseBatchTopicLine(item, input?.durationMode || "90")).filter(Boolean);

  if (!topics.length) {
    throw new Error("请至少提供一个主题");
  }

  const drafts = [];
  for (const item of topics) {
    const result = await createDraft({
      topic: item.topic,
      angle: item.angle || input?.angle || "",
      audience: item.audience || input?.audience || "",
      coverStyle: input?.coverStyle || "report",
      durationMode: item.durationMode,
    });
    drafts.push({
      id: result.draft.id,
      topic: result.draft.topic,
      angle: result.draft.angle,
      audience: result.draft.audience,
      title: result.draft.title,
      createdAt: result.draft.createdAt,
      durationMode: result.draft.durationMode,
    });
  }

  return { drafts };
}

export async function updateDraftContent(input) {
  const draftId = String(input?.draftId || "").trim();
  if (!draftId) {
    throw new Error("缺少 draftId");
  }

  const draftPath = path.join(draftRoot, draftId, "draft.json");
  const draftDir = path.join(draftRoot, draftId);
  const rawDraft = JSON.parse(await fs.readFile(draftPath, "utf8"));
  const { draft } = ensureDraftStructure(rawDraft);
  const content = input?.content || {};
  const nextSections = Array.isArray(content.sections) ? content.sections.map((item) => String(item || "").trim()) : draft.sections;

  draft.title = String(content.title || draft.title).trim();
  draft.titleVariants = {
    a: String(content.titleVariantA || draft.titleVariants?.a || draft.title).trim(),
    b: String(content.titleVariantB || draft.titleVariants?.b || draft.title).trim(),
  };
  draft.activeTitleVariant = draft.activeTitleVariant === "b" ? "b" : "a";
  draft.title = draft.titleVariants[draft.activeTitleVariant] || draft.title;
  draft.coverTitle = String(content.coverTitle || draft.coverTitle).trim();
  draft.coverSubtitle = String(content.coverSubtitle || draft.coverSubtitle).trim();
  draft.hook = String(content.hook || draft.hook).trim();
  draft.sections = whileFill(nextSections, 3, "").slice(0, 3);
  draft.cta = String(content.cta || draft.cta).trim();
  draft.narrationText = [draft.hook, ...draft.sections, draft.cta].join("");
  draft.durationMode = normalizeDurationMode(content.durationMode || draft.durationMode);
  draft.script = buildStructuredScript({
    title: draft.title,
    titleVariants: draft.titleVariants,
    coverTitle: draft.coverTitle,
    coverSubtitle: draft.coverSubtitle,
    hook: draft.hook,
    sections: draft.sections,
    cta: draft.cta,
    narrationText: draft.narrationText,
  });
  draft.storyboard = Array.isArray(content.storyboard) && content.storyboard.length
    ? normalizeStoryboardInput(content.storyboard, draft)
    : buildStoryboardFromDraft(draft);
  draft.subtitleEntries = buildSubtitleEntries(draft, draft.narrationText, draft.durationMode);
  draft.estimatedDurationSec = draft.subtitleEntries[draft.subtitleEntries.length - 1]?.endSec || draft.durationMode;
  draft.storyboard = await generateStoryboardAssets(draftDir, draft.storyboard, {
    topic: draft.topic,
    angle: draft.angle,
    audience: draft.audience,
    coverPath: draft.assets?.coverPath || "",
  });
  draft.timeline = buildTimelineFromStoryboard(draft.storyboard, draft.assets?.coverPath || "");
  draft.updatedAt = new Date().toISOString();
  draft.workflowStatus = "revised";
  draft.workflowStatusLabel = getWorkflowStatusLabel("revised");
  if (draft.productionStage !== "export") {
    draft.productionStage = normalizeProductionStage(draft.productionStage || "production");
  }

  const subtitlePath = path.join(rootDir, draft.assets.subtitlePath);
  await fs.writeFile(subtitlePath, toSrt(draft.subtitleEntries), "utf8");

  const voiceInfo = await generateVoice(draftDir, draft.narrationText);
  draft.assets.voicePath = relativeMediaPath(voiceInfo.filePath);
  draft.assets.voiceFormat = voiceInfo.format;

  const coverVariants = await ensureCoverVariants(draftDir, draft, {
    topic: draft.topic,
    angle: draft.angle,
    audience: draft.audience,
  });
  const coverAsset = coverVariants[draft.coverStyle] || coverVariants.report;
  await syncCurrentCoverVariant(draftDir, coverAsset);
  draft.assets.coverPath = relativeMediaPath(coverAsset.filePath);
  draft.assets.coverType = coverAsset.type;
  draft.coverPrompt = coverAsset.prompt;
  draft.comboOptions = buildComboOptions(draft.titleVariants, coverVariants);

  await fs.writeFile(draftPath, JSON.stringify(draft, null, 2), "utf8");
  await writeTimelineFile(draftDir, draft.timeline);

  return { draft };
}

export async function updateDraftMeta(input) {
  const draftId = String(input?.draftId || "").trim();
  if (!draftId) {
    throw new Error("缺少 draftId");
  }

  const draftPath = path.join(draftRoot, draftId, "draft.json");
  const draft = JSON.parse(await fs.readFile(draftPath, "utf8"));

  if (typeof input?.starred === "boolean") {
    draft.starred = input.starred;
  }

  if (input?.workflowStatus) {
    draft.workflowStatus = normalizeWorkflowStatus(input.workflowStatus);
    draft.workflowStatusLabel = getWorkflowStatusLabel(draft.workflowStatus);
  }

  if (input?.productionStage) {
    draft.productionStage = normalizeProductionStage(input.productionStage);
  }

  draft.updatedAt = new Date().toISOString();
  await fs.writeFile(draftPath, JSON.stringify(draft, null, 2), "utf8");
  return { draft };
}

export async function regenerateDraftScene(input) {
  const draftId = String(input?.draftId || "").trim();
  const sceneId = String(input?.sceneId || "").trim();

  if (!draftId || !sceneId) {
    throw new Error("缺少 draftId 或 sceneId");
  }

  const draftDir = path.join(draftRoot, draftId);
  const draftPath = path.join(draftDir, "draft.json");
  const rawDraft = JSON.parse(await fs.readFile(draftPath, "utf8"));
  const { draft } = ensureDraftStructure(rawDraft);
  const sceneIndex = (draft.storyboard || []).findIndex((scene) => scene.id === sceneId);

  if (sceneIndex < 0) {
    throw new Error("未找到对应的分镜");
  }

  const currentScene = draft.storyboard[sceneIndex];
  const scenesDir = path.join(draftDir, "scenes");
  await fs.mkdir(scenesDir, { recursive: true });
  const asset = await generateSceneAsset(scenesDir, currentScene, {
    topic: draft.topic,
    angle: draft.angle,
    audience: draft.audience,
    coverPath: draft.assets?.coverPath || "",
  });

  draft.storyboard[sceneIndex] = {
    ...currentScene,
    assetPath: asset.assetPath,
    assetType: asset.assetType,
    assetPrompt: asset.assetPrompt || currentScene.visualPrompt || "",
  };
  draft.timeline = buildTimelineFromStoryboard(draft.storyboard, draft.assets?.coverPath || "");
  draft.updatedAt = new Date().toISOString();

  await fs.writeFile(draftPath, JSON.stringify(draft, null, 2), "utf8");
  await writeTimelineFile(draftDir, draft.timeline);

  return { draft };
}

export async function checkDraftQuality(draftId) {
  const { draft } = await getDraft(draftId);
  const checks = [];
  const scriptRoute = await resolveLlmRouteConfig("script");
  const imageRoute = await resolveLlmRouteConfig("image");
  const ttsRoute = await resolveLlmRouteConfig("tts");
  const moderationRoute = await resolveLlmRouteConfig("moderation");

  if (!draft.title || draft.title.length < 10) {
    checks.push({ level: "error", label: "标题过短", detail: "建议至少 10 个字，方便形成完整判断。" });
  }

  if (draft.title.length > 38) {
    checks.push({ level: "warning", label: "标题偏长", detail: "标题超过 38 个字，封面和标题页可能显得拥挤。" });
  }

  if (!draft.sections.every((item) => String(item || "").trim())) {
    checks.push({ level: "error", label: "正文缺失", detail: "三段内容必须都存在，才能保证视频结构完整。" });
  }

  const voiceExists = await fileExists(path.join(rootDir, draft.assets.voicePath));
  if (!voiceExists) {
    checks.push({ level: "error", label: "配音缺失", detail: "当前草稿缺少音频文件，请重新保存或生成。" });
  }

  const coverExists = await fileExists(path.join(rootDir, draft.assets.coverPath));
  if (!coverExists) {
    checks.push({ level: "error", label: "封面缺失", detail: "当前草稿缺少封面文件，请重新生成封面。" });
  }

  const subtitleExists = await fileExists(path.join(rootDir, draft.assets.subtitlePath));
  if (!subtitleExists) {
    checks.push({ level: "error", label: "字幕缺失", detail: "当前草稿缺少字幕文件，请重新保存草稿。" });
  }

  if (!(await hasFfmpeg())) {
    checks.push({ level: "warning", label: "未检测到 ffmpeg", detail: "可生成导出脚本，但无法直接在网页里完成导出。" });
  }

  if (!isLlmRouteEnabled(scriptRoute) || !isLlmRouteEnabled(imageRoute) || !isLlmRouteEnabled(ttsRoute)) {
    checks.push({ level: "info", label: "当前存在本地兜底链路", detail: "至少有一个调用点未启用远程模型配置，更适合验证流程，不适合最终质量评估。" });
  }

  const moderationChecks = await runMedicalModerationChecks(draft, moderationRoute);
  checks.push(...moderationChecks);
  checks.push(...buildMedicalModerationGuidanceChecks(moderationRoute));

  draft.qualityChecks = checks;
  draft.updatedAt = new Date().toISOString();
  const draftPath = path.join(draftRoot, draftId, "draft.json");
  await fs.writeFile(draftPath, JSON.stringify(draft, null, 2), "utf8");

  return { draft, checks };
}

function buildMedicalModerationGuidanceChecks(route) {
  if (!isLlmRouteEnabled(route) || !isVolcengineMedicalRiskProvider(route)) {
    return [];
  }

  const checks = [];
  const imageCheckers = splitCheckerValues(route?.imageCheckers);
  const scene = String(route?.scene || "ad_compliance").trim() || "ad_compliance";

  if (imageCheckers.includes("ocr")) {
    checks.push({
      level: "info",
      label: "OCR 风险提示已启用",
      detail: "当前策略会额外检查封面和信息卡中的医疗功效承诺文字，像“治愈”“100%有效”这类字样更容易被拦截。",
    });
  }

  if (imageCheckers.includes("uncomfortable")) {
    checks.push({
      level: "info",
      label: "医学科普画面可能触发误判",
      detail: `当前 ${scene} 场景启用了 uncomfortable 检测。若包含手术、病理或创面画面，建议在火山控制台为“医学科普”单独配置白名单或调高阈值。`,
    });
  }

  return checks;
}

export async function getRuntimeStatus() {
  const config = await getLlmConfig();
  const scriptRoute = await resolveLlmRouteConfig("script", config);
  const storyboardRoute = await resolveLlmRouteConfig("storyboard", config);
  const imageRoute = await resolveLlmRouteConfig("image", config);
  const ttsRoute = await resolveLlmRouteConfig("tts", config);
  const moderationRoute = await resolveLlmRouteConfig("moderation", config);
  return {
    runtime: {
      textModel: scriptRoute.model || "-",
      storyboardModel: storyboardRoute.model || scriptRoute.model || "未单独配置",
      imageModel: imageRoute.model || "-",
      ttsModel: ttsRoute.model || "-",
      moderationModel: moderationRoute.serviceName || moderationRoute.model || "-",
      apiKeyConfigured: Boolean(scriptRoute.apiKey || storyboardRoute.apiKey || imageRoute.apiKey || ttsRoute.apiKey || moderationRoute.apiKey),
      ffmpegInstalled: await hasFfmpeg(),
      localVoice: envValue("LOCAL_TTS_VOICE", "Ting-Ting"),
      mode: isLlmRouteEnabled(scriptRoute) || isLlmRouteEnabled(storyboardRoute) || isLlmRouteEnabled(imageRoute) || isLlmRouteEnabled(ttsRoute) ? "api" : "local-fallback",
      llm: buildRuntimeLlmSummary(config, { scriptRoute, storyboardRoute, imageRoute, ttsRoute, moderationRoute }),
    },
  };
}

async function serveFile(filePath, contentType, res) {
  try {
    const data = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      sendJson(res, 404, { error: "文件不存在" });
      return;
    }

    throw error;
  }
}

async function serveBinary(filePath, res) {
  try {
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    const contentType =
      ext === ".svg"
        ? "image/svg+xml"
        : ext === ".png"
          ? "image/png"
          : ext === ".jpg" || ext === ".jpeg"
            ? "image/jpeg"
            : ext === ".webp"
              ? "image/webp"
        : ext === ".json"
          ? "application/json"
          : ext === ".srt"
            ? "text/plain; charset=utf-8"
            : ext === ".mp3"
              ? "audio/mpeg"
              : ext === ".aiff"
                ? "audio/aiff"
                : ext === ".mp4"
                  ? "video/mp4"
                  : "application/octet-stream";

    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      sendJson(res, 404, { error: "媒体文件不存在" });
      return;
    }

    throw error;
  }
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"));
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

async function generateWithLlm({ sourceType, topic, rawContent, angle, rewriteStyle, audience, durationMode }) {
  const prompt = buildScriptPrompt({ sourceType, topic, rawContent, angle, rewriteStyle, audience, durationMode });
  const route = await resolveLlmRouteConfig("script");

  if (!isLlmRouteEnabled(route)) {
    throw new Error("当前未启用文案生成模型配置。");
  }

  const response = await fetchWithRoute(route, buildLlmRouteUrl(route), {
    method: "POST",
    headers: buildLlmHeaders(route),
    body: JSON.stringify(buildScriptRequestBody(route, prompt)),
  });

  if (!response.ok) {
    throw new Error(`文案生成失败：${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const rawText = extractLlmTextOutput(route, data);
  const parsed = parseJsonResponse(rawText, "文案");

  return sanitizeDraft(parsed, topic);
}

async function generateStoryboard({ draft }) {
  const route = await resolveLlmRouteConfig("storyboard");

  if (!isLlmRouteEnabled(route)) {
    return buildStoryboardFromDraft(draft);
  }

  try {
    return await generateStoryboardWithLlm(draft, route);
  } catch (error) {
    console.warn(`分镜生成失败，已回退到默认分镜：${error instanceof Error ? error.message : String(error)}`);
    return buildStoryboardFromDraft(draft);
  }
}

async function generateStoryboardWithLlm(draft, route = null) {
  const storyboardRoute = route || (await resolveLlmRouteConfig("storyboard"));

  if (!isLlmRouteEnabled(storyboardRoute)) {
    throw new Error("当前未启用分镜生成模型配置。");
  }

  const prompt = buildStoryboardPrompt(draft);
  const response = await fetchWithRoute(storyboardRoute, buildLlmRouteUrl(storyboardRoute), {
    method: "POST",
    headers: buildLlmHeaders(storyboardRoute),
    body: JSON.stringify(buildScriptRequestBody(storyboardRoute, prompt)),
  });

  if (!response.ok) {
    throw new Error(`分镜生成失败：${response.status} ${await response.text()}`);
  }

  const data = await response.json();
  const rawText = extractLlmTextOutput(storyboardRoute, data);
  const parsed = parseJsonResponse(rawText, "分镜");

  return sanitizeStoryboard(parsed, draft);
}

function buildScriptRequestBody(route, prompt) {
  if (route.apiKind === "chat_completions") {
    return {
      model: route.model,
      messages: [{ role: "user", content: prompt }],
      temperature: Number(route.temperature ?? 0.7),
      response_format: { type: "json_object" },
    };
  }

  return {
    model: route.model,
    input: prompt,
  };
}

function buildImageRequest(route, prompt) {
  if (route.apiKind === "chat_completions") {
    return {
      method: "POST",
      headers: buildLlmHeaders(route),
      body: JSON.stringify({
        model: route.model,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: [
                  prompt,
                  "",
                  "如果你的网关支持通过 chat_completions 返回图片，请只返回 JSON。",
                  '字段优先使用：b64_json，其次 image_base64、url、image_url。',
                ].join("\n"),
              },
            ],
          },
        ],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    };
  }

  if (route.apiKind === "responses") {
    return {
      method: "POST",
      headers: buildLlmHeaders(route),
      body: JSON.stringify({
        model: route.model,
        input: [
          {
            role: "user",
            content: [
              {
                type: "input_text",
                text: [
                  prompt,
                  "",
                  "如果你的网关支持通过 responses 返回图片，请只返回 JSON。",
                  '字段优先使用：b64_json，其次 image_base64、url、image_url。',
                ].join("\n"),
              },
            ],
          },
        ],
      }),
    };
  }

  return {
    method: "POST",
    headers: buildLlmHeaders(route),
    body: JSON.stringify({
      model: route.model,
      prompt,
      size: route.size || "1024x1536",
      quality: route.quality || "high",
      output_format: route.outputFormat || "png",
    }),
  };
}

async function extractImageBase64(response, route) {
  const data = await response.json();
  const nativeBase64 = data?.data?.[0]?.b64_json || data?.b64_json || "";
  if (nativeBase64) {
    return nativeBase64;
  }

  const textOutput = extractGenericRouteTextOutput(route, data);
  const parsed = tryParseImagePayload(textOutput);
  if (parsed?.b64_json) {
    return parsed.b64_json;
  }

  const imageUrl = parsed?.url || parsed?.image_url || data?.data?.[0]?.url || "";
  if (imageUrl) {
    const imageResponse = await fetch(imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`图片 URL 拉取失败：${imageResponse.status}`);
    }
    const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
    return imageBuffer.toString("base64");
  }

  return "";
}

function isVolcengineJimengImageProvider(route) {
  const provider = String(route?.provider || "").trim().toLowerCase();
  return provider === "volcengine-jimeng-image" || provider === "volcengine-seedream-image" || provider === "jimeng-image";
}

async function generateJimengImageBase64(route, prompt) {
  const submitUrl = buildLlmRouteUrl(route);
  const queryUrl = buildJimengQueryUrl(route);
  if (!submitUrl || !queryUrl) {
    throw new Error("即梦图片接口地址不完整");
  }

  const submitPayload = buildJimengSubmitPayload(route, prompt);
  const submitBody = JSON.stringify(submitPayload);
  const submitHeaders = buildVolcengineSignedHeaders(route, submitUrl, submitBody);
  const submitResponse = await fetchWithRoute(route, submitUrl, {
    method: "POST",
    headers: submitHeaders,
    body: submitBody,
  });

  if (!submitResponse.ok) {
    throw new Error(`即梦提交任务失败：${submitResponse.status} ${await submitResponse.text()}`);
  }

  const submitData = await submitResponse.json();
  const immediateImageBase64 = await extractJimengImageBase64(submitData);
  if (immediateImageBase64) {
    return immediateImageBase64;
  }
  const taskId = extractJimengTaskId(submitData);
  if (!taskId) {
    throw new Error("即梦提交任务成功，但没有返回 task_id");
  }

  const attempts = resolveJimengPollAttempts(route);
  const intervalMs = resolveJimengPollIntervalMs(route);
  let latestData = null;

  for (let index = 0; index < attempts; index += 1) {
    if (index > 0) {
      await sleep(intervalMs);
    }

    const queryPayload = buildJimengQueryPayload(route, taskId);
    const queryBody = JSON.stringify(queryPayload);
    const queryHeaders = buildVolcengineSignedHeaders(route, queryUrl, queryBody);
    const queryResponse = await fetchWithRoute(route, queryUrl, {
      method: "POST",
      headers: queryHeaders,
      body: queryBody,
    });

    if (!queryResponse.ok) {
      throw new Error(`即梦查询任务失败：${queryResponse.status} ${await queryResponse.text()}`);
    }

    latestData = await queryResponse.json();
    const status = normalizeJimengTaskStatus(latestData);
    if (status === "succeeded") {
      const imageBase64 = await extractJimengImageBase64(latestData);
      if (!imageBase64) {
        throw new Error("即梦任务完成，但没有返回图片数据");
      }
      return imageBase64;
    }
    if (status === "failed") {
      throw new Error(extractJimengFailureMessage(latestData) || "即梦任务执行失败");
    }
  }

  throw new Error(`即梦任务轮询超时（>${Math.round((attempts * intervalMs) / 1000)} 秒）${latestData ? `，最近状态：${normalizeJimengTaskStatus(latestData)}` : ""}`);
}

function buildJimengQueryUrl(route) {
  const queryEndpoint = String(route?.queryEndpoint || "").trim();
  if (!queryEndpoint) {
    return "";
  }
  if (/^https?:\/\//.test(queryEndpoint)) {
    return queryEndpoint;
  }
  const baseURL = String(route?.baseURL || "").trim();
  if (!baseURL) {
    return "";
  }
  return `${baseURL.replace(/\/+$/, "")}/${queryEndpoint.replace(/^\/+/, "")}`;
}

function buildJimengSubmitPayload(route, prompt) {
  const { width, height } = parseImageSize(route?.size || "1024x1536");
  return {
    req_key: String(route?.model || "jimeng_t2i_v40").trim(),
    prompt,
    width,
    height,
    force_single: true,
  };
}

function buildJimengQueryPayload(route, taskId) {
  return {
    req_key: String(route?.model || "jimeng_t2i_v40").trim(),
    task_id: taskId,
    req_json: {
      return_url: true,
    },
  };
}

function parseImageSize(size) {
  const match = String(size || "").match(/(\d+)\s*x\s*(\d+)/i);
  if (!match) {
    return { width: 1024, height: 1536 };
  }
  return {
    width: Number(match[1]) || 1024,
    height: Number(match[2]) || 1536,
  };
}

function extractJimengTaskId(data) {
  const candidates = [
    data?.task_id,
    data?.data?.task_id,
    data?.data?.taskId,
    data?.result?.task_id,
    data?.result?.taskId,
  ];
  for (const candidate of candidates) {
    if (candidate) {
      return String(candidate).trim();
    }
  }
  return "";
}

function normalizeJimengTaskStatus(data) {
  const raw = String(
    data?.status ||
    data?.task_status ||
    data?.data?.status ||
    data?.data?.task_status ||
    data?.result?.status ||
    ""
  ).trim().toLowerCase();
  if (!raw) {
    return "pending";
  }
  if (["success", "succeeded", "done", "finished"].includes(raw)) {
    return "succeeded";
  }
  if (["fail", "failed", "error"].includes(raw)) {
    return "failed";
  }
  return "pending";
}

async function extractJimengImageBase64(data) {
  const directBase64 = [
    data?.image_base64,
    data?.data?.image_base64,
    data?.data?.binary_data_base64?.[0],
    data?.binary_data_base64?.[0],
    data?.result?.image_base64,
    data?.images?.[0]?.b64_json,
    data?.images?.[0]?.image_base64,
    data?.data?.images?.[0]?.b64_json,
    data?.data?.images?.[0]?.image_base64,
  ].find((item) => typeof item === "string" && item.trim());

  if (directBase64) {
    return String(directBase64).trim();
  }

  const imageUrl = [
    data?.image_url,
    data?.data?.image_url,
    data?.result?.image_url,
    data?.images?.[0]?.url,
    data?.data?.images?.[0]?.url,
    data?.result?.images?.[0]?.url,
  ].find((item) => typeof item === "string" && item.trim());

  if (!imageUrl) {
    return "";
  }

  const imageResponse = await fetch(imageUrl);
  if (!imageResponse.ok) {
    throw new Error(`即梦图片 URL 拉取失败：${imageResponse.status}`);
  }
  const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
  return imageBuffer.toString("base64");
}

function extractJimengFailureMessage(data) {
  return String(
    data?.message ||
    data?.msg ||
    data?.error?.message ||
    data?.data?.message ||
    data?.result?.message ||
    ""
  ).trim();
}

function resolveJimengPollAttempts(route) {
  const parsed = Number(route?.pollAttempts);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 15;
}

function resolveJimengPollIntervalMs(route) {
  const parsed = Number(route?.pollIntervalMs);
  return Number.isFinite(parsed) && parsed >= 100 ? parsed : 1200;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function buildVolcengineSignedHeaders(route, urlString, body) {
  const url = new URL(urlString);
  const method = "POST";
  const host = url.host;
  const now = new Date();
  const xDate = formatVolcengineXDate(now);
  const shortDate = xDate.slice(0, 8);
  const payloadHash = sha256Hex(body);
  const canonicalUri = url.pathname || "/";
  const canonicalQuery = [...url.searchParams.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${encodeRFC3986(key)}=${encodeRFC3986(value)}`)
    .join("&");
  const canonicalHeaders = [
    `content-type:application/json`,
    `host:${host}`,
    `x-content-sha256:${payloadHash}`,
    `x-date:${xDate}`,
  ].join("\n");
  const signedHeaders = "content-type;host;x-content-sha256;x-date";
  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery,
    `${canonicalHeaders}\n`,
    signedHeaders,
    payloadHash,
  ].join("\n");
  const credentialScope = `${shortDate}/${route.region || "cn-north-1"}/${route.service || "cv"}/request`;
  const stringToSign = [
    "HMAC-SHA256",
    xDate,
    credentialScope,
    sha256Hex(canonicalRequest),
  ].join("\n");
  const signingKey = getVolcengineSigningKey(route.secretKey || "", shortDate, route.region || "cn-north-1", route.service || "cv");
  const signature = crypto.createHmac("sha256", signingKey).update(stringToSign).digest("hex");

  return {
    "Content-Type": "application/json",
    Host: host,
    "X-Date": xDate,
    "X-Content-Sha256": payloadHash,
    Authorization: `HMAC-SHA256 Credential=${route.apiKey}/${credentialScope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  };
}

function getVolcengineSigningKey(secretKey, shortDate, region, service) {
  const kDate = crypto.createHmac("sha256", secretKey).update(shortDate).digest();
  const kRegion = crypto.createHmac("sha256", kDate).update(region).digest();
  const kService = crypto.createHmac("sha256", kRegion).update(service).digest();
  return crypto.createHmac("sha256", kService).update("request").digest();
}

function formatVolcengineXDate(date) {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  const hours = String(date.getUTCHours()).padStart(2, "0");
  const minutes = String(date.getUTCMinutes()).padStart(2, "0");
  const seconds = String(date.getUTCSeconds()).padStart(2, "0");
  return `${year}${month}${day}T${hours}${minutes}${seconds}Z`;
}

function sha256Hex(value) {
  return crypto.createHash("sha256").update(value).digest("hex");
}

function encodeRFC3986(value) {
  return encodeURIComponent(value).replace(/[!'()*]/g, (char) => `%${char.charCodeAt(0).toString(16).toUpperCase()}`);
}

function tryParseImagePayload(textOutput) {
  const source = String(textOutput || "").trim();
  if (!source) {
    return null;
  }

  const parsed = tryParseJson(source) || tryParseJson(extractJsonCandidate(source));
  if (!parsed || typeof parsed !== "object") {
    return null;
  }

  return {
    b64_json: String(parsed.b64_json || parsed.image_base64 || parsed.base64 || "").trim(),
    url: String(parsed.url || "").trim(),
    image_url: String(parsed.image_url || "").trim(),
  };
}

function buildTtsRequest(route, text) {
  if (isDoubaoTtsProvider(route)) {
    return {
      method: "POST",
      headers: buildDoubaoTtsHeaders(route),
      body: JSON.stringify(buildDoubaoTtsBody(route, text)),
    };
  }

  if (route.apiKind === "chat_completions") {
    return {
      method: "POST",
      headers: buildLlmHeaders(route),
      body: JSON.stringify({
        model: route.model,
        messages: [{ role: "user", content: text }],
        modalities: ["audio"],
        audio: {
          voice: route.voice || "alloy",
          format: route.format || "mp3",
        },
      }),
    };
  }

  if (route.apiKind === "responses") {
    return {
      method: "POST",
      headers: buildLlmHeaders(route),
      body: JSON.stringify({
        model: route.model,
        input: text,
        modalities: ["audio"],
        audio: {
          voice: route.voice || "alloy",
          format: route.format || "mp3",
        },
      }),
    };
  }

  return {
    method: "POST",
    headers: buildLlmHeaders(route),
    body: JSON.stringify({
      model: route.model,
      voice: route.voice || "alloy",
      input: text,
      format: route.format || "mp3",
    }),
  };
}

async function extractTtsAudioBuffer(response, route) {
  if (isDoubaoTtsProvider(route)) {
    return extractDoubaoTtsAudioBuffer(response);
  }

  const contentType = String(response.headers.get("content-type") || "");
  if (/^audio\//i.test(contentType) || /application\/octet-stream/i.test(contentType)) {
    return Buffer.from(await response.arrayBuffer());
  }

  const data = await response.json();
  const base64 = extractTtsAudioBase64(data, route);
  if (!base64) {
    throw new Error("配音响应里没有可解析的音频数据");
  }
  return Buffer.from(base64, "base64");
}

function extractTtsAudioBase64(data, route) {
  const candidates = [
    data?.audio,
    data?.audio_base64,
    data?.data?.audio,
    data?.data?.audio_base64,
    data?.choices?.[0]?.message?.audio?.data,
    data?.output?.[0]?.content?.[0]?.audio,
    data?.output?.[0]?.content?.[0]?.audio_base64,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  const textOutput = extractGenericRouteTextOutput(route, data);
  const parsed = tryParseJson(textOutput) || tryParseJson(extractJsonCandidate(textOutput));
  if (parsed && typeof parsed === "object") {
    const nestedCandidate = parsed.audio_base64 || parsed.audio || parsed.data;
    if (typeof nestedCandidate === "string" && nestedCandidate.trim()) {
      return nestedCandidate.trim();
    }
  }

  return "";
}

function isDoubaoTtsProvider(route) {
  const provider = String(route?.provider || "").trim().toLowerCase();
  return provider === "volcengine-doubao-tts" || provider === "doubao-tts" || provider === "volcengine-doubao";
}

function buildDoubaoTtsHeaders(route) {
  const headers = {
    "Content-Type": "application/json",
  };
  if (route?.appId) {
    headers["X-Api-App-Id"] = String(route.appId).trim();
  }
  if (route?.apiKey) {
    headers["X-Api-Access-Key"] = String(route.apiKey).trim();
  }
  if (route?.resourceId) {
    headers["X-Api-Resource-Id"] = String(route.resourceId).trim();
  }
  return headers;
}

function buildDoubaoTtsBody(route, text) {
  const format = normalizeDoubaoAudioFormat(route?.format);
  const voice = String(route?.voice || "").trim() || "zh_female_wanwanxiaohe_moon_bigtts";
  const payload = {
    user: {
      uid: "ivd-video-workflow",
    },
    namespace: "BidirectionalTTS",
    app: {
      appid: String(route?.appId || "").trim(),
      token: String(route?.apiKey || "").trim(),
      cluster: String(route?.resourceId || "seed-tts-2.0").trim(),
    },
    req_params: {
      text,
      speaker: voice,
      voice_type: voice,
      resource_id: String(route?.resourceId || "seed-tts-2.0").trim(),
      audio_params: {
        format,
      },
    },
  };

  return payload;
}

function normalizeDoubaoAudioFormat(format) {
  const normalized = String(format || "").trim().toLowerCase();
  if (normalized === "wav" || normalized === "pcm" || normalized === "ogg" || normalized === "mp3") {
    return normalized;
  }
  return "mp3";
}

async function extractDoubaoTtsAudioBuffer(response) {
  const contentType = String(response.headers.get("content-type") || "");
  if (/^audio\//i.test(contentType) || /application\/octet-stream/i.test(contentType)) {
    return Buffer.from(await response.arrayBuffer());
  }

  const rawText = await response.text();
  const directParsed = tryParseJson(rawText) || tryParseJson(extractJsonCandidate(rawText));
  const directChunk = extractDoubaoAudioChunk(directParsed);
  if (directChunk) {
    return Buffer.from(directChunk, "base64");
  }
  const chunks = extractDoubaoTtsBase64Chunks(rawText);
  if (!chunks.length) {
    const nested = extractDoubaoAudioChunk(directParsed);
    if (nested) {
      return Buffer.from(nested, "base64");
    }
    throw new Error(`豆包语音响应里没有可解析的音频数据（content-type=${contentType || "-"}, rawLen=${rawText.length}）`);
  }

  return Buffer.concat(chunks.map((item) => Buffer.from(item, "base64")));
}

function extractDoubaoTtsBase64Chunks(rawText) {
  const source = String(rawText || "");
  const lines = source
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const chunks = [];

  for (const line of lines) {
    const payloadText = line.startsWith("data:") ? line.slice(5).trim() : line;
    if (!payloadText || payloadText === "[DONE]") {
      continue;
    }
    const parsed = tryParseJson(payloadText) || tryParseJson(extractJsonCandidate(payloadText));
    const audioChunk = extractDoubaoAudioChunk(parsed);
    if (audioChunk) {
      chunks.push(audioChunk);
    }
  }

  if (chunks.length) {
    return chunks;
  }

  // 豆包有时会把多段 JSON 事件直接串在一起返回，不能只按换行切。
  for (const candidate of extractJsonObjectsFromText(source)) {
    const parsed = tryParseJson(candidate);
    const audioChunk = extractDoubaoAudioChunk(parsed);
    if (audioChunk) {
      chunks.push(audioChunk);
    }
  }

  if (chunks.length) {
    return chunks;
  }

  // 最后兜底：直接从原始文本里提取 data 字段中的 base64 音频块。
  const matches = source.matchAll(/"data"\s*:\s*"([A-Za-z0-9+/=]+)"/g);
  for (const match of matches) {
    const candidate = String(match[1] || "").trim();
    if (candidate && candidate.length > 128) {
      chunks.push(candidate);
    }
  }

  return chunks;
}

function extractJsonObjectsFromText(text) {
  const source = String(text || "");
  const objects = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;

  for (let i = 0; i < source.length; i += 1) {
    const char = source[i];

    if (inString) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === "\"") {
        inString = false;
      }
      continue;
    }

    if (char === "\"") {
      inString = true;
      continue;
    }

    if (char === "{") {
      if (depth === 0) {
        start = i;
      }
      depth += 1;
      continue;
    }

    if (char === "}") {
      if (depth > 0) {
        depth -= 1;
        if (depth === 0 && start >= 0) {
          objects.push(source.slice(start, i + 1));
          start = -1;
        }
      }
    }
  }

  return objects;
}

function extractDoubaoAudioChunk(parsed) {
  if (!parsed || typeof parsed !== "object") {
    return "";
  }

  const candidates = [
    parsed?.data,
    parsed?.audio,
    parsed?.audio_base64,
    parsed?.result?.audio,
    parsed?.result?.audio_base64,
    parsed?.payload_msg?.audio,
    parsed?.payload_msg?.audio_base64,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
  }

  return "";
}

function buildModerationRequest(route, text) {
  if (isVolcengineMedicalRiskProvider(route)) {
    const body = JSON.stringify(buildVolcengineMedicalModerationPayload(route, text));
    return {
      method: "POST",
      headers: buildVolcengineSignedHeaders(route, buildLlmRouteUrl(route), body),
      body,
    };
  }

  if (route.apiKind === "chat_completions" || route.apiKind === "responses") {
    return {
      method: "POST",
      headers: buildLlmHeaders(route),
      body: JSON.stringify(buildScriptRequestBody(route, [
        "你是一条内容审核分类器。",
        "请判断输入文本是否包含明显的违规或高风险内容。",
        '只返回 JSON，格式固定为 {"flagged":true/false,"reason":"..."}。',
        `输入文本：${text}`,
      ].join("\n"))),
    };
  }

  return {
    method: "POST",
    headers: buildLlmHeaders(route),
    body: JSON.stringify({
      model: route.model,
      input: text,
    }),
  };
}

function isVolcengineMedicalRiskProvider(route) {
  const provider = String(route?.provider || "").trim().toLowerCase();
  return provider === "volcengine-medical-risk" || provider === "volcengine-content-risk" || provider === "volcengine-medical-compliance";
}

function buildVolcengineMedicalModerationPayload(route, text) {
  const parameters = {
    text,
    scene: String(route?.scene || "ad_compliance").trim() || "ad_compliance",
  };
  if (String(route?.strategyId || "").trim()) {
    parameters.strategy_id = String(route.strategyId).trim();
  }
  const textCheckers = splitCheckerValues(route?.textCheckers);
  if (textCheckers.length) {
    parameters.checkers = textCheckers;
  }
  return {
    Service: String(route?.serviceName || route?.model || "text_risk").trim() || "text_risk",
    Parameters: JSON.stringify(parameters),
  };
}

function splitCheckerValues(value) {
  return String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function extractGenericRouteTextOutput(route, data) {
  if (route.apiKind === "chat_completions") {
    return extractChatCompletionText(data);
  }

  if (route.apiKind === "responses") {
    return data.output_text || extractOutputText(data);
  }

  return "";
}

function extractLlmTextOutput(route, data) {
  if (route.apiKind === "chat_completions") {
    return extractChatCompletionText(data);
  }

  return data.output_text || extractOutputText(data);
}

function extractChatCompletionText(data) {
  const content = data?.choices?.[0]?.message?.content;

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === "string") {
          return item;
        }

        if (item?.type === "text" && item?.text) {
          return item.text;
        }

        return "";
      })
      .join("\n")
      .trim();
  }

  return String(content || "").trim();
}

function extractOutputText(data) {
  const texts = [];
  for (const item of data.output || []) {
    for (const content of item.content || []) {
      if (content.type === "output_text" && content.text) {
        texts.push(content.text);
      }
    }
  }
  return texts.join("\n").trim();
}

function parseJsonResponse(rawText, label = "模型") {
  const source = String(rawText || "").trim();
  if (!source) {
    throw new Error(`${label}返回为空，无法解析。`);
  }

  const candidates = [
    source,
    source.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim(),
    extractJsonCandidate(source),
  ].filter(Boolean);

  for (const candidate of candidates) {
    const parsed = tryParseJson(candidate);
    if (parsed) {
      return parsed;
    }

    const repaired = repairJsonString(candidate);
    const repairedParsed = tryParseJson(repaired);
    if (repairedParsed) {
      return repairedParsed;
    }
  }

  throw new Error(`${label}返回不是有效 JSON。`);
}

function extractJsonCandidate(text) {
  const objectStart = text.indexOf("{");
  const objectEnd = text.lastIndexOf("}");
  if (objectStart >= 0 && objectEnd > objectStart) {
    return text.slice(objectStart, objectEnd + 1).trim();
  }

  const arrayStart = text.indexOf("[");
  const arrayEnd = text.lastIndexOf("]");
  if (arrayStart >= 0 && arrayEnd > arrayStart) {
    return text.slice(arrayStart, arrayEnd + 1).trim();
  }

  return "";
}

function repairJsonString(text) {
  return String(text || "")
    .replace(/,\s*([}\]])/g, "$1")
    .replace(/\u201c|\u201d/g, "\"")
    .replace(/\u2018|\u2019/g, "'");
}

function tryParseJson(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function sanitizeDraft(parsed, topic) {
  const title = String(parsed.title || `${topic}，正在重塑 IVD 竞争逻辑`).trim();
  const coverTitle = String(parsed.coverTitle || title).trim();
  const coverSubtitle = String(parsed.coverSubtitle || "90秒看懂趋势、分析与判断").trim();
  const hook = String(parsed.hook || `${topic}，现在值得重新看一遍。`).trim();
  const sectionSource = Array.isArray(parsed.sections) ? parsed.sections.slice(0, 3) : [];
  const sections = whileFill(sectionSource.map((item) => String(item).trim()).filter(Boolean), 3, "这一点会直接影响 IVD 企业的下一步判断。");
  const cta = String(parsed.cta || "如果你想继续看 IVD 行业判断，关注我，我会继续拆解。").trim();

  return { title, coverTitle, coverSubtitle, hook, sections, cta };
}

function buildStoryboardPrompt(draft) {
  const script = draft?.script || {};
  const durationMode = normalizeDurationMode(draft?.durationMode);

  return [
    "你是一名擅长制作 IVD 行业短视频的分镜导演。",
    "请基于下面已经定稿的口播脚本，输出一组适合竖屏视频的分镜 JSON。",
    "只返回 JSON，不要返回解释。",
    "返回格式：{\"scenes\":[...]}。",
    "scenes 数量保持在 5 到 8 个之间。",
    "每个 scene 必须包含 sceneTitle、voiceover、visualType、visualPrompt。",
    "visualType 只能从 cover、image、chart、quote、brand_outro 中选择。",
    "voiceover 要覆盖原始脚本的主要信息，不要引入脚本里没有的新事实。",
    "visualPrompt 要能直接用于图片或信息卡生成，风格克制、专业、适合 IVD 行业内容。",
    "",
    `主题：${draft?.topic || ""}`,
    `补充角度：${draft?.angle || "默认行业视角"}`,
    `目标受众：${draft?.audience || "IVD 行业从业者"}`,
    `目标时长：${durationMode} 秒`,
    `标题：${script.title || ""}`,
    `封面标题：${script.coverTitle || ""}`,
    `封面副标题：${script.coverSubtitle || ""}`,
    `开头 Hook：${script.hook || ""}`,
    `正文第 1 段：${script.sections?.[0] || ""}`,
    `正文第 2 段：${script.sections?.[1] || ""}`,
    `正文第 3 段：${script.sections?.[2] || ""}`,
    `结尾 CTA：${script.cta || ""}`,
  ].join("\n");
}

function sanitizeStoryboard(parsed, draft) {
  const fallback = buildStoryboardFromDraft(draft);
  const sourceScenes = Array.isArray(parsed?.scenes)
    ? parsed.scenes
    : Array.isArray(parsed)
      ? parsed
      : [];

  const normalized = sourceScenes
    .map((scene, index) => ({
      id: `scene-${index + 1}`,
      sceneTitle: String(scene?.sceneTitle || scene?.title || fallback[index]?.sceneTitle || `镜头 ${index + 1}`).trim(),
      voiceover: String(scene?.voiceover || fallback[index]?.voiceover || "").trim(),
      visualType: normalizeSceneVisualType(scene?.visualType || fallback[index]?.visualType || "image"),
      visualPrompt: String(scene?.visualPrompt || fallback[index]?.visualPrompt || "").trim(),
    }))
    .filter((scene) => scene.voiceover);

  if (!normalized.length) {
    return fallback;
  }

  return allocateStoryboardDurations(normalized, draft?.durationMode || 90);
}

function buildStructuredScript({ title, titleVariants, coverTitle, coverSubtitle, hook, sections, cta, narrationText }) {
  return {
    title: String(title || "").trim(),
    titleVariants: {
      a: String(titleVariants?.a || title || "").trim(),
      b: String(titleVariants?.b || title || "").trim(),
    },
    coverTitle: String(coverTitle || "").trim(),
    coverSubtitle: String(coverSubtitle || "").trim(),
    hook: String(hook || "").trim(),
    sections: whileFill((sections || []).map((item) => String(item || "").trim()).filter(Boolean), 3, "").slice(0, 3),
    cta: String(cta || "").trim(),
    narrationText: String(narrationText || "").trim(),
  };
}

function buildStoryboardFromDraft(draft) {
  const script = draft.script || buildStructuredScript({
    title: draft.title,
    titleVariants: draft.titleVariants,
    coverTitle: draft.coverTitle,
    coverSubtitle: draft.coverSubtitle,
    hook: draft.hook,
    sections: draft.sections,
    cta: draft.cta,
    narrationText: draft.narrationText,
  });
  const sectionTwoSegments = splitStoryboardText(script.sections?.[1] || "");
  const sceneBlueprints = [
    {
      id: "scene-1",
      sceneTitle: "开场判断",
      voiceover: script.hook,
      visualType: "cover",
      visualPrompt: `${script.coverTitle}，竖屏开场封面，强调主题冲突和判断感`,
    },
    {
      id: "scene-2",
      sceneTitle: "行业现象",
      voiceover: script.sections?.[0] || "",
      visualType: "image",
      visualPrompt: `${draft.topic}，IVD 行业现象，终端、渠道、实验室相关商业科技画面`,
    },
    {
      id: "scene-3",
      sceneTitle: "变量拆解 A",
      voiceover: sectionTwoSegments[0] || script.sections?.[1] || "",
      visualType: "chart",
      visualPrompt: `${draft.topic}，关键变量、渠道效率、利润结构、终端覆盖的图表卡片`,
    },
    {
      id: "scene-4",
      sceneTitle: "变量拆解 B",
      voiceover: sectionTwoSegments[1] || script.sections?.[1] || "",
      visualType: "image",
      visualPrompt: `${draft.topic}，实验室、检测设备、产业链协同的专业商业视觉`,
    },
    {
      id: "scene-5",
      sceneTitle: "观点判断",
      voiceover: script.sections?.[2] || "",
      visualType: "quote",
      visualPrompt: `${draft.topic}，行业判断、观点总结、信息卡样式`,
    },
    {
      id: "scene-6",
      sceneTitle: "结尾引导",
      voiceover: script.cta,
      visualType: "brand_outro",
      visualPrompt: "简洁专业的结尾页，适合 CTA 和品牌收束",
    },
  ];

  return allocateStoryboardDurations(sceneBlueprints, draft.durationMode || 90);
}

function splitStoryboardText(text) {
  const source = String(text || "").trim();

  if (!source) {
    return ["", ""];
  }

  const punctuationMatch = source.match(/^(.{12,}?[,，。；;])(.+)$/);
  if (punctuationMatch) {
    return [punctuationMatch[1].trim(), punctuationMatch[2].trim()];
  }

  const midpoint = Math.max(1, Math.floor(source.length / 2));
  return [source.slice(0, midpoint).trim(), source.slice(midpoint).trim()];
}

function allocateStoryboardDurations(sceneBlueprints, durationMode) {
  const profile = getDurationProfile(durationMode);
  const targetDuration = clamp(Number(durationMode || 90), profile.minSec, profile.maxSec);
  const baseScenes = sceneBlueprints
    .map((scene) => ({
      ...scene,
      voiceover: String(scene.voiceover || "").trim(),
      visualPrompt: String(scene.visualPrompt || "").trim(),
    }))
    .filter((scene) => scene.voiceover);
  const totalChars = Math.max(baseScenes.reduce((sum, scene) => sum + scene.voiceover.length, 0), 1);

  let allocated = 0;
  const storyboard = baseScenes.map((scene, index) => {
    const isEdgeScene = index === 0 || index === baseScenes.length - 1;
    const minDuration = isEdgeScene ? 5 : 7;
    const remainingScenes = baseScenes.length - index - 1;
    const remainingMin = remainingScenes * 5;
    const proportional = Math.round((scene.voiceover.length / totalChars) * targetDuration);
    const durationSec = index === baseScenes.length - 1
      ? Math.max(minDuration, targetDuration - allocated)
      : clamp(proportional, minDuration, Math.max(minDuration, targetDuration - allocated - remainingMin));

    allocated += durationSec;

    return {
      ...scene,
      durationSec,
      status: "planned",
    };
  });

  if (storyboard.length) {
    const total = storyboard.reduce((sum, scene) => sum + scene.durationSec, 0);
    const delta = targetDuration - total;
    storyboard[storyboard.length - 1].durationSec = Math.max(5, storyboard[storyboard.length - 1].durationSec + delta);
  }

  return storyboard;
}

async function generateStoryboardAssets(draftDir, storyboard, context) {
  const scenesDir = path.join(draftDir, "scenes");
  await fs.mkdir(scenesDir, { recursive: true });
  const nextScenes = [];

  for (const scene of storyboard || []) {
    const asset = await generateSceneAsset(scenesDir, scene, context);
    nextScenes.push({
      ...scene,
      assetPath: asset.assetPath,
      assetType: asset.assetType,
      assetPrompt: asset.assetPrompt || scene.visualPrompt || "",
    });
  }

  return nextScenes;
}

async function generateSceneAsset(scenesDir, scene, context) {
  if (scene.visualType === "cover") {
    return {
      assetPath: context.coverPath || "",
      assetType: "cover",
      assetPrompt: scene.visualPrompt || "",
    };
  }

  if (scene.visualType === "image") {
    try {
      if (await isLlmRouteEnabledByName("image")) {
        const generated = await generateSceneImageWithLlm(scenesDir, scene);
        return {
          assetPath: relativeMediaPath(generated.filePath),
          assetType: generated.type,
          assetPrompt: scene.visualPrompt || "",
        };
      }
    } catch (error) {
      console.warn(`分镜图片生成失败，已回退到本地卡片：${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const rendered = await renderLocalSceneAsset(scenesDir, scene, context);
  return {
    assetPath: relativeMediaPath(rendered.filePath),
    assetType: rendered.type,
    assetPrompt: scene.visualPrompt || "",
  };
}

async function generateSceneImageWithLlm(scenesDir, scene) {
  const route = await resolveLlmRouteConfig("image");
  const imageBase64 = isVolcengineJimengImageProvider(route)
    ? await generateJimengImageBase64(route, buildSceneImagePrompt(scene))
    : await generateImageBase64WithRoute(route, buildSceneImagePrompt(scene));

  if (!imageBase64) {
    throw new Error("分镜图片响应里没有 b64_json");
  }

  const filePath = path.join(scenesDir, `${scene.id}.png`);
  await fs.writeFile(filePath, Buffer.from(imageBase64, "base64"));
  return { filePath, type: "png" };
}

function buildSceneImagePrompt(scene) {
  return [
    "为中文 IVD 行业短视频生成单个镜头画面。",
    "画面比例：9:16 竖屏。",
    `镜头标题：${scene.sceneTitle}`,
    `镜头说明：${scene.visualPrompt || scene.voiceover || ""}`,
    `口播内容：${scene.voiceover || ""}`,
    "风格：商业科技感、专业、克制、适合行业观察视频。",
    "禁止：水印、logo、复杂小字、低清晰度、娱乐化夸张元素。",
  ].join("\n");
}

async function renderLocalSceneAsset(scenesDir, scene, context) {
  const filePath = path.join(scenesDir, `${scene.id}.svg`);
  await fs.writeFile(filePath, renderSceneSvg(scene, context), "utf8");
  await ensureRasterizedSvgAsset(filePath);
  return { filePath, type: "svg" };
}

async function ensureStoryboardRenderableAssets(storyboard) {
  for (const scene of storyboard || []) {
    const assetPath = String(scene?.assetPath || "").trim();
    if (!assetPath) {
      continue;
    }

    const absoluteAssetPath = path.isAbsolute(assetPath) ? assetPath : path.join(rootDir, assetPath);
    if (!absoluteAssetPath.toLowerCase().endsWith(".svg")) {
      continue;
    }

    await ensureRasterizedSvgAsset(absoluteAssetPath);
  }
}

async function ensureRasterizedSvgAsset(svgPath, options = {}) {
  const pngPath = String(options.outputPath || `${svgPath}.png`);
  if (existsSync(pngPath)) {
    return pngPath;
  }

  if (!(await commandExists("qlmanage"))) {
    return null;
  }

  const tempDir = path.join("/tmp", `videoing-svg-thumb-${crypto.randomBytes(4).toString("hex")}`);

  try {
    await fs.mkdir(tempDir, { recursive: true });
    await execFileAsync("qlmanage", ["-t", "-s", "2048", "-o", tempDir, svgPath]);
    const thumbPath = path.join(tempDir, `${path.basename(svgPath)}.png`);
    if (!existsSync(thumbPath)) {
      throw new Error("Quick Look 没有生成 PNG 缩略图");
    }
    await fs.copyFile(thumbPath, pngPath);
    return pngPath;
  } catch (error) {
    console.warn(`SVG 栅格化失败，将继续使用原始资源：${error instanceof Error ? error.message : String(error)}`);
    return null;
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

function refreshStoryboardCoverAsset(storyboard, coverPath) {
  return (storyboard || []).map((scene) => {
    if (scene.visualType !== "cover") {
      return scene;
    }

    return {
      ...scene,
      assetPath: coverPath || "",
      assetType: "cover",
    };
  });
}

function buildTimelineFromStoryboard(storyboard, coverPath = "") {
  let cursor = 0;

  return (storyboard || []).map((scene, index) => {
    const startSec = cursor;
    cursor += Number(scene.durationSec || 0);

    return {
      sceneId: scene.id,
      track: "video-main",
      visualType: scene.visualType,
      startSec,
      endSec: cursor,
      assetPath: scene.assetPath || (index === 0 && coverPath ? coverPath : ""),
      transition: index === 0 ? "cut" : "fade",
      overlay: scene.sceneTitle,
    };
  });
}

function ensureDraftStructure(rawDraft) {
  const draft = { ...rawDraft };
  let changed = false;

  if (!draft.sourceType) {
    draft.sourceType = "topic";
    changed = true;
  }

  if (!draft.rewriteStyle) {
    draft.rewriteStyle = "industry_observation";
    changed = true;
  }

  if (!draft.productionStage) {
    draft.productionStage = deriveDraftProductionStage(draft);
    changed = true;
  } else {
    const normalizedStage = normalizeProductionStage(draft.productionStage);
    if (normalizedStage !== draft.productionStage) {
      draft.productionStage = normalizedStage;
      changed = true;
    }
  }

  if (typeof draft.rawContent !== "string") {
    draft.rawContent = "";
    changed = true;
  }

  if (!draft.script) {
    draft.script = buildStructuredScript({
      title: draft.title,
      titleVariants: draft.titleVariants,
      coverTitle: draft.coverTitle,
      coverSubtitle: draft.coverSubtitle,
      hook: draft.hook,
      sections: draft.sections,
      cta: draft.cta,
      narrationText: draft.narrationText,
    });
    changed = true;
  }

  if (!Array.isArray(draft.storyboard) || !draft.storyboard.length) {
    draft.storyboard = buildStoryboardFromDraft(draft);
    changed = true;
  }

  if (!Array.isArray(draft.timeline) || !draft.timeline.length) {
    draft.timeline = buildTimelineFromStoryboard(draft.storyboard, draft.assets?.coverPath || "");
    changed = true;
  }

  return { draft, changed };
}

async function ensureDraftSceneAssets(draft, draftDir) {
  const storyboard = Array.isArray(draft.storyboard) ? draft.storyboard : [];
  const missingAsset = storyboard.some((scene) => scene.visualType !== "cover" && !scene.assetPath);

  if (!missingAsset) {
    const refreshedStoryboard = refreshStoryboardCoverAsset(storyboard, draft.assets?.coverPath || "");
    const refreshedTimeline = buildTimelineFromStoryboard(refreshedStoryboard, draft.assets?.coverPath || "");
    const changed = JSON.stringify(refreshedStoryboard) !== JSON.stringify(storyboard) || JSON.stringify(refreshedTimeline) !== JSON.stringify(draft.timeline || []);
    return {
      draft: changed
        ? {
            ...draft,
            storyboard: refreshedStoryboard,
            timeline: refreshedTimeline,
          }
        : draft,
      changed,
    };
  }

  const nextStoryboard = await generateStoryboardAssets(draftDir, storyboard, {
    topic: draft.topic,
    angle: draft.angle,
    audience: draft.audience,
    coverPath: draft.assets?.coverPath || "",
  });

  return {
    draft: {
      ...draft,
      storyboard: nextStoryboard,
      timeline: buildTimelineFromStoryboard(nextStoryboard, draft.assets?.coverPath || ""),
    },
    changed: true,
  };
}

function normalizeStoryboardInput(inputStoryboard, draft) {
  const currentScenes = Array.isArray(draft.storyboard) ? draft.storyboard : buildStoryboardFromDraft(draft);
  const currentSceneMap = new Map(currentScenes.map((scene) => [scene.id, scene]));

  return inputStoryboard
    .map((scene, index) => {
      const currentScene = currentSceneMap.get(scene?.id) || currentScenes[index] || {};
      const visualType = normalizeSceneVisualType(scene?.visualType || currentScene.visualType || "image");
      const durationSec = clamp(Math.round(Number(scene?.durationSec || currentScene.durationSec || 6)), 4, 40);

      return {
        ...currentScene,
        id: String(scene?.id || currentScene.id || `scene-${index + 1}`).trim(),
        sceneTitle: String(scene?.sceneTitle || currentScene.sceneTitle || `镜头 ${index + 1}`).trim(),
        voiceover: String(scene?.voiceover || currentScene.voiceover || "").trim(),
        visualType,
        visualPrompt: String(scene?.visualPrompt || currentScene.visualPrompt || "").trim(),
        durationSec,
      };
    })
    .filter((scene) => scene.voiceover);
}

function buildTitleVariants(topic, baseTitle) {
  const cleanBase = String(baseTitle || topic).trim();
  const compactTopic = topic.replace(/[，。！？、\s]/g, "");
  const variantA = cleanBase;
  const variantB = buildAlternativeTitle(compactTopic, cleanBase);
  return { a: variantA, b: variantB };
}

function buildAlternativeTitle(topic, baseTitle) {
  const inferred = inferIndustryLens(topic, "");

  if (baseTitle.includes("不是")) {
    const [front, back] = baseTitle.split("不是");
    return `${front}不只是${back || ""}`.trim();
  }

  if (/(出海|海外|国际化)/.test(topic)) {
    return `${topic}，关键不在起量，而在能否把本地化做扎实`;
  }

  if (/(集采|降价|招标|带量)/.test(topic)) {
    return `${topic}，企业下一步拼的其实是经营质量`;
  }

  if (/(渠道|经销|代理|招商)/.test(topic)) {
    return `${topic}，真正会拉开差距的是渠道效率`;
  }

  if (/(实验室|终端|医院|检验科)/.test(topic)) {
    return `${topic}，最后还是要回到终端价值`;
  }

  return `${topic}，${inferred.titleTail}`;
}

function buildComboOptions(titleVariants, coverVariants) {
  return [
    buildComboOption("a-report", "方案 1", titleVariants?.a, "行业报告风", coverVariants.report),
    buildComboOption("a-viral", "方案 2", titleVariants?.a, "爆款短视频风", coverVariants.viral),
    buildComboOption("b-report", "方案 3", titleVariants?.b, "行业报告风", coverVariants.report),
    buildComboOption("b-viral", "方案 4", titleVariants?.b, "爆款短视频风", coverVariants.viral),
  ];
}

function buildComboOption(id, label, title, coverStyleLabel, coverAsset) {
  return {
    id,
    label,
    title,
    coverStyleLabel,
    coverPath: relativeMediaPath(coverAsset.variantPath || coverAsset.filePath),
  };
}

function compareDrafts(a, b, sort) {
  if (sort === "created-desc") {
    return String(b.createdAt).localeCompare(String(a.createdAt));
  }

  if (sort === "quality-desc") {
    return (
      Number(b.blockingIssueCount) - Number(a.blockingIssueCount) ||
      Number(b.qualityCheckCount) - Number(a.qualityCheckCount) ||
      String(b.updatedAt).localeCompare(String(a.updatedAt))
    );
  }

  if (sort === "export-desc") {
    return (
      getExportPriority(b.exportStatus) - getExportPriority(a.exportStatus) ||
      String(b.updatedAt).localeCompare(String(a.updatedAt))
    );
  }

  return String(b.updatedAt).localeCompare(String(a.updatedAt));
}

function getExportPriority(status) {
  if (status === "blocked") {
    return 4;
  }

  if (status === "script-only") {
    return 3;
  }

  if (status === "idle") {
    return 2;
  }

  if (status === "error") {
    return 1;
  }

  return 0;
}

function getExportStatusLabel(status) {
  if (status === "success") {
    return "已出片";
  }

  if (status === "script-only") {
    return "已生成脚本";
  }

  if (status === "blocked") {
    return "被质检拦截";
  }

  if (status === "working") {
    return "导出中";
  }

  if (status === "error") {
    return "导出失败";
  }

  return "未导出";
}

function whileFill(items, targetLength, fillValue) {
  const next = [...items];
  while (next.length < targetLength) {
    next.push(fillValue);
  }
  return next;
}

export function buildLocalDraft({ sourceType, topic, rawContent, angle, rewriteStyle, audience, durationMode }) {
  const inferred = inferIndustryLens(topic, angle);
  const angleText = angle || "行业结构变化";
  const titleTail = inferred.titleTail;
  const coverMain = topic.length > 18 ? `${topic.slice(0, 18)}...` : topic;
  const coverSubtitle = `${durationMode}秒${inferred.coverFocus} · 分析逻辑`;
  const articleSignals = sourceType === "article" ? extractArticleSignals(rawContent, topic) : null;
  const styleProfile = getRewriteStyleProfile(rewriteStyle);

  if (articleSignals) {
    return {
      title: `${articleSignals.topic}，${styleProfile.articleTitleTail || titleTail}`,
      coverTitle: articleSignals.coverTitle,
      coverSubtitle: `${durationMode}秒${styleProfile.coverFocus} · ${styleProfile.coverKeyword}`,
      hook: `${articleSignals.summary} ${styleProfile.articleHook}`,
      sections: [
        `先看描述层，这篇内容真正值得提出来的，不只是${articleSignals.signalA}，而是它已经把${articleSignals.signalB}放到了${styleProfile.descriptionFocus}。`,
        `再看分析层，真正要拆开的不是表面结论，而是${inferred.analysisFocus}之间的关系。做成视频号文案时，重点要保留${styleProfile.analysisFocus}，而不是复述全文。`,
        `我的观点是，面对${angleText}，最好的改写方式不是把原文缩短，而是把${articleSignals.topic}重新整理成“${styleProfile.structureHint}”这三层。`,
      ],
      cta: `如果你想继续看更多 IVD 内容如何被改写成${styleProfile.ctaKeyword}风格文案，关注我，我会继续拆解${articleSignals.topic}。`,
    };
  }

  return {
    title: `${topic}，${styleProfile.topicTitleTail || titleTail}`,
    coverTitle: coverMain,
    coverSubtitle: `${durationMode}秒${inferred.coverFocus} · ${styleProfile.coverKeyword}`,
    hook: `${topic}，如果只把它看成一个单点事件，很容易误判。对 IVD 行业来说，它真正改变的是${styleProfile.topicHookPrefix}${inferred.hookFocus}。`,
    sections: [
      `先看描述层，这个话题最近被越来越多${audience}反复提起，说明市场已经从“讨论可能性”进入“${styleProfile.descriptionTrend}”的阶段。`,
      `再看分析层，真正值得盯住的不是表面热度，而是${inferred.analysisFocus}之间的联动。${styleProfile.analysisSentence}`,
      `我的观点是，面对${angleText}，企业现在最需要的不是泛泛跟进，而是先判断自己到底应该守住${inferred.defenseFocus}，还是去抢${inferred.attackFocus}。`,
    ],
    cta: `如果你想继续看这类 IVD 行业的${styleProfile.ctaKeyword}内容，关注我，我会继续拆解${topic}背后的业务逻辑。`,
  };
}

async function generateCoverAsset(draftDir, script, context) {
  const prompt = buildCoverPrompt(script, context);
  const styleBaseName = `cover-${context.coverStyle}`;

  if (await isLlmRouteEnabledByName("image")) {
    try {
      return await generateCoverWithLlm(draftDir, prompt, styleBaseName);
    } catch (error) {
      console.warn(`封面生成失败，已回退到本地封面：${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const svgVariantPath = path.join(draftDir, `${styleBaseName}.svg`);
  await fs.writeFile(svgVariantPath, renderCoverSvg(script, context.coverStyle), "utf8");
  const currentSvgPath = path.join(draftDir, "cover.svg");
  await fs.copyFile(svgVariantPath, currentSvgPath);

  const rasterizedVariantPath = await ensureRasterizedSvgAsset(svgVariantPath, {
    outputPath: path.join(draftDir, `${styleBaseName}.png`),
  });
  if (rasterizedVariantPath && existsSync(rasterizedVariantPath)) {
    const currentPngPath = path.join(draftDir, "cover.png");
    await fs.copyFile(rasterizedVariantPath, currentPngPath);
    return { filePath: currentPngPath, type: "png", prompt, variantPath: rasterizedVariantPath };
  }

  return { filePath: currentSvgPath, type: "svg", prompt, variantPath: svgVariantPath };
}

async function ensureCoverVariants(draftDir, script, baseContext) {
  const report = await generateCoverAsset(draftDir, script, { ...baseContext, coverStyle: "report" });
  const viral = await generateCoverAsset(draftDir, script, { ...baseContext, coverStyle: "viral" });
  return { report, viral };
}

async function syncCurrentCoverVariant(draftDir, coverAsset) {
  if (!coverAsset?.variantPath) {
    return;
  }

  const currentPath = path.join(draftDir, `cover.${coverAsset.type}`);
  await fs.copyFile(coverAsset.variantPath, currentPath);
}

function buildCoverPrompt(script, { topic, angle, audience, coverStyle }) {
  const angleText = angle || "产业结构、渠道效率与终端价值的变化";
  const stylePrompt = getCoverStylePrompt(coverStyle);
  return [
    "为中文短视频生成一张 9:16 竖版封面图。",
    "主题属于中国 IVD 行业观察内容。",
    `主标题概念：${script.coverTitle}`,
    `副标题概念：${script.coverSubtitle}`,
    `原始主题：${topic}`,
    `受众：${audience}`,
    `分析角度：${angleText}`,
    `封面风格：${getCoverStyleLabel(coverStyle)}`,
    stylePrompt,
    "禁止出现：过多小字、水印、品牌 logo、血腥内容、低清晰度、杂乱背景。",
  ].join("\n");
}

async function generateCoverWithLlm(draftDir, prompt, styleBaseName) {
  const route = await resolveLlmRouteConfig("image");
  const imageBase64 = isVolcengineJimengImageProvider(route)
    ? await generateJimengImageBase64(route, prompt)
    : await generateImageBase64WithRoute(route, prompt);

  if (!imageBase64) {
    throw new Error("图片响应里没有 b64_json");
  }

  const variantPath = path.join(draftDir, `${styleBaseName}.png`);
  await fs.writeFile(variantPath, Buffer.from(imageBase64, "base64"));
  const currentPath = path.join(draftDir, "cover.png");
  await fs.copyFile(variantPath, currentPath);
  return { filePath: currentPath, type: "png", prompt, variantPath };
}

async function generateImageBase64WithRoute(route, prompt) {
  const response = await fetchWithRoute(route, buildLlmRouteUrl(route), buildImageRequest(route, prompt));

  if (!response.ok) {
    throw new Error(`图片请求失败：${response.status} ${await response.text()}`);
  }

  return extractImageBase64(response, route);
}

function buildScriptPrompt({ sourceType, topic, rawContent, angle, rewriteStyle, audience, durationMode }) {
  const chosenAngle = angle || "从产业结构、渠道效率、终端实验室价值中，选择最适合该主题的一条主线";
  const styleProfile = getRewriteStyleProfile(rewriteStyle);
  const contentContext = sourceType === "article"
    ? [
        "输入来源：标题 / 正文",
        "你的任务不是摘要文章，而是把原始内容重构成适合视频号发布的 IVD 行业短视频文案。",
        "请先完成这一步内部处理：提炼原始内容的核心主题、关键信号、可保留的观点、真正值得展开的业务变量。",
        "再完成第二步：把提炼后的内容改写成口播稿，而不是把文章缩写一遍。",
        "不要照抄原文，不要沿用文章腔，不要出现'本文认为''作者提到''这篇文章说'这类表达。",
        "如果原始内容信息很多，请只保留最能支撑行业判断的部分，把冗余背景、铺垫和重复表述删掉。",
        "改写后的成片感觉应更像视频号里的行业观察，不要像公众号摘要，也不要像抖音标题党。",
        "原始内容如下：",
        truncateForPrompt(rawContent, 2800),
      ].join("\n")
    : "输入来源：主题";

  return [
    "你是一名长期服务中国 IVD 行业的内容策略师，同时具备产业研究、渠道分析和短视频写作能力。",
    `你的任务不是做科普，也不是做鸡汤，而是把一个 IVD 行业主题写成 ${durationMode} 秒左右、适合短视频口播的专业判断。`,
    "",
    "请严格输出 JSON，不要输出 Markdown，不要解释，不要补充字段。",
    "JSON 字段必须且只能包含：title, coverTitle, coverSubtitle, hook, sections, cta。",
    "",
    "字段要求：",
    "1. title：适合视频标题，18 到 30 个汉字，像行业观察号标题，要有判断，不要标题党。",
    "2. coverTitle：适合封面大字，尽量短，最好 8 到 16 个汉字。",
    "3. coverSubtitle：适合封面副标题，10 到 18 个汉字，体现“趋势/分析/观点”中的两个维度。",
    "4. hook：开场第一段，必须先点出这个主题为什么值得关注，避免空话，长度 45 到 80 个汉字。",
    "5. sections：长度必须为 3 的数组，每段 45 到 85 个汉字。",
    "6. cta：结尾引导，1 句话即可，不要油腻，不要过度营销。",
    "",
    "内容结构必须严格按下面执行：",
    "1. hook：先说这个变化为什么不是小事，最好直接点出它会影响谁、哪条链路、哪种决策。",
    "2. sections[0]：描述层。说清楚当下行业里正在发生什么，市场讨论点在哪里，谁更焦虑、谁更受影响。",
    "3. sections[1]：分析层。解释背后的关键变量，优先写注册、集采、渠道效率、终端需求、回款、产品结构、出海、本地化服务、利润空间这类真实变量，不要抽象废话。",
    "4. sections[2]：观点层。给出清晰立场，说明企业下一步应该如何判断、取舍或布局。",
    "5. cta：延续“行业观察”语气，像继续追更，而不是泛泛求点赞。",
    "",
    "平台风格要求：",
    "1. 这是视频号风格，不是抖音口播。表达可以完整，但不能拖沓。",
    "2. 第一段必须快速交代这件事为什么值得看，避免绕圈子。",
    "3. 中间两段优先保留真正有业务含义的变化、变量和判断，不做空泛总结。",
    "4. 结尾必须落到明确观点或建议，而不是只做重复总结。",
    `5. 当前改写风格：${styleProfile.label}。请优先体现这类风格的表达重心。`,
    "",
    "写作风格要求：",
    "1. 全部使用简体中文。",
    "2. 语气专业、克制、像业内人说话。",
    "3. 不要使用“颠覆、爆发、风口、一定会”等过度夸张表达。",
    "4. 尽量避免套话，例如“值得关注的是”“首先其次最后”重复出现。",
    "5. 可以有观点，但不要编造具体数据、政策编号、公司公告或未经确认的事实。",
    "6. 每一段都要有信息密度，听起来像真的理解 IVD 行业，而不是把通用商业分析换个名词。",
    "7. 如果输入是标题/正文，请优先保留原文里最重要的行业判断，不要把文案写成对原文的复述。",
    "",
    contentContext,
    "受众：" + audience,
    "主线角度：" + chosenAngle,
    "改写风格：" + styleProfile.promptHint,
    "主题：" + topic,
  ].join("\n");
}

function inferIndustryLens(topic, angle) {
  const source = `${topic} ${angle || ""}`;

  if (/(出海|海外|国际化|欧盟|东南亚|中东)/.test(source)) {
    return {
      titleTail: "真正难的不是卖出去，而是做深本地化",
      coverFocus: "出海门槛",
      hookFocus: "注册节奏、渠道能力和本地化交付的匹配效率",
      analysisFocus: "注册准入、渠道落地、本地售后服务和回款周期",
      defenseFocus: "核心产品与注册节奏",
      attackFocus: "区域市场的渠道深度和本地化服务能力",
    };
  }

  if (/(集采|价格|降价|招标|带量)/.test(source)) {
    return {
      titleTail: "考验的不只是价格，而是整体经营能力",
      coverFocus: "集采之后",
      hookFocus: "利润分配、渠道角色和终端覆盖效率",
      analysisFocus: "价格体系、渠道动力、终端覆盖和回款效率",
      defenseFocus: "利润底线和终端黏性",
      attackFocus: "精细化渠道和结构性替代机会",
    };
  }

  if (/(渠道|经销|代理|招商)/.test(source)) {
    return {
      titleTail: "下一轮比拼会回到渠道效率",
      coverFocus: "渠道效率",
      hookFocus: "渠道价值重估和终端覆盖能力",
      analysisFocus: "渠道层级、终端触达、回款质量和服务交付",
      defenseFocus: "已有渠道盘和终端关系",
      attackFocus: "高效率区域和空白终端",
    };
  }

  if (/(实验室|终端|医院|检验科)/.test(source)) {
    return {
      titleTail: "终局还是要看终端价值能不能站住",
      coverFocus: "终端价值",
      hookFocus: "终端实验室的采购逻辑和使用价值",
      analysisFocus: "终端需求、使用效率、科室协同和支付压力",
      defenseFocus: "终端可验证价值",
      attackFocus: "高频刚需场景和替代空间",
    };
  }

  return {
    titleTail: "正在倒逼企业重算增长逻辑",
    coverFocus: "行业变化",
    hookFocus: "产品、渠道与终端之间的利益重新分配",
    analysisFocus: "产品结构、渠道效率、终端需求和利润空间",
    defenseFocus: "核心盘面",
    attackFocus: "新增结构性机会",
  };
}

function buildSubtitleEntries(script, narrationText, durationMode = 90) {
  const sentences = [
    { label: "hook", text: script.hook },
    ...script.sections.map((text, index) => ({ label: `section-${index + 1}`, text })),
    { label: "cta", text: script.cta },
  ];
  const totalChars = Math.max(narrationText.length, 1);
  const durationProfile = getDurationProfile(durationMode);
  const totalDuration = clamp(
    Math.round(totalChars / durationProfile.charRate),
    durationProfile.minSec,
    durationProfile.maxSec,
  );
  const entries = [];
  let cursor = 0;

  for (const sentence of sentences) {
    const duration = Math.max(4, Number(((sentence.text.length / totalChars) * totalDuration).toFixed(2)));
    const startSec = cursor;
    cursor = Number((cursor + duration).toFixed(2));
    entries.push({
      label: sentence.label,
      text: sentence.text,
      startSec,
      endSec: cursor,
    });
  }

  if (entries.length) {
    entries[entries.length - 1].endSec = Math.max(totalDuration, entries[entries.length - 1].endSec);
  }

  return entries;
}

function toSrt(entries) {
  return entries
    .map((entry, index) => {
      return `${index + 1}\n${formatSrtTime(entry.startSec)} --> ${formatSrtTime(entry.endSec)}\n${entry.text}\n`;
    })
    .join("\n");
}

function formatSrtTime(seconds) {
  const totalMs = Math.round(seconds * 1000);
  const hours = String(Math.floor(totalMs / 3600000)).padStart(2, "0");
  const minutes = String(Math.floor((totalMs % 3600000) / 60000)).padStart(2, "0");
  const secs = String(Math.floor((totalMs % 60000) / 1000)).padStart(2, "0");
  const ms = String(totalMs % 1000).padStart(3, "0");
  return `${hours}:${minutes}:${secs},${ms}`;
}

async function generateVoice(draftDir, text) {
  if (await isLlmRouteEnabledByName("tts")) {
    const outPath = path.join(draftDir, "voice.mp3");
    const route = await resolveLlmRouteConfig("tts");
    try {
      const response = await fetchWithRoute(route, buildLlmRouteUrl(route), buildTtsRequest(route, text));

      if (!response.ok) {
        throw new Error(`配音生成失败：${response.status} ${await response.text()}`);
      }

      const audioBuffer = await extractTtsAudioBuffer(response, route);
      await fs.writeFile(outPath, audioBuffer);
      return { filePath: outPath, format: "mp3" };
    } catch (error) {
      console.warn(`远程配音失败，已回退到本地配音：${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const outPath = path.join(draftDir, "voice.aiff");
  const voice = envValue("LOCAL_TTS_VOICE", "Ting-Ting");
  await execFileAsync("say", ["-v", voice, "-o", outPath, text]);
  return { filePath: outPath, format: "aiff" };
}

function renderCoverSvg(script, coverStyle = "report") {
  if (coverStyle === "viral") {
    return renderViralCoverSvg(script);
  }
  return renderReportCoverSvg(script);
}

function renderReportCoverSvg(script) {
  const title = escapeXml(script.coverTitle);
  const subtitle = escapeXml(script.coverSubtitle);
  const chip = escapeXml("IVD INDUSTRY");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#061018"/>
      <stop offset="45%" stop-color="#0f3142"/>
      <stop offset="100%" stop-color="#bcefff"/>
    </linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.18"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.05"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#bg)"/>
  <circle cx="860" cy="220" r="240" fill="#9fe5ff" fill-opacity="0.10"/>
  <circle cx="180" cy="1540" r="320" fill="#39c6ff" fill-opacity="0.14"/>
  <circle cx="930" cy="1140" r="170" fill="#f8ffff" fill-opacity="0.06"/>
  <rect x="72" y="88" width="936" height="1744" rx="44" fill="url(#panel)" stroke="#ffffff" stroke-opacity="0.14"/>
  <rect x="120" y="152" width="280" height="64" rx="32" fill="#ffffff" fill-opacity="0.12"/>
  <text x="140" y="172" fill="#f5fbff" font-size="34" font-family="Arial, sans-serif" letter-spacing="4">${chip}</text>
  <path d="M160 420 C300 340, 430 360, 520 520 S760 770, 920 690" fill="none" stroke="#8ee8ff" stroke-opacity="0.25" stroke-width="6"/>
  <path d="M138 1230 C280 1150, 390 1180, 500 1320 S740 1580, 904 1480" fill="none" stroke="#e7fbff" stroke-opacity="0.18" stroke-width="4"/>
  <rect x="120" y="480" width="840" height="500" rx="30" fill="#03141d" fill-opacity="0.20"/>
  <text x="120" y="650" fill="#f7fbff" font-size="104" font-weight="700" font-family="Arial, sans-serif">
    <tspan x="120" dy="0">${chunkText(title, 9)[0] || ""}</tspan>
    <tspan x="120" dy="122">${chunkText(title, 9)[1] || ""}</tspan>
    <tspan x="120" dy="122">${chunkText(title, 9)[2] || ""}</tspan>
  </text>
  <text x="120" y="1085" fill="#d9edf8" font-size="48" font-family="Arial, sans-serif">${subtitle}</text>
  <rect x="120" y="1174" width="840" height="3" fill="#f5fbff" fill-opacity="0.22"/>
  <text x="120" y="1295" fill="#f5fbff" font-size="40" font-family="Arial, sans-serif">90 秒描述 · 结构分析 · 观点输出</text>
  <rect x="120" y="1470" width="260" height="260" rx="28" fill="#dff8ff" fill-opacity="0.10" stroke="#ffffff" stroke-opacity="0.12"/>
  <rect x="430" y="1408" width="430" height="120" rx="26" fill="#05202c" fill-opacity="0.28" stroke="#8fe5ff" stroke-opacity="0.18"/>
  <rect x="430" y="1560" width="520" height="120" rx="26" fill="#05202c" fill-opacity="0.22" stroke="#8fe5ff" stroke-opacity="0.12"/>
  <rect x="430" y="1712" width="350" height="52" rx="26" fill="#ffffff" fill-opacity="0.12"/>
</svg>`;
}

function renderViralCoverSvg(script) {
  const title = escapeXml(script.coverTitle);
  const subtitle = escapeXml(script.coverSubtitle);
  const chip = escapeXml("IVD HOT TAKE");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#190406"/>
      <stop offset="50%" stop-color="#4d1015"/>
      <stop offset="100%" stop-color="#ff8f3c"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#bg)"/>
  <circle cx="860" cy="220" r="250" fill="#fff6b8" fill-opacity="0.20"/>
  <circle cx="160" cy="1560" r="330" fill="#ff4f5c" fill-opacity="0.20"/>
  <rect x="88" y="104" width="360" height="76" rx="18" fill="#fff4d1"/>
  <text x="124" y="154" fill="#8c1118" font-size="34" font-weight="700" font-family="Arial, sans-serif" letter-spacing="3">${chip}</text>
  <rect x="88" y="380" width="904" height="760" rx="40" fill="#fff4d9"/>
  <rect x="118" y="412" width="844" height="696" rx="30" fill="#8f121a"/>
  <text x="136" y="612" fill="#fff7eb" font-size="114" font-weight="800" font-family="Arial, sans-serif">
    <tspan x="136" dy="0">${chunkText(title, 8)[0] || ""}</tspan>
    <tspan x="136" dy="134">${chunkText(title, 8)[1] || ""}</tspan>
    <tspan x="136" dy="134">${chunkText(title, 8)[2] || ""}</tspan>
  </text>
  <rect x="88" y="1200" width="904" height="170" rx="28" fill="#ffdf72"/>
  <text x="126" y="1302" fill="#7c0f16" font-size="52" font-weight="700" font-family="Arial, sans-serif">${subtitle}</text>
  <text x="90" y="1495" fill="#fff7e7" font-size="42" font-family="Arial, sans-serif">判断更直接 · 冲击感更强 · 适合高点击封面</text>
  <rect x="88" y="1600" width="436" height="180" rx="30" fill="#8f121a" fill-opacity="0.86"/>
  <text x="132" y="1708" fill="#fff7eb" font-size="54" font-weight="700" font-family="Arial, sans-serif">行业变化</text>
  <rect x="556" y="1600" width="436" height="180" rx="30" fill="#fff4d9" fill-opacity="0.94"/>
  <text x="600" y="1708" fill="#8f121a" font-size="54" font-weight="700" font-family="Arial, sans-serif">值得重判</text>
</svg>`;
}

function renderSceneSvg(scene, context = {}) {
  if (scene.visualType === "chart") {
    return renderChartSceneSvg(scene, context);
  }

  if (scene.visualType === "quote") {
    return renderQuoteSceneSvg(scene, context);
  }

  if (scene.visualType === "brand_outro") {
    return renderOutroSceneSvg(scene, context);
  }

  return renderImageSceneSvg(scene, context);
}

function renderImageSceneSvg(scene, context) {
  const title = escapeXml(scene.sceneTitle || "镜头画面");
  const bodyLines = chunkText(String(scene.voiceover || ""), 18);
  const topic = escapeXml(context.topic || "IVD 行业观察");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#071019"/>
      <stop offset="60%" stop-color="#173c50"/>
      <stop offset="100%" stop-color="#7fdcff"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#bg)"/>
  <circle cx="830" cy="290" r="240" fill="#ffffff" fill-opacity="0.08"/>
  <circle cx="220" cy="1530" r="260" fill="#89e2ff" fill-opacity="0.16"/>
  <rect x="72" y="76" width="936" height="1768" rx="40" fill="#08151d" fill-opacity="0.22" stroke="#ffffff" stroke-opacity="0.12"/>
  <text x="118" y="176" fill="#87ddff" font-size="36" font-family="Arial, sans-serif" letter-spacing="4">${topic}</text>
  <text x="118" y="330" fill="#f6fbff" font-size="78" font-weight="700" font-family="Arial, sans-serif">${title}</text>
  <rect x="118" y="420" width="844" height="660" rx="34" fill="#04121a" fill-opacity="0.24" stroke="#a9ebff" stroke-opacity="0.14"/>
  <circle cx="540" cy="750" r="180" fill="#dffaff" fill-opacity="0.08"/>
  <rect x="118" y="1160" width="844" height="420" rx="32" fill="#051722" fill-opacity="0.3" stroke="#ffffff" stroke-opacity="0.08"/>
  <text x="152" y="1260" fill="#eefaff" font-size="44" font-family="Arial, sans-serif">
    <tspan x="152" dy="0">${escapeXml(bodyLines[0] || "")}</tspan>
    <tspan x="152" dy="72">${escapeXml(bodyLines[1] || "")}</tspan>
    <tspan x="152" dy="72">${escapeXml(bodyLines[2] || "")}</tspan>
    <tspan x="152" dy="72">${escapeXml(bodyLines[3] || "")}</tspan>
  </text>
</svg>`;
}

function renderChartSceneSvg(scene, context) {
  const title = escapeXml(scene.sceneTitle || "变量拆解");
  const bodyLines = chunkText(String(scene.voiceover || ""), 18);
  const angle = escapeXml(context.angle || "关键变量拆解");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#091019"/>
      <stop offset="100%" stop-color="#173847"/>
    </linearGradient>
    <linearGradient id="card" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.03"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#bg)"/>
  <circle cx="902" cy="232" r="220" fill="#87e6ff" fill-opacity="0.14"/>
  <rect x="70" y="70" width="940" height="1780" rx="40" fill="#0d151d" stroke="#ffffff" stroke-opacity="0.1"/>
  <text x="128" y="176" fill="#8de2ff" font-size="32" font-family="Arial, sans-serif" letter-spacing="5">IVD VARIABLE MAP</text>
  <text x="126" y="302" fill="#f8fbff" font-size="78" font-weight="700" font-family="Arial, sans-serif">${title}</text>
  <text x="128" y="378" fill="#b8c9d6" font-size="32" font-family="Arial, sans-serif">${angle}</text>
  <rect x="118" y="456" width="844" height="590" rx="34" fill="url(#card)" stroke="#9fe9ff" stroke-opacity="0.16"/>
  <rect x="166" y="520" width="188" height="120" rx="22" fill="#ffffff" fill-opacity="0.06"/>
  <rect x="392" y="520" width="228" height="120" rx="22" fill="#ffffff" fill-opacity="0.1"/>
  <rect x="660" y="520" width="220" height="120" rx="22" fill="#ffffff" fill-opacity="0.06"/>
  <path d="M164 892 C308 802, 406 834, 520 720 S748 548, 914 598" fill="none" stroke="#8ce7ff" stroke-width="16" stroke-linecap="round"/>
  <circle cx="298" cy="798" r="20" fill="#ffffff"/>
  <circle cx="520" cy="720" r="20" fill="#ffffff"/>
  <circle cx="764" cy="610" r="20" fill="#ffffff"/>
  <text x="188" y="1008" fill="#8de2ff" font-size="30" font-family="Arial, sans-serif">变量结构</text>
  <rect x="118" y="1102" width="844" height="510" rx="34" fill="#0f1922" stroke="#ffffff" stroke-opacity="0.08"/>
  <text x="162" y="1218" fill="#eefaff" font-size="46" font-family="Arial, sans-serif">
    <tspan x="162" dy="0">${escapeXml(bodyLines[0] || "")}</tspan>
    <tspan x="162" dy="74">${escapeXml(bodyLines[1] || "")}</tspan>
    <tspan x="162" dy="74">${escapeXml(bodyLines[2] || "")}</tspan>
    <tspan x="162" dy="74">${escapeXml(bodyLines[3] || "")}</tspan>
  </text>
</svg>`;
}

function renderQuoteSceneSvg(scene, context) {
  const topic = escapeXml(context.topic || "行业判断");
  const quoteLines = chunkText(String(scene.voiceover || ""), 14);

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="quoteBg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0c0f15"/>
      <stop offset="100%" stop-color="#1b2430"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#quoteBg)"/>
  <circle cx="842" cy="296" r="250" fill="#5fd8ff" fill-opacity="0.16"/>
  <rect x="88" y="96" width="904" height="1728" rx="48" fill="#121821" stroke="#8ee7ff" stroke-opacity="0.14"/>
  <text x="150" y="230" fill="#92e2ff" font-size="32" font-family="Arial, sans-serif" letter-spacing="5">${topic}</text>
  <rect x="126" y="322" width="828" height="1220" rx="38" fill="#0f141b" stroke="#ffffff" stroke-opacity="0.06"/>
  <text x="142" y="520" fill="#dff7ff" font-size="200" font-family="Georgia, serif">“</text>
  <text x="162" y="734" fill="#f8fbff" font-size="96" font-weight="700" font-family="Arial, sans-serif">
    <tspan x="162" dy="0">${escapeXml(quoteLines[0] || "")}</tspan>
    <tspan x="162" dy="128">${escapeXml(quoteLines[1] || "")}</tspan>
    <tspan x="162" dy="128">${escapeXml(quoteLines[2] || "")}</tspan>
    <tspan x="162" dy="128">${escapeXml(quoteLines[3] || "")}</tspan>
  </text>
  <rect x="162" y="1468" width="356" height="4" fill="#8de2ff" fill-opacity="0.45"/>
  <text x="162" y="1558" fill="#b8c9d6" font-size="40" font-family="Arial, sans-serif">${escapeXml(scene.sceneTitle || "观点判断")}</text>
  <rect x="162" y="1640" width="276" height="74" rx="18" fill="#ffffff" fill-opacity="0.06"/>
  <text x="202" y="1688" fill="#f8fbff" font-size="30" font-family="Arial, sans-serif">行业视角</text>
</svg>`;
}

function renderOutroSceneSvg(scene, context) {
  const title = escapeXml(scene.sceneTitle || "结尾引导");
  const lines = chunkText(String(scene.voiceover || ""), 16);
  const audience = escapeXml(context.audience || "IVD 行业从业者");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#08131b"/>
      <stop offset="100%" stop-color="#0f5770"/>
    </linearGradient>
    <linearGradient id="outroCard" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.13"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.04"/>
    </linearGradient>
  </defs>
  <rect width="1080" height="1920" fill="url(#bg)"/>
  <circle cx="184" cy="1740" r="260" fill="#89e2ff" fill-opacity="0.12"/>
  <rect x="84" y="84" width="912" height="1752" rx="42" fill="#0a151e" fill-opacity="0.22" stroke="#ffffff" stroke-opacity="0.12"/>
  <text x="540" y="356" fill="#8de3ff" font-size="32" text-anchor="middle" font-family="Arial, sans-serif" letter-spacing="5">${audience}</text>
  <text x="540" y="530" fill="#f8fbff" font-size="104" font-weight="700" text-anchor="middle" font-family="Arial, sans-serif">${title}</text>
  <rect x="138" y="640" width="804" height="580" rx="42" fill="url(#outroCard)" stroke="#95e7ff" stroke-opacity="0.18"/>
  <text x="540" y="846" fill="#eefaff" font-size="66" font-weight="700" text-anchor="middle" font-family="Arial, sans-serif">
    <tspan x="540" dy="0">${escapeXml(lines[0] || "")}</tspan>
    <tspan x="540" dy="102">${escapeXml(lines[1] || "")}</tspan>
    <tspan x="540" dy="102">${escapeXml(lines[2] || "")}</tspan>
  </text>
  <rect x="282" y="1382" width="516" height="116" rx="58" fill="#ffffff" fill-opacity="0.14" stroke="#95e7ff" stroke-opacity="0.24"/>
  <text x="540" y="1456" fill="#f8fbff" font-size="46" text-anchor="middle" font-family="Arial, sans-serif">继续追踪更多 IVD 判断</text>
  <text x="540" y="1640" fill="#d4eaf6" font-size="34" text-anchor="middle" font-family="Arial, sans-serif">description · analysis · point of view</text>
</svg>`;
}

function normalizeCoverStyle(value) {
  return value === "viral" ? "viral" : "report";
}

function normalizeSceneVisualType(value) {
  if (value === "cover" || value === "image" || value === "chart" || value === "quote" || value === "brand_outro") {
    return value;
  }
  return "image";
}

function normalizeTitleVariant(value) {
  return value === "b" ? "b" : "a";
}

function normalizeWorkflowStatus(value) {
  if (value === "pending" || value === "revised" || value === "ready" || value === "exported" || value === "archived" || value === "all") {
    return value;
  }
  return "";
}

function normalizeProductionStage(value) {
  if (value === "script" || value === "production" || value === "export") {
    return value;
  }
  return "script";
}

function deriveDraftProductionStage(draft) {
  if (draft?.exportInfo?.videoReady || draft?.workflowStatus === "exported") {
    return "export";
  }
  if ((draft?.qualityChecks || []).length || draft?.workflowStatus === "ready") {
    return "production";
  }
  return "script";
}

function getCoverStyleLabel(style) {
  return style === "viral" ? "爆款短视频风" : "行业报告风";
}

function getWorkflowStatusLabel(status) {
  if (status === "revised") {
    return "待修改";
  }
  if (status === "ready") {
    return "可导出";
  }
  if (status === "exported") {
    return "已导出";
  }
  if (status === "archived") {
    return "已归档";
  }
  return "待处理";
}

function getCoverStylePrompt(style) {
  if (style === "viral") {
    return [
      "画面要求：更强冲击力、更强对比度、更像高点击率短视频封面，但仍保持专业感。",
      "视觉元素建议：大面积高对比色块、聚焦标题区域、少量警示感图形、数据冲击感、行业变化信号。",
      "构图要求：标题必须非常醒目，适合叠加粗体中文大字，第一眼就能看到主题冲突。",
      "风格要求：商业短视频爆款封面，不低俗，不夸张失真，不做娱乐八卦感。",
    ].join("\n");
  }

  return [
    "画面要求：高级、克制、专业、偏商业报道封面，不要卡通，不要人物大头自拍，不要夸张特效。",
    "视觉元素建议：实验室仪器抽象轮廓、冷色调数据流、医疗检测场景、玻璃质感、图表结构、产业分析氛围。",
    "构图要求：上方或中上部预留清晰标题区，背景层次分明，适合后续叠加中文大字。",
    "风格要求：科技商业杂志封面，真实感插画或高质感视觉合成，蓝绿冷色为主，局部青色高光。",
  ].join("\n");
}

function chunkText(text, size) {
  const chunks = [];
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size));
  }
  return whileFill(chunks.slice(0, 3), 3, "");
}

function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function buildStoryboardFfmpegScript({ ffmpegPath, storyboard, timeline, audioPath, subtitlePath, outputPath }) {
  const fontPath = "/System/Library/Fonts/Supplemental/Songti.ttc";
  const scenes = Array.isArray(storyboard) && storyboard.length ? storyboard : buildFallbackStoryboardFromTimeline(timeline);
  const sceneInputs = scenes.map((scene) => buildSceneInputSpec(scene));
  const drawSteps = scenes.map((scene, index) => buildSceneFilterStep(scene, index, fontPath));
  const concatInputs = scenes.map((_, index) => `[v${index}]`).join("");
  const subtitleEscaped = subtitlePath.replaceAll("\\", "/").replaceAll(":", "\\:");
  const audioEscaped = audioPath;
  const outputEscaped = outputPath;
  const inputLines = sceneInputs
    .map((sceneInput) => sceneInput.inputLine)
    .join(" \\\n");
  const filterChain = `${drawSteps.join(";")};${concatInputs}concat=n=${scenes.length}:v=1:a=0[base];[base]subtitles='${subtitleEscaped}':force_style='FontName=Songti SC,FontSize=20,PrimaryColour=&H00FFFFFF,OutlineColour=&H00000000,BorderStyle=3,Outline=1,Shadow=0,MarginV=120'[v]`;

return `#!/bin/sh
set -eu
"${ffmpegPath}" \\
-y \\
${inputLines} \\
-i "${audioEscaped}" \\
-filter_complex "${filterChain}" \\
-map "[v]" -map ${scenes.length}:a \\
-c:v libx264 -pix_fmt yuv420p -c:a aac -shortest -movflags +faststart \\
"${outputEscaped}"
`;
}

function buildFallbackStoryboardFromTimeline(timeline) {
  return (timeline || []).map((item, index) => ({
    id: item.sceneId || `scene-${index + 1}`,
    sceneTitle: item.overlay || `镜头 ${index + 1}`,
    voiceover: item.overlay || `镜头 ${index + 1}`,
    visualType: item.visualType || "image",
    durationSec: Math.max(4, Number(item.endSec || 0) - Number(item.startSec || 0)),
  }));
}

function buildSceneFilterStep(scene, index, fontPath) {
  const title = escapeDrawText(scene.sceneTitle || `镜头 ${index + 1}`);
  const body = escapeDrawText(scene.voiceover || "");
  const badge = escapeDrawText(getSceneBadge(scene.visualType));
  const bodyFontSize = getSceneBodyFontSize(scene.visualType);
  const duration = Math.max(4, Number(scene.durationSec || 6));
  const fadeDuration = Math.min(0.42, Math.max(0.24, duration * 0.08));
  const fadeOutStart = Math.max(0, duration - fadeDuration);
  const baseChain = sceneHasVisualAsset(scene)
    ? `[${index}:v]scale=1168:2076:force_original_aspect_ratio=increase:eval=frame,crop=1080:1920:x='(in_w-1080)/2-(t*5)':y='(in_h-1920)/2-(t*3)'`
    : `[${index}:v]format=yuv420p`;

  return `${baseChain},fade=t=in:st=0:d=${fadeDuration.toFixed(2)},fade=t=out:st=${fadeOutStart.toFixed(2)}:d=${fadeDuration.toFixed(2)},` +
    `drawtext=fontfile='${fontPath}':text='${badge}':fontcolor=#8FE7FF:fontsize=28:x=92:y=108,` +
    `drawtext=fontfile='${fontPath}':text='${title}':fontcolor=white:fontsize=78:line_spacing=18:x=92:y=246,` +
    `drawtext=fontfile='${fontPath}':text='${body}':fontcolor=white:fontsize=${bodyFontSize}:line_spacing=20:x=92:y=(h-text_h)/2:box=1:boxcolor=black@0.18:boxborderw=28[v${index}]`;
}

function buildSceneInputSpec(scene) {
  const duration = Number(scene.durationSec || 6).toFixed(2);

  if (sceneHasVisualAsset(scene)) {
    const assetPath = resolveSceneRenderableAssetPath(scene);
    return {
      inputLine: `-loop 1 -t ${duration} -i "${assetPath}"`,
    };
  }

  return {
    inputLine: `-f lavfi -t ${duration} -i color=c=${getSceneBackgroundColor(scene.visualType)}:s=1080x1920:r=30`,
  };
}

function sceneHasVisualAsset(scene) {
  const assetPath = resolveSceneRenderableAssetPath(scene).toLowerCase();
  return (
    assetPath.endsWith(".png") ||
    assetPath.endsWith(".jpg") ||
    assetPath.endsWith(".jpeg") ||
    assetPath.endsWith(".webp") ||
    assetPath.endsWith(".svg")
  );
}

function resolveSceneRenderableAssetPath(scene) {
  const assetPath = String(scene?.assetPath || "").trim();
  if (!assetPath) {
    return "";
  }

  const absoluteAssetPath = path.isAbsolute(assetPath) ? assetPath : path.join(rootDir, assetPath);
  if (absoluteAssetPath.toLowerCase().endsWith(".svg")) {
    const rasterizedAssetPath = `${absoluteAssetPath}.png`;
    if (existsSync(rasterizedAssetPath)) {
      return rasterizedAssetPath;
    }
  }

  return absoluteAssetPath;
}

function getSceneBackgroundColor(visualType) {
  if (visualType === "cover") {
    return "#0b1f33";
  }
  if (visualType === "chart") {
    return "#10212d";
  }
  if (visualType === "quote") {
    return "#151821";
  }
  if (visualType === "brand_outro") {
    return "#0a2d3c";
  }
  return "#11324d";
}

function getSceneBadge(visualType) {
  if (visualType === "cover") {
    return "OPEN";
  }
  if (visualType === "chart") {
    return "VARIABLE";
  }
  if (visualType === "quote") {
    return "POINT OF VIEW";
  }
  if (visualType === "brand_outro") {
    return "OUTRO";
  }
  return "SCENE";
}

function getSceneBodyFontSize(visualType) {
  if (visualType === "quote") {
    return 66;
  }
  if (visualType === "brand_outro") {
    return 54;
  }
  return 56;
}

function escapeDrawText(value) {
  return String(value)
    .replaceAll("\\", "\\\\")
    .replaceAll(":", "\\:")
    .replaceAll("'", "\\'")
    .replaceAll("%", "\\%");
}

function relativeMediaPath(filePath) {
  return path.relative(rootDir, filePath).split(path.sep).join("/");
}

async function writeTimelineFile(draftDir, timeline) {
  const timelinePath = path.join(draftDir, "timeline.json");
  await fs.writeFile(timelinePath, JSON.stringify(timeline || [], null, 2), "utf8");
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function normalizeDurationMode(value) {
  const numeric = Number(value);
  if (numeric === 60 || numeric === 120) {
    return numeric;
  }
  return 90;
}

function normalizeSourceType(value) {
  return String(value || "").trim() === "article" ? "article" : "topic";
}

function normalizeRewriteStyle(value) {
  const raw = String(value || "").trim();
  if (raw === "deep_analysis" || raw === "point_breakdown") {
    return raw;
  }
  return "industry_observation";
}

function getRewriteStyleProfile(style) {
  const normalized = normalizeRewriteStyle(style);
  if (normalized === "deep_analysis") {
    return {
      label: "深度解读",
      promptHint: "更强调变量、逻辑、因果链条和经营影响，语气沉稳，信息密度更高",
      coverFocus: "深度解读",
      coverKeyword: "逻辑与判断",
      ctaKeyword: "深度解读",
      articleTitleTail: "真正值得盯住的是背后的逻辑链",
      topicTitleTail: "真正值得看的是变量之间的联动",
      articleHook: "如果只做表面复述，视频会很散；真正值得留下来的，是它背后的逻辑链和经营含义。",
      descriptionFocus: "业务讨论的前台",
      analysisFocus: "变量之间真正有因果关系的那部分",
      structureHint: "发生了什么、背后逻辑是什么、企业该怎么判断",
      topicHookPrefix: "背后的逻辑链，而不只是",
      descriptionTrend: "重新拆解变量和风险收益结构",
      analysisSentence: "一旦其中一个环节变了，原来的增长路径、利润结构和终端策略都要重算。",
    };
  }

  if (normalized === "point_breakdown") {
    return {
      label: "观点拆解",
      promptHint: "更强调立场、判断、取舍和结论，表达更直接，但仍保持专业克制",
      coverFocus: "观点拆解",
      coverKeyword: "立场与取舍",
      ctaKeyword: "观点拆解",
      articleTitleTail: "关键不在表述，而在背后的立场",
      topicTitleTail: "企业下一步先要判断站位",
      articleHook: "如果只是复述原文，观点会被稀释；真正值得保留的，是它最终想指向的判断和取舍。",
      descriptionFocus: "判断层面",
      analysisFocus: "那些真正会影响立场和取舍的变量",
      structureHint: "出现了什么变化、为什么不能轻看、企业该站在哪边",
      topicHookPrefix: "企业取舍和判断，而不只是",
      descriptionTrend: "重新站队和重新判断",
      analysisSentence: "真正决定下一步动作的，不是热度高低，而是企业该站在哪一边、放大哪一个变量。",
    };
  }

  return {
    label: "行业观察",
    promptHint: "更像行业观察号，兼顾描述、分析和观点，表达克制完整",
    coverFocus: "行业观察",
    coverKeyword: "趋势与观点",
    ctaKeyword: "行业观察",
    articleTitleTail: "真正值得看的是背后的业务判断",
    topicTitleTail: "正在重塑 IVD 竞争逻辑",
    articleHook: "如果把这类内容直接做成文章复述，视频会很散；真正值得留下来的，是它对业务判断的那部分信息。",
    descriptionFocus: "业务判断的前台",
    analysisFocus: "能支撑判断的那条主线",
    structureHint: "发生了什么、为什么重要、下一步怎么判断",
    topicHookPrefix: "",
    descriptionTrend: "重新分配机会和风险",
    analysisSentence: "一旦其中一个环节变了，原来的增长路径和利润结构都要重算。",
  };
}

function inferTopicFromRawContent(rawContent, fallbackTopic = "") {
  const manualTopic = String(fallbackTopic || "").trim();
  if (manualTopic) {
    return manualTopic;
  }

  const firstLine = String(rawContent || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find(Boolean);

  if (!firstLine) {
    return "";
  }

  return firstLine.length > 30 ? `${firstLine.slice(0, 30)}...` : firstLine;
}

function truncateForPrompt(text, maxLength = 2800) {
  const source = String(text || "").trim();
  if (source.length <= maxLength) {
    return source;
  }
  return `${source.slice(0, maxLength)}\n\n[内容过长，后续部分已省略]`;
}

function extractArticleSignals(rawContent, fallbackTopic = "") {
  const lines = String(rawContent || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);

  if (!lines.length) {
    return null;
  }

  const topic = inferTopicFromRawContent(rawContent, fallbackTopic);
  const coverTitle = topic.length > 16 ? `${topic.slice(0, 16)}...` : topic;
  const bodyText = lines.slice(1).join(" ");
  const summarySource = bodyText || lines[0] || topic;
  const summary = summarySource.length > 42 ? `${summarySource.slice(0, 42)}...` : summarySource;
  const terms = summarySource.split(/[，。、；;：:\s]+/).map((item) => item.trim()).filter((item) => item.length >= 2);

  return {
    topic,
    coverTitle,
    summary,
    signalA: terms[0] || "行业变化",
    signalB: terms[1] || "业务逻辑变化",
  };
}

function getDurationProfile(durationMode) {
  if (durationMode === 60) {
    return { charRate: 3.7, minSec: 48, maxSec: 66 };
  }
  if (durationMode === 120) {
    return { charRate: 3.05, minSec: 108, maxSec: 132 };
  }
  return { charRate: 3.2, minSec: 78, maxSec: 102 };
}

function parseBatchTopicLine(line, fallbackDurationMode) {
  const raw = String(line || "").trim();
  if (!raw) {
    return null;
  }

  const parts = raw.split(/\s*[|｜]\s*/).map((item) => item.trim()).filter(Boolean);
  const topic = parts[0] || raw;
  const hasDuration = /^(60|90|120)$/.test(parts[1] || "");
  const durationMode = normalizeDurationMode(hasDuration ? parts[1] : fallbackDurationMode);
  const angle = hasDuration ? String(parts[2] || "").trim() : String(parts[1] || "").trim();
  const audience = hasDuration ? String(parts[3] || "").trim() : String(parts[2] || "").trim();

  return {
    topic,
    durationMode,
    angle,
    audience,
  };
}

async function commandExists(command) {
  try {
    await execFileAsync("bash", ["-lc", `command -v ${command}`]);
    return true;
  } catch {
    return false;
  }
}

function resolveLocalFfmpegPath() {
  try {
    return require("ffmpeg-static");
  } catch {
    return "";
  }
}

async function hasFfmpeg() {
  if (localFfmpegPath && (await fileExists(localFfmpegPath))) {
    return true;
  }

  return commandExists("ffmpeg");
}

async function getFfmpegPath() {
  if (localFfmpegPath && (await fileExists(localFfmpegPath))) {
    return localFfmpegPath;
  }

  if (await commandExists("ffmpeg")) {
    return "ffmpeg";
  }

  throw new Error("未检测到可用的 ffmpeg。");
}

async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

async function getLlmConfigPayload() {
  const config = await getLlmConfig();
  return { config: redactLlmConfig(config) };
}

async function saveLlmConfig(input) {
  const nextConfig = input?.config && typeof input.config === "object" ? input.config : {};
  const existingConfig = await readOptionalJson(llmConfigPath);
  const sanitized = sanitizeIncomingLlmConfig(nextConfig, existingConfig);
  await fs.writeFile(llmConfigPath, JSON.stringify(sanitized, null, 2), "utf8");
  return getLlmConfigPayload();
}

async function testLlmRoute(input) {
  const routeName = String(input?.routeName || "").trim();
  const allowedRoutes = new Set(["script", "storyboard", "image", "tts", "moderation"]);

  if (!allowedRoutes.has(routeName)) {
    throw new Error("无效的调用点。");
  }

  const defaults = buildDefaultLlmConfig();
  const existingConfig = await readOptionalJson(llmConfigPath);
  const incomingConfig = input?.config && typeof input.config === "object" ? input.config : {};
  const sanitized = sanitizeIncomingLlmConfig(incomingConfig, existingConfig);
  const mergedConfig = deepMerge(deepMerge(defaults, existingConfig), sanitized);
  const route = await resolveLlmRouteConfig(routeName, mergedConfig);
  const url = buildLlmRouteUrl(route);

  if (route.enabled === false) {
    return {
      ok: false,
      tone: "info",
      title: "该调用点当前未启用",
      message: "先勾选启用该调用点，再进行连接测试。",
    };
  }

  if (!route.model && !(routeName === "tts" && isDoubaoTtsProvider(route))) {
    return {
      ok: false,
      tone: "error",
      title: "缺少策略服务名",
      message: "请先填写风控服务名。",
    };
  }

  if (!url) {
    return {
      ok: false,
      tone: "error",
      title: "接口地址不完整",
      message: "请填写完整接口地址，或者同时填写相对路径和网关主地址。",
    };
  }

  if (!route.apiKey) {
    return {
      ok: false,
      tone: "error",
      title: routeName === "tts" && isDoubaoTtsProvider(route) ? "缺少 Access Token" : "缺少 API Key",
      message: routeName === "tts" && isDoubaoTtsProvider(route) ? "豆包语音需要在高级设置里补充 Access Token 后再测试。" : "请在高级设置里补充 API Key 后再测试。",
    };
  }

  if (routeName === "image" && isVolcengineJimengImageProvider(route) && !route.secretKey) {
    return {
      ok: false,
      tone: "error",
      title: "缺少 Secret Key",
      message: "即梦官方异步接口需要同时填写 Access Key ID 和 Secret Key。",
    };
  }

  if (routeName === "image" && isVolcengineJimengImageProvider(route) && !route.queryEndpoint) {
    return {
      ok: false,
      tone: "error",
      title: "缺少查询接口地址",
      message: "即梦官方异步接口需要填写查询任务结果的接口地址。",
    };
  }

  if (routeName === "tts" && isDoubaoTtsProvider(route) && !route.appId) {
    return {
      ok: false,
      tone: "error",
      title: "缺少 App ID",
      message: "豆包语音需要在高级设置里补充 App ID。",
    };
  }

  if (routeName === "tts" && isDoubaoTtsProvider(route) && !route.resourceId) {
    return {
      ok: false,
      tone: "error",
      title: "缺少资源 ID",
      message: "豆包语音需要在高级设置里补充资源 ID，例如 seed-tts-2.0。",
    };
  }

  try {
    if (routeName === "image" && isVolcengineJimengImageProvider(route)) {
      await generateJimengImageBase64(route, "蓝色正方形，极简背景");
      return {
        ok: true,
        tone: "success",
        title: "连接测试通过",
        message: "即梦任务提交和轮询查询都已通过。",
      };
    }

    const response = await fetchWithRoute(route, url, buildRouteTestRequest(routeName, route));

    if (response.status === 401 || response.status === 403) {
      return {
        ok: false,
        tone: "warning",
        title: "服务可达，但鉴权失败",
        message: `已连接到目标接口，但返回了 ${response.status}。请检查 API Key、鉴权头或鉴权方式。`,
      };
    }

    if (response.status === 404) {
      return {
        ok: false,
        tone: "warning",
        title: "服务可达，但接口地址可能不对",
        message: "已经连到目标服务，但返回 404。请检查接口地址或网关路由。",
      };
    }

    if (response.ok || [400, 405, 415, 422].includes(response.status)) {
      return {
        ok: true,
        tone: "success",
        title: "连接测试通过",
        message: `已连接到目标服务。当前返回状态为 ${response.status}，说明该地址可达。`,
      };
    }

    return {
      ok: false,
      tone: "warning",
      title: "服务可达，但返回异常状态",
      message: `已连接到目标服务，但返回了 ${response.status}。建议再检查接口兼容性。`,
    };
  } catch (error) {
    return {
      ok: false,
      tone: "error",
      title: "连接失败",
      message: error instanceof Error ? error.message : "无法连接到目标服务。",
    };
  }
}

function buildRouteTestRequest(routeName, route) {
  if (routeName === "image") {
    return buildImageRequest(route, "simple blue square");
  }

  if (routeName === "tts") {
    return buildTtsRequest(route, "测试");
  }

  if (routeName === "moderation") {
    return buildModerationRequest(route, "测试内容");
  }

  return {
    method: "POST",
    headers: buildLlmHeaders(route),
    body: JSON.stringify(buildScriptRequestBody(route, '只返回 {"ok":true} 这一段 JSON。')),
  };
}

async function getLlmConfig() {
  const defaults = buildDefaultLlmConfig();
  const fileConfig = await readOptionalJson(llmConfigPath);
  return deepMerge(defaults, fileConfig);
}

function buildDefaultLlmConfig() {
  return {
    script: {
      provider: envValue("OPENAI_TEXT_PROVIDER", envValue("LLM_BASE_PROVIDER", "openai-compatible")),
      baseURL: envValue("OPENAI_TEXT_BASE_URL", envValue("OPENAI_BASE_URL", "https://api.openai.com")),
      apiKey: envValue("OPENAI_TEXT_API_KEY", envValue("OPENAI_API_KEY", "")),
      authHeader: envValue("OPENAI_TEXT_AUTH_HEADER", envValue("OPENAI_AUTH_HEADER", "Authorization")),
      authScheme: envValue("OPENAI_TEXT_AUTH_SCHEME", envValue("OPENAI_AUTH_SCHEME", "Bearer")),
      timeoutSec: envValue("OPENAI_TEXT_TIMEOUT_SEC", "20"),
      enabled: true,
      apiKind: envValue("OPENAI_TEXT_API_KIND", "responses"),
      endpoint: envValue("OPENAI_TEXT_ENDPOINT", "/v1/responses"),
      model: envValue("OPENAI_TEXT_MODEL", "gpt-5.2"),
    },
    storyboard: {
      provider: envValue("OPENAI_STORYBOARD_PROVIDER", envValue("LLM_BASE_PROVIDER", "openai-compatible")),
      baseURL: envValue("OPENAI_STORYBOARD_BASE_URL", envValue("OPENAI_BASE_URL", "https://api.openai.com")),
      apiKey: envValue("OPENAI_STORYBOARD_API_KEY", envValue("OPENAI_API_KEY", "")),
      authHeader: envValue("OPENAI_STORYBOARD_AUTH_HEADER", envValue("OPENAI_AUTH_HEADER", "Authorization")),
      authScheme: envValue("OPENAI_STORYBOARD_AUTH_SCHEME", envValue("OPENAI_AUTH_SCHEME", "Bearer")),
      timeoutSec: envValue("OPENAI_STORYBOARD_TIMEOUT_SEC", "25"),
      enabled: true,
      apiKind: envValue("OPENAI_STORYBOARD_API_KIND", envValue("OPENAI_TEXT_API_KIND", "responses")),
      endpoint: envValue("OPENAI_STORYBOARD_ENDPOINT", envValue("OPENAI_TEXT_ENDPOINT", "/v1/responses")),
      model: envValue("OPENAI_STORYBOARD_MODEL", envValue("OPENAI_TEXT_MODEL", "gpt-5.2")),
    },
    image: {
      provider: envValue("OPENAI_IMAGE_PROVIDER", envValue("LLM_BASE_PROVIDER", "openai-compatible")),
      baseURL: envValue("OPENAI_IMAGE_BASE_URL", envValue("OPENAI_BASE_URL", "https://api.openai.com")),
      apiKey: envValue("OPENAI_IMAGE_API_KEY", envValue("OPENAI_API_KEY", "")),
      secretKey: envValue("OPENAI_IMAGE_SECRET_KEY", envValue("VOLCENGINE_IMAGE_SECRET_KEY", "")),
      region: envValue("OPENAI_IMAGE_REGION", envValue("VOLCENGINE_IMAGE_REGION", "cn-north-1")),
      service: envValue("OPENAI_IMAGE_SERVICE", envValue("VOLCENGINE_IMAGE_SERVICE", "cv")),
      pollIntervalMs: envValue("OPENAI_IMAGE_POLL_INTERVAL_MS", "1200"),
      pollAttempts: envValue("OPENAI_IMAGE_POLL_ATTEMPTS", "15"),
      authHeader: envValue("OPENAI_IMAGE_AUTH_HEADER", envValue("OPENAI_AUTH_HEADER", "Authorization")),
      authScheme: envValue("OPENAI_IMAGE_AUTH_SCHEME", envValue("OPENAI_AUTH_SCHEME", "Bearer")),
      timeoutSec: envValue("OPENAI_IMAGE_TIMEOUT_SEC", "45"),
      enabled: true,
      apiKind: envValue("OPENAI_IMAGE_API_KIND", "native"),
      endpoint: envValue("OPENAI_IMAGE_ENDPOINT", "/v1/images/generations"),
      model: envValue("OPENAI_IMAGE_MODEL", "gpt-image-1"),
      quality: envValue("OPENAI_IMAGE_QUALITY", "high"),
      size: envValue("OPENAI_IMAGE_SIZE", "1024x1536"),
      outputFormat: envValue("OPENAI_IMAGE_OUTPUT_FORMAT", "png"),
    },
    tts: {
      provider: envValue("OPENAI_TTS_PROVIDER", envValue("LLM_BASE_PROVIDER", "openai-compatible")),
      baseURL: envValue("OPENAI_TTS_BASE_URL", envValue("OPENAI_BASE_URL", "https://api.openai.com")),
      apiKey: envValue("OPENAI_TTS_API_KEY", envValue("OPENAI_API_KEY", "")),
      appId: envValue("OPENAI_TTS_APP_ID", envValue("VOLCENGINE_TTS_APP_ID", "")),
      resourceId: envValue("OPENAI_TTS_RESOURCE_ID", envValue("VOLCENGINE_TTS_RESOURCE_ID", "seed-tts-2.0")),
      authHeader: envValue("OPENAI_TTS_AUTH_HEADER", envValue("OPENAI_AUTH_HEADER", "Authorization")),
      authScheme: envValue("OPENAI_TTS_AUTH_SCHEME", envValue("OPENAI_AUTH_SCHEME", "Bearer")),
      timeoutSec: envValue("OPENAI_TTS_TIMEOUT_SEC", "45"),
      enabled: true,
      apiKind: envValue("OPENAI_TTS_API_KIND", "native"),
      endpoint: envValue("OPENAI_TTS_ENDPOINT", "/v1/audio/speech"),
      model: envValue("OPENAI_TTS_MODEL", "tts-1-hd"),
      voice: envValue("OPENAI_TTS_VOICE", "alloy"),
      format: envValue("OPENAI_TTS_FORMAT", "mp3"),
    },
    moderation: {
      provider: envValue("OPENAI_MODERATION_PROVIDER", "volcengine-medical-risk"),
      baseURL: envValue("OPENAI_MODERATION_BASE_URL", envValue("VOLCENGINE_MODERATION_BASE_URL", "https://visual.volcengineapi.com")),
      apiKey: envValue("OPENAI_MODERATION_API_KEY", envValue("VOLCENGINE_MODERATION_AK", "")),
      secretKey: envValue("OPENAI_MODERATION_SECRET_KEY", envValue("VOLCENGINE_MODERATION_SK", "")),
      region: envValue("OPENAI_MODERATION_REGION", envValue("VOLCENGINE_MODERATION_REGION", "cn-north-1")),
      service: envValue("OPENAI_MODERATION_SERVICE", envValue("VOLCENGINE_MODERATION_SERVICE", "cv")),
      authHeader: envValue("OPENAI_MODERATION_AUTH_HEADER", "Authorization"),
      authScheme: envValue("OPENAI_MODERATION_AUTH_SCHEME", "HMAC-SHA256"),
      timeoutSec: envValue("OPENAI_MODERATION_TIMEOUT_SEC", "15"),
      enabled: true,
      apiKind: envValue("OPENAI_MODERATION_API_KIND", "native"),
      endpoint: envValue("OPENAI_MODERATION_ENDPOINT", "/?Action=TextRisk&Version=2022-08-31"),
      model: envValue("OPENAI_MODERATION_MODEL", "text_risk"),
      serviceName: envValue("OPENAI_MODERATION_SERVICE_NAME", "text_risk"),
      scene: envValue("OPENAI_MODERATION_SCENE", "ad_compliance"),
      strategyId: envValue("OPENAI_MODERATION_STRATEGY_ID", ""),
      textCheckers: envValue("OPENAI_MODERATION_TEXT_CHECKERS", "medical_fake_ad,drug_forbidden,doctor_qualification"),
      imageCheckers: envValue("OPENAI_MODERATION_IMAGE_CHECKERS", "uncomfortable,ocr"),
    },
  };
}

async function resolveLlmRouteConfig(routeName, fullConfig = null) {
  const config = fullConfig || (await getLlmConfig());
  const base = config.base || {};
  const route = config[routeName] || {};
  const merged = deepMerge(base, route);
  const defaultApiKind = routeName === "script" || routeName === "storyboard" ? "responses" : "native";
  return {
    ...merged,
    routeName,
    apiKind: normalizeApiKind(merged.apiKind || defaultApiKind),
    baseURL: normalizeUrlLikeValue(merged.baseURL),
    endpoint: normalizeUrlLikeValue(merged.endpoint),
    queryEndpoint: normalizeUrlLikeValue(merged.queryEndpoint),
    apiKey: String(merged.apiKey || "").trim(),
    secretKey: String(merged.secretKey || "").trim(),
    region: String(merged.region || "").trim(),
    service: String(merged.service || "").trim(),
    pollIntervalMs: String(merged.pollIntervalMs || "").trim(),
    pollAttempts: String(merged.pollAttempts || "").trim(),
    appId: String(merged.appId || "").trim(),
    resourceId: String(merged.resourceId || "").trim(),
    authHeader: String(merged.authHeader || "Authorization").trim(),
    authScheme: String(merged.authScheme || "Bearer").trim(),
    timeoutSec: String(merged.timeoutSec || "").trim(),
    model: String(merged.model || "").trim(),
  };
}

async function isLlmRouteEnabledByName(routeName) {
  return isLlmRouteEnabled(await resolveLlmRouteConfig(routeName));
}

function isLlmRouteEnabled(route) {
  if (!route || route.enabled === false || !route.apiKey || !buildLlmRouteUrl(route)) {
    return false;
  }
  if (route.routeName === "image" && isVolcengineJimengImageProvider(route)) {
    return Boolean(route.secretKey && route.model && route.queryEndpoint);
  }
  if (route.routeName === "tts" && isDoubaoTtsProvider(route)) {
    return Boolean(route.appId && route.resourceId);
  }
  return Boolean(route.model);
}

function normalizeApiKind(value) {
  if (value === "chat_completions" || value === "responses" || value === "native") {
    return value;
  }
  return "responses";
}

function normalizeUrlLikeValue(value) {
  return String(value || "").trim().replace(/\s+/g, "");
}

function normalizeRouteEndpoint(route, endpoint) {
  const raw = String(endpoint || "").trim();
  if (!raw) {
    return raw;
  }

  if (route?.apiKind && route.apiKind !== "native") {
    return raw;
  }

  const expectedPath = getExpectedRoutePath(route?.routeName, route?.model);
  if (!expectedPath) {
    return raw;
  }

  if (/^https?:\/\//.test(raw)) {
    try {
      const url = new URL(raw);
      if (url.pathname === "/v1/chat/completions" || url.pathname === "/v1/responses") {
        url.pathname = expectedPath;
        return url.toString();
      }
    } catch {
      return raw;
    }
  }

  if (raw === "/v1/chat/completions" || raw === "/v1/responses") {
    return expectedPath;
  }

  return raw;
}

function getExpectedRoutePath(routeName, model = "") {
  if (routeName === "image" || /^gpt-image/i.test(String(model || ""))) {
    return "/v1/images/generations";
  }

  if (routeName === "tts" || /^tts-/i.test(String(model || ""))) {
    return "/v1/audio/speech";
  }

  if (routeName === "moderation" || /moderation/i.test(String(model || ""))) {
    return "/v1/moderations";
  }

  return "";
}

function buildLlmRouteUrl(route) {
  const endpoint = String(route?.endpoint || "").trim();
  const baseURL = String(route?.baseURL || "").trim();
  const normalizedEndpoint = normalizeRouteEndpoint(route, endpoint);

  if (/^https?:\/\//.test(normalizedEndpoint)) {
    return normalizedEndpoint;
  }

  if (!baseURL || !normalizedEndpoint) {
    return "";
  }

  return `${baseURL.replace(/\/+$/, "")}/${normalizedEndpoint.replace(/^\/+/, "")}`;
}

function buildLlmHeaders(route) {
  const headers = { "Content-Type": "application/json" };
  if (route?.apiKey) {
    headers[route.authHeader || "Authorization"] = route.authScheme ? `${route.authScheme} ${route.apiKey}` : route.apiKey;
  }
  return headers;
}

async function fetchWithRoute(route, url, options = {}) {
  const timeoutMs = resolveRouteTimeoutMs(route);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(new Error("timeout")), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error?.name === "AbortError" || error?.message === "timeout" || error?.cause?.message === "timeout") {
      throw new Error(`${getRouteDisplayName(route?.routeName)}请求超时（>${Math.round(timeoutMs / 1000)} 秒）`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function resolveRouteTimeoutMs(route) {
  const routeName = route?.routeName || "";
  const fallbackSec = routeName === "image" || routeName === "tts" ? 45 : routeName === "moderation" ? 15 : routeName === "storyboard" ? 25 : 20;
  const parsed = Number(route?.timeoutSec);
  const timeoutSec = Number.isFinite(parsed) && parsed > 0 ? parsed : fallbackSec;
  return timeoutSec * 1000;
}

function getRouteDisplayName(routeName) {
  if (routeName === "storyboard") {
    return "分镜模型";
  }
  if (routeName === "image") {
    return "图片模型";
  }
  if (routeName === "tts") {
    return "配音模型";
  }
  if (routeName === "moderation") {
    return "风控策略";
  }
  return "文案模型";
}

async function runMedicalModerationChecks(draft, route) {
  if (!isLlmRouteEnabled(route) || !isVolcengineMedicalRiskProvider(route)) {
    return [];
  }

  const scriptText = [
    draft.title,
    draft.coverTitle,
    draft.coverSubtitle,
    draft.hook,
    ...(draft.sections || []),
    draft.cta,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const response = await fetchWithRoute(route, buildLlmRouteUrl(route), buildModerationRequest(route, scriptText));
    if (!response.ok) {
      return [{ level: "warning", label: "医疗合规预检异常", detail: `火山审核接口返回 ${response.status}，建议在控制台复核策略和鉴权。` }];
    }
    const data = await response.json();
    const result = normalizeMedicalModerationResult(data);

    if (result.decision === "pass") {
      return [{ level: "success", label: "医疗文案预检通过", detail: `已按 ${route.scene || "ad_compliance"} 场景完成文本预检。` }];
    }

    if (result.decision === "review") {
      return [{
        level: "warning",
        label: "医疗文案建议人工复核",
        detail: `命中风险标签：${result.labels.join("、") || "未返回标签"}。建议在发布前人工确认医学合规表达。`,
      }];
    }

    return [{
      level: "error",
      label: "医疗文案预检未通过",
      detail: `命中风险标签：${result.labels.join("、") || "未返回标签"}。请先修改文案，再继续导出。`,
    }];
  } catch (error) {
    return [{
      level: "warning",
      label: "医疗合规预检失败",
      detail: error instanceof Error ? error.message : "无法连接火山审核接口。",
    }];
  }
}

function normalizeMedicalModerationResult(data) {
  const decision = String(
    data?.data?.decision ||
    data?.decision ||
    data?.result?.decision ||
    "review"
  ).trim().toLowerCase();
  const results = data?.data?.results || data?.results || data?.result?.results || [];
  const labels = Array.isArray(results)
    ? results
        .map((item) => String(item?.label || item?.name || item?.risk_name || "").trim())
        .filter(Boolean)
    : [];
  return { decision, labels };
}

function buildRuntimeLlmSummary(config, routes) {
  return {
    script: summarizeLlmRoute(routes.scriptRoute),
    storyboard: summarizeLlmRoute(routes.storyboardRoute),
    image: summarizeLlmRoute(routes.imageRoute),
    tts: summarizeLlmRoute(routes.ttsRoute),
    moderation: summarizeLlmRoute(routes.moderationRoute),
  };
}

function summarizeLlmRoute(route) {
  const normalizedEndpoint = normalizeRouteEndpoint(route, route?.endpoint || "");
  const effectiveUrl = buildLlmRouteUrl({
    ...route,
    endpoint: normalizedEndpoint,
  });

  return {
    enabled: isLlmRouteEnabled(route),
    provider: route?.provider || "",
    apiKind: route?.apiKind || "",
    endpoint: normalizedEndpoint,
    effectiveUrl,
    baseURL: route?.baseURL || "",
    model: route?.model || "",
    serviceName: route?.serviceName || "",
    scene: route?.scene || "",
    strategyId: route?.strategyId || "",
  };
}

function redactLlmConfig(config) {
  return JSON.parse(JSON.stringify(config, (key, value) => {
    if ((key === "apiKey" || key === "secretKey") && value) {
      return "***";
    }
    return value;
  }));
}

async function readOptionalJson(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function sanitizeIncomingLlmConfig(nextConfig, existingConfig) {
  if (Array.isArray(nextConfig)) {
    return nextConfig.map((item, index) => sanitizeIncomingLlmConfig(item, existingConfig?.[index]));
  }

  if (!nextConfig || typeof nextConfig !== "object") {
    if (nextConfig === "***") {
      return existingConfig;
    }

    return nextConfig;
  }

  const result = {};

  for (const [key, value] of Object.entries(nextConfig)) {
    const sanitizedValue = sanitizeIncomingLlmConfig(value, existingConfig?.[key]);

    if (sanitizedValue === undefined) {
      continue;
    }

    result[key] = sanitizedValue;
  }

  return result;
}

function deepMerge(base, override) {
  const result = { ...base };

  for (const [key, value] of Object.entries(override || {})) {
    if (value && typeof value === "object" && !Array.isArray(value) && base?.[key] && typeof base[key] === "object" && !Array.isArray(base[key])) {
      result[key] = deepMerge(base[key], value);
    } else {
      result[key] = value;
    }
  }

  return result;
}

function envValue(name, fallback = "") {
  return process.env[name] || fallback;
}

async function loadLocalEnv() {
  const envPath = path.join(rootDir, ".env.local");

  try {
    const raw = await fs.readFile(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const eqIndex = trimmed.indexOf("=");
      if (eqIndex < 0) {
        continue;
      }

      const key = trimmed.slice(0, eqIndex).trim();
      let value = trimmed.slice(eqIndex + 1).trim();

      if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
        value = value.slice(1, -1);
      }

      if (key && !process.env[key]) {
        process.env[key] = value;
      }
    }
  } catch (error) {
    if (!(error instanceof Error) || !String(error.message).includes("ENOENT")) {
      throw error;
    }
  }
}
