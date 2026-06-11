(function () {
  const MAX_BATCH = 6;
  let settings = null;
  let observer = null;
  let scanTimer = null;
  let selectedImage = null;

  function hasWeakAlt(img) {
    if (!img || !img.src) return false;
    const alt = (img.getAttribute("alt") || "").trim();
    if (!alt) return true;
    return /\.(png|jpe?g|gif|webp|svg)$/i.test(alt);
  }

  function isPrivateLikeHost(hostname) {
    const host = hostname.replace(/^\[|\]$/g, "").toLowerCase();
    const isIpv6 = host.includes(":");
    return (
      host === "localhost" ||
      host.endsWith(".localhost") ||
      host.endsWith(".local") ||
      host.endsWith(".lan") ||
      host.endsWith(".localdomain") ||
      host.endsWith(".home.arpa") ||
      /^10\./.test(host) ||
      /^127\./.test(host) ||
      /^169\.254\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[0-1])\./.test(host) ||
      /^192\.168\./.test(host) ||
      (isIpv6 &&
        (host === "::1" ||
          host.startsWith("fc") ||
          host.startsWith("fd") ||
          host.includes(":ffff:") ||
          host.startsWith("fe80:")))
    );
  }

  function publicImageSource(img) {
    try {
      const url = new URL(img.currentSrc || img.src, document.baseURI);
      if (!["http:", "https:"].includes(url.protocol)) return "";
      if (isPrivateLikeHost(url.hostname)) return "";
      return url.toString();
    } catch (error) {
      return "";
    }
  }

  function isVisibleImage(img) {
    const rect = img.getBoundingClientRect();
    if (rect.width < 24 || rect.height < 24) return false;
    if (
      rect.bottom <= 0 ||
      rect.right <= 0 ||
      rect.top >= window.innerHeight ||
      rect.left >= window.innerWidth
    ) {
      return false;
    }
    const style = window.getComputedStyle(img);
    return (
      style.display !== "none" &&
      style.visibility !== "hidden" &&
      Number(style.opacity) !== 0
    );
  }

  function candidates() {
    return Array.from(document.images || [])
      .filter(hasWeakAlt)
      .filter(isVisibleImage)
      .filter((img) => Boolean(publicImageSource(img)))
      .filter((img) => img.dataset.auraAiStatus !== "done")
      .slice(0, MAX_BATCH);
  }

  function setStatus(img, status, text) {
    img.dataset.auraAiStatus = status;
    if (text) img.title = text;
  }

  function markSelected(img) {
    if (img && img.tagName === "IMG" && isVisibleImage(img)) selectedImage = img;
  }

  function taskOptions(options = {}) {
    return {
      task: options.task || settings?.ai?.task || "caption",
      question: options.question || settings?.ai?.question || "",
    };
  }

  async function describeImage(img, options = {}) {
    if (!settings || !settings.ai.enabled || !settings.ai.consent) {
      return { status: "error", message: "AI chưa được bật hoặc chưa được đồng ý." };
    }
    if (!img || !img.src || img.dataset.auraAiStatus === "loading") {
      return { status: "skipped" };
    }

    const imageUrl = publicImageSource(img);
    if (!imageUrl) {
      return { status: "skipped", message: "Image source is not visible or public." };
    }

    setStatus(img, "loading", "AURA đang tạo mô tả ảnh.");
    const response = await chrome.runtime.sendMessage({
      type: "AURA_DESCRIBE_IMAGE",
      payload: {
        imageUrl,
        ...taskOptions(options),
        language: settings.ai.language,
        cache: settings.ai.cache,
      },
    });

    if (response && response.status === "success") {
      const description = response.description.trim();
      if (!img.dataset.auraOriginalAlt) img.dataset.auraOriginalAlt = img.getAttribute("alt") || "";
      img.alt = description;
      img.setAttribute("aria-label", description);
      img.dataset.auraAiResult = JSON.stringify(response.result || {});
      img.dataset.auraAiGeneratedAt = new Date().toISOString();
      setStatus(img, "done", `AURA AI: ${description}`);
      return response;
    }

    setStatus(img, "error", response?.message || "Không thể mô tả ảnh.");
    return response || { status: "error", message: "Không thể mô tả ảnh." };
  }

  async function scanAndDescribe() {
    if (!settings || !settings.ai.enabled || !settings.ai.consent) return [];
    if (settings.ai.mode === "manual") return [];
    const list = candidates();
    const results = [];
    for (const img of list) {
      results.push(await describeImage(img));
    }
    return results;
  }

  function scheduleScan() {
    window.clearTimeout(scanTimer);
    scanTimer = window.setTimeout(scanAndDescribe, 450);
  }

  function configure(nextSettings) {
    settings = window.AuraDefaults.normalizeSettings(nextSettings);
    if (!settings.ai.enabled || !settings.ai.consent) return;
    if (!observer) {
      observer = new MutationObserver(scheduleScan);
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }
    scheduleScan();
  }

  async function describeVisibleImages(options = {}) {
    const list = candidates();
    const results = [];
    for (const img of list) {
      results.push(await describeImage(img, options));
    }
    return results;
  }

  async function describeSelectedImage(options = {}) {
    if (!selectedImage) return [{ status: "skipped", message: "Chưa chọn ảnh trên trang." }];
    return [await describeImage(selectedImage, options)];
  }

  document.addEventListener("mouseover", (event) => markSelected(event.target), { passive: true });
  document.addEventListener("focusin", (event) => markSelected(event.target));

  window.AuraAi = {
    configure,
    describeSelectedImage,
    describeVisibleImages,
  };
})();
