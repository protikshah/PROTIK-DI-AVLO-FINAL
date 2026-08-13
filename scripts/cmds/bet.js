const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "bet",
    version: "2.5",
    author: "Protik / Assistant",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Quick bet with video" },
    category: "games",
    guide: { en: "{pn} [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0) return message.reply("❌ | নিয়ম: !bet [amount]");
    if (bet > 50000000000) return message.reply("❌ | সর্বোচ্চ বেট লিমিট $50,000,000,000 (50 Billion)!");

    let userData = await usersData.get(senderID);
    let uData = userData.data || {};
    let money = uData.money !== undefined ? uData.money : 10000000;

    if (money < bet) return message.reply("❌ | Not enough balance!");

    const isWin = Math.random() < 0.5;
    const videoUrl = isWin ? "https://i.imgur.com/K0YQ2mX.mp4" : "https://i.imgur.com/43A8gYm.mp4";
    const cacheVideo = path.join(__dirname, "cache", `bet_${Date.now()}.mp4`);
    await fs.ensureDir(path.join(__dirname, "cache"));

    const vidRes = await axios.get(videoUrl, { responseType: "arraybuffer" });
    await fs.writeFile(cacheVideo, Buffer.from(vidRes.data));

    let msg = "";
    if (isWin) {
      uData.money = money + bet;
      msg = `💥 QUICK BET WIN!\n🎰 You bet: $${bet.toLocaleString()}\n💰 You won: $${bet.toLocaleString()}\n💵 Balance: $${uData.money.toLocaleString()}`;
    } else {
      uData.money = money - bet;
      msg = `💥 QUICK BET LOSS!\n🎰 You bet: $${bet.toLocaleString()}\n💸 You won: $0\n💵 Balance: $${uData.money.toLocaleString()}`;
    }

    await usersData.set(senderID, { data: uData });

    return message.reply({
      body: msg,
      attachment: fs.createReadStream(cacheVideo)
    }, () => fs.unlinkSync(cacheVideo));
  }
};
