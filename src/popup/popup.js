document.addEventListener("DOMContentLoaded", function () {
  const contrastToggle = document.getElementById("contrast-toggle");
  const fontSlider = document.getElementById("font-slider");
  const fontSizeValue = document.getElementById("font-size-value");
  const previewText = document.getElementById("preview-text");

  // Load saved settings (use defaults if none)
  chrome.storage.sync.get({ isContrastOn: false, fontSize: 100 }, (res) => {
    contrastToggle.checked = !!res.isContrastOn;
    fontSlider.value = res.fontSize || 100;
    updateFontDisplay(fontSlider.value);
  });

  // Update preview display
  function updateFontDisplay(size) {
    fontSizeValue.textContent = `${size}%`;
    if (previewText) previewText.style.fontSize = `${size}%`;
  }

  // Send a message to the active tab, swallowing errors when no content script is present
  function sendToActiveTab(message) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || tabs.length === 0) return;
      tabs.forEach((tab) => {
        if (!tab || !tab.url) return;
        if (!tab.url.startsWith("http:") && !tab.url.startsWith("https:"))
          return;
        try {
          chrome.tabs.sendMessage(tab.id, message, function () {
            if (chrome.runtime.lastError) return;
          });
        } catch (e) {
          // ignore
        }
      });
    });
  }

  // Save all settings to storage and optionally notify content script
  function saveSettings(changedKey) {
    const isContrastOn = !!contrastToggle.checked;
    const fontSize = Number(fontSlider.value) || 100;
    const scale = fontSize / 100;

    var userConfig = {
      contrastMode: isContrastOn ? "high" : "none",
      fontSize: scale,
    };

    chrome.storage.sync.set({
      isContrastOn: isContrastOn,
      fontSize: fontSize,
      userConfig: userConfig,
    });

    // Only send the message for the setting that actually changed
    if (changedKey === "contrast") {
      sendToActiveTab({
        type: "TOGGLE_CONTRAST",
        payload: { isEnabled: isContrastOn },
      });
    } else if (changedKey === "fontSize") {
      sendToActiveTab({
        type: "CHANGE_FONT_SIZE",
        payload: { scale: scale },
      });
    }
  }

  // Event listeners
  contrastToggle.addEventListener("change", () => {
    saveSettings("contrast");
  });

  fontSlider.addEventListener("input", (e) => {
    updateFontDisplay(e.target.value);
  });

  // Save when the user stops interacting with the slider (on change)
  fontSlider.addEventListener("change", () => {
    saveSettings("fontSize");
  });
});
