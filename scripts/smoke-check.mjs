const args = new Set(process.argv.slice(2));
const draftIdArg = process.argv.slice(2).find((arg) => arg.startsWith("--draft="));
const baseUrlArg = process.argv.slice(2).find((arg) => arg.startsWith("--base-url="));
const comboIdArg = process.argv.slice(2).find((arg) => arg.startsWith("--combo="));
const sceneIdArg = process.argv.slice(2).find((arg) => arg.startsWith("--scene="));
const stageArg = process.argv.slice(2).find((arg) => arg.startsWith("--stage="));

const baseUrl = (baseUrlArg ? baseUrlArg.split("=").slice(1).join("=") : "http://127.0.0.1:3016").replace(/\/+$/, "");
const draftId = draftIdArg ? draftIdArg.split("=").slice(1).join("=") : "";
const comboId = comboIdArg ? comboIdArg.split("=").slice(1).join("=") : "";
const sceneId = sceneIdArg ? sceneIdArg.split("=").slice(1).join("=") : "";
const stage = stageArg ? stageArg.split("=").slice(1).join("=") : "";
const shouldExport = args.has("--export");

async function main() {
  const summary = [];

  const statusData = await fetchJson(`${baseUrl}/api/status`);
  const runtime = statusData.runtime || {};
  summary.push(`status: ok (${runtime.mode || "unknown"} mode, ffmpeg=${String(runtime.ffmpegInstalled)})`);

  if (draftId) {
    const draftData = await fetchJson(`${baseUrl}/api/drafts/${encodeURIComponent(draftId)}`);
    const draft = draftData.draft || {};
    summary.push(
      `draft: ok (${draft.id}, cover=${draft.assets?.coverType || "unknown"}, voice=${draft.assets?.voiceFormat || "unknown"}, stage=${draft.productionStage || "unknown"})`,
    );

    if (stage) {
      const stageData = await postJson(`${baseUrl}/api/drafts/meta`, { draftId, productionStage: stage });
      const persistedStage = stageData.draft?.productionStage || "unknown";
      if (persistedStage !== stage) {
        throw new Error(`stage failed: expected ${stage}, got ${persistedStage}`);
      }
      const reloaded = await fetchJson(`${baseUrl}/api/drafts/${encodeURIComponent(draftId)}`);
      const reloadedStage = reloaded.draft?.productionStage || "unknown";
      if (reloadedStage !== stage) {
        throw new Error(`stage reload failed: expected ${stage}, got ${reloadedStage}`);
      }
      summary.push(`stage: ok (${stage})`);
    }

    if (comboId) {
      const comboData = await postJson(`${baseUrl}/api/combo`, { draftId, comboId });
      const comboDraft = comboData.draft || {};
      summary.push(
        `combo: ok (${comboId}, active=${comboDraft.activeTitleVariant || "unknown"}-${comboDraft.coverStyle || "unknown"})`,
      );
    }

    if (sceneId) {
      const sceneData = await postJson(`${baseUrl}/api/drafts/scene-regenerate`, { draftId, sceneId });
      const nextScene = (sceneData.draft?.storyboard || []).find((item) => item.id === sceneId);
      summary.push(`scene: ok (${sceneId}, asset=${nextScene?.assetType || "unknown"})`);
    }

    if (shouldExport) {
      const exportData = await postJson(`${baseUrl}/api/export`, { draftId });
      if (!exportData.exported) {
        throw new Error(`export failed: ${exportData.message || "unknown error"}`);
      }
      summary.push(`export: ok (${exportData.outputVideoPath || "no output path"})`);
    }
  }

  for (const line of summary) {
    console.log(line);
  }
}

async function fetchJson(url) {
  const response = await fetch(url);
  const text = await response.text();
  const data = safeJsonParse(text);

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${data?.error || text}`);
  }

  return data;
}

async function postJson(url, payload) {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const text = await response.text();
  const data = safeJsonParse(text);

  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText}: ${data?.error || text}`);
  }

  return data;
}

function safeJsonParse(text) {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
});
