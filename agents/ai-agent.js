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
Ты AI-агент по анализу лидов в Японии.

Твоя задача:
- оценить, стоит ли писать клиенту
- определить, подходит ли он под автоматизацию

Критерии хорошего лида:
- малый или средний бизнес
- есть Instagram
- есть DM予約 или LINE予約
- нет сложной системы (например HOT PEPPER — плохо)
- не сеть

Критерии плохого лида:
- крупные сети
- уже есть полноценная система записи
- HOT PEPPER

Отвечай строго в формате:
1. Стоит писать: да / нет
2. Причина: (1-2 короткие причины)
3. Потенциал: низкий / средний / высокий
      `;

      case "sales-manager":
        return `
Ты sales manager для японского рынка.

Твоя задача:
- писать сообщения клиентам на японском
- быть вежливым (丁寧)
- писать коротко (5–6 строк)
- не продавать агрессивно
- цель — получить ответ

Контекст:
мы предлагаем систему автоматизации записи через LINE для салонов

Формат:
- только сообщение на японском
- без объяснений
- естественный японский стиль
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
