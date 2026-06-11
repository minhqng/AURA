document.addEventListener("DOMContentLoaded", () => {
  const { SETTINGS_KEY, SITE_SETTINGS_KEY, defaults, normalize, withGlobalAi } =
    window.AuraPopupSettings;

  const form = {
    siteLabel: document.getElementById("site-label"),
    status: document.getElementById("status-text"),
    fontScale: document.getElementById("font-scale"),
    fontScaleValue: document.getElementById("font-scale-value"),
    lineHeight: document.getElementById("line-height"),
    lineHeightValue: document.getElementById("line-height-value"),
    letterSpacing: document.getElementById("letter-spacing"),
    letterSpacingValue: document.getElementById("letter-spacing-value"),
    readableFont: document.getElementById("readable-font"),
    focusAid: document.getElementById("focus-aid"),
    reducedMotion: document.getElementById("reduced-motion"),
    readingGuide: document.getElementById("reading-guide"),
    aiConsent: document.getElementById("ai-consent"),
    aiEnabled: document.getElementById("ai-enabled"),
    aiMode: document.getElementById("ai-mode"),
    aiTask: document.getElementById("ai-task"),
    aiQuestion: document.getElementById("ai-question"),
    aiApiKey: document.getElementById("ai-api-key"),
    siteOverride: document.getElementById("site-override"),
  };

  let activeTab = null;
  let activeOrigin = null;
  let globalSettings = { ...defaults, ai: { ...defaults.ai } };
  let siteSettings = {};

  function currentSettings() {
    const site = activeOrigin && form.siteOverride.checked ? siteSettings[activeOrigin] : null;
    const merged = normalize({ ...globalSettings, ...site, ai: globalSettings.ai });
    return merged;
  }

  function render(settings) {
    document.querySelector(
      `input[name="contrast-mode"][value="${settings.contrastMode}"]`
    ).checked = true;
    form.fontScale.value = Math.round(settings.fontScale * 100);
    form.fontScaleValue.value = `${form.fontScale.value}%`;
    form.lineHeight.value = settings.lineHeight;
    form.lineHeightValue.value = Number(settings.lineHeight).toFixed(1);
    form.letterSpacing.value = settings.letterSpacing;
    form.letterSpacingValue.value = `${settings.letterSpacing}px`;
    form.readableFont.checked = settings.readableFont;
    form.focusAid.checked = settings.focusAid;
    form.reducedMotion.checked = settings.reducedMotion;
    form.readingGuide.checked = settings.readingGuide;
    form.aiConsent.checked = settings.ai.consent;
    form.aiEnabled.checked = settings.ai.enabled;
    form.aiMode.value = settings.ai.mode;
    form.aiTask.value = settings.ai.task;
    form.aiQuestion.value = settings.ai.question;
    document.getElementById("describe-images").disabled = !settings.ai.enabled;
    document.getElementById("describe-selected").disabled = !settings.ai.enabled;
  }

  function collect() {
    const contrast = document.querySelector('input[name="contrast-mode"]:checked');
    const consent = form.aiConsent.checked;
    return normalize({
      contrastMode: contrast ? contrast.value : "none",
      fontScale: Number(form.fontScale.value) / 100,
      lineHeight: Number(form.lineHeight.value),
      letterSpacing: Number(form.letterSpacing.value),
      readableFont: form.readableFont.checked,
      focusAid: form.focusAid.checked,
      reducedMotion: form.reducedMotion.checked,
      readingGuide: form.readingGuide.checked,
      ai: {
        consent,
        enabled: form.aiEnabled.checked && consent,
        mode: form.aiMode.value,
        task: form.aiTask.value,
        question: form.aiQuestion.value,
        language: "vi",
        cache: true,
      },
    });
  }

  function sendToTab(settings) {
    if (!activeTab?.id || !activeTab.url?.startsWith("http")) return;
    chrome.tabs.sendMessage(
      activeTab.id,
      { type: "AURA_APPLY_SETTINGS", payload: { settings } },
      () => chrome.runtime.lastError
    );
  }

  function save() {
    const settings = collect();
    if (form.siteOverride.checked && activeOrigin) {
      const { ai, ...siteOnly } = settings;
      siteSettings[activeOrigin] = siteOnly;
      globalSettings = withGlobalAi(globalSettings, settings);
    } else {
      globalSettings = settings;
    }
    window.AuraPopupActions.saveApiKey(form.aiApiKey);

    chrome.storage.sync.set(
      {
        [SETTINGS_KEY]: globalSettings,
        [SITE_SETTINGS_KEY]: siteSettings,
        isContrastOn: settings.contrastMode !== "none",
        fontSize: Math.round(settings.fontScale * 100),
        userConfig: {
          contrastMode: settings.contrastMode,
          fontSize: settings.fontScale,
        },
      },
      () => {
        const active = currentSettings();
        render(active);
        sendToTab(active);
        form.status.textContent = form.siteOverride.checked
          ? "Đã lưu cho trang hiện tại."
          : "Đã lưu cài đặt chung.";
      }
    );
  }

  function resetSite() {
    if (activeOrigin) delete siteSettings[activeOrigin];
    form.siteOverride.checked = false;
    chrome.storage.sync.set({ [SITE_SETTINGS_KEY]: siteSettings }, () => {
      render(globalSettings);
      sendToTab(globalSettings);
      form.status.textContent = "Đã reset trang hiện tại.";
    });
  }

  function resetAll() {
    globalSettings = normalize(defaults);
    siteSettings = {};
    chrome.storage.sync.set(
      {
        [SETTINGS_KEY]: globalSettings,
        [SITE_SETTINGS_KEY]: {},
        isContrastOn: false,
        fontSize: 100,
        userConfig: { contrastMode: "none", fontSize: 1 },
      },
      () => {
        window.AuraPopupActions.clearPrivateData(form.status);
        render(globalSettings);
        sendToTab(globalSettings);
        form.status.textContent = "Đã reset toàn bộ cài đặt.";
      }
    );
  }

  function wireEvents() {
    document.querySelectorAll("input, select").forEach((element) => {
      element.addEventListener("input", () => render(collect()));
      element.addEventListener("change", save);
    });
    document.getElementById("describe-images").addEventListener("click", () => {
      window.AuraPopupActions.describe({ activeTab, form, currentSettings });
    });
    document.getElementById("describe-selected").addEventListener("click", () => {
      window.AuraPopupActions.describe({ activeTab, form, currentSettings, selectedOnly: true });
    });
    document.getElementById("clear-ai-cache").addEventListener("click", () => {
      chrome.runtime.sendMessage({ type: "AURA_CLEAR_AI_CACHE" }, () => {
        form.status.textContent = "Đã xóa cache AI.";
      });
    });
    document.getElementById("clear-private-data").addEventListener("click", () => {
      window.AuraPopupActions.clearPrivateData(form.status);
    });
    document.getElementById("reset-site").addEventListener("click", resetSite);
    document.getElementById("reset-all").addEventListener("click", resetAll);
  }

  chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
    activeTab = tab;
    try {
      activeOrigin = tab?.url ? new URL(tab.url).origin : null;
    } catch (error) {
      activeOrigin = null;
    }
    form.siteLabel.textContent = activeOrigin || "Tab hiện tại";
    chrome.storage.sync.get([SETTINGS_KEY, SITE_SETTINGS_KEY], (storage) => {
      globalSettings = normalize(storage[SETTINGS_KEY]);
      siteSettings = storage[SITE_SETTINGS_KEY] || {};
      form.siteOverride.checked = Boolean(activeOrigin && siteSettings[activeOrigin]);
      render(currentSettings());
      form.status.textContent = "Sẵn sàng.";
      wireEvents();
    });
  });
});
