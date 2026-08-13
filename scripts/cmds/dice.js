const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "dice",
    aliases: ["roll"],
    version: "5.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Roll the lucky dice" },
    category: "games",
    guide: { en: "{pn} [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0) return message.reply("❌ | নিয়ম: !dice [bet_amount]");
    if (bet > 50000000000) return message.reply("❌ | সর্বোচ্চ লিমিট $50 Billion!");

    let userData = await usersData.get(senderID);
    let uData = userData.data || {};
    let money = uData.money !== undefined ? uData.money : 10000000;

    if (money < bet) return message.reply("❌ | পর্যাপ্ত ব্যালেন্স নেই!");

    const userRoll = Math.floor(Math.random() * 6) + 1;
    const botRoll = Math.floor(Math.random() * 6) + 1;

    const isWin = userRoll > botRoll;
    const isDraw = userRoll === botRoll;

    let winAmount = 0;
    let newBalance = money;

    if (isWin) {
      winAmount = bet;
      newBalance = money + winAmount;
    } else if (!isDraw) {
      newBalance = money - bet;
    }

    uData.money = newBalance;
    await usersData.set(senderID, { data: uData });

    const canvas = createCanvas(800, 450);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = isWin ? "#001a1a" : (isDraw ? "#1a1a1a" : "#1a0000");
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = isWin ? "#1abc9c" : (isDraw ? "#f39c12" : "#e74c3c");
    ctx.lineWidth = 10;
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

    ctx.fillStyle = isWin ? "#1abc9c" : (isDraw ? "#f39c12" : "#e74c3c");
    ctx.font = "bold 45px Sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(isWin ? "🎲 LUCKY DICE WIN 🎲" : (isDraw ? "🎲 DICE ROLL DRAW 🎲" : "🎲 DICE ROLL LOSS 🎲"), 400, 80);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 45px Sans-serif";
    ctx.fillText(`You: 🎲 [ ${userRoll} ]   vs   Bot: 🎲 [ ${botRoll} ]`, 400, 170);

    ctx.font = "bold 32px Sans-serif";
    ctx.fillStyle = isWin ? "#2ecc71" : (isDraw ? "#f39c12" : "#e74c3c");
    ctx.fillText(isWin ? `+ $${winAmount.toLocaleString()}` : (isDraw ? "NO PROFIT / NO LOSS" : `- $${bet.toLocaleString()}`), 400, 250);

    ctx.fillStyle = "#f1c40f";
    ctx.font = "bold 28px Sans-serif";
    ctx.fillText(`Total Balance: $${newBalance.toLocaleString()}`, 400, 330);

    ctx.fillStyle = "#888888";
    ctx.font = "italic 20px Sans-serif";
    ctx.fillText("GOLDEN DICE CLUB • DYNAMIC CARD", 400, 400);

    const cardPath = path.join(__dirname, `cache_dice_${senderID}.png`);
    fs.writeFileSync(cardPath, canvas.toBuffer("image/png"));

    const msg = isWin 
      ? `🎲 | জিতেছেন! আপনার ছক্কা বেশি পড়েছে, পয়েন্ট $${winAmount.toLocaleString()} যোগ হয়েছে!` 
      : (isDraw ? `🎲 | ড্র হয়েছে! কোনো টাকা কাটা যায়নি।` : `🎲 | হেরে গেছেন! আপনার পয়েন্ট কম পড়েছে।`);

    return message.reply({
      body: msg,
      attachment: fs.createReadStream(cardPath)
    }, () => {
      if (fs.existsSync(cardPath)) fs.unlinkSync(cardPath);
    });
  }
};
