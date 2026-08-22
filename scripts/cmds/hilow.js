const mongoose = require("mongoose");

const bankUserSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 }
});

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", bankUserSchema);

module.exports = {
  config: {
    name: "hilow",
    aliases: ["highlow"],
    version: "1.0.0",
    author: "DI-ABLO JI-SOO",
    countDown: 4,
    role: 0,
    shortDescription: "Guess if next card is High or Low",
    category: "game",
    guide: { en: "{p}hilow [high/low] [amount/2m/all]" }
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
      if (!choice || !["high", "low", "hi", "lo", "h", "l"].includes(choice)) {
        return sendMsg("❌ ᴘʟᴇᴀsᴇ ᴄʜᴏᴏsᴇ 'ʜɪɢʜ' ᴏʀ 'ʟᴏᴡ'.\nᴇxᴀᴍᴘʟᴇ: #ʜɪʟᴏᴡ ʜɪɢʜ 2ᴍ");
      }

      const userChoice = (choice === "high" || choice === "hi" || choice === "h") ? "HIGH" : "LOW";
      const betAmount = this.parseAmount(args[1], user.balance);

      if (betAmount === null || isNaN(betAmount) || betAmount <= 0) {
        return sendMsg("❌ ɪɴᴠᴀʟɪᴅ ʙᴇᴛ ᴀᴍᴏᴜɴᴛ!");
      }

      if (user.balance < betAmount) {
        return sendMsg(`❌ ɪɴsᴜғғɪᴄɪᴇɴᴛ ʙᴀʟᴀɴᴄᴇ! ʏᴏᴜ ʜᴀᴠᴇ $${user.balance.toLocaleString()}.`);
      }

      const cardNames = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
      const suits = ["♠️", "♥️", "♦️", "♣️"];

      const baseCardVal = Math.floor(Math.random() * 11) + 1; // 1 to 11
      const nextCardVal = Math.floor(Math.random() * 13); // 0 to 12

      const baseCardStr = `${cardNames[baseCardVal]} ${suits[Math.floor(Math.random() * suits.length)]}`;
      const nextCardStr = `${cardNames[nextCardVal]} ${suits[Math.floor(Math.random() * suits.length)]}`;

      let actualOutcome = "";
      if (nextCardVal > baseCardVal) actualOutcome = "HIGH";
      else if (nextCardVal < baseCardVal) actualOutcome = "LOW";
      else actualOutcome = "EQUAL";

      let newBalance = user.balance;
      let resultMsg = "";

      if (actualOutcome === "EQUAL") {
        resultMsg = `🤝 🎨 ᴇǫᴜᴀʟ ᴄᴀʀᴅ! ʏᴏᴜʀ ʙᴇᴛ ɪs ʀᴇᴛᴜʀɴᴇᴅ.`;
      } else if (userChoice === actualOutcome) {
        newBalance += betAmount;
        resultMsg = `🎉 ʙᴀʙʏ, ʏᴏᴜ ᴡᴏɴ $${this.formatMoney(betAmount * 2)}!`;
      } else {
        newBalance -= betAmount;
        resultMsg = `💔 ʙᴀʙʏ, ʏᴏᴜ ʟᴏsᴛ $${this.formatMoney(betAmount)}`;
      }

      await BankUser.updateOne({ userID: senderID }, { $set: { balance: newBalance } });

      const response = `🃏 ─── [ ʜɪɢʜ / ʟᴏᴡ ᴄᴀʀᴅs ] ─── 🃏\n\n` +
        `🎴 ʙᴀsᴇ ᴄᴀʀᴅ: [ ${baseCardStr} ]\n` +
        `🎴 ɴᴇxᴛ ᴄᴀʀᴅ: [ ${nextCardStr} ]\n\n` +
        `👤 ʏᴏᴜʀ ɢᴜᴇss: ${userChoice}\n` +
        `${resultMsg}\n` +
        `💰 ɴᴇᴡ ʙᴀʟᴀɴᴄᴇ: $${newBalance.toLocaleString()}`;

      return sendMsg(response);
    } catch (err) {
      console.error(err);
      return sendMsg("❌ ʜɪʟᴏᴡ ɢᴀᴍᴇ ᴇʀʀᴏʀ!");
    }
  }
};
