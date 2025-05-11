import fetch from "node-fetch";
import { Telegraf } from "telegraf";

const telegramToken = process.env.TELEGRAM_BOT_TOKEN!;
const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL!;

const bot = new Telegraf(telegramToken);

// Обработка текстовых сообщений
bot.on("text", async (ctx) => {
  await handleMessage(ctx, "text", ctx.message.text);
});

// Обработка голосовых сообщений
bot.on("voice", async (ctx) => {
  try {
    const fileId = ctx.message.voice.file_id;
    const voiceLink = await ctx.telegram.getFileLink(fileId);
    await handleMessage(ctx, "voice", voiceLink.href);
  } catch (err) {
    console.error("Ошибка при получении голосового сообщения:", err);
    await ctx.reply("❌ Error processing a voice message.");
  }
});

// Универсальная отправка в n8n
async function handleMessage(ctx: any, type: "text" | "voice", content: string) {
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
      timestamp: ctx.message.date || null,
      message_type: type, // "text" или "voice"
      text: type === "text" ? content : null,
      voice_url: type === "voice" ? content : null,
      twitter_id: null,
      wallet_address: null
    };

    const response = await fetch(n8nWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    await ctx.reply(data.reply || "⚠️ Technical work is underway.");
  } catch (err) {
    console.error("Ошибка при отправке в n8n:", err);
    await ctx.reply("❌ Technical work is underway.");
  }
}

bot.launch();
console.log("🤖 AIAdvisorXBot is running");
