console.log(`=== AURA AI: Chạy tại ${window.location.href} ===`);

const API_DELAY_MS = 4200; 

const imageQueue = [];
let isProcessingQueue = false;

function isImageMissingAlt(img) {
  if (img.width < 60 || img.height < 60) return false;
  if (!img.hasAttribute('alt') || img.alt.trim() === '') return true;
  
  const lowerAlt = img.alt.toLowerCase();

  const invalidExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.webp', 'may be an image'];
  return invalidExtensions.some(ext => lowerAlt.includes(ext));
}

function addToQueue(img) {
  if (img.dataset.aiStatus) return;

  img.dataset.aiStatus = 'queued';
  img.style.border = '4px dotted #95a5a6';

  imageQueue.push(img);
  
  processQueue();
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
  
  console.log(`[Calling AI] Đang gọi API cho ảnh: ${img.src.slice(0, 30)}...`);

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
    img.title = "Lỗi/Hết quota";
  }
}

const intersectionObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
 
      if (isImageMissingAlt(img)) {
        addToQueue(img);
      }
      
      observer.unobserve(img);
    }
  });
}, { rootMargin: '50px', threshold: 0.1 });

function registerImage(img) {
  if (img.dataset.aiStatus) return;
  if (!isImageMissingAlt(img)) return;
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

document.querySelectorAll('img').forEach(registerImage);
setupMutationObserver();