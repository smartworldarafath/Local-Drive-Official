import { TelegramClient, Api } from "telegram";
import { StringSession } from "telegram/sessions/index.js";
import fs from "fs";
import env from "dotenv";

env.config();

const apiId = parseInt(process.env.TELEGRAM_API_ID || "30180445");
const apiHash = process.env.TELEGRAM_API_HASH || "7ba589cf9d04a0c549df7fef55dd76dd";
const sessionStr = process.env.TG_SESSION || "";

(async () => {
  const client = new TelegramClient(new StringSession(sessionStr), apiId, apiHash, {
    connectionRetries: 5,
  });
  await client.connect();
  const messages = await client.getMessages("me", { search: "#CloudGram", limit: 10 });
  const photoMsgs = messages.filter((m) => m.media instanceof Api.MessageMediaPhoto);
  
  if (photoMsgs.length > 0) {
     console.log("Found photo msg:", photoMsgs[0].id);
     const buf = await client.downloadMedia(photoMsgs[0], {});
     if (buf) {
       console.log("Downloaded photo size:", buf.length);
     } else {
       console.log("Download failed, returned undefined");
     }
  } else {
     console.log("No photos found. Found types:", messages.map(m=>m.media?.className).join());
  }
  await client.disconnect();
})();
