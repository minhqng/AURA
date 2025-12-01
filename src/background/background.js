import { GEMINI_API_KEY, GEMINI_API_URL } from "../config.js";
async function imageUrlToBase64(url) {
  try {
    const response = await fetch(url);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result.split(",")[1];
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error(error);
    throw new Error("Không thể tải ảnh.");
  }
}

async function fetchAIDescription(imageUrl) {
  try {
    const base64Image = await imageUrlToBase64(imageUrl);

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: "Mô tả bức ảnh này bằng một câu tiếng Việt tự nhiên, ngắn gọn để hỗ trợ người khiếm thị.",
            },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image,
              },
            },
          ],
        },
      ],
    };

    const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Lỗi API (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    if (data.candidates && data.candidates.length > 0) {
      const description = data.candidates[0].content.parts[0].text;
      return { status: "success", description: description };
    } else {
      return { status: "error", message: "AI không trả về kết quả nào." };
    }
  } catch (error) {
    console.error(error);
    return { status: "error", message: error.message };
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "GET_AI_DESCRIPTION") {
    fetchAIDescription(message.imageUrl).then((result) => {
      sendResponse(result);
    });
    return true;
  }

  if (message.type === "SPEAK_TEXT") {
    chrome.tts.stop();
    chrome.tts.speak(message.text, {
      lang: "vi-VN",
      rate: 1.0,
    });
  }
});
