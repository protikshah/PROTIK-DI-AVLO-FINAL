const mongoose = require("mongoose");

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  loan: { type: Number, default: 0 }
}));

module.exports = {
  config: {
    name: "bank",
    aliases: ["cutbal", "loan", "payloan"],
    version: "1.1.0",
    author: "DI-ABLO JI-SOO",
    countDown: 2,
    role: 0,
    shortDescription: "DI-ABLO Bank Services (Loan, PayLoan, CutBal)",
    category: "economy",
    guide: { en: "{p}bank cutbal [@user] [amount]\n{p}bank loan [amount]\n{p}bank payloan" }
  },

  adminUIDs: ["61591412309835"], // Replace with your Facebook UID
  adminName: "ᴅɪ-ᴀʙʟᴏ ᴊɪ-sᴏᴏ",

  onStart: async function ({ api, event, args, message, usersData }) {
    const senderID = event.senderID;
    const subCommand = args[0]?.toLowerCase();
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

    let user = await BankUser.findOne({ userID: senderID });
    if (!user) user = await BankUser.create({ userID: senderID, balance: 1000, loan: 0 });

    try {
      // SUB-COMMAND: CUTBAL
      if (subCommand === "cutbal") {
        if (!this.adminUIDs.includes(senderID)) {
          return sendMsg("❌ ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ. ᴏɴʟʏ ᴀᴅᴍɪɴɪsᴛʀᴀᴛᴏʀ ᴄᴀɴ ᴄᴜᴛ ʙᴀʟᴀɴᴄᴇ.");
        }

        let targetID = senderID;
        if (event.type === "message_reply") {
          targetID = event.messageReply.senderID;
        } else if (Object.keys(event.mentions || {}).length > 0) {
          targetID = Object.keys(event.mentions)[0];
        }

        const amount = parseInt(args[args.length - 1]);
        if (isNaN(amount) || amount <= 0) {
          return sendMsg("❌ ᴜsᴀɢᴇ: !ʙᴀɴᴋ ᴄᴜᴛʙᴀʟ [@ᴜsᴇʀ / ʀᴇᴘʟʏ] [ᴀᴍᴏᴜɴᴛ]");
        }

        let targetUser = await BankUser.findOne({ userID: targetID });
        if (!targetUser) targetUser = await BankUser.create({ userID: targetID, balance: 1000, loan: 0 });

        targetUser.balance = Math.max(0, targetUser.balance - amount);
        await targetUser.save();

        const targetName = await usersData.getName(targetID);

        return sendMsg(`⚠️ ─── [ᴅɪ-ᴀʙʟᴏ ʙᴀɴᴋ] ─── ⚠️\n\n` +
          `👤 ᴀᴅᴍɪɴ: ${this.adminName}\n` +
          `🔻 ᴅᴇʙɪᴛᴇᴅ: -$${amount.toLocaleString()}\n` +
          `🎯 ᴛᴀʀɢᴇᴛ ᴜsᴇʀ: ${targetName}\n` +
          `💰 ɴᴇᴡ ʙᴀʟᴀɴᴄᴇ: $${targetUser.balance.toLocaleString()}`
        );
      }

      // SUB-COMMAND: LOAN
      if (subCommand === "loan") {
        const amount = parseInt(args[1]);
        if (isNaN(amount) || amount <= 0) {
          return sendMsg("❌ ᴜsᴀɢᴇ: !ʙᴀɴᴋ ʟᴏᴀɴ [ᴀᴍᴏᴜɴᴛ]");
        }

        if (user.loan > 0) {
          return sendMsg("❌ ʏᴏᴜ ᴀʟʀᴇᴀᴅʏ ʜᴀᴠᴇ ᴀɴ ᴜɴᴘᴀɪᴅ ʟᴏᴀɴ. ᴘᴀʏ ɪᴛ ғɪʀsᴛ ᴜsɪɴɢ '!ʙᴀɴᴋ ᴘᴀʏʟᴏᴀɴ'.");
        }

        if (amount > 1000000) {
          return sendMsg("❌ ᴍᴀxɪᴍᴜᴍ ʟᴏᴀɴ ʟɪᴍɪᴛ ɪs $1,000,000.");
        }

        user.loan = Math.floor(amount * 1.1);
        user.balance += amount;
        await user.save();

        return sendMsg(`🏦 ─── [ ʟᴏᴀɴ ᴀᴘᴘʀᴏᴠᴇᴅ ] ─── 🏦\n\n` +
          `💵 ʟᴏᴀɴ ᴀᴍᴏᴜɴᴛ: $${amount.toLocaleString()}\n` +
          `📈 ᴛᴏᴛᴀʟ ᴅᴜᴇ (10% ɪɴᴛᴇʀᴇsᴛ): $${user.loan.toLocaleString()}\n` +
          `💰 ɴᴇᴡ ʙᴀʟᴀɴᴄᴇ: $${user.balance.toLocaleString()}`
        );
      }

      // SUB-COMMAND: PAYLOAN
      if (subCommand === "payloan") {
        if (user.loan <= 0) {
          return sendMsg("❌ ʏᴏᴜ ᴅᴏ ɴᴏᴛ ʜᴀᴠᴇ ᴀɴʏ ᴀᴄᴛɪᴠᴇ ʟᴏᴀɴs.");
        }

        if (user.balance < user.loan) {
          return sendMsg(`❌ ɪɴsᴜғғɪᴄɪᴇɴᴛ ʙᴀʟᴀɴᴄᴇ ᴛᴏ ᴘᴀʏ ʟᴏᴀɴ ᴏғ $${user.loan.toLocaleString()}.`);
        }

        user.balance -= user.loan;
        const paidAmount = user.loan;
        user.loan = 0;
        await user.save();

        return sendMsg(`✅ ─── [ ʟᴏᴀɴ ᴄʟᴇᴀʀᴇᴅ ] ─── ✅\n\n` +
          `💵 ᴘᴀɪᴅ ᴀᴍᴏᴜɴᴛ: $${paidAmount.toLocaleString()}\n` +
          `🏦 ʀᴇᴍᴀɪɴɪɴɢ ʟᴏᴀɴ: $0\n` +
          `💰 ᴄᴜʀʀᴇɴᴛ ʙᴀʟᴀɴᴄᴇ: $${user.balance.toLocaleString()}`
        );
      }

      return sendMsg("❌ ɪɴᴠᴀʟɪᴅ sᴜʙ-ᴄᴏᴍᴍᴀɴᴅ. ᴜsᴇ: cutbal, loan, or payloan.");
    } catch (err) {
      console.error(err);
      return sendMsg("❌ ʙᴀɴᴋ sᴇʀᴠɪᴄᴇ ᴇʀʀᴏʀ.");
    }
  }
};
