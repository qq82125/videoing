import { createServer } from "node:http";
import path from "node:path";
import { promises as fs } from "node:fs";

import {
  publicDir,
  rootDir,
  createDraft,
  generateDraftBatch,
  exportDraft,
  switchDraftCoverStyle,
  switchDraftTitleVariant,
  applyDraftCombo,
  listDrafts,
  getDraft,
  updateDraftContent,
  syncDraftAudio,
  syncDraftCover,
  selectDraftCoverBackground,
  toggleDraftCoverBackgroundStar,
  saveDraftContent,
  updateDraftMeta,
  checkDraftQuality,
  regenerateDraftScene,
  getRuntimeStatus,
  getLlmConfigPayload,
  saveLlmConfig,
  testLlmRoute,
} from "./workflow.js";

export function createAppServer() {
  return createServer(async (req, res) => {
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

      if (req.method === "GET" && url.pathname.startsWith("/shared/")) {
        return serveFile(path.join(publicDir, url.pathname.replace(/^\/+/, "")), getContentType(url.pathname), res);
      }

      if (req.method === "GET" && url.pathname.startsWith("/app/")) {
        return serveFile(path.join(publicDir, url.pathname.replace(/^\/+/, "")), getContentType(url.pathname), res);
      }

      if (req.method === "GET") {
        const served = await tryServePublicAsset(url.pathname, res);
        if (served) {
          return;
        }
      }

      if (req.method === "GET" && url.pathname.startsWith("/media/")) {
        const relativeMediaPath = url.pathname.replace(/^\/media\/+/, "");
        const filePath = path.join(rootDir, relativeMediaPath);
        return serveBinary(filePath, res);
      }

      if (req.method === "POST" && url.pathname === "/api/generate") {
        const body = await readJsonBody(req);
        return sendJson(res, 200, await createDraft(body));
      }

      if (req.method === "POST" && url.pathname === "/api/generate-batch") {
        const body = await readJsonBody(req);
        return sendJson(res, 200, await generateDraftBatch(body));
      }

      if (req.method === "POST" && url.pathname === "/api/export") {
        const body = await readJsonBody(req);
        return sendJson(res, 200, await exportDraft(body.draftId));
      }

      if (req.method === "POST" && url.pathname === "/api/cover-style") {
        const body = await readJsonBody(req);
        return sendJson(res, 200, await switchDraftCoverStyle(body.draftId, body.coverStyle));
      }

      if (req.method === "POST" && url.pathname === "/api/title-variant") {
        const body = await readJsonBody(req);
        return sendJson(res, 200, await switchDraftTitleVariant(body.draftId, body.titleVariant));
      }

      if (req.method === "POST" && url.pathname === "/api/combo") {
        const body = await readJsonBody(req);
        return sendJson(res, 200, await applyDraftCombo(body.draftId, body.comboId));
      }

      if (req.method === "GET" && url.pathname === "/api/drafts") {
        return sendJson(res, 200, await listDrafts({
          q: url.searchParams.get("q") || "",
          workflowStatus: url.searchParams.get("workflowStatus") || "",
          productionStage: url.searchParams.get("productionStage") || "",
          starred: url.searchParams.get("starred") || "",
          sort: url.searchParams.get("sort") || "",
        }));
      }

      if (req.method === "GET" && url.pathname.startsWith("/api/drafts/")) {
        const draftId = decodeURIComponent(url.pathname.replace("/api/drafts/", ""));
        return sendJson(res, 200, await getDraft(draftId));
      }

      if (req.method === "POST" && url.pathname === "/api/drafts/update") {
        const body = await readJsonBody(req);
        return sendJson(res, 200, await updateDraftContent(body));
      }

      if (req.method === "POST" && url.pathname === "/api/drafts/sync-audio") {
        const body = await readJsonBody(req);
        return sendJson(res, 200, await syncDraftAudio(body));
      }

      if (req.method === "POST" && url.pathname === "/api/drafts/sync-cover") {
        const body = await readJsonBody(req);
        return sendJson(res, 200, await syncDraftCover(body));
      }

      if (req.method === "POST" && url.pathname === "/api/drafts/select-cover-background") {
        const body = await readJsonBody(req);
        return sendJson(res, 200, await selectDraftCoverBackground(body));
      }

      if (req.method === "POST" && url.pathname === "/api/drafts/toggle-cover-background-star") {
        const body = await readJsonBody(req);
        return sendJson(res, 200, await toggleDraftCoverBackgroundStar(body));
      }

      if (req.method === "POST" && url.pathname === "/api/drafts/save-content") {
        const body = await readJsonBody(req);
        return sendJson(res, 200, await saveDraftContent(body));
      }

      if (req.method === "POST" && url.pathname === "/api/drafts/meta") {
        const body = await readJsonBody(req);
        return sendJson(res, 200, await updateDraftMeta(body));
      }

      if (req.method === "POST" && url.pathname === "/api/drafts/check") {
        const body = await readJsonBody(req);
        return sendJson(res, 200, await checkDraftQuality(body.draftId));
      }

      if (req.method === "POST" && url.pathname === "/api/drafts/scene-regenerate") {
        const body = await readJsonBody(req);
        return sendJson(res, 200, await regenerateDraftScene(body));
      }

      if (req.method === "GET" && url.pathname === "/api/status") {
        return sendJson(res, 200, await getRuntimeStatus());
      }

      if (req.method === "GET" && url.pathname === "/api/llm-config") {
        return sendJson(res, 200, await getLlmConfigPayload());
      }

      if (req.method === "POST" && url.pathname === "/api/llm-config") {
        const body = await readJsonBody(req);
        return sendJson(res, 200, await saveLlmConfig(body));
      }

      if (req.method === "POST" && url.pathname === "/api/llm-config/test") {
        const body = await readJsonBody(req);
        return sendJson(res, 200, await testLlmRoute(body));
      }

      return sendJson(res, 404, { error: "Not found" });
    } catch (error) {
      return sendJson(res, 500, {
        error: error instanceof Error ? error.message : "Unknown server error",
      });
    }
  });
}

