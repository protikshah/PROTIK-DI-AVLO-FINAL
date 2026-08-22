const mongoose = require("mongoose");

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  loan: { type: Number, default: 0 }
}));

module.exports = {
  config: {
    name: "addbal",
    version: "1.0.0",
    author: "DI-ABLO JI-SOO",
    countDown: 2,
    role: 2,
    shortDescription: "Add balance to user (Admin Only)",
    category: "economy",
    guide: { en: "{p}addbal [@user / reply] [amount]" }
  },

  adminUIDs: ["61591412309835"], // Replace with your Facebook UID
  adminName: "ᴅɪ-ᴀ勃-ʟᴏ ᴊɪ-sᴏᴏ",

  onStart: async function ({ api, event, args, message }) {
    const senderID = event.senderID;
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

    if (!this.adminUIDs.includes(senderID)) {
      return sendMsg("❌ ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ. ᴏɴʟʏ ᴀᴅᴍɪɴɪsᴛʀᴀᴛᴏʀ ᴅɪ-ᴀʙʟᴏ ᴄᴀɴ ᴜsᴇ ᴛʜɪs ᴄᴏᴍᴍᴀɴᴅ.");
    }

    let targetID = senderID;
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions || {}).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    }

    const amount = parseInt(args[args.length - 1]);
    if (isNaN(amount) || amount <= 0) {
      return sendMsg("❌ ᴜsᴀɢᴇ: !ᴀᴅᴅʙᴀʟ [@ᴜsᴇʀ / ʀᴇᴘʟʏ] [ᴀᴍᴏᴜɴᴛ]");
    }

    try {
      let user = await BankUser.findOne({ userID: targetID });
      if (!user) {
        user = await BankUser.create({ userID: targetID, balance: 1000, loan: 0 });
      }

      user.balance += amount;
      await user.save();

      return sendMsg(`✅ ─── [ ᴅɪ-ᴀʙʟᴏ ʙᴀɴᴋ ] ─── ✅\n\n` +
        `👤 ᴀᴅᴍɪɴ: ᴅɪ-ᴀʙʟᴏ ᴊɪ-sᴏᴏ\n` +
        `💳 ᴄʀᴇᴅɪᴛᴇᴅ: +$${amount.toLocaleString()}\n` +
        `🎯 ᴛᴀʀɢᴇᴛ ᴜɪᴅ: ${targetID}\n` +
        `💰 ɴᴇᴡ ʙᴀʟᴀɴᴄᴇ: $${user.balance.toLocaleString()}`
      );
    } catch (err) {
      console.error(err);
      return sendMsg("❌ ғᴀɪʟᴇᴅ ᴛᴏ ᴀᴅᴅ ʙᴀʟᴀɴᴄᴇ.");
    }
  }
};
