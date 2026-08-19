module.exports = {
  config: {
    name: "flip",
    aliases: ["coinflip", "cf"],
    version: "7.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "High Stakes Coin Flip" },
    category: "games",
    guide: { en: "{pn} [heads/tails] [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const choiceInput = args[0] ? args[0].toLowerCase() : null;
    const rawBet = args[1];

    if (!choiceInput || !["heads", "tails", "head", "tail", "h", "t"].includes(choiceInput) || !rawBet) {
      return message.reply("> 🪙\n• Usage: !flip [heads/tails] [bet]\n• Example: !flip heads 5m");
    }

    const userChoice = ["h", "head", "heads"].includes(choiceInput) ? "Heads" : "Tails";

    const parseBet = (input) => {
      if (!input) return NaN;
      const lower = input.toLowerCase();
      if (lower.endsWith("k")) return parseFloat(lower) * 1000;
      if (lower.endsWith("m")) return parseFloat(lower) * 1000000;
      if (lower.endsWith("b")) return parseFloat(lower) * 1000000000;
      return parseInt(input);
    };

    const bet = parseBet(rawBet);
    if (isNaN(bet) || bet <= 0) return message.reply("> 🪙\n• Please enter a valid bet amount!");
    if (bet > 50000000000) return message.reply("> 🪙\n• Maximum bet limit is $50B!");

    let userData = await usersData.get(senderID);
    let currentMoney = typeof userData.money === "number" ? userData.money : (userData.data?.money || 0);

    if (currentMoney < bet) return message.reply("> 🪙\n• Insufficient balance in your account!");

    const outcome = Math.random() < 0.50 ? "Heads" : "Tails";
    const isWin = userChoice === outcome;

    const winAmount = bet;
    const newBalance = isWin ? currentMoney + winAmount : currentMoney - bet;

    // Stats
    if (!userData.data) userData.data = {};
    if (!userData.data.flipStats) userData.data.flipStats = { wins: 0, total: 0 };
    userData.data.flipStats.total += 1;
    if (isWin) userData.data.flipStats.wins += 1;

    const totalGames = userData.data.flipStats.total;
    const totalWins = userData.data.flipStats.wins;
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

    const coinIcon = outcome === "Heads" ? "👑 (Heads)" : "⚡ (Tails)";
    const statusMsg = isWin 
      ? `• Royal Win! You predicted right +$${formatMoney(winAmount)}`
      : `• Unlucky Flip! You lost -$${formatMoney(bet)}`;

    const response = 
      `> 🪙\n` +
      `${statusMsg}\n` +
      `• Flip Result: Coin landed on ${coinIcon}\n` +
      `• Your Choice: ${userChoice}\n\n` +
      `🎯 Flip Win Rate: ${winRate}% (${totalWins}/${totalGames})\n` +
      `💳 Balance: $${formatMoney(newBalance)}`;

    return message.reply(response);
  }
};
