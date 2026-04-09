import "dotenv/config";
import { AIAgent } from "./agents/ai-agent.js";

const agent = new AIAgent("lead-generator");

async function run() {
  try {
    const result = await agent.handleTask(
      "Где искать клиентов в Японии для услуги AI-автоматизации малого бизнеса?"
    );

    console.log("Ответ агента:");
    console.log(result);
  } catch (error) {
    console.error("Ошибка запуска:", error.message);
  }
}

run();
