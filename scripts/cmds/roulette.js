module.exports = {
  config: {
    name: "roulette",
    aliases: ["rl"],
    version: "7.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "European Casino Roulette" },
    category: "games",
    guide: { en: "{pn} [red/black/even/odd] [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const choice = args[0] ? args[0].toLowerCase() : null;
    const rawBet = args[1];

    if (!choice || !["red", "black", "even", "odd"].includes(choice) || !rawBet) {
      return message.reply("> 🎡\n• Usage: !roulette [red/black/even/odd] [bet]\n• Example: !roulette red 10m");
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
    if (isNaN(bet) || bet <= 0) return message.reply("> 🎡\n• Please enter a valid bet amount!");
    if (bet > 50000000000) return message.reply("> 🎡\n• Maximum bet limit is $50B!");

    let userData = await usersData.get(senderID);
    let currentMoney = typeof userData.money === "number" ? userData.money : (userData.data?.money || 0);

    if (currentMoney < bet) return message.reply("> 🎡\n• Insufficient balance in your account!");

    const landedNumber = Math.floor(Math.random() * 37); // 0 to 36
    const isRed = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36].includes(landedNumber);
    const color = landedNumber === 0 ? "green" : (isRed ? "red" : "black");
    const parity = landedNumber % 2 === 0 ? "even" : "odd";

    let isWin = false;
    if (choice === "red" && color === "red") isWin = true;
    if (choice === "black" && color === "black") isWin = true;
    if (choice === "even" && parity === "even" && landedNumber !== 0) isWin = true;
    if (choice === "odd" && parity === "odd" && landedNumber !== 0) isWin = true;

    const winAmount = bet;
    const newBalance = isWin ? currentMoney + winAmount : currentMoney - bet;

    // Stats
    if (!userData.data) userData.data = {};
    if (!userData.data.rouletteStats) userData.data.rouletteStats = { wins: 0, total: 0 };
    userData.data.rouletteStats.total += 1;
    if (isWin) userData.data.rouletteStats.wins += 1;

    const totalGames = userData.data.rouletteStats.total;
    const totalWins = userData.data.rouletteStats.wins;
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

    const colorEmoji = color === "red" ? "🔴 Red" : (color === "black" ? "⚫ Black" : "🟢 Green 0");
    const statusMsg = isWin 
      ? `• Jackpot Winner! You pocketed +$${formatMoney(winAmount)}`
      : `• House Won! You lost -$${formatMoney(bet)}`;

    const response = 
      `> 🎡\n` +
      `${statusMsg}\n` +
      `• Ball Landed On: [ ${landedNumber} | ${colorEmoji} ]\n` +
      `• Bet Pick: ${choice.toUpperCase()}\n\n` +
      `🎯 Roulette Win Rate: ${winRate}% (${totalWins}/${totalGames})\n` +
      `💳 Balance: $${formatMoney(newBalance)}`;

    return message.reply(response);
  }
};
