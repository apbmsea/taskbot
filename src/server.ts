import express from "express";
import bodyParser from "body-parser";
import { handleStreamOnline } from "./twitch.js";

const app = express();
app.use(bodyParser.json());

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

app.listen(3000, () => {
  console.log("Webhook server running");
});
