(function () {
  const AI_CONFIG_KEY = "auraAiConfig";

  function aiPayload(form) {
    return {
      task: form.aiTask.value,
      question: form.aiQuestion.value.trim(),
    };
  }

  function firstSuccess(results) {
    return results?.find((item) => item?.status === "success" && item.description);
  }

  function describe({ activeTab, form, currentSettings, selectedOnly = false }) {
    if (!currentSettings().ai.enabled) {
      form.status.textContent = "Cần bật AI và đồng ý quyền riêng tư trước.";
      return;
    }
    if (!activeTab?.id || !activeTab.url?.startsWith("http")) {
      form.status.textContent = "Chỉ xử lý ảnh trên tab http/https.";
      return;
    }
    const type = selectedOnly ? "AURA_DESCRIBE_SELECTED_IMAGE" : "AURA_DESCRIBE_IMAGES";
    form.status.textContent = "AURA đang xử lý ảnh.";
    chrome.tabs.sendMessage(activeTab.id, { type, payload: aiPayload(form) }, (res) => {
      if (chrome.runtime.lastError) {
        form.status.textContent = "Không thể kết nối content script trên tab này.";
        return;
      }
      const first = firstSuccess(res?.results);
      if (first) {
        chrome.runtime.sendMessage({ type: "AURA_SPEAK_TEXT", payload: { text: first.description } });
      }
      form.status.textContent = first
        ? `Đã xử lý ${res?.count || 0} ảnh và đọc kết quả đầu tiên.`
        : res?.results?.[0]?.message || `Đã xử lý ${res?.count || 0} ảnh.`;
    });
  }

  function saveApiKey(input) {
    const apiKey = input.value.trim();
    if (!apiKey) return;
    chrome.storage.local.set({ [AI_CONFIG_KEY]: { apiKey, updatedAt: Date.now() } }, () => {
      chrome.runtime.sendMessage({ type: "AURA_REFRESH_AI_CONFIG" });
      input.value = "";
      input.placeholder = "API key đã lưu cục bộ";
    });
  }

  function clearPrivateData(status) {
    chrome.runtime.sendMessage({ type: "AURA_CLEAR_AI_CACHE" });
    chrome.storage.local.remove([AI_CONFIG_KEY], () => {
      status.textContent = "Đã xóa cache AI và API key cục bộ.";
    });
  }

  window.AuraPopupActions = {
    clearPrivateData,
    describe,
    saveApiKey,
  };
})();
