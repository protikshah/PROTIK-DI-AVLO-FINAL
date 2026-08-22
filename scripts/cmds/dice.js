const mongoose = require("mongoose");

const bankUserSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 }
});

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", bankUserSchema);

module.exports = {
  config: {
    name: "dice",
    aliases: ["roll"],
    version: "1.0.0",
    author: "DI-ABLO JI-SOO",
    countDown: 4,
    role: 0,
    shortDescription: "Guess dice number (1-6) for 5x win!",
    category: "game",
    guide: { en: "{p}dice [1-6] [amount/2m/all]" }
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

      const userGuess = parseInt(args[0]);
      if (isNaN(userGuess) || userGuess < 1 || userGuess > 6) {
        return sendMsg("❌ ᴘʟᴇᴀsᴇ ᴄʜᴏᴏsᴇ ᴀ ɴᴜᴍʙᴇʀ ʙᴇᴛᴡᴇᴇɴ 1 ᴀɴᴅ 6.\nᴇxᴀᴍᴘʟᴇ: #ᴅɪᴄᴇ 5 2ᴍ");
      }

      const betAmount = this.parseAmount(args[1], user.balance);

      if (betAmount === null || isNaN(betAmount) || betAmount <= 0) {
        return sendMsg("❌ ɪɴᴠᴀʟɪᴅ ʙᴇᴛ ᴀᴍᴏᴜɴᴛ!");
      }

      if (user.balance < betAmount) {
        return sendMsg(`❌ ɪɴsᴜғғɪᴄɪᴇɴᴛ ʙᴀʟᴀɴᴄᴇ! ʏᴏᴜ ʜᴀᴠᴇ $${user.balance.toLocaleString()}.`);
      }

      const diceEmojis = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
      const rolledNumber = Math.floor(Math.random() * 6) + 1;
      const diceIcon = diceEmojis[rolledNumber - 1];

      let newBalance = user.balance;
      let resultMsg = "";

      if (userGuess === rolledNumber) {
        const prize = betAmount * 5; // 5x Jackpot for exact guess
        newBalance += (prize - betAmount);
        resultMsg = `🎉 ᴊᴀᴄᴋᴘᴏᴛ! ʙᴀʙʏ, ʏᴏᴜ ᴡᴏɴ $${this.formatMoney(prize)} (5x)!`;
      } else {
        newBalance -= betAmount;
        resultMsg = `💔 ʙᴀʙʏ, ʏᴏᴜ ʟᴏsᴛ $${this.formatMoney(betAmount)}`;
      }

      await BankUser.updateOne({ userID: senderID }, { $set: { balance: newBalance } });

      const response = `🎲 ─── [ ᴅɪᴄᴇ ʀᴏʟʟ ] ─── 🎲\n\n` +
        `🎯 ʏᴏᴜʀ ɢᴜᴇss: ${userGuess}\n` +
        `🎲 ᴅɪᴄᴇ ʀᴏʟʟᴇᴅ: ${diceIcon} (${rolledNumber})\n\n` +
        `${resultMsg}\n` +
        `💰 ɴᴇᴡ ʙᴀʟᴀɴᴄᴇ: $${newBalance.toLocaleString()}`;

      return sendMsg(response);
    } catch (err) {
      console.error(err);
      return sendMsg("❌ ᴅɪᴄᴇ ɢᴀᴍᴇ ᴇʀʀᴏʀ!");
    }
  }
};
