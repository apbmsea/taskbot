import "dotenv/config";
import { Telegraf } from "telegraf";
import axios from "axios";
import { getAppToken, subscribeToStreamer, streamers } from "./twitch.js";
export const bot = new Telegraf(process.env.BOT_TOKEN);
bot.command("register", async (ctx) => {
    try {
        const parts = ctx.message.text.split(" ");
        if (parts.length < 3) {
            return ctx.reply("Используй: /register twitch_username @telegram_channel");
        }
        const twitchUsername = parts[1];
        const telegramChannel = parts[2];
        const token = await getAppToken();
        const res = await axios.get("https://api.twitch.tv/helix/users", {
            params: { login: twitchUsername },
            headers: {
                "Client-ID": process.env.TWITCH_CLIENT_ID,
                Authorization: `Bearer ${token}`,
            },
        });
        if (!res.data.data || res.data.data.length === 0) {
            return ctx.reply(`Пользователь ${twitchUsername} не найден на Twitch`);
        }
        const userId = res.data.data[0].id;
        streamers.set(userId, telegramChannel);
        await subscribeToStreamer(userId);
        ctx.reply("Готово. Буду отправлять уведомления.");
    }
    catch (error) {
        console.error("Ошибка регистрации:", error.message);
        ctx.reply("Произошла ошибка при регистрации. Проверьте данные и попробуйте снова.");
    }
});
bot.launch();
//# sourceMappingURL=bot.js.map