const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "flip",
    aliases: ["coin"],
    version: "3.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Coin toss game" },
    category: "games",
    guide: { en: "{pn} [head/tail] [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const choice = args[0]?.toLowerCase();
    const bet = parseInt(args[1]);

    if (!choice || (choice !== "head" && choice !== "tail") || isNaN(bet) || bet <= 0) return message.reply("❌ | ফরম্যাট: !flip [head/tail] [bet_amount]");
    if (bet > 50000000000) return message.reply("❌ | সর্বোচ্চ বেট লিমিট $50,000,000,000 (50 Billion)!");

    let userData = await usersData.get(senderID);
    let uData = userData.data || {};
    let money = uData.money !== undefined ? uData.money : 10000000;

    if (money < bet) return message.reply("❌ | পর্যাপ্ত ব্যালেন্স নেই!");

    const flipResult = Math.random() < 0.5 ? "head" : "tail";
    const isWin = (choice === flipResult);
    let msg = "";

    if (isWin) {
      uData.money = money + bet;
      msg = `🪙 COIN FLIP 🪙\n🪙 Landed on: ${flipResult.toUpperCase()}\n\n🎉 YOU WON!\n💰 +$${bet.toLocaleString()}\n💵 Balance: $${uData.money.toLocaleString()}`;
    } else {
      uData.money = money - bet;
      msg = `🪙 COIN FLIP 🪙\n🪙 Landed on: ${flipResult.toUpperCase()}\n\n😭 YOU LOST!\n💸 -$${bet.toLocaleString()}\n💵 Balance: $${uData.money.toLocaleString()}`;
    }

    await usersData.set(senderID, { data: uData });

    const videoUrl = isWin ? "https://i.imgur.com/K0YQ2mX.mp4" : "https://i.imgur.com/43A8gYm.mp4";
    const cacheVideo = path.join(__dirname, "cache", `flip_${Date.now()}.mp4`);
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
