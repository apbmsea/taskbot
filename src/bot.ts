import { Telegraf } from "telegraf";
import axios from "axios";
import { getAppToken, subscribeToStreamer, streamers } from "./twitch.js";

export const bot = new Telegraf(process.env.BOT_TOKEN!);

bot.command("register", async (ctx) => {
  const parts = ctx.message.text.split(" ");
  if (parts.length < 3) {
    return ctx.reply("Используй: /register twitch_username @telegram_channel");
  }

  const twitchUsername = parts[1];
  const telegramChannel = parts[2];

  const res = await axios.get(
    "https://api.twitch.tv/helix/users",
    {
      params: { login: twitchUsername },
      headers: {
        "Client-ID": process.env.TWITCH_CLIENT_ID!,
        Authorization: `Bearer ${await getAppToken()}`,
      },
    }
  );

  const userId = res.data.data[0].id;

  streamers.set(userId, telegramChannel);

  await subscribeToStreamer(userId);

  ctx.reply("Готово. Буду отправлять уведомления.");
});

bot.launch();
