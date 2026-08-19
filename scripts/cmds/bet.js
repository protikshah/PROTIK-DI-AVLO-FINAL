module.exports = {
  config: {
    name: "bet",
    aliases: ["qbet"],
    version: "7.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Quick money multiplier bet" },
    category: "games",
    guide: { en: "{pn} [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const rawBet = args[0];

    if (!rawBet) return message.reply("> 👑\n• Usage: !bet [bet_amount]\n• Example: !bet 2m");

    const parseBet = (input) => {
      if (!input) return NaN;
      const lower = input.toLowerCase();
      if (lower.endsWith("k")) return parseFloat(lower) * 1000;
      if (lower.endsWith("m")) return parseFloat(lower) * 1000000;
      if (lower.endsWith("b")) return parseFloat(lower) * 1000000000;
      return parseInt(input);
    };

    const bet = parseBet(rawBet);
    if (isNaN(bet) || bet <= 0) return message.reply("> 👑\n• Please enter a valid bet amount!");
    if (bet > 50000000000) return message.reply("> 👑\n• Maximum bet limit is $50B!");

    let userData = await usersData.get(senderID);
    let currentMoney = typeof userData.money === "number" ? userData.money : (userData.data?.money || 0);

    if (currentMoney < bet) return message.reply("> 👑\n• Insufficient balance in your account!");

    const isWin = Math.random() < 0.50;
    const winAmount = bet;
    const newBalance = isWin ? currentMoney + winAmount : currentMoney - bet;

    // Stats Management
    if (!userData.data) userData.data = {};
    if (!userData.data.betStats) userData.data.betStats = { wins: 0, total: 0 };
    userData.data.betStats.total += 1;
    if (isWin) userData.data.betStats.wins += 1;

    const totalGames = userData.data.betStats.total;
    const totalWins = userData.data.betStats.wins;
    const winRate = ((totalWins / totalGames) * 100).toFixed(1);

    // Save to Database permanently
    userData.money = newBalance;
    userData.data.money = newBalance;
    await usersData.set(senderID, userData);

    const formatMoney = (num) => {
      if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(1) + "K";
      return num.toLocaleString();
    };

    const statusMsg = isWin 
      ? `• Lucky Choice! You doubled +$${formatMoney(winAmount)}`
      : `• Bad Luck! You lost -$${formatMoney(bet)}`;

    const iconResult = isWin ? "[ 💸 | 💎 | 💵 ]" : "[ 💣 | 💥 | 💀 ]";

    const response = 
      `> 👑\n` +
      `${statusMsg}\n` +
      `• Bet Multiplier: ${iconResult}\n\n` +
      `🎯 Bet Win Rate: ${winRate}% (${totalWins}/${totalGames})\n` +
      `💳 Balance: $${formatMoney(newBalance)}`;

    return message.reply(response);
  }
};
