const mongoose = require("mongoose");

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  loan: { type: Number, default: 0 }
}));

module.exports = {
  config: {
    name: "sendmoney",
    aliases: ["pay"],
    version: "1.1.0",
    author: "DI-ABLO JI-SOO",
    countDown: 2,
    role: 0,
    shortDescription: "Send money to another user",
    category: "economy",
    guide: { en: "{p}sendmoney [@user / reply] [amount]" }
  },

  onStart: async function ({ api, event, args, message, usersData }) {
    const senderID = event.senderID;
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

    let targetID = null;
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    } else if (Object.keys(event.mentions || {}).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    }

    if (!targetID || targetID === senderID) {
      return sendMsg("❌ ʏᴏᴜ ᴍᴜsᴛ ᴍᴇɴᴛɪᴏɴ ᴏʀ ʀᴇᴘʟʏ ᴛᴏ ᴀɴᴏᴛʜᴇʀ ᴜsᴇʀ ᴛᴏ sᴇɴᴅ ᴍᴏɴᴇʏ.");
    }

    const amount = parseInt(args[args.length - 1]);
    if (isNaN(amount) || amount <= 0) {
      return sendMsg("❌ ᴜsᴀɢᴇ: !sᴇɴᴅᴍᴏɴᴇʏ [@ᴜsᴇʀ / ʀᴇᴘʟʏ] [ᴀᴍᴏᴜɴᴛ]");
    }

    try {
      let sender = await BankUser.findOne({ userID: senderID });
      if (!sender) sender = await BankUser.create({ userID: senderID, balance: 1000, loan: 0 });

      if (sender.balance < amount) {
        return sendMsg("❌ ᴛʀᴀɴsᴀᴄᴛɪᴏɴ ғᴀɪʟᴇᴅ. ɪɴsᴜғғɪᴄɪᴇɴᴛ ʙᴀʟᴀɴᴄᴇ.");
      }

      let target = await BankUser.findOne({ userID: targetID });
      if (!target) target = await BankUser.create({ userID: targetID, balance: 1000, loan: 0 });

      sender.balance -= amount;
      target.balance += amount;

      await sender.save();
      await target.save();

      const senderName = await usersData.getName(senderID);
      const targetName = await usersData.getName(targetID);

      return sendMsg(`💸 ─── [ ᴛʀᴀɴsᴀᴄᴛɪᴏɴ sᴜᴄᴄᴇssғᴜʟ ] ─── 💸\n\n` +
        `📤 sᴇɴᴅᴇʀ: ${senderName}\n` +
        `📥 ʀᴇᴄᴇɪᴠᴇʀ: ${targetName}\n` +
        `💵 ᴀᴍᴏᴜɴᴛ: $${amount.toLocaleString()}\n` +
        `💰 ʏᴏᴜʀ ʀᴇᴍᴀɪɴɪɴɢ ʙᴀʟᴀɴᴄᴇ: $${sender.balance.toLocaleString()}`
      );
    } catch (err) {
      console.error(err);
      return sendMsg("❌ ᴛʀᴀɴsᴀᴄᴛɪᴏɴ ғᴀɪʟᴇᴅ.");
    }
  }
};
