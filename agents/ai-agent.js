import OpenAI from "openai";

export class AIAgent {
  constructor(role = "lead-generator") {
    this.role = role;

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  getSystemPrompt() {
    switch (this.role) {
      case "lead-generator":
        return `
Ты AI-агент по лидогенерации.

Твоя задача:
- находить потенциальных клиентов
- предлагать, где их искать
- давать конкретные действия для sales

Отвечай:
- кратко
- структурировано
- без воды
- с упором на практику
        `;

      default:
        return `
Ты AI-агент, который помогает обрабатывать задачи кратко и по делу.
        `;
    }
  }

  async handleTask(task) {
    try {
      const response = await this.client.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt()
          },
          {
            role: "user",
            content: task
          }
        ]
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error("Ошибка AI:", error);
      throw new Error("Ошибка AI-агента", { cause: error });
    }
  }
}
