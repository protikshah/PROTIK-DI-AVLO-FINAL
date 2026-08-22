const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  loan: { type: Number, default: 0 }
});

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", UserSchema);

module.exports = {
  config: {
    name: "bal",
    aliases: ["balance"],
    version: "1.0.0",
    author: "DI-ABLO JI-SOO",
    countDown: 2,
    role: 0,
    shortDescription: "Check DI-ABLO Bank Balance",
    category: "economy",
    guide: { en: "{p}bal [@user / reply]" }
  },

  onStart: async function ({ api, event, message }) {
    const senderID = event.senderID;
    let targetID = senderID;

    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions || {}).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    }

    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

    try {
      let user = await BankUser.findOne({ userID: targetID });
      if (!user) {
        user = await BankUser.create({ userID: targetID, balance: 1000, loan: 0 });
      }

      const nameLabel = targetID === senderID ? "ʏᴏᴜʀ" : "ᴜsᴇʀ";
      const responseStr = `🏦 ─── [ ᴅɪ-ᴀʙʟᴏ ʙᴀɴᴋ ] ─── 🏦\n\n` +
        `💳 ${nameLabel} ᴀᴄᴄᴏᴜɴᴛ ᴅᴇᴛᴀɪʟs:\n` +
        `👤 ᴜɪᴅ: ${user.userID}\n` +
        `💰 ʙᴀʟᴀɴᴄᴇ: $${user.balance.toLocaleString()}\n` +
        `🏦 ᴀᴄᴛɪᴠᴇ ʟᴏᴀɴ: $${user.loan.toLocaleString()}\n\n` +
        `───────────────`;

      return sendMsg(responseStr);
    } catch (err) {
      console.error(err);
      return sendMsg("❌ ᴇʀʀᴏʀ ғᴇᴛᴄʜɪɴɢ ʙᴀʟᴀɴᴄᴇ.");
    }
  }
};
