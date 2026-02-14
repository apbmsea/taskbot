import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import { bot } from "./bot.js";
import { handleStreamOnline, streamers } from "./twitch.js";

const app = express();
app.use(bodyParser.json());

const PUBLIC_URL = process.env.PUBLIC_URL;
const BOT_TOKEN = process.env.BOT_TOKEN;

console.log("🌐 Express сервер инициализирован");

// Логирование всех запросов
app.use((req, res, next) => {
  console.log(`\n📥 ${req.method} ${req.path}`);
  console.log(`Headers:`, req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log(`Body:`, JSON.stringify(req.body, null, 2));
  }
  next();
});

// Health check
app.get("/", (req, res) => {
  const status = {
    status: "running",
    streamers: streamers.size,
    timestamp: new Date().toISOString()
  };
  console.log("✅ Health check:", status);
  res.json(status);
});

// Telegram webhook
app.use(bot.webhookCallback("/telegram"));

// Twitch webhook
app.post("/webhook", async (req, res) => {
  console.log("\n🎮 === TWITCH WEBHOOK ===");
  const messageType = req.headers["twitch-eventsub-message-type"];
  console.log(`📨 Тип сообщения: ${messageType}`);

  if (messageType === "webhook_callback_verification") {
    console.log("✅ Верификация webhook");
    console.log("Challenge:", req.body.challenge);
    return res.status(200).send(req.body.challenge);
  }

  if (messageType === "notification") {
    console.log("🔔 Получено уведомление от Twitch");
    await handleStreamOnline(req.body);
    return res.sendStatus(200);
  }

  console.log("⚠️ Неизвестный тип сообщения");
  res.sendStatus(200);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`\n🚀 === СЕРВЕР ЗАПУЩЕН ===");
  console.log(`🌐 Порт: ${PORT}`);
  console.log(`📡 PUBLIC_URL: ${PUBLIC_URL}`);
  
  if (PUBLIC_URL && PUBLIC_URL !== 'https://your-app-name.onrender.com') {
    try {
      console.log(`\n🔧 Устанавливаю Telegram webhook...`);
      await bot.telegram.setWebhook(`${PUBLIC_URL}/telegram`);
      console.log(`✅ Telegram webhook установлен: ${PUBLIC_URL}/telegram`);
      
      const webhookInfo = await bot.telegram.getWebhookInfo();
      console.log(`📊 Webhook info:`, webhookInfo);
    } catch (error) {
      console.error('❌ Ошибка установки webhook:', error.message);
    }
  } else {
    console.log('⚠️ PUBLIC_URL не установлен! Установите его в Environment Variables на Render');
  }
  
  console.log(`\n✅ Бот готов к работе!`);
  console.log(`🔗 Откройте: ${PUBLIC_URL || 'http://localhost:' + PORT}`);
  console.log(`🚀 === ИНИЦИАЛИЗАЦИЯ ЗАВЕРШЕНА ===\n`);
});
