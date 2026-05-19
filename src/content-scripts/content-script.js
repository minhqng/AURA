console.log("Bắt đầu");
console.log(`=== Chạy tại ${window.location.href} ===`);

const MAX_CONCURRENT = 3;
const MAX_CACHE_SIZE = 200;
const REQUEST_TIMEOUT_MS = 60000;
let activeRequests = 0;
let extensionInvalidated = false;
const pendingQueue = [];
const descriptionCache = new Map();

function enqueue(fn) {
  return new Promise((resolve, reject) => {
    const run = () => {
      activeRequests++;
      let settled = false;
      function release() {
        if (settled) return;
        settled = true;
        activeRequests--;
        if (pendingQueue.length > 0) pendingQueue.shift()();
      }
      const timer = setTimeout(() => {
        release();
        reject(new Error('Yêu cầu AI hết thời gian chờ'));
      }, REQUEST_TIMEOUT_MS);
      fn().then(
        (v) => { clearTimeout(timer); release(); resolve(v); },
        (e) => { clearTimeout(timer); release(); reject(e); }
      );
    };
    if (activeRequests < MAX_CONCURRENT) run();
    else pendingQueue.push(run);
  });
}

// --- 1. HÀM KIỂM TRA ẢNH LỖI ---
function isImageMissingAlt(img) {
  // Images explicitly marked as decorative via ARIA — do not process
  const role = img.getAttribute('role');
  if (role === 'presentation' || role === 'none') return false;
  if (img.getAttribute('aria-hidden') === 'true') return false;

  // Images with aria-label or aria-labelledby already have an accessible name
  const ariaLabel = img.getAttribute('aria-label');
  if (ariaLabel && ariaLabel.trim()) return false;
  const ariaLabelledBy = img.getAttribute('aria-labelledby');
  if (ariaLabelledBy && ariaLabelledBy.trim()) return false;

  // alt="" is intentionally empty (decorative image per WCAG) — not missing
  if (img.hasAttribute('alt') && img.alt.trim() === '') return false;

  // No alt attribute at all — truly missing
  if (!img.hasAttribute('alt')) return true;

  // Alt text that is just a filename — effectively missing
  const lowerAlt = img.alt.toLowerCase();
  const invalidExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
  return invalidExtensions.some(ext => lowerAlt.endsWith(ext));
}

function isImageVisible(img) {
  // Broken/errored images: fully loaded but no dimensions
  if (img.complete && img.naturalWidth === 0) return false;
  if (img.naturalWidth > 0 && img.naturalWidth <= 2 && img.naturalHeight <= 2) return false;
  const style = window.getComputedStyle(img);
  if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
  if (img.offsetWidth === 0 && img.offsetHeight === 0) return false;
  return true;
}

