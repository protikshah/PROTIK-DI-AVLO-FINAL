module.exports = {
  config: {
    name: "rps",
    aliases: ["rockpaperscissors"],
    version: "7.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Rock Paper Scissors Duel" },
    category: "games",
    guide: { en: "{pn} [rock/paper/scissors] [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const userPick = args[0] ? args[0].toLowerCase() : null;
    const rawBet = args[1];

    const validPicks = {
      rock: "✊ Rock",
      r: "✊ Rock",
      paper: "🖐️ Paper",
      p: "🖐️ Paper",
      scissors: "✌️ Scissors",
      s: "✌️ Scissors"
    };

    if (!userPick || !validPicks[userPick] || !rawBet) {
      return message.reply("> ✂️\n• Usage: !rps [rock/paper/scissors] [bet]\n• Example: !rps rock 2m");
    }

    const parseBet = (input) => {
      if (!input) return NaN;
      const lower = input.toLowerCase();
      if (lower.endsWith("k")) return parseFloat(lower) * 1000;
      if (lower.endsWith("m")) return parseFloat(lower) * 1000000;
      if (lower.endsWith("b")) return parseFloat(lower) * 1000000000;
      return parseInt(input);
    };

    const bet = parseBet(rawBet);
    if (isNaN(bet) || bet <= 0) return message.reply("> ✂️\n• Please enter a valid bet amount!");
    if (bet > 50000000000) return message.reply("> ✂️\n• Maximum bet limit is $50B!");

    let userData = await usersData.get(senderID);
    let currentMoney = typeof userData.money === "number" ? userData.money : (userData.data?.money || 0);

    if (currentMoney < bet) return message.reply("> ✂️\n• Insufficient balance in your account!");

    const choices = ["rock", "paper", "scissors"];
    const botChoiceKey = choices[Math.floor(Math.random() * choices.length)];
    
    const userChoiceKey = userPick.startsWith("r") ? "rock" : (userPick.startsWith("p") ? "paper" : "scissors");

    let isWin = false;
    let isDraw = false;

    if (userChoiceKey === botChoiceKey) {
      isDraw = true;
    } else if (
      (userChoiceKey === "rock" && botChoiceKey === "scissors") ||
      (userChoiceKey === "paper" && botChoiceKey === "rock") ||
      (userChoiceKey === "scissors" && botChoiceKey === "paper")
    ) {
      isWin = true;
    }

    let newBalance = currentMoney;
    let winAmount = 0;

    if (isWin) {
      winAmount = bet;
      newBalance = currentMoney + winAmount;
    } else if (!isDraw) {
      newBalance = currentMoney - bet;
    }

    // Stats
    if (!userData.data) userData.data = {};
    if (!userData.data.rpsStats) userData.data.rpsStats = { wins: 0, total: 0 };
    userData.data.rpsStats.total += 1;
    if (isWin) userData.data.rpsStats.wins += 1;

    const totalGames = userData.data.rpsStats.total;
    const totalWins = userData.data.rpsStats.wins;
    const winRate = ((totalWins / totalGames) * 100).toFixed(1);

    // Database Permanent Save
    userData.money = newBalance;
    userData.data.money = newBalance;
    await usersData.set(senderID, userData);

    const formatMoney = (num) => {
      if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(1) + "K";
      return num.toLocaleString();
    };

    let statusMsg = "";
    if (isWin) statusMsg = `• Master Move! You won +$${formatMoney(winAmount)}`;
    else if (isDraw) statusMsg = `• Equal Match! Tie - Money refunded`;
    else statusMsg = `• Defeated! You lost -$${formatMoney(bet)}`;

    const response = 
      `> ✂️\n` +
      `${statusMsg}\n` +
      `• Duel: You [ ${validPicks[userChoiceKey]} ] vs Bot [ ${validPicks[botChoiceKey]} ]\n\n` +
      `🎯 RPS Win Rate: ${winRate}% (${totalWins}/${totalGames})\n` +
      `💳 Balance: $${formatMoney(newBalance)}`;

    return message.reply(response);
  }
};
