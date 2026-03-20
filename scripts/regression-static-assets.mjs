import assert from "node:assert/strict";

const { createAppServer } = await import("../src/server/http.js");

const server = createAppServer();
const summary = [];

try {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  const address = server.address();
  assert.ok(address && typeof address === "object" && address.port, "回归服务未拿到可用端口");

  const baseUrl = `http://127.0.0.1:${address.port}`;
  const checks = [
    {
      path: "/",
      type: "text/html; charset=utf-8",
      pattern: "/app.js?v=",
      label: "entry-index",
    },
    {
      path: "/admin",
      type: "text/html; charset=utf-8",
      pattern: "/admin.js?v=",
      label: "entry-admin",
    },
    {
      path: "/app.js?v=regression",
      type: "application/javascript; charset=utf-8",
      pattern: './shared/api-client.js',
      label: "app-shell",
    },
    {
      path: "/admin.js?v=regression",
      type: "application/javascript; charset=utf-8",
      pattern: './shared/api-client.js',
      label: "admin-shell",
    },
    {
      path: "/shared/api-client.js",
      type: "application/javascript; charset=utf-8",
      pattern: "export async function postJson",
      label: "module-api-client",
    },
    {
      path: "/app/content-panels.js",
      type: "application/javascript; charset=utf-8",
      pattern: "export function buildScriptViewHtml",
      label: "module-content-panels",
    },
    {
      path: "/app/history-panel.js",
      type: "application/javascript; charset=utf-8",
      pattern: "export function renderHistorySummary",
      label: "module-history-panel",
    },
    {
      path: "/app/quality-panel.js",
      type: "application/javascript; charset=utf-8",
      pattern: "export function renderQualityOverview",
      label: "module-quality-panel",
    },
    {
      path: "/app/editor-state.js",
      type: "application/javascript; charset=utf-8",
      pattern: "export function cloneStoryboard",
      label: "module-editor-state",
    },
  ];

  for (const check of checks) {
    const response = await fetch(`${baseUrl}${check.path}`);
    const body = await response.text();
    assert.equal(response.status, 200, `${check.path} 返回 ${response.status}`);
    assert.equal(response.headers.get("content-type"), check.type, `${check.path} content-type 不匹配`);
    assert.ok(body.includes(check.pattern), `${check.path} 未命中关键内容: ${check.pattern}`);
    summary.push(`${check.label}: ok`);
  }

  for (const line of summary) {
    console.log(line);
  }
} finally {
  await new Promise((resolve) => server.close(resolve));
}
