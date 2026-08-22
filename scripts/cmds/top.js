const mongoose = require("mongoose");

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  loan: { type: Number, default: 0 }
}));

module.exports = {
  config: {
    name: "top",
    aliases: ["leaderboard"],
    version: "1.1.0",
    author: "DI-ABLO JI-SOO",
    countDown: 3,
    role: 0,
    shortDescription: "Top 10 richest users in DI-ABLO Bank",
    category: "economy",
    guide: { en: "{p}top" }
  },

  onStart: async function ({ api, event, message, usersData }) {
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

    try {
      const topUsers = await BankUser.find().sort({ balance: -1 }).limit(10);
      let rankStr = `🏆 ─── [ ᴅɪ-ᴀʙʟᴏ ʙᴀɴᴋ ᴛᴏᴘ 10 ] ─── 🏆\n\n`;

      for (let idx = 0; idx < topUsers.length; idx++) {
        const u = topUsers[idx];
        const uName = await usersData.getName(u.userID);
        rankStr += `${idx + 1}. 👤 ${uName}\n   💰 ʙᴀʟᴀɴᴄᴇ: $${u.balance.toLocaleString()}\n`;
      }

      rankStr += `\n───────────────`;
      return sendMsg(rankStr);
    } catch (err) {
      console.error(err);
      return sendMsg("❌ ғᴀɪʟᴇᴅ ᴛᴏ ʟᴏᴀᴅ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ.");
    }
  }
};
