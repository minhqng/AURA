/**
 * AURA Content Script - UI Accessibility Features
 * - Auto-applies saved settings on page load (State Persistence)
 * - Handles Contrast Mode with proper image/video color preservation
 * - Handles Font Size scaling
 * - Listens to storage changes and messages from popup
 */

(function () {
  "use strict";

  // ======================
  // CONSTANTS & UTILITIES
  // ======================
  const STYLE_ID = "aura-injected-styles";
  const DEBUG = false; // Set to true for console logging

  function log(...args) {
    if (DEBUG) console.log("[AURA Content Script]", ...args);
  }

  function parseFloatOrDefault(value, defaultValue) {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? defaultValue : parsed;
  }

  // ======================
  // STYLE INJECTION
  // ======================
  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;

    // CSS rules for contrast and font scaling
    const css = `
/* High Contrast Mode - Invert colors but preserve images/videos */
html.aura-contrast-high {
  filter: invert(100%) hue-rotate(180deg) !important;
}

/* Re-invert images & videos to preserve their original colors */
html.aura-contrast-high img,
html.aura-contrast-high video,
html.aura-contrast-high picture,
html.aura-contrast-high canvas,
html.aura-contrast-high svg,
html.aura-contrast-high iframe[src*="youtube"],
html.aura-contrast-high iframe[src*="vimeo"] {
  filter: invert(100%) hue-rotate(180deg) !important;
}

/* Font scaling controlled by CSS variable */
html.aura-font-scaled body,
html.aura-font-scaled body * {
  font-size: calc(1em * var(--aura-font-scale, 1)) !important;
}

/* Ensure images are not affected by font scaling */
html.aura-font-scaled img,
html.aura-font-scaled video {
  font-size: initial !important;
}
`;

    const styleElement = document.createElement("style");
    styleElement.id = STYLE_ID;
    styleElement.textContent = css;

    // Insert early to avoid FOUC (Flash of Unstyled Content)
    (document.head || document.documentElement).appendChild(styleElement);
    log("Styles injected");
  }

  // ======================
  // CONTRAST MODE
  // ======================
  function applyContrast(isEnabled) {
    const html = document.documentElement;

    if (isEnabled) {
      html.classList.add("aura-contrast-high");
      log("Contrast mode: ENABLED");
    } else {
      html.classList.remove("aura-contrast-high");
      log("Contrast mode: DISABLED");
    }
  }

  // ======================
  // FONT SIZE SCALING
  // ======================
  function applyFontSize(scale) {
    // Accept either scale (1.0 = 100%) or percent (120)
    let finalScale = parseFloatOrDefault(scale, 1.0);

    // If value > 5, assume it's a percentage (e.g., 120 means 1.2x)
    if (finalScale > 5) {
      finalScale = finalScale / 100;
    }

    const html = document.documentElement;

    if (finalScale !== 1.0) {
      html.style.setProperty("--aura-font-scale", String(finalScale));
      html.classList.add("aura-font-scaled");
      log("Font scale set to:", finalScale);
    } else {
      html.style.removeProperty("--aura-font-scale");
      html.classList.remove("aura-font-scaled");
      log("Font scale: RESET to default");
    }
  }

  // ======================
  // UNIFIED SETTINGS APPLICATION
  // ======================
  function applySettings(settings) {
    if (!settings) return;

    log("Applying settings:", settings);

    // Handle contrast (support both isContrastOn and userConfig.contrastMode)
    if (typeof settings.isContrastOn !== "undefined") {
      applyContrast(!!settings.isContrastOn);
    } else if (settings.userConfig && settings.userConfig.contrastMode) {
      const mode = String(settings.userConfig.contrastMode);
      applyContrast(mode === "high");
    }

    // Handle font size (support both fontSize and userConfig.fontSize)
    if (typeof settings.fontSize !== "undefined") {
      applyFontSize(settings.fontSize);
    } else if (
      settings.userConfig &&
      typeof settings.userConfig.fontSize !== "undefined"
    ) {
      applyFontSize(settings.userConfig.fontSize);
    }
  }

  // ======================
  // STORAGE & STATE PERSISTENCE
  // ======================
  function loadAndApplySettings() {
    chrome.storage.sync.get(
      ["isContrastOn", "fontSize", "userConfig"],
      function (result) {
        if (chrome.runtime.lastError) {
          log("Error loading settings:", chrome.runtime.lastError);
          return;
        }

        log("Settings loaded from storage:", result);
        applySettings(result);
      }
    );
  }

  // MESSAGE LISTENERS

  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (!request || !request.type) return;

    log("Message received:", request.type, request.payload);

    switch (request.type) {
      case "TOGGLE_CONTRAST":
        if (
          request.payload &&
          typeof request.payload.isEnabled !== "undefined"
        ) {
          applyContrast(!!request.payload.isEnabled);
          sendResponse({ ok: true });
        }
        break;

      case "CHANGE_FONT_SIZE":
        if (request.payload && typeof request.payload.scale !== "undefined") {
          applyFontSize(request.payload.scale);
          sendResponse({ ok: true });
        }
        break;

      default:
        break;
    }
  });

  // Listen to storage changes for live updates
  chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName !== "sync" && areaName !== "local") return;

    log("Storage changed:", changes);

    // Handle individual setting changes
    if (changes.isContrastOn) {
      applyContrast(!!changes.isContrastOn.newValue);
    }

    if (changes.fontSize) {
      applyFontSize(changes.fontSize.newValue);
    }

    // Handle unified config changes
    if (changes.userConfig && changes.userConfig.newValue) {
      applySettings({ userConfig: changes.userConfig.newValue });
    }
  });

  // ======================
  // INITIALIZATION
  // ======================
  function init() {
    log("Initializing AURA Content Script...");

    // Inject styles immediately to avoid FOUC
    injectStyles();

    // Load and apply saved settings
    loadAndApplySettings();

    log("Initialization complete");
  }

  // Run initialization
  // Use different timing based on document state to ensure settings apply ASAP
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    // DOM already loaded
    init();
  }
})();
