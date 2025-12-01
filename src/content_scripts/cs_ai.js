console.log(`=== AI: Chạy tại ${window.location.href} ===`);

const VIEWPORT_DELAY_MS = 500; 

function isImageMissingAlt(img) {
  if (img.width < 50 || img.height < 50) return false;

  if (!img.hasAttribute('alt') || img.alt.trim() === '') return true;

  const lowerAlt = img.alt.toLowerCase();
  const invalidExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp'];
  return invalidExtensions.some(ext => lowerAlt.endsWith(ext));
}

async function processSingleImage(img) {
  if (img.dataset.aiStatus) return;

  img.dataset.aiStatus = 'processing';
  img.style.border = '4px dashed #f1c40f';
  
  console.log(`[Calling AI] Đang gọi API cho ảnh: ${img.src.slice(0, 40)}...`);

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_AI_DESCRIPTION',
      imageUrl: img.src
    });

    if (response && response.status === 'success') {
      img.alt = response.description;

      img.dataset.aiStatus = 'done';
      img.style.border = '4px solid #2ecc71';
      img.title = `AI: ${response.description}`;
    } else {
      throw new Error(response.message || 'Unknown Error');
    }

  } catch (error) {
    console.error(`[Error] Ảnh ${img.src}:`, error);
   
    img.dataset.aiStatus = 'error';
    img.style.border = '2px solid #e74c3c';
    img.title = "Lỗi kết nối AI";
  }
}

const intersectionObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;

      processSingleImage(img);
      observer.unobserve(img);
    }
  });
}, {
  root: null,
  rootMargin: '100px',
  threshold: 0.1
});

function registerImage(img) {
  if (!isImageMissingAlt(img)) return;

  if (img.dataset.aiObserved === 'true') return;

  img.dataset.aiObserved = 'true';

  intersectionObserver.observe(img);
}

function setupMutationObserver() {
  const observerCallback = (mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        mutation.addedNodes.forEach(node => {
          if (node.nodeName === 'IMG') {
            registerImage(node);
          } else if (node.querySelectorAll) {
            node.querySelectorAll('img').forEach(registerImage);
          }
        });
      }
    }
  };

  const observer = new MutationObserver(observerCallback);
  observer.observe(document.body, { childList: true, subtree: true });
}

console.log("--> Bắt đầu quét và theo dõi...");
document.querySelectorAll('img').forEach(registerImage);
setupMutationObserver();