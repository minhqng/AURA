import { buildGeminiRequest, normalizeAiTask } from "./ai-request-builder.js";
import { descriptionForResult, parseAiResult } from "./ai-response-parser.js";
import { assertPublicImageUrl } from "./safe-url.js";

const DEFAULT_CONFIG = {
  GEMINI_API_KEY: "",
  GEMINI_API_BASE_URL: "https://generativelanguage.googleapis.com/v1beta/models",
  GEMINI_MODEL: "gemini-3.5-flash",
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const RATE_LIMIT = { count: 12, windowMs: 60 * 1000 };
const AI_CONFIG_KEY = "auraAiConfig";
let cachedConfig = null;

async function loadConfig() {
  if (cachedConfig) return cachedConfig;
  let fileConfig = {};
  try {
    const module = await import("../config.js");
    fileConfig = module;
  } catch (error) {
    fileConfig = { missingConfig: true };
  }
  const local = await chrome.storage.local.get(AI_CONFIG_KEY);
  const apiKey = local[AI_CONFIG_KEY]?.apiKey || fileConfig.GEMINI_API_KEY;
  cachedConfig = { ...DEFAULT_CONFIG, ...fileConfig, GEMINI_API_KEY: apiKey };
  return cachedConfig;
}

function configured(config) {
  return (
    config.GEMINI_API_KEY &&
    config.GEMINI_API_KEY !== "YOUR_API_KEY_HERE"
  );
}

async function hashText(text) {
  const bytes = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hash))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function bufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let index = 0; index < bytes.length; index += 0x8000) {
    const chunk = bytes.subarray(index, index + 0x8000);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

async function checkRateLimit() {
  const now = Date.now();
  const { auraAiRateLimit = [] } = await chrome.storage.local.get("auraAiRateLimit");
  const recent = auraAiRateLimit.filter((time) => now - time < RATE_LIMIT.windowMs);
  if (recent.length >= RATE_LIMIT.count) {
    throw new Error("Đã đạt giới hạn mô tả ảnh tạm thời. Vui lòng thử lại sau.");
  }
  recent.push(now);
  await chrome.storage.local.set({ auraAiRateLimit: recent });
}

async function getCachedDescription(cacheKey) {
  const { auraAiCache = {} } = await chrome.storage.local.get("auraAiCache");
  return auraAiCache[cacheKey];
}

async function setCachedDescription(cacheKey, output) {
  const { auraAiCache = {} } = await chrome.storage.local.get("auraAiCache");
  auraAiCache[cacheKey] = { ...output, createdAt: Date.now() };
  const entries = Object.entries(auraAiCache).slice(-80);
  await chrome.storage.local.set({ auraAiCache: Object.fromEntries(entries) });
}

async function imageToInlineData(imageUrl) {
  const url = assertPublicImageUrl(imageUrl);
  const response = await fetch(url.toString(), { cache: "force-cache", redirect: "error" });
  if (!response.ok) throw new Error(`Không thể tải ảnh (${response.status}).`);
  const blob = await response.blob();
  if (blob.size > MAX_IMAGE_BYTES) {
    throw new Error("Ảnh quá lớn để mô tả an toàn.");
  }
  const buffer = await blob.arrayBuffer();
  return {
    data: bufferToBase64(buffer),
    mimeType: blob.type || response.headers.get("content-type") || "image/jpeg",
  };
}

function geminiUrl(config) {
  const base = config.GEMINI_API_BASE_URL.replace(/\/$/, "");
  const model = encodeURIComponent(config.GEMINI_MODEL);
  return `${base}/${model}:generateContent?key=${config.GEMINI_API_KEY}`;
}

async function fetchAIDescription(payload) {
  const config = await loadConfig();
  if (!configured(config)) {
    throw new Error("Chưa cấu hình Gemini API key trong popup hoặc src/config.js.");
  }

  const task = normalizeAiTask(payload.task);
  const cacheKey = await hashText(
    [payload.imageUrl, task, payload.question || "", payload.language || "vi"].join("|")
  );
  if (payload.cache !== false) {
    const cached = await getCachedDescription(cacheKey);
    if (cached?.description) return { ...cached, cached: true };
  }

  await checkRateLimit();
  const image = await imageToInlineData(payload.imageUrl);
  const body = buildGeminiRequest({
    image,
    task,
    question: payload.question,
    language: payload.language,
  });

  const response = await fetch(geminiUrl(config), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`Gemini API lỗi ${response.status}.`);
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts
    ?.map((part) => part.text || "")
    .join(" ")
    .trim();
  if (!rawText) throw new Error("AI không trả về mô tả ảnh.");
  const result = parseAiResult(rawText, task);
  const output = { description: descriptionForResult(result), result };
  if (payload.cache !== false) await setCachedDescription(cacheKey, output);
  return output;
}

function speak(text) {
  chrome.tts.stop();
  chrome.tts.speak(String(text || ""), { lang: "vi-VN", rate: 1.0 });
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message?.type === "AURA_DESCRIBE_IMAGE" || message?.type === "GET_AI_DESCRIPTION") {
    fetchAIDescription(message.payload || { imageUrl: message.imageUrl })
      .then((output) => sendResponse({ status: "success", ...output }))
      .catch((error) => sendResponse({ status: "error", message: error.message }));
    return true;
  }

  if (message?.type === "AURA_SPEAK_TEXT" || message?.type === "SPEAK_TEXT") {
    speak(message.payload?.text || message.text);
    sendResponse({ ok: true });
    return true;
  }

  if (message?.type === "AURA_CLEAR_AI_CACHE") {
    chrome.storage.local.remove(["auraAiCache", "auraAiRateLimit"], () => {
      sendResponse({ ok: true });
    });
    return true;
  }

  if (message?.type === "AURA_REFRESH_AI_CONFIG") {
    cachedConfig = null;
    sendResponse({ ok: true });
    return true;
  }

  return false;
});
