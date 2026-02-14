import axios from "axios";
import { bot } from "./bot.js";

const CLIENT_ID = process.env.TWITCH_CLIENT_ID!;
const CLIENT_SECRET = process.env.TWITCH_CLIENT_SECRET!;
const PUBLIC_URL = process.env.PUBLIC_URL!;

let accessToken: string;

export const streamers = new Map<string, string>();
// key = twitch_user_id
// value = telegram_channel_id

export async function getAppToken() {
  const res = await axios.post(
    "https://id.twitch.tv/oauth2/token",
    null,
    {
      params: {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: "client_credentials",
      },
    }
  );

  accessToken = res.data.access_token;
}

export async function subscribeToStreamer(userId: string) {
  await axios.post(
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
    }
  );
}

export async function handleStreamOnline(data: any) {
  const userId = data.event.broadcaster_user_id;
  const channelId = streamers.get(userId);

  if (!channelId) return;

  await bot.telegram.sendMessage(
    channelId,
    `🔴 ${data.event.broadcaster_user_name} начал стрим!\nhttps://twitch.tv/${data.event.broadcaster_user_login}`
  );
}
