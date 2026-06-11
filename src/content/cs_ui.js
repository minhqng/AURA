(function () {
  const {
    SETTINGS_KEY,
    SITE_SETTINGS_KEY,
    fromStorage,
    normalizeSettings,
  } = window.AuraDefaults;

  function siteKey() {
    return location.origin || "unknown-origin";
  }

  function mergeSiteSettings(globalSettings, siteSettings) {
    const site = siteSettings && siteSettings[siteKey()];
    if (!site) return globalSettings;
    return normalizeSettings({ ...globalSettings, ...site, ai: globalSettings.ai });
  }

  function readSettings(callback) {
    chrome.storage.sync.get(
      [SETTINGS_KEY, SITE_SETTINGS_KEY, "isContrastOn", "fontSize", "userConfig"],
      (storage) => {
        const globalSettings = fromStorage(storage);
        callback(mergeSiteSettings(globalSettings, storage[SITE_SETTINGS_KEY]));
      }
    );
  }

  function apply(settings) {
    const normalized = normalizeSettings(settings);
    window.AuraEngine.apply(normalized);
    window.AuraAi.configure(normalized);
  }

  function applyFromStorage() {
    readSettings(apply);
  }

  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request || !request.type) return false;

    if (request.type === "AURA_APPLY_SETTINGS") {
      apply(request.payload && request.payload.settings);
      sendResponse({ ok: true });
      return true;
    }

    if (request.type === "AURA_DESCRIBE_IMAGES") {
      window.AuraAi.describeVisibleImages(request.payload).then((results) => {
        sendResponse({ ok: true, count: results.length, results });
      });
      return true;
    }

    if (request.type === "AURA_DESCRIBE_SELECTED_IMAGE") {
      window.AuraAi.describeSelectedImage(request.payload).then((results) => {
        sendResponse({ ok: true, count: results.length, results });
      });
      return true;
    }

    if (request.type === "TOGGLE_CONTRAST") {
      readSettings((settings) => {
        settings.contrastMode = request.payload?.isEnabled ? "inverted" : "none";
        apply(settings);
        sendResponse({ ok: true });
      });
      return true;
    }

    if (request.type === "CHANGE_FONT_SIZE") {
      readSettings((settings) => {
        settings.fontScale = Number(request.payload?.scale) || 1;
        apply(settings);
        sendResponse({ ok: true });
      });
      return true;
    }

    return false;
  });

  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "sync") return;
    if (
      changes[SETTINGS_KEY] ||
      changes[SITE_SETTINGS_KEY] ||
      changes.isContrastOn ||
      changes.fontSize ||
      changes.userConfig
    ) {
      applyFromStorage();
    }
  });

  applyFromStorage();
})();
