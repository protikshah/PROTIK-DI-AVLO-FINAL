const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "rps",
    version: "3.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Rock Paper Scissors" },
    category: "games",
    guide: { en: "{pn} [rock/paper/scissors] [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const userChoice = args[0]?.toLowerCase();
    const bet = parseInt(args[1]);

    if (!userChoice || !["rock", "paper", "scissors"].includes(userChoice) || isNaN(bet) || bet <= 0) return message.reply("❌ | ফরম্যাট: !rps [rock/paper/scissors] [bet_amount]");
    if (bet > 50000000000) return message.reply("❌ | সর্বোচ্চ বেট লিমিট $50,000,000,000 (50 Billion)!");

    let userData = await usersData.get(senderID);
    let uData = userData.data || {};
    let money = uData.money !== undefined ? uData.money : 10000000;

    if (money < bet) return message.reply("❌ | পর্যাপ্ত ব্যালেন্স নেই!");

    const choices = ["rock", "paper", "scissors"];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    const icons = { rock: "🪨", paper: "📄", scissors: "✂️" };

    const isWin = 
      (userChoice === "rock" && botChoice === "scissors") ||
      (userChoice === "paper" && botChoice === "rock") ||
      (userChoice === "scissors" && botChoice === "paper");

    let msg = "";
    if (userChoice === botChoice) {
      msg = `✂️ ROCK PAPER SCISSORS ✂️\nYou: ${icons[userChoice]} vs Bot: ${icons[botChoice]}\n\n🤝 DRAW! (টাকা ফেরত নেওয়া হয়েছে)`;
    } else if (isWin) {
      uData.money = money + bet;
      msg = `✂️ ROCK PAPER SCISSORS ✂️\nYou: ${icons[userChoice]} vs Bot: ${icons[botChoice]}\n\n🎉 YOU WON!\n💰 +$${bet.toLocaleString()}\n💵 Balance: $${uData.money.toLocaleString()}`;
    } else {
      uData.money = money - bet;
      msg = `✂️ ROCK PAPER SCISSORS ✂️\nYou: ${icons[userChoice]} vs Bot: ${icons[botChoice]}\n\n😭 YOU LOST!\n💸 -$${bet.toLocaleString()}\n💵 Balance: $${uData.money.toLocaleString()}`;
    }

    await usersData.set(senderID, { data: uData });

    const videoUrl = isWin ? "https://i.imgur.com/K0YQ2mX.mp4" : "https://i.imgur.com/43A8gYm.mp4";
    const cacheVideo = path.join(__dirname, "cache", `rps_${Date.now()}.mp4`);
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
