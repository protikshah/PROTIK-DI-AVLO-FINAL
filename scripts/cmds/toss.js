const mongoose = require("mongoose");

const bankUserSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 }
});

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", bankUserSchema);

module.exports = {
  config: {
    name: "toss",
    aliases: ["cointoss", "flip"],
    version: "1.0.0",
    author: "DI-ABLO JI-SOO",
    countDown: 4,
    role: 0,
    shortDescription: "Play Head or Tail coin toss game",
    category: "game",
    guide: { en: "{p}toss [head/tail] [amount/2m/all]" }
  },

  parseAmount: function (str, userBalance) {
    if (!str) return null;
    str = str.toLowerCase().trim();
    if (str === "all") return userBalance;

    const match = str.match(/^(\d+(\.\d+)?)\s*([kmb])?$/);
    if (!match) return null;

    let value = parseFloat(match[1]);
    const unit = match[3];

    if (unit === "k") value *= 1000;
    else if (unit === "m") value *= 1000000;
    else if (unit === "b") value *= 1000000000;

    return Math.floor(value);
  },

  formatMoney: function (num) {
    if (num >= 1000000000) return (num / 1000000000).toFixed(1).replace(/\.0$/, "") + "ʙ";
    if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "ᴍ";
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "ᴋ";
    return num.toLocaleString();
  },

  onStart: async function ({ api, event, args, message }) {
    const senderID = event.senderID;
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

    try {
      let user = await BankUser.findOne({ userID: senderID });
      if (!user) user = await BankUser.create({ userID: senderID, balance: 1000 });

      const choice = args[0]?.toLowerCase();
      if (!choice || !["head", "tail", "heads", "tails", "h", "t"].includes(choice)) {
        return sendMsg("❌ ᴘʟᴇᴀsᴇ ᴄʜᴏᴏsᴇ 'ʜᴇᴀᴅ' ᴏʀ 'ᴛᴀɪʟ'.\nᴇxᴀᴍᴘʟᴇ: #ᴛᴏss ʜᴇᴀᴅ 2ᴍ");
      }

      const userChoice = (choice === "head" || choice === "heads" || choice === "h") ? "HEAD" : "TAIL";
      const betAmount = this.parseAmount(args[1], user.balance);

      if (betAmount === null || isNaN(betAmount) || betAmount <= 0) {
        return sendMsg("❌ ɪɴᴠᴀʟɪᴅ ʙᴇᴛ ᴀᴍᴏᴜɴᴛ!");
      }

      if (user.balance < betAmount) {
        return sendMsg(`❌ ɪɴsᴜғғɪᴄɪᴇɴᴛ ʙᴀʟᴀɴᴄᴇ! ʏᴏᴜ ʜᴀᴠᴇ $${user.balance.toLocaleString()}.`);
      }

      const coin = Math.random() < 0.5 ? "HEAD" : "TAIL";
      const coinIcon = coin === "HEAD" ? "🪙 [👑 HEAD]" : "🪙 [🦅 TAIL]";
      const isWin = userChoice === coin;

      let newBalance = user.balance;
      let resultMsg = "";

      if (isWin) {
        newBalance += betAmount;
        resultMsg = `🎉 ʙᴀʙʏ, ʏᴏᴜ ᴡᴏɴ $${this.formatMoney(betAmount * 2)}!`;
      } else {
        newBalance -= betAmount;
        resultMsg = `💔 ʙᴀʙʏ, ʏᴏᴜ ʟᴏsᴛ $${this.formatMoney(betAmount)}`;
      }

      await BankUser.updateOne({ userID: senderID }, { $set: { balance: newBalance } });

      const response = `✨ ─── [ ᴄᴏɪɴ ᴛᴏss ] ─── ✨\n\n` +
        `👤 ʏᴏᴜʀ ᴄʜᴏɪᴄᴇ: ${userChoice}\n` +
        `🎲 ʀᴇsᴜʟᴛ: ${coinIcon}\n\n` +
        `${resultMsg}\n` +
        `💰 ɴᴇᴡ ʙᴀʟᴀɴᴄᴇ: $${newBalance.toLocaleString()}`;

      return sendMsg(response);
    } catch (err) {
      console.error(err);
      return sendMsg("❌ ᴄᴏɪɴ ᴛᴏss ɢᴀᴍᴇ ᴇʀʀᴏʀ!");
    }
  }
};
