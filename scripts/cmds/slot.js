const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "slot",
    aliases: ["slots"],
    version: "5.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Spin the slot machine" },
    category: "games",
    guide: { en: "{pn} [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0) return message.reply("❌ | নিয়ম: !slot [bet_amount]");
    if (bet > 50000000000) return message.reply("❌ | সর্বোচ্চ লিমিট $50 Billion!");

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
    const winAmount = Math.floor(bet * winMultiplier);
    const newBalance = isWin ? money + winAmount : money - bet;

    uData.money = newBalance;
    await usersData.set(senderID, { data: uData });

    const canvas = createCanvas(800, 450);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = isWin ? "#1a1801" : "#1a0105";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = isWin ? "#ffd700" : "#ff4d4d";
    ctx.lineWidth = 10;
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

    ctx.fillStyle = isWin ? "#ffd700" : "#ff4d4d";
    ctx.font = "bold 45px Sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(isWin ? "🎉 SLOT JACKPOT WIN 🎉" : "😭 SLOT MACHINE LOSS 😭", 400, 80);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 55px Sans-serif";
    ctx.fillText(`[ ${slot1} | ${slot2} | ${slot3} ]`, 400, 170);

    ctx.font = "bold 32px Sans-serif";
    ctx.fillStyle = isWin ? "#2ecc71" : "#e74c3c";
    ctx.fillText(isWin ? `+ $${winAmount.toLocaleString()}` : `- $${bet.toLocaleString()}`, 400, 250);

    ctx.fillStyle = "#f1c40f";
    ctx.font = "bold 28px Sans-serif";
    ctx.fillText(`Total Balance: $${newBalance.toLocaleString()}`, 400, 330);

    ctx.fillStyle = "#888888";
    ctx.font = "italic 20px Sans-serif";
    ctx.fillText("VIP CASINO CLUB • DYNAMIC CARD", 400, 400);

    const cardPath = path.join(__dirname, `cache_slot_${senderID}.png`);
    fs.writeFileSync(cardPath, canvas.toBuffer("image/png"));

    const msg = isWin 
      ? `🎰 | অভিনন্দন! আপনি $${winAmount.toLocaleString()} জিতেছেন!` 
      : `🎰 | আফসোস! আপনি $${bet.toLocaleString()} হেরে গেছেন!`;

    return message.reply({
      body: msg,
      attachment: fs.createReadStream(cardPath)
    }, () => {
      if (fs.existsSync(cardPath)) fs.unlinkSync(cardPath);
    });
  }
};
