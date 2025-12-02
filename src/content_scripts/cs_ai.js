console.log(`=== AURA AI: Đã kích hoạt tại ${window.location.href} ===`);

const API_DELAY_MS = 3000; 
const MIN_SIZE = 150;
const PREFETCH_MARGIN = '800px';

let imageQueue = []; 
let isProcessingQueue = false;

function isJunkImage(img) {
  // 1. Loại bỏ ảnh quá nhỏ (icon, sticker, nút bấm)
  if (img.width < MIN_SIZE || img.height < MIN_SIZE) return true;

  // 2. Kiểm tra Alt
  if (img.hasAttribute('alt') && img.alt.trim() !== '') {
    const lowerAlt = img.alt.toLowerCase();
  
    const badKeywords = [
      '.jpg', '.png', '.jpeg', '.gif', '.webp',
      'image', 'photo', 'screenshot', 
      'may be an image', 'undefined', 'null'
    ];
    if (!badKeywords.some(key => lowerAlt.includes(key))) {
      return true;
    }
  }

  // 3. Lọc theo Class rác của Facebook (Sticker, Emoji)
  const className = (img.className || '').toLowerCase();
  if (className.includes('emoji') || className.includes('sticker') || className.includes('badge')) {
    return true;
  }

  return false;
}

/**
 * @param {HTMLImageElement} img 
 * @param {boolean} isPriority
 */
function addToQueue(img, isPriority = false) {
  if (img.dataset.aiStatus === 'processing' || img.dataset.aiStatus === 'done') return;
  
  if (isJunkImage(img)) return;

  if (!img.hasAttribute('alt') || img.alt.trim() === '' || img.alt === 'image') {
    img.alt = "Đang phân tích hình ảnh, vui lòng chờ...";
  }
  img.style.cursor = 'wait';

  if (isPriority) {
    removeFromQueue(img); 
    imageQueue.unshift(img); 
    
    img.dataset.aiStatus = 'queued_priority';
    img.style.border = '4px dashed #9b59b6'; // Viền TÍM (Ưu tiên)
    processQueue();

  } else {
    if (!imageQueue.includes(img) && img.dataset.aiStatus !== 'queued') {
      imageQueue.push(img);
      
      img.dataset.aiStatus = 'queued';
      img.style.border = '4px dotted #95a5a6'; // Viền XÁM (Đang xếp hàng)
      processQueue();
    }
  }
}

function removeFromQueue(img) {
  const index = imageQueue.indexOf(img);
  if (index > -1) {
    imageQueue.splice(index, 1);
    if (img.dataset.aiStatus === 'queued') {
      delete img.dataset.aiStatus;
      img.style.border = '';
      img.style.cursor = 'default';
    }
  }
}

async function processQueue() {
  if (isProcessingQueue) return; 
  if (imageQueue.length === 0) return;

  isProcessingQueue = true;
  const img = imageQueue.shift();
  
  await processSingleImage(img);
  setTimeout(() => {
    isProcessingQueue = false;
    processQueue(); 
  }, API_DELAY_MS);
}

async function processSingleImage(img) {
  img.dataset.aiStatus = 'processing';
  img.style.border = '4px dashed #f1c40f'; 

  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_AI_DESCRIPTION',
      imageUrl: img.src
    });

    if (response && response.status === 'success') {
      img.alt = response.description;
      img.dataset.aiStatus = 'done';
      img.style.border = '4px solid #2ecc71'; // XANH LÁ
      img.style.cursor = 'help';
      img.title = `AI: ${response.description}`;
    } else {
      throw new Error(response.message || 'Unknown Error');
    }

  } catch (error) {
    console.error(`[Error]`, error);
    img.dataset.aiStatus = 'error';
    img.style.border = '2px solid #e74c3c'; // ĐỎ
    img.alt = "Không thể phân tích ảnh này.";
    img.style.cursor = 'not-allowed';
  }
}

const intersectionObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    const img = entry.target;
    if (entry.isIntersecting) {
      addToQueue(img, false);
    } else {
      removeFromQueue(img);
    }
  });
}, { 
  rootMargin: `0px 0px ${PREFETCH_MARGIN} 0px`,
  threshold: 0.01 
});

function registerImage(img) {
  if (img.dataset.aiRegistered) return;
  img.dataset.aiRegistered = 'true';
  intersectionObserver.observe(img);
}

function handleUserPriority(e) {
  const target = e.target;
  if (target.tagName === 'IMG') {
    addToQueue(target, true);
  }
}
document.addEventListener('focus', handleUserPriority, true); 
document.addEventListener('mouseover', handleUserPriority);

function setupMutationObserver() {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach(mutation => {
      mutation.addedNodes.forEach(node => {
        if (node.nodeName === 'IMG') registerImage(node);
        else if (node.querySelectorAll) node.querySelectorAll('img').forEach(registerImage);
      });
    });
  });
  observer.observe(document.body, { childList: true, subtree: true });
}

document.querySelectorAll('img').forEach(registerImage);
setupMutationObserver();