import "dotenv/config";
import { AIAgent } from "./agents/ai-agent.js";

const leadAgent = new AIAgent("lead-generator");
const salesAgent = new AIAgent("sales-manager");

async function run() {
  try {
    const leadInput = `
Instagram салона в Токио.
Небольшой салон, есть Instagram, есть LINE予約, нет сложной системы.
`;

    console.log("=== АНАЛИЗ ЛИДА ===");

    const analysis = await leadAgent.handleTask(leadInput);
    console.log(analysis);

    // Простая проверка (если "да" — идём дальше)
    if (analysis.includes("да")) {
      console.log("\n=== СООБЩЕНИЕ КЛИЕНТУ ===");

      const message = await salesAgent.handleTask(`
Салон: небольшой салон в Токио
Контакт: Instagram DM
Напиши первое сообщение
      `);

      console.log(message);
    } else {
      console.log("\nЛид не подходит, пропускаем.");
    }
  } catch (error) {
    console.error("Ошибка:", error.message);
  }
}
run();
