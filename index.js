const qrcode = require("qrcode-terminal");
const { Client, RemoteAuth } = require("whatsapp-web.js");
require("dotenv").config();

// Require database
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");

// Load the session data
mongoose.connect(process.env.MONGODB_URI).then(() => {
  const store = new MongoStore({ mongoose: mongoose });
  const client = new Client({
    authStrategy: new RemoteAuth({
      store: store,
      backupSyncIntervalMs: 300000,
    }),
  });

  client.initialize();

  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("Client is ready!");
  });

  client.on("message", async (message) => {
    console.log(message);
    const chat = await message.getChat();

    if (message.body === "!ping") {
      message.reply("pong");
    }
  });

  client.on("authenticated", (session) => {
    console.log("Authenticated!");
  });
});
