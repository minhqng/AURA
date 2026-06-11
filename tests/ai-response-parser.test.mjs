import assert from "node:assert/strict";
import test from "node:test";

import { buildGeminiRequest, normalizeAiTask } from "../src/background/ai-request-builder.js";
import { descriptionForResult, parseAiResult } from "../src/background/ai-response-parser.js";

test("AI task normalization falls back to caption", () => {
  assert.equal(normalizeAiTask("ocr"), "ocr");
  assert.equal(normalizeAiTask("bad"), "caption");
});

test("Gemini request asks for structured JSON and preserves task intent", () => {
  const request = buildGeminiRequest({
    image: { mimeType: "image/png", data: "abc" },
    task: "question",
    question: "What does the sign say?",
    language: "en",
  });
  const text = request.contents[0].parts[0].text;
  assert.match(text, /Return compact JSON only/);
  assert.match(text, /What does the sign say/);
  assert.equal(request.contents[0].parts[1].inline_data.mime_type, "image/png");
});

test("AI parser handles fenced JSON responses", () => {
  const result = parseAiResult(
    '```json\n{"caption":"A bus stop.","detectedText":["Bus 12"],"objects":["sign"],"cautions":[]}\n```',
    "ocr"
  );
  assert.equal(result.caption, "A bus stop.");
  assert.deepEqual(result.detectedText, ["Bus 12"]);
  assert.equal(descriptionForResult(result), "Văn bản trong ảnh: Bus 12");
});

test("AI parser falls back for unstructured model text", () => {
  const result = parseAiResult("A small chart with two bars.", "objects");
  assert.equal(result.caption, "A small chart with two bars.");
  assert.deepEqual(result.cautions, ["Model returned unstructured text."]);
  assert.equal(descriptionForResult(result), "A small chart with two bars.");
});
