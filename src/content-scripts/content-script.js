(function () {
// --- 1. HÀM KIỂM TRA ẢNH LỖI ---
function isImageMissingAlt(img) {
  if (!img.hasAttribute('alt') || img.alt.trim() === '') {
    return true;
  }
  var lowerAlt = img.alt.toLowerCase();
  var invalidExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
  return invalidExtensions.some(function(ext) { return lowerAlt.endsWith(ext); });
}

// --- 1b. KIỂM TRA SRC HỢP LỆ ---
function hasValidSrc(img) {
  var src = img.src;
  if (!src || src === '' || src === window.location.href) return false;
  if (src.startsWith('data:') || src.startsWith('blob:')) return false;
  return true;
}

// --- 1c. KIỂM TRA KÍCH THƯỚC TỐI THIỂU ---
function isTooSmall(img) {
  if (!img.complete) return false;
  var w = img.naturalWidth || img.width;
  var h = img.naturalHeight || img.height;
  return (w > 0 && w < 50) || (h > 0 && h < 50);
}

// --- 2. HÀM XỬ LÝ CHÍNH & UI PHẢN HỒI ---
async function processSingleImage(img) {
  if (!chrome.runtime || !chrome.runtime.id) return;

  if (img.dataset.aiStatus === 'processing' || img.dataset.aiStatus === 'done') {
    return;
  }

  if (!isImageMissingAlt(img)) return;
  if (!hasValidSrc(img)) return;
  if (isTooSmall(img)) return;

  img.dataset.aiStatus = 'processing';
  img.style.border = '4px dashed #f1c40f';
  img.style.transition = 'border 0.3s';

  try {
    var response = await chrome.runtime.sendMessage({
      type: 'GET_AI_DESCRIPTION',
      imageUrl: img.src
    });

    if (response && response.status === 'success') {
      img.alt = response.description;
      img.dataset.aiStatus = 'done';
      img.style.border = '4px solid #2ecc71';
      img.title = 'AI: ' + response.description;
    } else {
      throw new Error((response && response.message) || 'Lỗi không xác định từ AI');
    }
  } catch (error) {
    console.error("AURA:", error);
    img.style.border = '4px solid #e74c3c';
    img.dataset.aiStatus = 'error';
    img.title = "Lỗi khi gọi AI";
  }
}

// --- 3. LOGIC LAZY LOAD ---
function setupMutationObserver() {
  var observer = new MutationObserver(function(mutationsList) {
    for (var i = 0; i < mutationsList.length; i++) {
      var mutation = mutationsList[i];
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(function(node) {
          if (node.nodeName === 'IMG') {
            processSingleImage(node);
          } else if (node.querySelectorAll) {
            var imgs = node.querySelectorAll('img');
            imgs.forEach(processSingleImage);
          }
        });
      }
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

// --- 4. KHỞI CHẠY ---
// Guard: after an extension update the old content script's APIs are invalid.
if (chrome.runtime && chrome.runtime.id) {
  chrome.runtime.sendMessage({ type: 'CHECK_AI_AVAILABLE' }, function(response) {
    if (chrome.runtime.lastError) {
      return;
    }
    if (!response || !response.available) {
      return;
    }

    var initialImages = document.querySelectorAll('img');
    initialImages.forEach(processSingleImage);
    setupMutationObserver();
  });
}
})();
