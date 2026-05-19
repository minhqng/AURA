// Simple content script implementing the UI tasks:
// - Listen for TOGGLE_CONTRAST messages and apply/remove an HTML-level filter
//   while re-inverting images/videos so their colors remain correct.
// - Listen for CHANGE_FONT_SIZE messages and set body font size.
// - Also respond to `chrome.storage` changes for `isContrastOn` and `fontSize`.

(function () {
  const STYLE_ID = "a11y-contrast-style";

  function installContrastStyle() {
    if (document.getElementById(STYLE_ID)) return;
    const css = `html.a11y-inverted { filter: invert(100%) hue-rotate(180deg) !important; }
/* Re-invert images & video so their colors are preserved */
html.a11y-inverted img, html.a11y-inverted video, html.a11y-inverted video * {
  filter: invert(100%) hue-rotate(180deg) !important;
}
`;
    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.appendChild(document.createTextNode(css));
    document.head && document.head.appendChild(style);
  }

  function removeContrastStyle() {
    const el = document.getElementById(STYLE_ID);
    if (el && el.parentNode) el.parentNode.removeChild(el);
  }

  function enableContrast(enable) {
    if (enable) {
      installContrastStyle();
      document.documentElement.classList.add("a11y-inverted");
    } else {
      document.documentElement.classList.remove("a11y-inverted");
      // keep the style element for quick re-enable, or remove it to clean up
      // we'll remove to avoid leaving stale rules
      removeContrastStyle();
    }
  }

  function setFontScale(scale) {
    // Accept either a numeric scale (1.0 = 100%) or a percent number (e.g. 120)
    var s = Number(scale);
    if (isNaN(s)) return;
    if (s > 5) {
      // if someone passed 120, convert to 1.2
      s = s / 100;
    }
    try {
      if (document.body) {
        document.body.style.fontSize = s * 100 + "%";
      } else {
        document.documentElement.style.fontSize = s * 100 + "%";
      }
    } catch (e) {
      try {
        if (document.body) document.body.style.zoom = s;
        else document.documentElement.style.zoom = s;
      } catch (e2) {
        // ignore
      }
    }
  }

  // Messages from popup / background
  chrome.runtime.onMessage.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (!request || !request.type) return;
    switch (request.type) {
      case "TOGGLE_CONTRAST":
        if (
          request.payload &&
          typeof request.payload.isEnabled !== "undefined"
        ) {
          enableContrast(!!request.payload.isEnabled);
          sendResponse({ ok: true });
        }
        break;
      case "CHANGE_FONT_SIZE":
        if (request.payload && typeof request.payload.scale !== "undefined") {
          setFontScale(request.payload.scale);
          sendResponse({ ok: true });
        }
        break;
      default:
        break;
    }
  });

  // Apply initial state from storage (keys used by popup)
  chrome.storage &&
    chrome.storage.sync &&
    chrome.storage.sync.get(
      ["isContrastOn", "fontSize", "userConfig"],
      function (res) {
        if (res) {
          if (typeof res.isContrastOn !== "undefined") {
            enableContrast(!!res.isContrastOn);
          }
          // Accept fontSize expressed as percent (100, 120) or userConfig.fontSize as scale
          if (typeof res.fontSize !== "undefined") {
            setFontScale(Number(res.fontSize));
          } else if (
            res.userConfig &&
            typeof res.userConfig.fontSize !== "undefined"
          ) {
            setFontScale(Number(res.userConfig.fontSize));
          }
        }
      }
    );

  // React to storage changes
  chrome.storage &&
    chrome.storage.onChanged &&
    chrome.storage.onChanged.addListener(function (changes, areaName) {
      if (areaName !== "sync" && areaName !== "local") return;
      if (changes.isContrastOn) {
        enableContrast(!!changes.isContrastOn.newValue);
      }
      if (changes.fontSize) {
        setFontScale(changes.fontSize.newValue);
      }
      if (changes.userConfig && changes.userConfig.newValue) {
        var cfg = changes.userConfig.newValue;
        if (cfg.contrastMode != null)
          enableContrast(String(cfg.contrastMode) !== "none");
        if (typeof cfg.fontSize !== "undefined") setFontScale(cfg.fontSize);
      }
    });
})();
