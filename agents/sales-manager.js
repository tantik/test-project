import {
  extractJsonFromText,
  generateText
} from "../services/openai-client.js";

export async function generateSalesMessages(lead) {
  const recommendedDirection = lead.hasLine
    ? "Do NOT propose introducing LINE. Instead suggest smoothing or organizing the existing reservation flow."
    : "It is acceptable to gently suggest LINE-based reservation flow as one possible option.";

  const system = `
You write first-contact Japanese outreach messages for beauty businesses in Japan.

Return ONLY valid JSON:
{
  "A": "string",
  "B": "string",
  "C": "string"
}

Rules:
- Natural Japanese
- Soft, respectful, realistic tone
- Suitable for Instagram DM or LINE first outreach
- No aggressive sales language
- No exaggerated praise
- No assumptions about internal operations
- Do not state that the business is struggling
- Do not state that they manually manage bookings unless explicitly visible
- Keep each message concise
- Prefer observation-based phrasing
- Use wording like:
  "〜が見受けられました"
  "〜できる余地があるかもしれません"
  "〜を少し整えられるかもしれません"
- Avoid:
  感動しました
  感激しました
  感銘を受けました
  貴サロン
  御社
  気軽に
  こんにちは
  はじめまして
  改善できます
  大変かと思います
  導入することで
  自動化できます
- JSON only
`;

  const user = `
Lead:
${JSON.stringify(
  {
    businessName: lead.businessName,
    niche: lead.niche,
    city: lead.city,
    channel: lead.channel,
    hasLine: lead.hasLine,
    hasWebsite: lead.hasWebsite,
    bookingMethod: lead.bookingMethod,
    strengths: lead.strengths,
    painPoints: lead.painPoints,
    recommendedOffer: lead.recommendedOffer,
    enrichment: lead.enrichment
  },
  null,
  2
)}

Extra direction:
${recommendedDirection}

Task:
Generate 3 Japanese first outreach messages.

A = safest and most polite
B = warmer and more human
C = slightly more value-oriented, but still soft
`;

  try {
    const raw = await generateText({
      system,
      user,
      model: "gpt-4.1-mini",
      temperature: 0.7
    });

    const parsed = extractJsonFromText(raw);

    if (!parsed) return [];

    return [parsed.A, parsed.B, parsed.C]
      .map((item) => String(item || "").trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}
