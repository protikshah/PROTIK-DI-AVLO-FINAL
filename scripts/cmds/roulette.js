const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "roulette",
    aliases: ["rlt"],
    version: "5.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Spin the roulette wheel" },
    category: "games",
    guide: { en: "{pn} [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0) return message.reply("❌ | নিয়ম: !roulette [bet_amount]");
    if (bet > 50000000000) return message.reply("❌ | সর্বোচ্চ লিমিট $50 Billion!");

    let userData = await usersData.get(senderID);
    let uData = userData.data || {};
    let money = uData.money !== undefined ? uData.money : 10000000;

    if (money < bet) return message.reply("❌ | পর্যাপ্ত ব্যালেন্স নেই!");

    const multipliers = [0, 0, 0, 1.5, 2, 5];
    const landedMultiplier = multipliers[Math.floor(Math.random() * multipliers.length)];

    const isWin = landedMultiplier > 0;
    const winAmount = Math.floor(bet * landedMultiplier);
    const newBalance = isWin ? money + winAmount : money - bet;

    uData.money = newBalance;
    await usersData.set(senderID, { data: uData });

    const canvas = createCanvas(800, 450);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = isWin ? "#1a0f00" : "#120000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = isWin ? "#d35400" : "#c0392b";
    ctx.lineWidth = 10;
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

    ctx.fillStyle = isWin ? "#e67e22" : "#e74c3c";
    ctx.font = "bold 45px Sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(isWin ? "🎡 ROULETTES SPIN WIN 🎡" : "🎡 ROULETTE SPIN LOSS 🎡", 400, 80);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 45px Sans-serif";
    ctx.fillText(`Landed on: [ ${landedMultiplier}x Multiplier ]`, 400, 170);

    ctx.font = "bold 32px Sans-serif";
    ctx.fillStyle = isWin ? "#2ecc71" : "#e74c3c";
    ctx.fillText(isWin ? `+ $${winAmount.toLocaleString()}` : `- $${bet.toLocaleString()}`, 400, 250);

    ctx.fillStyle = "#f1c40f";
    ctx.font = "bold 28px Sans-serif";
    ctx.fillText(`Total Balance: $${newBalance.toLocaleString()}`, 400, 330);

    ctx.fillStyle = "#888888";
    ctx.font = "italic 20px Sans-serif";
    ctx.fillText("ROYAL ROULETTE WHEEL • DYNAMIC CARD", 400, 400);

    const cardPath = path.join(__dirname, `cache_roulette_${senderID}.png`);
    fs.writeFileSync(cardPath, canvas.toBuffer("image/png"));

    const msg = isWin 
      ? `🎡 | রুলেট চাকা ঘুরে ${landedMultiplier}x গুণ বোনাস পাওয়া গেছে!` 
      : `🎡 | রুলেট চাকা জিরোতে থেমে গেছে, লস $${bet.toLocaleString()}`;

    return message.reply({
      body: msg,
      attachment: fs.createReadStream(cardPath)
    }, () => {
      if (fs.existsSync(cardPath)) fs.unlinkSync(cardPath);
    });
  }
};
