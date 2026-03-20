export async function postJson(url, payload) {
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "请求失败");
    }
    return data;
  } catch (error) {
    throw new Error(normalizeRequestError(error));
  }
}

export async function fetchJson(url) {
  try {
    const response = await fetch(url, { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "请求失败");
    }
    return data;
  } catch (error) {
    throw new Error(normalizeRequestError(error));
  }
}

export function normalizeRequestError(error) {
  const message = String(error?.message || "");
  const normalized = message.toLowerCase();
  if (message === "timeout" || normalized === "timeout") {
    return "请求超时，请稍后重试。";
  }
  if (message.includes("Failed to fetch") || normalized.includes("fetch failed")) {
    return "本地服务未连接，请刷新页面或重启网站。";
  }
  if (message.includes("NetworkError")) {
    return "网络请求失败，请检查本地服务是否正常运行。";
  }
  return message || "请求失败";
}
