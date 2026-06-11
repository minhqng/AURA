(function () {
  const SETTINGS_KEY = "auraSettings";
  const SITE_SETTINGS_KEY = "auraSiteSettings";

  const DEFAULT_SETTINGS = {
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
      language: "vi",
      cache: true,
    },
  };

  function clamp(value, min, max, fallback) {
    const number = Number(value);
    if (!Number.isFinite(number)) return fallback;
    return Math.min(max, Math.max(min, number));
  }

  function normalizeAi(input) {
    const ai = input && typeof input === "object" ? input : {};
    const mode = ["manual", "missing-alt-only", "batch"].includes(ai.mode)
      ? ai.mode
      : DEFAULT_SETTINGS.ai.mode;

    return {
      enabled: Boolean(ai.enabled),
      consent: Boolean(ai.consent),
      mode,
      language: String(ai.language || DEFAULT_SETTINGS.ai.language),
      cache: ai.cache !== false,
    };
  }

  function normalizeSettings(input) {
    const source = input && typeof input === "object" ? input : {};
    const contrastMode = ["none", "high", "inverted", "grayscale"].includes(
      source.contrastMode
    )
      ? source.contrastMode
      : DEFAULT_SETTINGS.contrastMode;

    return {
      version: 1,
      contrastMode,
      fontScale: clamp(source.fontScale ?? source.fontSize, 0.8, 2, 1),
      lineHeight: clamp(source.lineHeight, 1.1, 2, 1.4),
      letterSpacing: clamp(source.letterSpacing, 0, 4, 0),
      readableFont: Boolean(source.readableFont),
      focusAid: Boolean(source.focusAid),
      reducedMotion: Boolean(source.reducedMotion),
      readingGuide: Boolean(source.readingGuide),
      ai: normalizeAi(source.ai),
    };
  }

  function fromStorage(storage) {
    if (storage && storage[SETTINGS_KEY]) {
      return normalizeSettings(storage[SETTINGS_KEY]);
    }

    const legacy = {};
    if (storage && typeof storage.isContrastOn !== "undefined") {
      legacy.contrastMode = storage.isContrastOn ? "inverted" : "none";
    }
    if (storage && typeof storage.fontSize !== "undefined") {
      legacy.fontScale = Number(storage.fontSize) / 100;
    }
    if (storage && storage.userConfig) {
      legacy.contrastMode = legacy.contrastMode || storage.userConfig.contrastMode;
      legacy.fontScale = storage.userConfig.fontSize || legacy.fontScale;
    }
    return normalizeSettings(legacy);
  }

  window.AuraDefaults = {
    DEFAULT_SETTINGS,
    SETTINGS_KEY,
    SITE_SETTINGS_KEY,
    fromStorage,
    normalizeSettings,
  };
})();
