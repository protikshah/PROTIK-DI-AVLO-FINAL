module.exports = {
  config: {
    name: "dice",
    aliases: ["roll"],
    version: "7.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Roll the lucky dice" },
    category: "games",
    guide: { en: "{pn} [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const rawBet = args[0];

    if (!rawBet) return message.reply("> 🎲\n• Usage: !dice [bet_amount]\n• Example: !dice 1m");

    const parseBet = (input) => {
      if (!input) return NaN;
      const lower = input.toLowerCase();
      if (lower.endsWith("k")) return parseFloat(lower) * 1000;
      if (lower.endsWith("m")) return parseFloat(lower) * 1000000;
      if (lower.endsWith("b")) return parseFloat(lower) * 1000000000;
      return parseInt(input);
    };

    const bet = parseBet(rawBet);
    if (isNaN(bet) || bet <= 0) return message.reply("> 🎲\n• Please enter a valid bet amount!");
    if (bet > 50000000000) return message.reply("> 🎲\n• Maximum bet limit is $50B!");

    let userData = await usersData.get(senderID);
    let currentMoney = typeof userData.money === "number" ? userData.money : (userData.data?.money || 0);

    if (currentMoney < bet) return message.reply("> 🎲\n• Insufficient balance in your account!");

    const diceIcons = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
    const userRollIdx = Math.floor(Math.random() * 6);
    const botRollIdx = Math.floor(Math.random() * 6);

    const userRoll = userRollIdx + 1;
    const botRoll = botRollIdx + 1;

    const isWin = userRoll > botRoll;
    const isDraw = userRoll === botRoll;

    let winAmount = 0;
    let newBalance = currentMoney;

    if (isWin) {
      winAmount = bet;
      newBalance = currentMoney + winAmount;
    } else if (!isDraw) {
      newBalance = currentMoney - bet;
    }

    // Stats Management
    if (!userData.data) userData.data = {};
    if (!userData.data.diceStats) userData.data.diceStats = { wins: 0, total: 0 };
    userData.data.diceStats.total += 1;
    if (isWin) userData.data.diceStats.wins += 1;

    const totalGames = userData.data.diceStats.total;
    const totalWins = userData.data.diceStats.wins;
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

    let statusMsg = "";
    if (isWin) statusMsg = `• High Roll! You won +$${formatMoney(winAmount)}`;
    else if (isDraw) statusMsg = `• Draw Match! No loss occurred`;
    else statusMsg = `• Low Roll! You lost -$${formatMoney(bet)}`;

    const response = 
      `> 🎲\n` +
      `${statusMsg}\n` +
      `• Roll Result: You [ ${diceIcons[userRollIdx]} ${userRoll} ] vs Bot [ ${diceIcons[botRollIdx]} ${botRoll} ]\n\n` +
      `🎯 Dice Win Rate: ${winRate}% (${totalWins}/${totalGames})\n` +
      `💳 Balance: $${formatMoney(newBalance)}`;

    return message.reply(response);
  }
};
