import "dotenv/config";
import { AIAgent } from "./agents/ai-agent.js";

const leadAgent = new AIAgent("lead-generator");
const salesAgent = new AIAgent("sales-manager");

// 🔹 простой парсер A/B/C
function parseVariants(text) {
  const get = (label) => {
    const regex = new RegExp(`${label}:([\\s\\S]*?)(?=パターン[A-C]:|$)`);
    const m = text.match(regex);
    return m ? m[1].trim() : "";
  };

  return {
    A: get("パターンA"),
    B: get("パターンB"),
    C: get("パターンC")
  };
}

// 🔹 скоринг (простые правила под Японию)
function scoreVariant(v) {
  let score = 0;

  // must-have
  if (v.includes("突然のご連絡失礼いたします")) score += 2;
  if (v.includes("Instagramを拝見")) score += 2;
  if (v.includes("LINE")) score += 2;
  if (v.includes("ご返信いただけますと幸いです")) score += 2;

  // soft value
  if (v.includes("楽に") || v.includes("スムーズ")) score += 1;

  // penalties
  const bad = ["感動しました", "感心しました", "貴サロン", "御社", "気軽に"];
  bad.forEach((w) => {
    if (v.includes(w)) score -= 3;
  });

  // слишком длинно
  if (v.length > 180) score -= 1;

  return score;
}

function pickBest(variants) {
  const entries = Object.entries(variants).map(([k, v]) => ({
    key: k,
    text: v,
    score: scoreVariant(v)
  }));

  entries.sort((a, b) => b.score - a.score);
  return entries[0];
}

async function run() {
  try {
    const leadInput = `
Instagram:
https://instagram.com/example_salon

Описание:
- небольшой ネイルサロン
- есть LINE予約
- нет полноценной внешней онлайн-системы записи
- посты с дизайнами ногтей
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
Тип бизнеса: ネイルサロン

Наблюдение:
- посмотрели Instagram
- аккуратные и стильные nail designs
- у салона есть LINE予約
- нужно мягко подвести к теме LINE予約
- не утверждать факты
- нужен спокойный, вежливый тон
- с мягким намёком на пользу

Сгенерируй 3 варианта первого сообщения.
`;

    console.log("\n=== СООБЩЕНИЯ ===");
    const raw = await salesAgent.handleTask(salesInput);
    console.log(raw);

    const variants = parseVariants(raw);
    const best = pickBest(variants);

    console.log("\n=== РЕКОМЕНДОВАННЫЙ ВАРИАНТ ===");
    console.log(`パターン${best.key} (score: ${best.score})`);
    console.log(best.text);
  } catch (error) {
    console.error("Ошибка запуска:", error.message);
  }
}

run();
