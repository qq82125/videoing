export function normalizeCoverOffset(value) {
  const numeric = Number(value);
  return [-2, -1, 0, 1, 2].includes(numeric) ? numeric : 0;
}

export function normalizeCoverTitlePosition(value) {
  return ["top", "middle", "bottom"].includes(value) ? value : "middle";
}

export function normalizeCoverTitleAlign(value) {
  return ["left", "center", "right"].includes(value) ? value : "left";
}

export function normalizeCoverTitleSize(value, fallback = "large") {
  return ["small", "medium", "large"].includes(value) ? value : fallback;
}

export function normalizeCoverTitleWidth(value) {
  return ["narrow", "normal", "wide"].includes(value) ? value : "normal";
}

export function normalizeCoverTitleSpacing(value) {
  return ["tight", "normal", "wide"].includes(value) ? value : "normal";
}

export function normalizeCoverSubtitlePosition(value) {
  return ["below-title", "safe-bottom", "hidden"].includes(value) ? value : "below-title";
}

export function normalizeCoverSubtitleAlign(value) {
  return ["follow", "left", "center", "right"].includes(value) ? value : "follow";
}

export function normalizeCoverSubtitleWidth(value) {
  return ["narrow", "normal", "wide"].includes(value) ? value : "normal";
}

export function escapeXml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}

export function chunkCoverText(text, size) {
  const normalizedLines = String(text || "")
    .split(/\r?\n/)
    .map((item) => item.trim())
    .filter(Boolean);
  if (normalizedLines.length > 1) {
    return normalizedLines;
  }
  const sourceLines = normalizedLines.length ? normalizedLines : [String(text || "").trim()];
  const chunks = [];
  for (const line of sourceLines) {
    if (!line) continue;
    for (let i = 0; i < line.length; i += size) {
      chunks.push(line.slice(i, i + size));
    }
  }
  return chunks;
}

export function getCoverTitleLayout(script, coverStyle = "report") {
  const titleSize = normalizeCoverTitleSize(script?.coverTitleSize);
  const titleWidth = normalizeCoverTitleWidth(script?.coverTitleWidth);
  const titleAlign = normalizeCoverTitleAlign(script?.coverTitleAlign);
  const titlePosition = normalizeCoverTitlePosition(script?.coverTitlePosition);
  const titleOffset = normalizeCoverOffset(script?.coverTitleOffset);
  const titleXOffset = normalizeCoverOffset(script?.coverTitleXOffset);
  const titleSpacing = normalizeCoverTitleSpacing(script?.coverTitleSpacing);
  const centerX = 540;
  const leftX = coverStyle === "viral" ? 136 : 120;
  const rightX = coverStyle === "viral" ? 944 : 960;
  const chunkSizeByFont = coverStyle === "viral"
    ? { small: 11, medium: 10, large: 8 }
    : { small: 12, medium: 10, large: 9 };
  const fontSizeByLevel = coverStyle === "viral"
    ? { small: 92, medium: 104, large: 116 }
    : { small: 84, medium: 96, large: 108 };
  const lineHeightByLevel = coverStyle === "viral"
    ? { small: 112, medium: 124, large: 134 }
    : { small: 100, medium: 112, large: 124 };
  const startYByPosition = coverStyle === "viral"
    ? { top: 520, middle: 612, bottom: 900 }
    : { top: 560, middle: 650, bottom: 980 };
  const widthFactor = titleWidth === "wide" ? 1.35 : titleWidth === "narrow" ? 0.82 : 1;
  const chunkSize = Math.max(4, Math.round(chunkSizeByFont[titleSize] * widthFactor));
  const anchor = titleAlign === "center" ? "middle" : titleAlign === "right" ? "end" : "start";
  const baseX = titleAlign === "center" ? centerX : titleAlign === "right" ? rightX : leftX;
  const x = baseX + (titleXOffset * 44);
  const lines = chunkCoverText(String(script?.coverTitle || ""), chunkSize).filter(Boolean).slice(0, 4);
  const letterSpacing = titleSpacing === "tight" ? "-0.065em" : titleSpacing === "wide" ? "0.01em" : "-0.04em";

  return {
    x,
    anchor,
    fontSize: fontSizeByLevel[titleSize],
    lineHeight: lineHeightByLevel[titleSize],
    startY: startYByPosition[titlePosition] + (titleOffset * 60),
    lines: lines.length ? lines : [""],
    letterSpacing,
  };
}

