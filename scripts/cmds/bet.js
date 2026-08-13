const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "bet",
    version: "3.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Quick 50/50 Bet" },
    category: "games",
    guide: { en: "{pn} [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0) return message.reply("❌ | ব্যবহারের নিয়ম: !bet [amount]");
    if (bet > 50000000000) return message.reply("❌ | সর্বোচ্চ বেট লিমিট $50,000,000,000 (50 Billion)!");

    let userData = await usersData.get(senderID);
    let uData = userData.data || {};
    let money = uData.money !== undefined ? uData.money : 10000000;

    if (money < bet) return message.reply("❌ | Not enough balance!");

    const isWin = Math.random() < 0.5;
    let msg = "";

    if (isWin) {
      uData.money = money + bet;
      msg = `💥 QUICK BET WIN!\n🎰 You bet: $${bet.toLocaleString()}\n💰 You won: $${bet.toLocaleString()}\n💵 Balance: $${uData.money.toLocaleString()}`;
    } else {
      uData.money = money - bet;
      msg = `💥 QUICK BET LOSS!\n🎰 You bet: $${bet.toLocaleString()}\n💸 You won: $0\n💵 Balance: $${uData.money.toLocaleString()}`;
    }

    await usersData.set(senderID, { data: uData });

    const videoUrl = isWin ? "https://i.imgur.com/K0YQ2mX.mp4" : "https://i.imgur.com/43A8gYm.mp4";
    const cacheVideo = path.join(__dirname, "cache", `bet_${Date.now()}.mp4`);
    await fs.ensureDir(path.join(__dirname, "cache"));

    try {
      const vidRes = await axios.get(videoUrl, { responseType: "arraybuffer", timeout: 5000 });
      await fs.writeFile(cacheVideo, Buffer.from(vidRes.data));
      
      return message.reply({
        body: msg,
        attachment: [fs.createReadStream(cacheVideo)]
      }, () => { if (fs.existsSync(cacheVideo)) fs.unlinkSync(cacheVideo); });
    } catch (e) {
      return message.reply(msg);
    }
  }
};
