import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import { bot } from "./bot.js";
import { handleStreamOnline } from "./twitch.js";

const app = express();
app.use(bodyParser.json());

const PUBLIC_URL = process.env.PUBLIC_URL;
const BOT_TOKEN = process.env.BOT_TOKEN;

// Telegram webhook
app.use(bot.webhookCallback(`/telegram/${BOT_TOKEN}`));

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
  
  // Устанавливаем Telegram webhook
  await bot.telegram.setWebhook(`${PUBLIC_URL}/telegram/${BOT_TOKEN}`);
  console.log("Telegram webhook установлен");
});
