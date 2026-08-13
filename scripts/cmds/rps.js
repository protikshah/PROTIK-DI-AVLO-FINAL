const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "rps",
    aliases: ["rockpaperscissors"],
    version: "5.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Rock Paper Scissors with card" },
    category: "games",
    guide: { en: "{pn} [rock/paper/scissors] [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const choice = args[0] ? args[0].toLowerCase() : "";
    const bet = parseInt(args[1]);

    const validChoices = ["rock", "paper", "scissors"];
    if (!validChoices.includes(choice) || isNaN(bet) || bet <= 0) {
      return message.reply("❌ | নিয়ম: !rps [rock/paper/scissors] [bet_amount]");
    }
    if (bet > 50000000000) return message.reply("❌ | সর্বোচ্চ লিমিট $50 Billion!");

    let userData = await usersData.get(senderID);
    let uData = userData.data || {};
    let money = uData.money !== undefined ? uData.money : 10000000;

    if (money < bet) return message.reply("❌ | পর্যাপ্ত ব্যালেন্স নেই!");

    const botChoice = validChoices[Math.floor(Math.random() * validChoices.length)];

    let result = "draw";
    if (
      (choice === "rock" && botChoice === "scissors") ||
      (choice === "paper" && botChoice === "rock") ||
      (choice === "scissors" && botChoice === "paper")
    ) {
      result = "win";
    } else if (choice !== botChoice) {
      result = "lose";
    }

    const isWin = result === "win";
    const isDraw = result === "draw";

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

    ctx.fillStyle = isWin ? "#001a0d" : (isDraw ? "#1a1a1a" : "#1a001a");
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = isWin ? "#27ae60" : (isDraw ? "#f39c12" : "#8e44ad");
    ctx.lineWidth = 10;
    ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);

    ctx.fillStyle = isWin ? "#2ecc71" : (isDraw ? "#f39c12" : "#9b59b6");
    ctx.font = "bold 45px Sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(isWin ? "✂️ RPS VICTORY ✂️" : (isDraw ? "✂️ RPS DRAW ✂️" : "✂️ RPS DEFEAT ✂️"), 400, 80);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 40px Sans-serif";
    ctx.fillText(`You: [ ${choice.toUpperCase()} ] vs Bot: [ ${botChoice.toUpperCase()} ]`, 400, 170);

    ctx.font = "bold 32px Sans-serif";
    ctx.fillStyle = isWin ? "#2ecc71" : (isDraw ? "#f39c12" : "#e74c3c");
    ctx.fillText(isWin ? `+ $${winAmount.toLocaleString()}` : (isDraw ? "MATCH DRAWN" : `- $${bet.toLocaleString()}`), 400, 250);

    ctx.fillStyle = "#f1c40f";
    ctx.font = "bold 28px Sans-serif";
    ctx.fillText(`Total Balance: $${newBalance.toLocaleString()}`, 400, 330);

    ctx.fillStyle = "#888888";
    ctx.font = "italic 20px Sans-serif";
    ctx.fillText("CYBER RPS DUEL • DYNAMIC CARD", 400, 400);

    const cardPath = path.join(__dirname, `cache_rps_${senderID}.png`);
    fs.writeFileSync(cardPath, canvas.toBuffer("image/png"));

    const msg = isWin 
      ? `✂️ | দুর্দান্ত চাল! জিতছেন $${winAmount.toLocaleString()}` 
      : (isDraw ? `✂️ | ম্যাচ ড্র হয়েছে!` : `✂️ | হেরে গেছেন!`);

    return message.reply({
      body: msg,
      attachment: fs.createReadStream(cardPath)
    }, () => {
      if (fs.existsSync(cardPath)) fs.unlinkSync(cardPath);
    });
  }
};
