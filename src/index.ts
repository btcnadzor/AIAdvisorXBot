import fetch from "node-fetch";
import { Telegraf } from "telegraf";

const telegramToken = process.env.TELEGRAM_BOT_TOKEN!;
const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL!;

const bot = new Telegraf(telegramToken);

bot.on("text", async (ctx) => {
  try {
    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        telegram_id: ctx.from.id,
        username: ctx.from.username,
        text: ctx.message.text,
      }),
    });
    const data = await response.json();
    ctx.reply(data.reply || "⚠️ Пустой ответ от AI.");
  } catch (err) {
    console.error(err);
    ctx.reply("❌ Ошибка при обращении к AI.");
  }
});

bot.launch();
console.log("🤖 Telegram AI агент запущен");