const fs = require("fs-extra");
const axios = require("axios");
const path = require("path");

module.exports = {
  config: {
    name: "casino",
    aliases: ["evenodd"],
    version: "3.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Play even or odd casino" },
    category: "games",
    guide: { en: "{pn} [even/odd] [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const choice = args[0]?.toLowerCase();
    const bet = parseInt(args[1]);

    if (!choice || (choice !== "even" && choice !== "odd")) {
      return message.reply("❌ | সঠিক ফরম্যাট: !casino [even/odd] [bet_amount]");
    }
    if (isNaN(bet) || bet <= 0) return message.reply("❌ | সঠিক বেটের পরিমাণ লেখো!");
    if (bet > 50000000000) return message.reply("❌ | সর্বোচ্চ বেট লিমিট $50,000,000,000 (50 Billion)!");

    let userData = await usersData.get(senderID);
    let uData = userData.data || {};
    let money = uData.money !== undefined ? uData.money : 10000000;

    if (money < bet) return message.reply("❌ | পর্যাপ্ত ব্যালেন্স নেই!");

    const randNum = Math.floor(Math.random() * 100) + 1;
    const isEven = randNum % 2 === 0;
    const resultType = isEven ? "even" : "odd";
    const isWin = (choice === resultType);

    let msg = "";
    if (isWin) {
      let newBal = money + bet;
      uData.money = newBal;
      msg = `🚨 EVEN / ODD CASINO 🚨\n🎯 Choice: ${choice.toUpperCase()}\n🎲 Number: ${randNum} (${resultType.toUpperCase()})\n\n🎉 YOU WON!\n💰 +$${bet.toLocaleString()}\n💵 Balance: $${newBal.toLocaleString()}`;
    } else {
      let newBal = money - bet;
      uData.money = newBal;
      msg = `🚨 EVEN / ODD CASINO 🚨\n🎯 Choice: ${choice.toUpperCase()}\n🎲 Number: ${randNum} (${resultType.toUpperCase()})\n\n😭 YOU LOST!\n💸 -$${bet.toLocaleString()}\n💵 Balance: $${newBal.toLocaleString()}`;
    }

    await usersData.set(senderID, { data: uData });

    // Try video download safely
    const videoUrl = isWin ? "https://i.imgur.com/K0YQ2mX.mp4" : "https://i.imgur.com/43A8gYm.mp4";
    const cacheVideo = path.join(__dirname, "cache", `casino_${Date.now()}.mp4`);
    await fs.ensureDir(path.join(__dirname, "cache"));

    try {
      const vidRes = await axios.get(videoUrl, { responseType: "arraybuffer", timeout: 5000 });
      await fs.writeFile(cacheVideo, Buffer.from(vidRes.data));
      
      return message.reply({
        body: msg,
        attachment: [fs.createReadStream(cacheVideo)]
      }, () => { if (fs.existsSync(cacheVideo)) fs.unlinkSync(cacheVideo); });
    } catch (e) {
      // Fallback: If video download fails, reply with text instantly
      return message.reply(msg);
    }
  }
};
