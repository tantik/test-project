import "dotenv/config";
import { AIAgent } from "./agents/ai-agent.js";
import { BUSINESS_TYPES } from "./config/business-types.js";

const leadAgent = new AIAgent("lead-generator");
const salesAgent = new AIAgent("sales-manager");
const polisherAgent = new AIAgent("message-polisher");

function parseVariants(text) {
  const get = (label) => {
    const regex = new RegExp(`${label}:([\\s\\S]*?)(?=パターン[A-C]:|$)`);
    const match = text.match(regex);
    return match ? match[1].trim() : "";
  };

  return {
    A: get("パターンA"),
    B: get("パターンB"),
    C: get("パターンC")
  };
}

function scoreVariant(text) {
  let score = 0;

  if (text.includes("突然のご連絡失礼いたします")) score += 2;
  if (text.includes("Instagramを拝見")) score += 2;
  if (text.includes("LINE")) score += 2;
  if (
    text.includes("ご返信いただけますと幸いです") ||
    text.includes("もしよろしければ、お話しできればと思っております")
  ) {
    score += 2;
  }
  if (text.includes("楽に") || text.includes("スムーズ")) score += 1;

  const badWords = [
    "感動しました",
    "感心しました",
    "感激しました",
    "貴サロン",
    "御社",
    "気軽に",
    "こんにちは",
    "はじめまして"
  ];

  badWords.forEach((word) => {
    if (text.includes(word)) score -= 3;
  });

  if (text.length > 180) score -= 1;

  return score;
}

function pickBestVariant(variants) {
  const entries = Object.entries(variants).map(([key, text]) => ({
    key,
    text,
    score: scoreVariant(text)
  }));

  entries.sort((a, b) => b.score - a.score);
  return entries[0];
}

async function run() {
  try {
    const businessType = BUSINESS_TYPES.nail;

    const leadInput = `
Instagram:
https://instagram.com/example_salon

Описание:
- небольшой ${businessType.label}
- есть LINE予約
- нет полноценной внешней онлайн-системы записи
- посты с ${businessType.instagramPoint}
- не сеть
`;

    console.log("=== АНАЛИЗ ЛИДА ===");
    const analysis = await leadAgent.handleTask(leadInput);
    console.log(analysis);

    const shouldContact = analysis.toLowerCase().includes("да");

    if (!shouldContact) {
      console.log("\nЛид не подходит, пропускаем.");
      return;
    }

    const salesInput = `
Канал: Instagram DM
Тип бизнеса: ${businessType.label}

Наблюдение:
- посмотрели Instagram
- есть LINE予約
- нужно мягко подвести к теме LINE予約
- не утверждать факты о внутренних процессах клиента
- нужен спокойный, вежливый и живой тон
- с мягким намёком на пользу
- акцент для персонализации: ${businessType.instagramPoint}
- подсказка по тону: ${businessType.toneHint}

Сгенерируй 3 варианта первого сообщения.
`;

    console.log("\n=== СООБЩЕНИЯ ===");
    const rawMessages = await salesAgent.handleTask(salesInput);
    console.log(rawMessages);

    const variants = parseVariants(rawMessages);
    const best = pickBestVariant(variants);

    console.log("\n=== РЕКОМЕНДОВАННЫЙ ВАРИАНТ ===");
    console.log(`パターン${best.key} (score: ${best.score})`);
    console.log(best.text);

    console.log("\n=== УЛУЧШЕННЫЙ ВАРИАНТ ===");
    const improved = await polisherAgent.handleTask(`
Ниже сообщение для cold outreach в Японии.

Задача:
- улучшить его до максимально естественного и аккуратного уровня
- сохранить основной смысл
- сделать чуть чище и мягче
- не делать его более рекламным
- не добавлять новых идей
- если сообщение уже хорошее, менять минимально

Сообщение:
${best.text}
`);

    console.log(improved);
  } catch (error) {
    console.error("Ошибка запуска:", error.message);
  }
}

run();
