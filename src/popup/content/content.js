// Áp dụng khi tải trang
(function () {
  // Helper: safe parse
  function parseFloatOrDefault(v, d) {
    var f = parseFloat(v);
    return isNaN(f) ? d : f;
  }

  // Apply full style configuration object
  function applyStyles(config) {
    if (!config || typeof config !== "object") return;

    var root = document.documentElement;

    // Contrast mode
    if (config.contrastMode) {
      root.setAttribute("data-a11y-contrast", String(config.contrastMode));
    } else {
      root.setAttribute("data-a11y-contrast", "none");
    }

    // Font settings: set CSS variables on root
    var hasFont = false;
    if (config.fontSize != null) {
      var scale = parseFloatOrDefault(config.fontSize, 1.0);
      root.style.setProperty("--user-font-size-scale", String(scale));
      hasFont = true;
    }
    if (config.fontFamily) {
      root.style.setProperty("--user-font-family", String(config.fontFamily));
      hasFont = true;
    }
    if (config.lineHeight != null) {
      var lh = parseFloatOrDefault(config.lineHeight, 1.2);
      root.style.setProperty("--user-line-height", String(lh));
      hasFont = true;
    }
    if (config.letterSpacing != null) {
      root.style.setProperty(
        "--user-letter-spacing",
        String(config.letterSpacing) + "px"
      );
      hasFont = true;
    }

    if (hasFont) {
      root.setAttribute("data-a11y-font", "true");
    } else {
      root.removeAttribute("data-a11y-font");
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
})();

// Lắng nghe thay đổi từ popup
// For compatibility, accept message-based commands but do not rely on them
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
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

// Keep the original root font-size as base so scale is deterministic
// Maintain compatibility helper: setting root font-size directly
var _aura_base_font_size = null;
function _ensureBase() {
  if (_aura_base_font_size == null) {
    try {
      var cs = window.getComputedStyle(document.documentElement);
      _aura_base_font_size = parseFloat(cs && cs.fontSize) || 16;
    } catch (e) {
      _aura_base_font_size = 16;
    }
  }
}

function applyFontScale(scale) {
  _ensureBase();
  var newSize = _aura_base_font_size * scale;
  try {
    document.documentElement.style.fontSize = newSize + "px";
  } catch (e) {
    document.body.style.fontSize = newSize + "px";
  }
}
