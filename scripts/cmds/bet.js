module.exports = {
  config: {
    name: "bet",
    version: "1.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Quick 50/50 Betting Game" },
    category: "games",
    guide: { en: "{pn} [amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0) return message.reply("❌ | সঠিক ব্যবহারের নিয়ম: !bet [amount]");
    if (bet > 10000000) return message.reply("❌ | সর্বোচ্চ বেট লিমিট $10,000,000 (10M)!");

    let userData = await usersData.get(senderID);
    let money = (userData.data && userData.data.money !== undefined) ? userData.data.money : 10000000;

    if (money < bet) return message.reply("❌ | Not enough balance!");

    const isWin = Math.random() < 0.5;

    if (isWin) {
      let newBal = money + bet;
      await usersData.set(senderID, { money: newBal });
      return message.reply(`💥 YOU WON THE BET!\n🎰 You bet: $${bet.toLocaleString()}\n💰 You won: $${bet.toLocaleString()}\n💵 New balance: $${newBal.toLocaleString()}`);
    } else {
      let newBal = money - bet;
      await usersData.set(senderID, { money: newBal });
      return message.reply(`💥 You lost everything!\n🎰 You bet: $${bet.toLocaleString()}\n💸 You won: $0\n💵 New balance: $${newBal.toLocaleString()}`);
    }
  }
};
