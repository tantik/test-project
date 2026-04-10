import {
  extractJsonFromText,
  extractThreeMessagesFromPlainText,
  generateText
} from "../services/openai-client.js";

function normalizeMessage(value) {
  return String(value || "")
    .replace(/^["']|["']$/g, "")
    .trim();
}

function buildFallbackMessages(lead) {
  const name = lead.businessName ? `${lead.businessName}様` : "サロン様";

  if (lead.hasLine) {
    return [
      `${name}のInstagramを拝見し、丁寧なネイルケアや季節感のあるデザインがとても素敵だと感じました。ご予約導線も拝見し、LINEを含めた受付の流れをもう少し分かりやすく整えられる余地があるかもしれないと思い、ご連絡いたしました。`,
      `${name}のInstagramを拝見し、デザインの雰囲気や丁寧な印象がとても素敵だと感じました。すでにLINEもご活用されているようでしたので、受付の流れやご予約導線を少し整理できる可能性があるかもしれないと思い、ご連絡しました。`,
      `${name}の投稿を拝見し、世界観がとても丁寧で素敵だと感じました。LINEを含めたご予約導線について、もう少し分かりやすく整えられる余地があるかもしれないと思い、ご連絡いたしました。`
    ];
  }

  return [
    `${name}のInstagramを拝見し、丁寧なネイルケアや季節感のあるデザインがとても素敵だと感じました。ご予約導線について、LINEも含めてもう少し分かりやすく整えられる可能性があるかもしれないと思い、ご連絡いたしました。`,
    `${name}のInstagramを拝見し、デザインの雰囲気がとても印象的でした。ご予約の流れを少し分かりやすくできる余地があるかもしれないと思い、ご連絡しました。`,
    `${name}の投稿を拝見し、丁寧な世界観がとても素敵だと感じました。ご予約導線をもう少し整えられる可能性があるかもしれないと思い、ご連絡いたしました。`
  ];
}

export async function generateSalesMessages(lead) {
  const recommendedDirection = lead.hasLine
    ? "Do NOT propose introducing LINE. Suggest smoothing or organizing the existing reservation flow."
    : "It is acceptable to gently mention LINE-based reservation flow as one possible option.";

  const system = `
You write first-contact Japanese outreach messages for beauty businesses in Japan.

Return valid JSON:
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

    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      const messages = [parsed.A, parsed.B, parsed.C]
        .map(normalizeMessage)
        .filter(Boolean);

      if (messages.length > 0) {
        return messages;
      }
    }

    const plainTextMessages = extractThreeMessagesFromPlainText(raw)
      .map(normalizeMessage)
      .filter(Boolean);

    if (plainTextMessages.length > 0) {
      return plainTextMessages;
    }

    return buildFallbackMessages(lead);
  } catch (error) {
    console.error("sales-manager error:", error.message);
    return buildFallbackMessages(lead);
  }
}
