const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "slot",
    aliases: ["slots"],
    version: "2.5",
    author: "Protik / Assistant",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Spin slot machine with video" },
    category: "games",
    guide: { en: "{pn} [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0) return message.reply("❌ | নিয়ম: !slot [bet_amount]");
    if (bet > 50000000000) return message.reply("❌ | সর্বোচ্চ বেট লিমিট $50,000,000,000 (50 Billion)!");

    let userData = await usersData.get(senderID);
    let uData = userData.data || {};
    let money = uData.money !== undefined ? uData.money : 10000000;

    if (money < bet) return message.reply("❌ | পর্যাপ্ত ব্যালেন্স নেই!");

    const icons = ["🎰", "⭐", "💎", "🔔", "🍎"];
    const slot1 = icons[Math.floor(Math.random() * icons.length)];
    const slot2 = icons[Math.floor(Math.random() * icons.length)];
    const slot3 = icons[Math.floor(Math.random() * icons.length)];

    let winMultiplier = 0;
    if (slot1 === slot2 && slot2 === slot3) winMultiplier = 3;
    else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) winMultiplier = 1.5;

    const isWin = winMultiplier > 0;
    const videoUrl = isWin ? "https://i.imgur.com/K0YQ2mX.mp4" : "https://i.imgur.com/43A8gYm.mp4";
    const cacheVideo = path.join(__dirname, "cache", `slot_${Date.now()}.mp4`);
    await fs.ensureDir(path.join(__dirname, "cache"));

    const vidRes = await axios.get(videoUrl, { responseType: "arraybuffer" });
    await fs.writeFile(cacheVideo, Buffer.from(vidRes.data));

    let msg = "";
    if (isWin) {
      let prize = Math.floor(bet * winMultiplier);
      uData.money = money + prize;
      msg = `🎰 SLOT MACHINE 🎰\n[ ${slot1} | ${slot2} | ${slot3} ]\n\n🎉 JACKPOT/WIN!\n💰 +$${prize.toLocaleString()}\n💵 Balance: $${uData.money.toLocaleString()}`;
    } else {
      uData.money = money - bet;
      msg = `🎰 SLOT MACHINE 🎰\n[ ${slot1} | ${slot2} | ${slot3} ]\n\n😭 YOU LOST!\n💸 -$${bet.toLocaleString()}\n💵 Balance: $${uData.money.toLocaleString()}`;
    }

    await usersData.set(senderID, { data: uData });

    return message.reply({
      body: msg,
      attachment: fs.createReadStream(cacheVideo)
    }, () => fs.unlinkSync(cacheVideo));
  }
};
