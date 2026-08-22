const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  slotWins: { type: Number, default: 0 },
  slotTotal: { type: Number, default: 0 },
  lastSlotDate: { type: String, default: "" },
  slotCount: { type: Number, default: 0 },
  slotWindowStart: { type: Number, default: 0 }
});

const BankUser = mongoose.models.DiabloBankUser || mongoose.model("DiabloBankUser", UserSchema);

module.exports = {
  config: {
    name: "slot",
    aliases: ["slots"],
    version: "1.2.0",
    author: "DI-ABLO JI-SOO",
    countDown: 2,
    role: 0,
    shortDescription: "Play casino slot game with limit and max bet",
    category: "game",
    guide: { en: "{p}slot [amount / 2m / 5k / all]" }
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
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, "") + "ᴋ";
    return num.toLocaleString();
  },

  onStart: async function ({ api, event, args, message }) {
    const senderID = event.senderID;
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

    try {
      let user = await BankUser.findOne({ userID: senderID });
      if (!user) user = await BankUser.create({ userID: senderID, balance: 1000 });

      if (!args[0]) {
        return sendMsg("❌ ᴘʟᴇᴀsᴇ ᴇɴᴛᴇʀ ᴀ ʙᴇᴛ ᴀᴍᴏᴜɴᴛ. ᴇxᴀᴍᴘʟᴇ: !sʟᴏᴛ 2ᴍ");
      }

      let betAmount = this.parseAmount(args[0], user.balance);

      if (betAmount === null || isNaN(betAmount) || betAmount <= 0) {
        return sendMsg("❌ ɪɴᴠᴀʟɪᴅ ʙᴇᴛ ᴀᴍᴏᴜɴᴛ!");
      }

      // 50 Billion Max Bet Limit
      const MAX_BET = 50000000000; 
      if (betAmount > MAX_BET) {
        return sendMsg(`❌ ᴍᴀxɪᴍᴜᴍ ʙᴇᴛ ʟɪᴍɪᴛ ɪs $50ʙ (${this.formatMoney(MAX_BET)}).`);
      }

      if (user.balance < betAmount) {
        return sendMsg(`❌ ɪɴsᴜғғɪᴄɪᴇɴᴛ ʙᴀʟᴀɴᴄᴇ! ʏᴏᴜ ʜᴀᴠᴇ $${user.balance.toLocaleString()}.`);
      }

      // 5 Hours Cooldown & 30 Spins Limit Check
      const now = Date.now();
      const FIVE_HOURS = 5 * 60 * 60 * 1000;

      if (!user.slotWindowStart || (now - user.slotWindowStart) > FIVE_HOURS) {
        user.slotWindowStart = now;
        user.slotCount = 0;
      }

      if (user.slotCount >= 30) {
        const remainingMs = FIVE_HOURS - (now - user.slotWindowStart);
        const remainingMins = Math.ceil(remainingMs / (60 * 1000));
        const hours = Math.floor(remainingMins / 60);
        const mins = remainingMins % 60;

        const timeStr = hours > 0 ? `${hours}ʜ ${mins}ᴍ` : `${mins}ᴍ`;
        return sendMsg(`❌ ʏᴏᴜ ʜᴀᴠᴇ ʀᴇᴀᴄʜᴇᴅ ᴛʜᴇ ʟɪᴍɪᴛ ᴏғ 30 sᴘɪɴs ᴘᴇʀ 5 ʜᴏᴜʀs.\n⏳ ᴘʟᴇᴀsᴇ ᴡᴀɪᴛ ${timeStr} ᴛᴏ ᴘʟᴀʏ ᴀɢᴀɪɴ.`);
      }

      // Daily Reset Stats
      const today = new Date().toISOString().slice(0, 10);
      if (user.lastSlotDate !== today) {
        user.slotWins = 0;
        user.slotTotal = 0;
        user.lastSlotDate = today;
      }

      // Heart Icons for Slot
      const items = ["💜", "❤️", "🤍", "💚", "💛", "💙"];
      const icon1 = items[Math.floor(Math.random() * items.length)];
      const icon2 = items[Math.floor(Math.random() * items.length)];
      const icon3 = items[Math.floor(Math.random() * items.length)];

      let winMultiplier = 0;
      if (icon1 === icon2 && icon2 === icon3) {
        winMultiplier = 3;
      } else if (icon1 === icon2 || icon1 === icon3 || icon2 === icon3) {
        winMultiplier = 2;
      }

      user.slotTotal += 1;
      user.slotCount += 1;
      let resultText = "";

      if (winMultiplier > 0) {
        user.slotWins += 1;
        const prize = betAmount * winMultiplier;
        user.balance += (prize - betAmount);
        resultText = `• ʙᴀʙʏ, ʏᴏᴜ ᴡᴏɴ $${this.formatMoney(prize)}`;
      } else {
        user.balance -= betAmount;
        resultText = `• ʙᴀʙʏ, ʏᴏᴜ ʟᴏsᴛ $${this.formatMoney(betAmount)}`;
      }

      await user.save();

      const winRate = ((user.slotWins / user.slotTotal) * 100).toFixed(1);

      const response = `> 🎀\n` +
        `${resultText}\n` +
        `• ɢᴀᴍᴇ ʀᴇsᴜʟᴛs: [ ${icon1} | ${icon2} | ${icon3} ]\n\n` +
        `🎯 ᴡɪɴ ʀᴀᴛᴇ ᴛᴏᴅᴀʏ: ${winRate}% (${user.slotWins}/${user.slotTotal})\n` +
        `🎰 sᴘɪɴs ʟᴇғᴛ (5ʜ): ${30 - user.slotCount}/30`;

      return sendMsg(response);
    } catch (err) {
      console.error(err);
      return sendMsg("❌ sʟᴏᴛ ɢᴀᴍᴇ ᴇʀʀᴏʀ!");
    }
  }
};
