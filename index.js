import "dotenv/config";
import { AIAgent } from "./agents/ai-agent.js";

const leadAgent = new AIAgent("lead-generator");
const salesAgent = new AIAgent("sales-manager");

async function run() {
  try {
    const leadInput = `
Instagram салона в Токио.
Небольшой nail salon.
Есть Instagram.
Есть LINE予約.
Нет сложной внешней системы записи.
Не сеть.
`;

    console.log("=== АНАЛИЗ ЛИДА ===");
    const analysis = await leadAgent.handleTask(leadInput);
    console.log(analysis);

    if (analysis.includes("да")) {
      console.log("\n=== СООБЩЕНИЕ КЛИЕНТУ ===");

      const message = await salesAgent.handleTask(`
Канал: Instagram DM
Тип бизнеса: ネイルサロン
Город: 東京

Наблюдение:
- посмотрели Instagram
- дизайн работ выглядит аккуратно и стильно
- у салона есть LINE予約
- хотим предложить улучшение процесса записи

Напиши первое сообщение для холодного контакта.
Оно должно быть вежливым, естественным, персональным и коротким.
`);

      console.log(message);
    } else {
      console.log("\nЛид не подходит, пропускаем.");
    }
  } catch (error) {
    console.error("Ошибка запуска:", error.message);
  }
}

run();
