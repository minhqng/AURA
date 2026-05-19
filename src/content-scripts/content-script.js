console.log("Bắt đầu");
console.log(`=== Chạy tại ${window.location.href} ===`);

// --- 1. HÀM KIỂM TRA ẢNH LỖI ---
function isImageMissingAlt(img) {
  // Kiểm tra thiếu hoặc rỗng
  if (!img.hasAttribute('alt') || img.alt.trim() === '') {
    return true;
  }
  const lowerAlt = img.alt.toLowerCase();
  const invalidExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
  return invalidExtensions.some(ext => lowerAlt.endsWith(ext));
}

// --- 2. HÀM XỬ LÝ CHÍNH & UI PHẢN HỒI ---
async function processSingleImage(img) {
  // A. Kiểm tra cờ để tránh xử lý lại
  if (img.dataset.aiStatus === 'processing' || img.dataset.aiStatus === 'done') {
    return;
  }

  if (!isImageMissingAlt(img)) return;

  img.dataset.aiStatus = 'processing';
  img.style.border = '4px dashed #f1c40f'; // Màu vàng
  img.style.transition = 'border 0.3s';
  
  console.log(`[Gửi đi] Yêu cầu Lâm phân tích ảnh: ${img.src.slice(0, 30)}...`);

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_AI_DESCRIPTION',
      imageUrl: img.src // <-- Khớp với background.js của Lâm
    });

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
            processSingleImage(node);
          }
          else if (node.querySelectorAll) {
            const imgs = node.querySelectorAll('img');
            imgs.forEach(processSingleImage);
          }
        });
      }
    }
  };

  const observer = new MutationObserver(observerCallback);
  observer.observe(document.body, { childList: true, subtree: true });
  console.log("--> MutationObserver đã bật: Sẵn sàng bắt ảnh Lazy load.");
}

// --- 4. KHỞI CHẠY ---
chrome.runtime.sendMessage({ type: 'CHECK_AI_AVAILABLE' }, function(response) {
  if (chrome.runtime.lastError) {
    console.log("AURA: Không thể kết nối service worker.", chrome.runtime.lastError.message);
    return;
  }
  if (!response || !response.available) {
    console.log("AURA: AI chưa được cấu hình. Bỏ qua quét ảnh tự động.");
    return;
  }

  const initialImages = document.querySelectorAll('img');
  console.log(`Tìm thấy ${initialImages.length} ảnh.`);
  initialImages.forEach(processSingleImage);

  setupMutationObserver();
});
