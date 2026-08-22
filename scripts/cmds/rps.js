const mongoose = require("mongoose");

const bankUserSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 }
});

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", bankUserSchema);

module.exports = {
  config: {
    name: "rps",
    aliases: ["rockpaperscissors"],
    version: "1.0.0",
    author: "DI-ABLO JI-SOO",
    countDown: 4,
    role: 0,
    shortDescription: "Play Rock Paper Scissors against Bot",
    category: "game",
    guide: { en: "{p}rps [rock/paper/scissors] [amount/2m/all]" }
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

      const choices = {
        r: "ROCK", rock: "ROCK", 🪨: "ROCK",
        p: "PAPER", paper: "PAPER", 📄: "ROCK",
        s: "SCISSORS", scissors: "SCISSORS", ✂️: "SCISSORS"
      };

      const userChoiceStr = args[0]?.toLowerCase();
      const userChoice = choices[userChoiceStr];

      if (!userChoice) {
        return sendMsg("❌ ᴘʟᴇᴀsᴇ ᴄʜᴏᴏsᴇ 'ʀᴏᴄᴋ', 'ᴘᴀᴘᴇʀ', ᴏʀ 'sᴄɪssᴏʀs'.\nᴇxᴀᴍᴘʟᴇ: #ʀᴘs ʀᴏᴄᴋ 2ᴍ");
      }

      const betAmount = this.parseAmount(args[1], user.balance);

      if (betAmount === null || isNaN(betAmount) || betAmount <= 0) {
        return sendMsg("❌ ɪɴᴠᴀʟɪᴅ ʙᴇᴛ ᴀᴍᴏᴜɴᴛ!");
      }

      if (user.balance < betAmount) {
        return sendMsg(`❌ ɪɴsᴜғғɪᴄɪᴇɴᴛ ʙᴀʟᴀɴᴄᴇ! ʏᴏᴜ ʜᴀᴠᴇ $${user.balance.toLocaleString()}.`);
      }

      const botOptions = ["ROCK", "PAPER", "SCISSORS"];
      const botChoice = botOptions[Math.floor(Math.random() * botOptions.length)];

      const icons = { ROCK: "🪨 ʀᴏᴄᴋ", PAPER: "📄 ᴘᴀᴘᴇʀ", SCISSORS: "✂️ sᴄɪssᴏʀs" };

      let newBalance = user.balance;
      let resultMsg = "";

      if (userChoice === botChoice) {
        resultMsg = `🤝 ɪᴛ's ᴀ ᴛɪᴇ! ʏᴏᴜʀ ʙᴇᴛ ɪs ʀᴇᴛᴜʀɴᴇᴅ.`;
      } else if (
        (userChoice === "ROCK" && botChoice === "SCISSORS") ||
        (userChoice === "PAPER" && botChoice === "ROCK") ||
        (userChoice === "SCISSORS" && botChoice === "PAPER")
      ) {
        newBalance += betAmount;
        resultMsg = `🎉 ʙᴀʙʏ, ʏᴏᴜ ᴡᴏɴ $${this.formatMoney(betAmount * 2)}!`;
      } else {
        newBalance -= betAmount;
        resultMsg = `💔 ʙᴀʙʏ, ʏᴏᴜ ʟᴏsᴛ $${this.formatMoney(betAmount)}`;
      }

      await BankUser.updateOne({ userID: senderID }, { $set: { balance: newBalance } });

      const response = `⚔️ ─── [ ʀ.ᴘ.s ᴄʜᴀʟʟᴇɴɢᴇ ] ─── ⚔️\n\n` +
        `👤 ʏᴏᴜ: ${icons[userChoice]}\n` +
        `🤖 ʙᴏᴛ: ${icons[botChoice]}\n\n` +
        `${resultMsg}\n` +
        `💰 ɴᴇᴡ ʙᴀʟᴀɴᴄᴇ: $${newBalance.toLocaleString()}`;

      return sendMsg(response);
    } catch (err) {
      console.error(err);
      return sendMsg("❌ ʀᴘs ɢᴀᴍᴇ ᴇʀʀᴏʀ!");
    }
  }
};
