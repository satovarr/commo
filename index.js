const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const { addStreak, getLeaderboard, getGroup } = require("./utils");
require("dotenv").config();

const startTime = Date.now();

async function startWhatsAppClient() {
  const client = await new Client({
    authStrategy: new LocalAuth(),
  });

  client.on("qr", (qr) => {
    qrcode.generate(qr, { small: true });
  });

  client.on("ready", () => {
    console.log("Client is ready!");
  });

  client.on("message", async (message) => {

    // Group
    const groupId = message.from;
    const group = await getGroup(groupId);
    console.log("group", group)
    // Check if the message is received after the script started
    const messageTimestamp = message.timestamp * 1000;
    if (messageTimestamp > startTime) {
      const participantId = message.author;
      const participantName = message._data.notifyName;
      const groupId = message.from;
      const hasMedia = message.hasMedia;
      
      // Check if the message is from a group
      if (message._data.id.participant) {
          if (message.body === "!leaderboard") {
            const leaderboard = await getLeaderboard(groupId);
            console.log("Leaderboard requested from group", groupId)
            message.reply(leaderboard);
          } else {
          
          console.log("Message received from group", groupId, "by participant", participantId, hasMedia? "with media" : "");
          // Call addStreak function
          addStreak(participantId, participantName, groupId, hasMedia, group.maxPoints);
        }
      }
    }
  });

  client.on("authenticated", (session) => {
    console.log("Authenticated!");
  });

  await client.initialize();
}

startWhatsAppClient();
