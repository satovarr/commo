const qrcode = require("qrcode-terminal");
const { Client, LocalAuth } = require("whatsapp-web.js");
const { addStreak, getLeaderboard, getGroup } = require("../utils");
const Group = require("../models/Group");

const startTime = Date.now();
const client = new Client({
  authStrategy: new LocalAuth(),
});


async function startWhatsAppClient() {

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
          console.log("Leaderboard requested from group", groupId);
          message.reply(leaderboard);
        } else {
          console.log(
            "Message received from group",
            groupId,
            "by participant",
            participantId,
            hasMedia ? "with media" : ""
          );
          // Call addStreak function
          addStreak(
            participantId,
            participantName,
            groupId,
            hasMedia,
            group.maxPoints
          );
        }
      }
    }
  });

  client.on("authenticated", (session) => {
    console.log("Authenticated!");
  });

  await client.initialize();
}

async function joinWhatsAppGroup(groupCode) {

  // remove beggining url of the code
  groupCode = groupCode.split("/").pop();
  const group = await client.acceptInvite(groupCode);
  console.log("Joined group", group)
 return group;
}

module.exports = { startWhatsAppClient, joinWhatsAppGroup, client };
