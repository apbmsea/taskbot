import "dotenv/config";
import { Telegraf } from "telegraf";
import axios from "axios";
import { getAppToken, subscribeToStreamer, streamers } from "./twitch.js";

export const bot = new Telegraf(process.env.BOT_TOKEN);

console.log("🤖 Telegram бот инициализирован");

bot.use((ctx, next) => {
  console.log(`📨 Получено сообщение от ${ctx.from?.username || ctx.from?.id}: ${ctx.message?.text || 'не текст'}`);
  return next();
});

bot.command("start", (ctx) => {
  console.log("✅ Команда /start от", ctx.from?.username);
  ctx.reply("Привет! Используй /register twitch_username @telegram_channel");
});

bot.command("list", (ctx) => {
  console.log("📋 Команда /list от", ctx.from?.username);
  if (streamers.size === 0) {
    return ctx.reply("Нет зарегистрированных стримеров");
  }
  let msg = `Зарегистрировано стримеров: ${streamers.size}\n\n`;
  for (const [userId, channel] of streamers) {
    msg += `ID: ${userId} → ${channel}\n`;
  }
  ctx.reply(msg);
});

bot.command("register", async (ctx) => {
  console.log("\n🔵 === НАЧАЛО РЕГИСТРАЦИИ ===");
  try {
    const parts = ctx.message.text.split(" ");
    console.log("📝 Получена команда:", ctx.message.text);
    console.log("📝 Части команды:", parts);
    
    if (parts.length < 3) {
      console.log("❌ Недостаточно параметров");
      return ctx.reply("Используй: /register twitch_username @telegram_channel");
    }

    const twitchUsername = parts[1];
    const telegramChannel = parts[2];
    console.log(`📺 Twitch: ${twitchUsername}`);
    console.log(`💬 Telegram: ${telegramChannel}`);

    console.log("🔑 Получаю Twitch токен...");
    const token = await getAppToken();
    console.log("✅ Токен получен");
    
    console.log(`🔍 Ищу пользователя ${twitchUsername} на Twitch...`);
    const res = await axios.get("https://api.twitch.tv/helix/users", {
      params: { login: twitchUsername },
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID,
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.data.data || res.data.data.length === 0) {
      console.log(`❌ Пользователь ${twitchUsername} не найден`);
      return ctx.reply(`Пользователь ${twitchUsername} не найден на Twitch`);
    }

    const userId = res.data.data[0].id;
    console.log(`✅ Найден пользователь: ID=${userId}`);

    streamers.set(userId, telegramChannel);
    console.log(`💾 Сохранено: ${userId} -> ${telegramChannel}`);
    console.log(`📊 Всего стримеров: ${streamers.size}`);

    console.log("📡 Подписываюсь на события Twitch...");
    await subscribeToStreamer(userId);
    console.log("✅ Подписка успешна");

    ctx.reply("Готово. Буду отправлять уведомления.");
    console.log("🔵 === РЕГИСТРАЦИЯ ЗАВЕРШЕНА ===\n");
  } catch (error) {
    console.error("❌ ОШИБКА РЕГИСТРАЦИИ:", error.message);
    console.error("Stack:", error.stack);
    ctx.reply("Произошла ошибка при регистрации. Проверьте данные и попробуйте снова.");
  }
});
