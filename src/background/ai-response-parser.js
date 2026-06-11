import { normalizeAiTask } from "./ai-request-builder.js";

function asList(value) {
  if (Array.isArray(value)) return value.map(String).map((item) => item.trim()).filter(Boolean);
  if (typeof value === "string" && value.trim()) return [value.trim()];
  return [];
}

function extractJson(text) {
  const trimmed = String(text || "").trim();
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const source = fenced ? fenced[1].trim() : trimmed;
  const start = source.indexOf("{");
  const end = source.lastIndexOf("}");
  return start >= 0 && end > start ? source.slice(start, end + 1) : source;
}

export function parseAiResult(rawText, task = "caption") {
  const normalizedTask = normalizeAiTask(task);
  const fallbackText = String(rawText || "").trim();
  try {
    const parsed = JSON.parse(extractJson(fallbackText));
    return {
      task: normalizedTask,
      caption: String(parsed.caption || parsed.answer || fallbackText).trim(),
      detectedText: asList(parsed.detectedText),
      objects: asList(parsed.objects),
      cautions: asList(parsed.cautions),
      answer: String(parsed.answer || "").trim(),
    };
  } catch (error) {
    return {
      task: normalizedTask,
      caption: fallbackText,
      detectedText: [],
      objects: [],
      cautions: ["Model returned unstructured text."],
      answer: normalizedTask === "question" ? fallbackText : "",
    };
  }
}

export function descriptionForResult(result) {
  if (result.task === "ocr" && result.detectedText.length) {
    return `Văn bản trong ảnh: ${result.detectedText.join("; ")}`;
  }
  if (result.task === "objects" && result.objects.length) {
    return `Đối tượng chính: ${result.objects.join(", ")}`;
  }
  if (result.task === "question" && result.answer) return result.answer;
  return result.caption || result.answer || "Không có mô tả.";
}