export function getCoverSubtitleLayout(script, coverStyle, titleLayout) {
  const subtitlePosition = normalizeCoverSubtitlePosition(script?.coverSubtitlePosition);
  const subtitleSize = normalizeCoverTitleSize(script?.coverSubtitleSize, "small");
  const subtitleAlign = normalizeCoverSubtitleAlign(script?.coverSubtitleAlign);
  const subtitleOffset = normalizeCoverOffset(script?.coverSubtitleOffset);
  const subtitleXOffset = normalizeCoverOffset(script?.coverSubtitleXOffset);
  const subtitleWidth = normalizeCoverSubtitleWidth(script?.coverSubtitleWidth);
  const anchor = subtitleAlign === "follow"
    ? titleLayout.anchor
    : subtitleAlign === "center"
      ? "middle"
      : subtitleAlign === "right"
        ? "end"
        : "start";
  const baseX = anchor === "middle" ? 540 : anchor === "end" ? (coverStyle === "viral" ? 944 : 960) : (coverStyle === "viral" ? 126 : 120);
  const x = baseX + (subtitleXOffset * 44);
  const fontSize = subtitleSize === "large"
    ? (coverStyle === "viral" ? 72 : 68)
    : subtitleSize === "medium"
      ? (coverStyle === "viral" ? 62 : 58)
      : (coverStyle === "viral" ? 52 : 48);
  const subtitleLengthLimit = subtitleWidth === "wide" ? 28 : subtitleWidth === "narrow" ? 14 : 20;
  const lines = chunkCoverText(String(script?.coverSubtitle || ""), subtitleLengthLimit).filter(Boolean).slice(0, 2);
  const y = subtitlePosition === "safe-bottom"
    ? (coverStyle === "viral" ? 1460 : 1450) + (subtitleOffset * 48)
    : (titleLayout.startY + (Math.max(titleLayout.lines.length, 1) * titleLayout.lineHeight) + (coverStyle === "viral" ? 64 : 54) + (subtitleOffset * 36));

  return {
    hidden: subtitlePosition === "hidden",
    anchor,
    x,
    y,
    panelY: subtitlePosition === "safe-bottom" ? (1360 + (subtitleOffset * 48)) : y - 102,
    fontSize,
    lines,
  };
}

function buildCoverTextTspans(x, lines, lineHeight) {
  return lines
    .map((line, index) => `<tspan x="${x}" dy="${index === 0 ? 0 : lineHeight}">${escapeXml(line)}</tspan>`)
    .join("");
}

export function buildCoverOverlaySvg(script, coverStyle = "report") {
  const titleLayout = getCoverTitleLayout(script, coverStyle);
  const subtitleLayout = getCoverSubtitleLayout(script, coverStyle, titleLayout);
  const titleFill = coverStyle === "viral" ? "#fff7eb" : "#f7fbff";
  const subtitleFill = coverStyle === "viral" ? "#ffe6c8" : "#d9edf8";
  const shadowColor = coverStyle === "viral" ? "#1f0508" : "#061018";
  const subtitleText = subtitleLayout.hidden
    ? ""
    : `<text x="${subtitleLayout.x}" y="${subtitleLayout.y}" fill="${subtitleFill}" font-size="${subtitleLayout.fontSize}" text-anchor="${subtitleLayout.anchor}" font-family="Arial, sans-serif" filter="url(#cover-title-shadow)">${buildCoverTextTspans(subtitleLayout.x, subtitleLayout.lines, Math.round(subtitleLayout.fontSize * 1.18))}</text>`;
  const viralSubtitlePanel = coverStyle === "viral" && !subtitleLayout.hidden
    ? `<rect x="88" y="${subtitleLayout.panelY}" width="904" height="170" rx="28" fill="#ffdf72"/>`
    : "";

  return `
  <defs>
    <filter id="cover-title-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="10" stdDeviation="18" flood-color="${shadowColor}" flood-opacity="0.45"/>
    </filter>
    <linearGradient id="cover-title-panel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#041018" stop-opacity="0.12"/>
      <stop offset="100%" stop-color="#041018" stop-opacity="0.38"/>
    </linearGradient>
  </defs>
  <rect x="72" y="${coverStyle === "viral" ? 340 : 430}" width="936" height="${coverStyle === "viral" ? 840 : 760}" rx="36" fill="url(#cover-title-panel)"/>
  <text x="${titleLayout.x}" y="${titleLayout.startY}" fill="${titleFill}" font-size="${titleLayout.fontSize}" font-weight="${coverStyle === "viral" ? "800" : "700"}" text-anchor="${titleLayout.anchor}" font-family="Arial, sans-serif" letter-spacing="${titleLayout.letterSpacing}" filter="url(#cover-title-shadow)">
    ${buildCoverTextTspans(titleLayout.x, titleLayout.lines, titleLayout.lineHeight)}
  </text>
  ${viralSubtitlePanel}
  ${subtitleText}
`;
}

export function buildCoverComposedSvgDocument({ script, coverStyle = "report", backgroundMarkup = "" }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1080" height="1920" viewBox="0 0 1080 1920" xmlns="http://www.w3.org/2000/svg">
  ${backgroundMarkup}
  ${buildCoverOverlaySvg(script, coverStyle)}
</svg>`;
}
