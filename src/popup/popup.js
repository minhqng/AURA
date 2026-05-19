document.addEventListener("DOMContentLoaded", function () {
  const contrastToggle = document.getElementById("contrast-toggle");
  const fontSlider = document.getElementById("font-slider");
  const fontSizeValue = document.getElementById("font-size-value");
  const previewText = document.getElementById("preview-text");

  if (!contrastToggle || !fontSlider || !fontSizeValue) return;

  // Load saved settings (use defaults if none)
  chrome.storage.sync.get({ isContrastOn: false, fontSize: 100 }, (res) => {
    if (chrome.runtime.lastError) {
      console.warn("Storage read failed:", chrome.runtime.lastError.message);
      return;
    }
    contrastToggle.checked = !!res.isContrastOn;
    fontSlider.value = res.fontSize != null ? res.fontSize : 100;
    updateFontDisplay(fontSlider.value);
  });

  function updateFontDisplay(size) {
    fontSizeValue.textContent = `${size}%`;
    if (previewText) previewText.style.fontSize = `${size}%`;
  }

  // Save settings and notify content script(s)
  function saveSettings() {
    const isContrastOn = !!contrastToggle.checked;
    const fontSize = Number(fontSlider.value) || 100;

    // Save a simple pair for UI and backward compatibility
    // Also write a `userConfig` object so content script and other parts
    // of the extension that expect that shape will pick up changes.
    const scale = fontSize / 100; // 1.0 = 100%
    var userConfig = {
      contrastMode: isContrastOn ? "high" : "none",
      fontSize: scale,
    };

    chrome.storage.sync.set(
      {
        isContrastOn: isContrastOn,
        fontSize: fontSize,
        userConfig: userConfig,
      },
      () => {
        if (chrome.runtime.lastError) {
          console.warn("Storage save error:", chrome.runtime.lastError.message);
        }
      }
    );

    // Send messages to the active tab so content script can apply immediately
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (chrome.runtime.lastError) {
        console.warn("Tab query failed:", chrome.runtime.lastError.message);
        return;
      }
      if (!tabs || tabs.length === 0) return;
      tabs.forEach((tab) => {
        // Skip tabs where content scripts cannot be injected
        if (!tab || !tab.url) return;
        if (!tab.url.startsWith("http:") && !tab.url.startsWith("https:"))
          return;

        // Send messages using the callback form and handle runtime.lastError
        try {
          chrome.tabs.sendMessage(
            tab.id,
            { type: "CHANGE_FONT_SIZE", payload: { scale: scale } },
            function (response) {
              if (chrome.runtime.lastError) {
                // receiving end does not exist on this tab — ignore silently
                return;
              }
            }
          );

          chrome.tabs.sendMessage(
            tab.id,
            { type: "TOGGLE_CONTRAST", payload: { isEnabled: isContrastOn } },
            function (response) {
              if (chrome.runtime.lastError) {
                return;
              }
            }
          );
        } catch (e) {
          // ignore unexpected errors
        }
      });
    });
  }

  // Event listeners
  contrastToggle.addEventListener("change", () => {
    saveSettings();
  });

  fontSlider.addEventListener("input", (e) => {
    updateFontDisplay(e.target.value);
  });

  // Save when the user stops interacting with the slider (on change)
  fontSlider.addEventListener("change", () => {
    saveSettings();
  });
});
