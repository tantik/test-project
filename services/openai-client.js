import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function extractJsonFromText(text) {
  if (!text || typeof text !== "string") return null;

  const trimmed = text.trim();

  try {
    return JSON.parse(trimmed);
  } catch {
    // ignore
  }

  const fencedMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/i);
  if (fencedMatch?.[1]) {
    try {
      return JSON.parse(fencedMatch[1]);
    } catch {
      // ignore
    }
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    const maybeJson = trimmed.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(maybeJson);
    } catch {
      // ignore
    }
  }

  return null;
}

export async function generateText({
  system,
  user,
  model = "gpt-4.1-mini",
  temperature = 0.7,
  retries = 2
}) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      const response = await client.responses.create({
        model,
        temperature,
        input: [
          {
            role: "system",
            content: [{ type: "input_text", text: system }]
          },
          {
            role: "user",
            content: [{ type: "input_text", text: user }]
          }
        ]
      });

      return String(response.output_text || "").trim();
    } catch (error) {
      lastError = error;

      if (attempt < retries) {
        await sleep(700 * (attempt + 1));
      }
    }
  }

  throw lastError;
}
