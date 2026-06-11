export const AI_TASKS = new Set(["caption", "ocr", "objects", "question"]);

export function normalizeAiTask(task) {
  return AI_TASKS.has(task) ? task : "caption";
}

function taskInstruction(task, question) {
  if (task === "ocr") return "Extract readable text from the image.";
  if (task === "objects") return "List salient objects, layout, and relevant visual cues.";
  if (task === "question") {
    return `Answer this user question about the image: ${question || "Describe what matters."}`;
  }
  return "Describe the image for a blind or low-vision user.";
}

export function buildGeminiRequest({ image, task, question, language }) {
  const normalizedTask = normalizeAiTask(task);
  const outputLanguage = language === "en" ? "English" : "Vietnamese";
  const prompt = [
    `Task: ${taskInstruction(normalizedTask, question)}`,
    `Language: ${outputLanguage}.`,
    "Return compact JSON only with keys: caption, detectedText, objects, cautions, answer.",
    "Use arrays for detectedText, objects, cautions.",
    "Do not identify people, infer protected traits, or include unsupported certainty.",
  ].join(" ");

  return {
    contents: [
      {
        parts: [
          { text: prompt },
          {
            inline_data: {
              mime_type: image.mimeType,
              data: image.data,
            },
          },
        ],
      },
    ],
  };
}
