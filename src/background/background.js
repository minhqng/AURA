let GEMINI_API_KEY = "";
let GEMINI_API_URL = "";

try {
  const config = await import("../config.js");
  GEMINI_API_KEY = config.GEMINI_API_KEY || "";
  GEMINI_API_URL = config.GEMINI_API_URL || "";
} catch (e) {
  console.warn(
    "config.js not found — AI features disabled. Copy config.example.js to config.js and add your API key."
  );
}

const GLOBAL_MAX_CONCURRENT = 5;
let globalActive = 0;
const globalQueue = [];

function globalEnqueue(fn) {
  return new Promise((resolve, reject) => {
    const run = () => {
      globalActive++;
      fn().then(resolve, reject).finally(() => {
        globalActive--;
        if (globalQueue.length > 0) globalQueue.shift()();
      });
    };
    if (globalActive < GLOBAL_MAX_CONCURRENT) run();
    else globalQueue.push(run);
  });
}

async function imageUrlToBase64(url) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const blob = await response.blob();
    const mimeType = blob.type || "image/jpeg";
    if (!mimeType.startsWith("image/")) {
      throw new Error(`Không phải ảnh (${mimeType})`);
    }

    const base64String = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(",")[1]);
      reader.onerror = () => reject(new Error("FileReader failed"));
      reader.readAsDataURL(blob);
    });
    return { base64: base64String, mimeType };
  } catch (error) {
    console.error(error);
    throw new Error("Không thể tải ảnh.");
  } finally {
    clearTimeout(timeoutId);
  }
}

async function fetchAIDescription(imageUrl) {
  if (!GEMINI_API_KEY || !GEMINI_API_URL) {
    return {
      status: "error",
      message: "API key chưa được cấu hình. Xem config.example.js",
    };
  }

  try {
    const { base64, mimeType } = await imageUrlToBase64(imageUrl);

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: "Mô tả bức ảnh này bằng một câu tiếng Việt tự nhiên, ngắn gọn để hỗ trợ người khiếm thị.",
            },
            {
              inline_data: {
                mime_type: mimeType,
                data: base64,
              },
            },
          ],
        },
      ],
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    let response;
    try {
      response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lỗi API (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    const description =
      data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (description) {
      return { status: "success", description };
    } else {
      return { status: "error", message: "AI không trả về kết quả nào." };
    }
  } catch (error) {
    console.error(error);
    const message = error.name === 'AbortError'
      ? 'Hết thời gian chờ phản hồi từ AI.'
      : error.message;
    return { status: "error", message };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (!message || !message.type) return;

  if (message.type === "CHECK_AI_STATUS") {
    sendResponse({ configured: !!(GEMINI_API_KEY && GEMINI_API_URL) });
    return;
  }

  if (message.type === "GET_AI_DESCRIPTION") {
    if (!message.imageUrl) {
      sendResponse({ status: "error", message: "Thiếu URL ảnh." });
      return;
    }
    globalEnqueue(() => fetchAIDescription(message.imageUrl))
      .then((result) => {
        sendResponse(result);
      })
      .catch((err) => {
        console.error("GET_AI_DESCRIPTION handler error:", err);
        try {
          sendResponse({ status: "error", message: err.message });
        } catch (_) {
          // Port closed — ignore
        }
      });
    return true;
  }

  if (message.type === "SPEAK_TEXT") {
    if (message.text) {
      chrome.tts.stop();
      chrome.tts.speak(message.text, {
        lang: "vi-VN",
        rate: 1.0,
      }, () => {
        if (chrome.runtime.lastError) {
          console.warn("TTS error:", chrome.runtime.lastError.message);
        }
      });
    }
  }
});