// --- 2. HÀM XỬ LÝ CHÍNH & UI PHẢN HỒI ---
async function processSingleImage(img) {
  if (extensionInvalidated) return;

  // A. Kiểm tra cờ để tránh xử lý lại
  if (img.dataset.aiStatus === 'processing' || img.dataset.aiStatus === 'done') {
    return;
  }

  if (!isImageMissingAlt(img)) return;

  // Skip images without a valid HTTP(S) src (use currentSrc for responsive images)
  const imageUrl = img.currentSrc || img.src;
  if (!imageUrl || imageUrl.trim() === '') return;
  if (!imageUrl.startsWith('http://') && !imageUrl.startsWith('https://')) return;

  // Skip invisible or tiny images (e.g. tracking pixels)
  if (!isImageVisible(img)) {
    // Image may still be loading — retry once it finishes
    if (!img.complete && !img.dataset.aiLoadRetry) {
      img.dataset.aiLoadRetry = 'pending';
      const cleanup = () => { delete img.dataset.aiLoadRetry; };
      img.addEventListener('load', () => {
        cleanup();
        processSingleImage(img).catch(() => {});
      }, { once: true });
      img.addEventListener('error', cleanup, { once: true });
    }
    return;
  }

  img.dataset.aiStatus = 'processing';
  img.style.border = '4px dashed #f1c40f'; // Màu vàng
  img.style.transition = 'border 0.3s';
  
  console.log(`[Gửi đi] Yêu cầu AI phân tích ảnh: ${imageUrl.slice(0, 60)}...`);

  try {
    let response;
    const cached = descriptionCache.get(imageUrl);
    if (cached) {
      // Re-insert so this entry becomes the most recently used (LRU eviction)
      descriptionCache.delete(imageUrl);
      descriptionCache.set(imageUrl, cached);
      response = cached;
    } else {
      response = await enqueue(() => chrome.runtime.sendMessage({
        type: 'GET_AI_DESCRIPTION',
        imageUrl: imageUrl
      }));
      if (response && response.status === 'success') {
        if (descriptionCache.size >= MAX_CACHE_SIZE) {
          const firstKey = descriptionCache.keys().next().value;
          descriptionCache.delete(firstKey);
        }
        descriptionCache.set(imageUrl, response);
      }
    }

    console.log("[Nhận về] Phản hồi:", response);

    if (response && response.status === 'success') {
      img.alt = response.description;
      img.dataset.aiStatus = 'done';
      img.style.border = '4px solid #2ecc71';
      img.title = `AI Mô tả: ${response.description}`;
    } else {
      throw new Error((response && response.message) || 'Lỗi không xác định từ AI');
    }

  } catch (error) {
    if (error.message && error.message.includes('Extension context invalidated')) {
      extensionInvalidated = true;
      img.style.border = '';
      delete img.dataset.aiStatus;
      return;
    }
    console.error("[Lỗi] Không thể lấy mô tả:", error);
    img.style.border = '4px solid #e74c3c'; 
    img.dataset.aiStatus = 'error';
    img.title = "Lỗi khi gọi AI (Check Console)";
  }
}

// --- 3. LOGIC LAZY LOAD ---
function setupMutationObserver() {
  const observerCallback = (mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeName === 'IMG') {
            processSingleImage(node).catch(() => {});
          }
          else if (node.querySelectorAll) {
            const imgs = node.querySelectorAll('img');
            imgs.forEach(img => processSingleImage(img).catch(() => {}));
          }
        });
      }
    }
  };

  const attrObserver = new MutationObserver((mutations) => {
    for (const m of mutations) {
      if (m.type === 'attributes' && m.target.nodeName === 'IMG') {
        const img = m.target;
        if (img.dataset.aiStatus === 'processing' || img.dataset.aiStatus === 'done') continue;
        processSingleImage(img).catch(() => {});
      }
    }
  });

  const observer = new MutationObserver(observerCallback);
  if (!document.body) return;
  observer.observe(document.body, { childList: true, subtree: true });
  attrObserver.observe(document.body, { attributes: true, subtree: true, attributeFilter: ['src', 'srcset'] });
  console.log("--> MutationObserver đã bật: Sẵn sàng bắt ảnh Lazy load.");
}

// --- 4. KHỞI CHẠY ---
async function checkAIStatus(retries) {
  for (let i = 0; i < retries; i++) {
    try {
      const status = await chrome.runtime.sendMessage({ type: 'CHECK_AI_STATUS' });
      if (status && status.configured) return true;
      // Background may still be loading config — retry after a delay
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 500 * (i + 1)));
      }
    } catch (e) {
      if (i < retries - 1) {
        await new Promise(r => setTimeout(r, 500 * (i + 1)));
      } else {
        console.warn('[AI Scanner] Không thể kiểm tra trạng thái AI:', e);
      }
    }
  }
  return false;
}

(async function init() {
  const aiAvailable = await checkAIStatus(3);

  if (!aiAvailable) {
    console.log('[AI Scanner] AI chưa được cấu hình. Scanner đã tắt.');
    return;
  }

  setupMutationObserver();

  const initialImages = document.querySelectorAll('img');
  console.log(`Tìm thấy ${initialImages.length} ảnh.`);
  initialImages.forEach(img => processSingleImage(img).catch(() => {}));
})();
