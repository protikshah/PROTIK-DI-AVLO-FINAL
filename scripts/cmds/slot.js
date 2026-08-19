module.exports = {
  config: {
    name: "slot",
    aliases: ["slots"],
    version: "7.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Spin the slot machine" },
    category: "games",
    guide: { en: "{pn} [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const rawBet = args[0];

    if (!rawBet) return message.reply("> 🎀\n• Usage: !slot [bet_amount]\n• Example: !slot 5m or !slot 1000");

    const parseBet = (input) => {
      if (!input) return NaN;
      const lower = input.toLowerCase();
      if (lower.endsWith("k")) return parseFloat(lower) * 1000;
      if (lower.endsWith("m")) return parseFloat(lower) * 1000000;
      if (lower.endsWith("b")) return parseFloat(lower) * 1000000000;
      return parseInt(input);
    };

    const bet = parseBet(rawBet);
    if (isNaN(bet) || bet <= 0) return message.reply("> 🎀\n• Please enter a valid bet amount!");
    if (bet > 50000000000) return message.reply("> 🎀\n• Maximum bet limit is $50B!");

    let userData = await usersData.get(senderID);
    let currentMoney = typeof userData.money === "number" ? userData.money : (userData.data?.money || 0);

    if (currentMoney < bet) return message.reply("> 🎀\n• Insufficient balance in your account!");

    const icons = ["💜", "❤️", "🤍", "💛", "💙", "💚"];
    const slot1 = icons[Math.floor(Math.random() * icons.length)];
    const slot2 = icons[Math.floor(Math.random() * icons.length)];
    const slot3 = icons[Math.floor(Math.random() * icons.length)];

    let winMultiplier = 0;
    if (slot1 === slot2 && slot2 === slot3) winMultiplier = 3;
    else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) winMultiplier = 1.5;

    const isWin = winMultiplier > 0;
    const winAmount = Math.floor(bet * winMultiplier);
    const newBalance = isWin ? currentMoney + winAmount : currentMoney - bet;

    // Stats Management
    if (!userData.data) userData.data = {};
    if (!userData.data.slotStats) userData.data.slotStats = { wins: 0, total: 0 };
    userData.data.slotStats.total += 1;
    if (isWin) userData.data.slotStats.wins += 1;

    const totalGames = userData.data.slotStats.total;
    const totalWins = userData.data.slotStats.wins;
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
      ? `• Baby, You won $${formatMoney(winAmount)}`
      : `• Baby, You lost $${formatMoney(bet)}`;

    const response = 
      `> 🎀\n` +
      `${statusMsg}\n` +
      `• Game Results: [ ${slot1} | ${slot2} | ${slot3} ]\n\n` +
      `🎯 Win Rate Today: ${winRate}% (${totalWins}/${totalGames})\n` +
      `💳 Balance: $${formatMoney(newBalance)}`;

    return message.reply(response);
  }
};
