(function () {
  const SETTINGS_KEY = "auraSettings";
  const SITE_SETTINGS_KEY = "auraSiteSettings";
  const defaults = {
    version: 1,
    contrastMode: "none",
    fontScale: 1,
    lineHeight: 1.4,
    letterSpacing: 0,
    readableFont: false,
    focusAid: false,
    reducedMotion: false,
    readingGuide: false,
    ai: {
      enabled: false,
      consent: false,
      mode: "manual",
      task: "caption",
      question: "",
      language: "vi",
      cache: true,
    },
  };

  function clamp(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
  }

  function normalize(input) {
    const source = input && typeof input === "object" ? input : {};
    const ai = source.ai || {};
    const contrastMode = ["none", "high", "inverted", "grayscale"].includes(
      source.contrastMode
    )
      ? source.contrastMode
      : "none";
    const mode = ["manual", "missing-alt-only", "batch"].includes(ai.mode)
      ? ai.mode
      : "manual";
    const task = ["caption", "ocr", "objects", "question"].includes(ai.task)
      ? ai.task
      : "caption";

    return {
      ...defaults,
      ...source,
      contrastMode,
      fontScale: clamp(source.fontScale, 0.8, 2, 1),
      lineHeight: clamp(source.lineHeight, 1.1, 2, 1.4),
      letterSpacing: clamp(source.letterSpacing, 0, 4, 0),
      ai: {
        ...defaults.ai,
        ...ai,
        mode,
        task,
        question: String(ai.question || "").slice(0, 240),
        enabled: Boolean(ai.enabled && ai.consent),
        consent: Boolean(ai.consent),
      },
    };
  }

  function withGlobalAi(globalSettings, nextSettings) {
    const global = normalize(globalSettings);
    const next = normalize(nextSettings);
    return normalize({ ...global, ai: next.ai });
  }

  window.AuraPopupSettings = {
    SETTINGS_KEY,
    SITE_SETTINGS_KEY,
    defaults,
    normalize,
    withGlobalAi,
  };
})();
