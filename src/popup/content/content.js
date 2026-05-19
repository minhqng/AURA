// Áp dụng khi tải trang
(function () {
  // Helper: safe parse
  function parseFloatOrDefault(v, d) {
    var f = parseFloat(v);
    return isNaN(f) ? d : f;
  }

  // Apply style configuration object.
  // Only modifies properties explicitly present in config so that
  // partial updates (e.g. font-only or contrast-only) don't reset
  // unrelated settings.
  function applyStyles(config) {
    if (!config || typeof config !== "object") return;

    var root = document.documentElement;

    // Contrast mode — only touch when explicitly provided
    if ("contrastMode" in config) {
      if (config.contrastMode && config.contrastMode !== "none") {
        root.setAttribute("data-a11y-contrast", String(config.contrastMode));
      } else {
        root.removeAttribute("data-a11y-contrast");
      }
    }

    // Font settings: set CSS variables on root.
    // Only modify properties that are present in config.
    // Track whether any font property is set to a non-default value.
    var fontActive = false;
    var fontProvided = false;
    if ("fontSize" in config && config.fontSize != null) {
      var scale = parseFloatOrDefault(config.fontSize, 1.0);
      root.style.setProperty("--user-font-size-scale", String(scale));
      fontProvided = true;
      if (scale !== 1.0) fontActive = true;
    }
    if ("fontFamily" in config && config.fontFamily) {
      root.style.setProperty("--user-font-family", String(config.fontFamily));
      fontProvided = true;
      fontActive = true;
    }
    if ("lineHeight" in config && config.lineHeight != null) {
      var lh = parseFloatOrDefault(config.lineHeight, 1.2);
      root.style.setProperty("--user-line-height", String(lh));
      fontProvided = true;
      if (lh !== 1.2) fontActive = true;
    }
    if ("letterSpacing" in config && config.letterSpacing != null) {
      root.style.setProperty(
        "--user-letter-spacing",
        String(config.letterSpacing) + "px"
      );
      fontProvided = true;
      if (parseFloatOrDefault(config.letterSpacing, 0) !== 0) fontActive = true;
    }

    if (fontActive) {
      root.setAttribute("data-a11y-font", "true");
    } else if (fontProvided) {
      root.removeAttribute("data-a11y-font");
      root.style.removeProperty("--user-font-size-scale");
      root.style.removeProperty("--user-font-family");
      root.style.removeProperty("--user-line-height");
      root.style.removeProperty("--user-letter-spacing");
    }
  }

  // On initial load, read userConfig (preferred) or fallback to auraSettings.
  // Also accept the simple keys `isContrastOn` and `fontSize` saved by popup.
  chrome.storage.sync.get(
    ["userConfig", "auraSettings", "isContrastOn", "fontSize"],
    function (res) {
      var cfg = null;
      if (res && res.userConfig) cfg = res.userConfig;
      else if (res && res.auraSettings) cfg = res.auraSettings;

      // If there is no modern config, but popup saved simple keys, convert them
      if (!cfg) {
        var hasSimple = false;
        cfg = {};
        if (res && typeof res.isContrastOn !== "undefined") {
          cfg.contrastMode = res.isContrastOn ? "high" : "none";
          hasSimple = true;
        }
        if (res && typeof res.fontSize !== "undefined") {
          // popup stores percent (e.g. 120). convert to scale (1.2)
          var scale = parseFloat(res.fontSize) / 100;
          if (!isNaN(scale)) cfg.fontSize = scale;
          hasSimple = true;
        }
        if (!hasSimple) cfg = null;
      }

      if (cfg) applyStyles(cfg);
    }
  );

  // Listen for storage changes and apply live. Accept both object configs and simple keys.
  chrome.storage.onChanged.addListener(function (changes, areaName) {
    if (areaName !== "sync" && areaName !== "local") return;

    if (changes.userConfig) {
      applyStyles(changes.userConfig.newValue);
      return;
    }
    if (changes.auraSettings) {
      applyStyles(changes.auraSettings.newValue);
      return;
    }

    // Backwards-compatible simple keys
    if (changes.isContrastOn) {
      var newVal = changes.isContrastOn.newValue;
      applyStyles({ contrastMode: newVal ? "high" : "none" });
    }
    if (changes.fontSize) {
      var fv = changes.fontSize.newValue;
      var scale = parseFloat(fv) / 100;
      if (!isNaN(scale)) applyStyles({ fontSize: scale });
    }
  });

  // Listen for direct messages from popup
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (!request || !request.type) return;
    switch (request.type) {
      case "CHANGE_FONT_SIZE":
        if (request.payload && request.payload.scale != null) {
          applyStyles({ fontSize: request.payload.scale });
        }
        sendResponse({ ok: true });
        break;
      case "TOGGLE_CONTRAST":
        if (request.payload && request.payload.isEnabled != null) {
          applyStyles({
            contrastMode: request.payload.isEnabled ? "high" : "none",
          });
        }
        sendResponse({ ok: true });
        break;
      default:
        break;
    }
  });
})();
