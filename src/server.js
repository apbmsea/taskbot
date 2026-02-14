import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import { bot } from "./bot.js";
import { handleStreamOnline } from "./twitch.js";

const app = express();
app.use(bodyParser.json());

const PUBLIC_URL = process.env.PUBLIC_URL;
const BOT_TOKEN = process.env.BOT_TOKEN;

// Health check
app.get("/", (req, res) => {
  res.send("Twitch Bot is running!");
});

// Telegram webhook
app.use(bot.webhookCallback("/telegram"));

// Twitch webhook
app.post("/webhook", async (req, res) => {
  const messageType = req.headers["twitch-eventsub-message-type"];

  if (messageType === "webhook_callback_verification") {
    return res.status(200).send(req.body.challenge);
  }

  if (messageType === "notification") {
    await handleStreamOnline(req.body);
    return res.sendStatus(200);
  }

  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Webhook server running on port ${PORT}`);
  
  if (PUBLIC_URL && PUBLIC_URL !== 'https://your-app-name.onrender.com') {
    try {
      await bot.telegram.setWebhook(`${PUBLIC_URL}/telegram`);
      console.log(`✅ Telegram webhook установлен: ${PUBLIC_URL}/telegram`);
      
      const webhookInfo = await bot.telegram.getWebhookInfo();
      console.log(`Webhook info:`, webhookInfo);
    } catch (error) {
      console.error('❌ Ошибка установки webhook:', error.message);
    }
  } else {
    console.log('⚠️ PUBLIC_URL не установлен! Установите его в Environment Variables на Render');
  }
});
