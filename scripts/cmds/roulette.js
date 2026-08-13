const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "roulette",
    aliases: ["wheel"],
    version: "3.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Spin roulette wheel" },
    category: "games",
    guide: { en: "{pn} [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0) return message.reply("❌ | নিয়ম: !roulette [bet_amount]");
    if (bet > 50000000000) return message.reply("❌ | সর্বোচ্চ বেট লিমিট $50,000,000,000 (50 Billion)!");

    let userData = await usersData.get(senderID);
    let uData = userData.data || {};
    let money = uData.money !== undefined ? uData.money : 10000000;

    if (money < bet) return message.reply("❌ | পর্যাপ্ত ব্যালেন্স নেই!");

    const multipliers = [0, 0.5, 1, 1.5, 2, 5, 10];
    const landed = multipliers[Math.floor(Math.random() * multipliers.length)];
    let msg = "";

    if (landed > 1) {
      let profit = Math.floor(bet * (landed - 1));
      uData.money = money + profit;
      msg = `🎡 ROULETTE SPIN 🎡\n🎯 Landed on: [ ${landed}x ]\n\n🎉 BIG WIN!\n💰 +$${profit.toLocaleString()}\n💵 Balance: $${uData.money.toLocaleString()}`;
    } else if (landed === 1) {
      msg = `🎡 ROULETTE SPIN 🎡\n🎯 Landed on: [ 1x ]\n\n⚖️ SAFE! No profit, no loss.\n💵 Balance: $${money.toLocaleString()}`;
    } else {
      let loss = Math.floor(bet * (1 - landed));
      uData.money = money - loss;
      msg = `🎡 ROULETTE SPIN 🎡\n🎯 Landed on: [ ${landed}x ]\n\n😭 YOU LOST!\n💸 -$${loss.toLocaleString()}\n💵 Balance: $${uData.money.toLocaleString()}`;
    }

    await usersData.set(senderID, { data: uData });

    const videoUrl = landed >= 1 ? "https://i.imgur.com/K0YQ2mX.mp4" : "https://i.imgur.com/43A8gYm.mp4";
    const cacheVideo = path.join(__dirname, "cache", `roulette_${Date.now()}.mp4`);
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
