const BAD_PHRASES = [
  "感動しました",
  "感激しました",
  "感銘を受けました",
  "貴サロン",
  "御社",
  "気軽に",
  "こんにちは",
  "はじめまして",
  "導入することで",
  "改善できます",
  "大変かと思います"
];

const SOFT_PHRASES = [
  "もしよろしければ",
  "かもしれません",
  "できればと思い",
  "ご連絡いたしました",
  "ご連絡しました",
  "少しでも"
];

function scoreSingleMessage(message, lead) {
  let score = 0;
  const text = String(message || "");
  const lower = text.toLowerCase();

  if (lead.businessName && text.includes(lead.businessName)) score += 15;
  if (text.includes("Instagram")) score += 8;
  if (text.includes("予約")) score += 12;
  if (text.includes("導線")) score += 8;
  if (text.includes("もしよろしければ")) score += 10;

  SOFT_PHRASES.forEach((phrase) => {
    if (text.includes(phrase)) score += 4;
  });

  BAD_PHRASES.forEach((phrase) => {
    if (text.includes(phrase)) score -= 18;
  });

  if (lead.hasLine) {
    if (text.includes("LINE予約の自動化")) score -= 22;
    if (text.includes("LINEを活用した予約の自動化")) score -= 22;
    if (text.includes("LINE導入")) score -= 25;
    if (text.includes("予約導線を整える")) score += 10;
    if (text.includes("受付の流れ")) score += 8;
  } else {
    if (lower.includes("line")) score += 10;
  }

  if (text.includes("必ず") || text.includes("絶対")) score -= 20;
  if (text.length < 70) score -= 8;
  if (text.length > 220) score -= 12;

  return score;
}

export async function selectBestMessage(lead, messages = []) {
  if (!Array.isArray(messages) || messages.length === 0) {
    return {
      ...lead,
      messages: [],
      selectedMessage: null,
      status: "no-messages"
    };
  }

  const ranked = messages.map((message, index) => ({
    id: `variant_${index + 1}`,
    text: message,
    score: scoreSingleMessage(message, lead)
  }));

  ranked.sort((a, b) => b.score - a.score);

  return {
    ...lead,
    messages: ranked,
    selectedMessage: ranked[0],
    updatedAt: new Date().toISOString(),
    status: "message-selected"
  };
}
