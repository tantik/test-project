import { generateText } from "../services/openai-client.js";

function sanitizePolishedText(text, fallback) {
  const result = String(text || "").trim();

  if (!result) return fallback;

  const banned = [
    "感動しました",
    "感激しました",
    "感銘を受けました",
    "御社",
    "貴サロン",
    "大変かと思います"
  ];

  for (const phrase of banned) {
    if (result.includes(phrase)) {
      return fallback;
    }
  }

  return result;
}

export async function polishSalesMessage(lead, message) {
  const system = `
You improve Japanese cold outreach messages.

Return only the improved Japanese message text.

Rules:
- Keep the original meaning
- Keep it soft, respectful, realistic
- Make only light edits
- Do not make it more emotional
- Do not make it stronger than the original
- Do not add new claims
- Do not add phrases like:
  感動しました
  感激しました
  感銘を受けました
  大変かと思います
  導入することで
  改善できます
- Keep it concise
- Output plain Japanese text only
`;

  const user = `
Lead context:
${JSON.stringify(
  {
    businessName: lead.businessName,
    niche: lead.niche,
    channel: lead.channel,
    hasLine: lead.hasLine,
    recommendedOffer: lead.recommendedOffer
  },
  null,
  2
)}

Original message:
${message}
`;

  try {
    const result = await generateText({
      system,
      user,
      model: "gpt-4.1-mini",
      temperature: 0.2
    });

    return sanitizePolishedText(result, message);
  } catch {
    return message;
  }
}
