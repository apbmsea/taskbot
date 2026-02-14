import "dotenv/config";
import axios from "axios";
import { bot } from "./bot.js";

const CLIENT_ID = process.env.TWITCH_CLIENT_ID;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET;
const PUBLIC_URL = process.env.PUBLIC_URL;

let accessToken;

export const streamers = new Map();

console.log("🎮 Twitch модуль инициализирован");
console.log(`📡 Webhook URL: ${PUBLIC_URL}/webhook`);

export async function getAppToken() {
  if (accessToken) {
    console.log("✅ Используется существующий токен");
    return accessToken;
  }

  console.log("🔑 Запрашиваю новый Twitch токен...");
  const res = await axios.post("https://id.twitch.tv/oauth2/token", null, {
    params: {
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
    },
  });

  accessToken = res.data.access_token;

  if (!accessToken) throw new Error("Не удалось получить Twitch access token");

  console.log("✅ Twitch токен получен");
  return accessToken;
}

export async function subscribeToStreamer(userId) {
  console.log(`\n📡 === ПОДПИСКА НА TWITCH ===");
  console.log(`User ID: ${userId}`);
  console.log(`Webhook: ${PUBLIC_URL}/webhook`);
  
  try {
    const response = await axios.post(
      "https://api.twitch.tv/helix/eventsub/subscriptions",
      {
        type: "stream.online",
        version: "1",
        condition: { broadcaster_user_id: userId },
        transport: {
          method: "webhook",
          callback: `${PUBLIC_URL}/webhook`,
          secret: "supersecret",
        },
      },
      {
        headers: {
          "Client-ID": CLIENT_ID,
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    console.log("✅ Подписка создана:", response.data);
    console.log("📡 === ПОДПИСКА ЗАВЕРШЕНА ===\n");
  } catch (error) {
    console.error("❌ Ошибка подписки:", error.response?.data || error.message);
    if (error.response?.data) {
      console.error("Детали:", JSON.stringify(error.response.data, null, 2));
    }
    throw error;
  }
}

export async function handleStreamOnline(data) {
  console.log("\n🔴 === СТРИМ НАЧАЛСЯ ===");
  console.log("Полные данные:", JSON.stringify(data, null, 2));
  
  try {
    const userId = data.event.broadcaster_user_id;
    const userName = data.event.broadcaster_user_name;
    const userLogin = data.event.broadcaster_user_login;
    
    console.log(`📺 Стример: ${userName} (${userLogin})`);
    console.log(`🆔 User ID: ${userId}`);
    
    const channelId = streamers.get(userId);
    console.log(`💬 Канал для уведомления: ${channelId}`);
    console.log(`📊 Всего зарегистрировано: ${streamers.size}`);
    console.log(`📋 Список:`, Array.from(streamers.entries()));

    if (!channelId) {
      console.log("⚠️ Канал не найден для этого стримера");
      return;
    }

    console.log(`📤 Отправляю сообщение в ${channelId}...`);
    await bot.telegram.sendMessage(
      channelId,
      `🔴 ${userName} начал стрим!\nhttps://twitch.tv/${userLogin}`,
    );
    console.log("✅ Уведомление отправлено!");
    console.log("🔴 === ОБРАБОТКА ЗАВЕРШЕНА ===\n");
  } catch (error) {
    console.error("❌ Ошибка отправки уведомления:", error.message);
    console.error("Stack:", error.stack);
  }
}
