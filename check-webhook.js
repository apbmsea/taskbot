import "dotenv/config";
import { Telegraf } from "telegraf";

const bot = new Telegraf(process.env.BOT_TOKEN);

async function checkWebhook() {
  try {
    const info = await bot.telegram.getWebhookInfo();
    console.log("Текущий webhook:", info);
    
    if (info.url) {
      console.log("\nУдаляю старый webhook...");
      await bot.telegram.deleteWebhook();
      console.log("✅ Webhook удален");
    }
    
    if (process.env.PUBLIC_URL && process.env.PUBLIC_URL !== 'https://your-app-name.onrender.com') {
      console.log(`\nУстанавливаю новый webhook: ${process.env.PUBLIC_URL}/telegram`);
      await bot.telegram.setWebhook(`${process.env.PUBLIC_URL}/telegram`);
      console.log("✅ Webhook установлен");
      
      const newInfo = await bot.telegram.getWebhookInfo();
      console.log("\nНовый webhook:", newInfo);
    }
  } catch (error) {
    console.error("Ошибка:", error.message);
  }
}

checkWebhook();
