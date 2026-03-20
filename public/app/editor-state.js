export function cloneStoryboard(storyboard) {
  return (storyboard || []).map((scene) => ({ ...scene }));
}

export function buildEditorSnapshotPayload({ draft, durationModeValue, getDraftScriptSource }) {
  const script = getDraftScriptSource(draft);
  return {
    titleVariantA: script.titleVariants?.a || script.title || "",
    titleVariantB: script.titleVariants?.b || script.titleVariants?.a || script.title || "",
    coverTitle: script.coverTitle || "",
    coverSubtitle: script.coverSubtitle || "",
    coverVisualPrompt: draft?.coverVisualPrompt || "",
    coverNegativePrompt: draft?.coverNegativePrompt || "",
    coverTitlePosition: script.coverTitlePosition || "middle",
    coverTitleAlign: script.coverTitleAlign || "left",
    coverTitleSize: script.coverTitleSize || "large",
    coverTitleWidth: script.coverTitleWidth || "normal",
    coverTitleOffset: String(script.coverTitleOffset ?? "0"),
    coverTitleXOffset: String(script.coverTitleXOffset ?? "0"),
    coverTitleSpacing: script.coverTitleSpacing || "normal",
    coverSubtitlePosition: script.coverSubtitlePosition || "below-title",
    coverSubtitleSize: script.coverSubtitleSize || "small",
    coverSubtitleAlign: script.coverSubtitleAlign || "follow",
    coverSubtitleOffset: String(script.coverSubtitleOffset ?? "0"),
    coverSubtitleXOffset: String(script.coverSubtitleXOffset ?? "0"),
    coverSubtitleWidth: script.coverSubtitleWidth || "normal",
    hook: script.hook || "",
    sections: [
      script.sections?.[0] || "",
      script.sections?.[1] || "",
      script.sections?.[2] || "",
    ],
    cta: script.cta || "",
    durationMode: String(draft?.durationMode || durationModeValue || ""),
    storyboard: cloneStoryboard(draft?.storyboard || []),
  };
}

export function buildEditorDirtyState(currentPayload, snapshot) {
  const titleDirty = currentPayload.titleVariantA !== snapshot.titleVariantA;
  const coverDirty =
    currentPayload.coverTitle !== snapshot.coverTitle ||
    currentPayload.coverSubtitle !== snapshot.coverSubtitle ||
    currentPayload.coverVisualPrompt !== snapshot.coverVisualPrompt ||
    currentPayload.coverNegativePrompt !== snapshot.coverNegativePrompt ||
    currentPayload.coverTitlePosition !== snapshot.coverTitlePosition ||
    currentPayload.coverTitleAlign !== snapshot.coverTitleAlign ||
    currentPayload.coverTitleSize !== snapshot.coverTitleSize ||
    currentPayload.coverTitleWidth !== snapshot.coverTitleWidth ||
    currentPayload.coverTitleOffset !== snapshot.coverTitleOffset ||
    currentPayload.coverTitleXOffset !== snapshot.coverTitleXOffset ||
    currentPayload.coverTitleSpacing !== snapshot.coverTitleSpacing ||
    currentPayload.coverSubtitlePosition !== snapshot.coverSubtitlePosition ||
    currentPayload.coverSubtitleSize !== snapshot.coverSubtitleSize ||
    currentPayload.coverSubtitleAlign !== snapshot.coverSubtitleAlign ||
    currentPayload.coverSubtitleOffset !== snapshot.coverSubtitleOffset ||
    currentPayload.coverSubtitleXOffset !== snapshot.coverSubtitleXOffset ||
    currentPayload.coverSubtitleWidth !== snapshot.coverSubtitleWidth;
  const bodyDirty =
    currentPayload.hook !== snapshot.hook ||
    currentPayload.sections[0] !== snapshot.sections[0] ||
    currentPayload.sections[1] !== snapshot.sections[1] ||
    currentPayload.sections[2] !== snapshot.sections[2];
  const ctaDirty = currentPayload.cta !== snapshot.cta;
  const durationDirty = currentPayload.durationMode !== snapshot.durationMode;
  const storyboardDirty = JSON.stringify(currentPayload.storyboard || []) !== JSON.stringify(snapshot.storyboard || []);

  return {
    titleDirty,
    coverDirty,
    bodyDirty,
    ctaDirty,
    durationDirty,
    storyboardDirty,
    hasEditorUnsavedChanges: titleDirty || coverDirty || bodyDirty || ctaDirty || durationDirty,
    hasUnsavedChanges: titleDirty || coverDirty || bodyDirty || ctaDirty || durationDirty || storyboardDirty,
  };
}
