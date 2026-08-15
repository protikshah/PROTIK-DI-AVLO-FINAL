const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "flip",
    aliases: ["coinflip"],
    version: "5.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Flip a coin (head/tail)" },
    category: "games",
    guide: { en: "{pn} [head/tail] [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const choice = args[0] ? args[0].toLowerCase() : "";
    const bet = parseInt(args[1]);

    if (!["head", "tail", "heads", "tails"].includes(choice) || isNaN(bet) || bet <= 0) {
      return message.reply("❌ | Usage: !flip [head/tail] [bet_amount]");
    }
    if (bet > 50000000000) return message.reply("❌ | Maximum bet limit is $50 Billion!");

    const money = await usersData.getMoney(senderID);
    if (money < bet) return message.reply("❌ | Insufficient balance!");

    const outcome = Math.random() < 0.5 ? "head" : "tail";
    const userChoice = choice.startsWith("head") ? "head" : "tail";
    const isWin = userChoice === outcome;

    const winAmount = bet;
    let newBalance;

    if (isWin) {
      const updatedUser = await usersData.addMoney(senderID, winAmount);
      newBalance = updatedUser.money;
    } else {
      const updatedUser = await usersData.subtractMoney(senderID, bet);
      newBalance = updatedUser.money;
    }

    const canvas = createCanvas(800, 450);
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = isWin ? "#1a1300" : "#0d0d1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = isWin ? "#e67e22" : "#3498db";
    ctx.lineWidth = 10;
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

    ctx.fillStyle = isWin ? "#f39c12" : "#e74c3c";
    ctx.font = "bold 45px Sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(isWin ? "🪙 COIN FLIP WIN 🪙" : "🪙 COIN FLIP LOSS 🪙", 400, 80);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 45px Sans-serif";
    ctx.fillText(`Landed on: [ ${outcome.toUpperCase()} ]`, 400, 170);

    ctx.font = "bold 32px Sans-serif";
    ctx.fillStyle = isWin ? "#2ecc71" : "#e74c3c";
    ctx.fillText(isWin ? `+ $${winAmount.toLocaleString()}` : `- $${bet.toLocaleString()}`, 400, 250);

    ctx.fillStyle = "#f1c40f";
    ctx.font = "bold 28px Sans-serif";
    ctx.fillText(`Total Balance: $${newBalance.toLocaleString()}`, 400, 330);

    ctx.fillStyle = "#888888";
    ctx.font = "italic 20px Sans-serif";
    ctx.fillText("GOLDEN COIN TOSSER • DYNAMIC CARD", 400, 400);

    const cardPath = path.join(__dirname, `cache_flip_${senderID}.png`);
    fs.writeFileSync(cardPath, canvas.toBuffer("image/png"));

    const msg = isWin 
      ? `🪙 | You won! The coin landed on ${outcome.toUpperCase()}.` 
      : `🪙 | You lost! The coin landed on ${outcome.toUpperCase()}.`;

    return message.reply({
      body: msg,
      attachment: fs.createReadStream(cardPath)
    }, () => {
      if (fs.existsSync(cardPath)) fs.unlinkSync(cardPath);
    });
  }
};
