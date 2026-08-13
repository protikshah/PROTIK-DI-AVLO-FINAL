const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "dice",
    aliases: ["roll"],
    version: "2.5",
    author: "Protik / Assistant",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Roll dice with video" },
    category: "games",
    guide: { en: "{pn} [1-6] [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const guess = parseInt(args[0]);
    const bet = parseInt(args[1]);

    if (isNaN(guess) || guess < 1 || guess > 6 || isNaN(bet) || bet <= 0) return message.reply("❌ | ফরম্যাট: !dice [১-৬] [bet_amount]");
    if (bet > 50000000000) return message.reply("❌ | সর্বোচ্চ বেট লিমিট $50,000,000,000 (50 Billion)!");

    let userData = await usersData.get(senderID);
    let uData = userData.data || {};
    let money = uData.money !== undefined ? uData.money : 10000000;

    if (money < bet) return message.reply("❌ | পর্যাপ্ত ব্যালেন্স নেই!");

    const rolled = Math.floor(Math.random() * 6) + 1;
    const isWin = (guess === rolled);

    const videoUrl = isWin ? "https://i.imgur.com/K0YQ2mX.mp4" : "https://i.imgur.com/43A8gYm.mp4";
    const cacheVideo = path.join(__dirname, "cache", `dice_${Date.now()}.mp4`);
    await fs.ensureDir(path.join(__dirname, "cache"));

    const vidRes = await axios.get(videoUrl, { responseType: "arraybuffer" });
    await fs.writeFile(cacheVideo, Buffer.from(vidRes.data));

    let msg = "";
    if (isWin) {
      let prize = bet * 5;
      uData.money = money + prize;
      msg = `🎲 DICE ROLL 🎲\n🎯 Guess: ${guess} | 🎲 Rolled: ${rolled}\n\n🎉 PERFECT GUESS (5x Win)!\n💰 +$${prize.toLocaleString()}\n💵 Balance: $${uData.money.toLocaleString()}`;
    } else {
      uData.money = money - bet;
      msg = `🎲 DICE ROLL 🎲\n🎯 Guess: ${guess} | 🎲 Rolled: ${rolled}\n\n😭 YOU LOST!\n💸 -$${bet.toLocaleString()}\n💵 Balance: $${uData.money.toLocaleString()}`;
    }

    await usersData.set(senderID, { data: uData });

    return message.reply({
      body: msg,
      attachment: fs.createReadStream(cacheVideo)
    }, () => fs.unlinkSync(cacheVideo));
  }
};
