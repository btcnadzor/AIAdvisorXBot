import fetch from "node-fetch";
import { Telegraf } from "telegraf";

const telegramToken = process.env.TELEGRAM_BOT_TOKEN!;
const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL!;

const bot = new Telegraf(telegramToken);

bot.on("text", async (ctx) => {
  try {
    const payload = {
      telegram_id: ctx.from.id,
      telegram_username: ctx.from.username || null,
      first_name: ctx.from.first_name || null,
      last_name: ctx.from.last_name || null,
      language_code: ctx.from.language_code || null,
      is_premium: ctx.from.is_premium || false,
      chat_id: ctx.chat.id,
      chat_type: ctx.chat.type,
      message_id: ctx.message.message_id,
      text: ctx.message.text || null,
      timestamp: ctx.message.date || null,
      twitter_id: null, // пока null, добавишь позже
      wallet_address: null // тоже добавишь через Supabase/n8n позже
    };

    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    await ctx.reply(data.reply || "⚠️ Пустой ответ от AI.");
  } catch (err) {
    console.error(err);
    await ctx.reply("❌ Ошибка при обращении к AI.");
  }
});

bot.launch();
console.log("🤖 Telegram AI агент запущен");