async function serveFile(filePath, contentType, res) {
  try {
    const content = await fs.readFile(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

async function tryServePublicAsset(requestPath, res) {
  const normalizedPath = path.posix.normalize(String(requestPath || ""));
  if (!normalizedPath.startsWith("/") || normalizedPath === "/") {
    return false;
  }

  const assetPath = path.resolve(publicDir, `.${normalizedPath}`);
  const publicRoot = `${path.resolve(publicDir)}${path.sep}`;
  if (!assetPath.startsWith(publicRoot)) {
    return false;
  }

  try {
    const stat = await fs.stat(assetPath);
    if (!stat.isFile()) {
      return false;
    }
  } catch {
    return false;
  }

  return serveFile(assetPath, getContentType(assetPath), res).then(() => true);
}

async function serveBinary(filePath, res) {
  try {
    const content = await fs.readFile(filePath);
    const contentType = getContentType(filePath);
    res.writeHead(200, { "Content-Type": contentType });
    res.end(content);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found");
  }
}

async function readJsonBody(req) {
  const chunks = [];
  for await (const chunk of req) {
    chunks.push(chunk);
  }

  const raw = Buffer.concat(chunks).toString("utf8");
  return raw ? JSON.parse(raw) : {};
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": "application/json; charset=utf-8" });
  res.end(JSON.stringify(payload));
}

function getContentType(filePath) {
  const lower = String(filePath || "").toLowerCase();
  if (lower.endsWith(".html")) return "text/html; charset=utf-8";
  if (lower.endsWith(".js") || lower.endsWith(".mjs")) return "application/javascript; charset=utf-8";
  if (lower.endsWith(".css")) return "text/css; charset=utf-8";
  if (lower.endsWith(".json")) return "application/json; charset=utf-8";
  if (lower.endsWith(".svg")) return "image/svg+xml; charset=utf-8";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  if (lower.endsWith(".webp")) return "image/webp";
  if (lower.endsWith(".mp3")) return "audio/mpeg";
  if (lower.endsWith(".wav")) return "audio/wav";
  if (lower.endsWith(".aiff") || lower.endsWith(".aif")) return "audio/aiff";
  if (lower.endsWith(".mp4")) return "video/mp4";
  return "application/octet-stream";
}
