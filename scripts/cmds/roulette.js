module.exports = {
  config: {
    name: "roulette",
    aliases: ["wheel", "spinwheel"],
    version: "1.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Spin the roulette wheel" },
    category: "games",
    guide: { en: "{pn} [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0) return message.reply("❌ | ব্যবহারের নিয়ম: !roulette [bet_amount]");
    if (bet > 10000000) return message.reply("❌ | সর্বোচ্চ বেট লিমিট $10,000,000 (10M)!");

    let userData = await usersData.get(senderID);
    let money = (userData.data && userData.data.money !== undefined) ? userData.data.money : 10000000;

    if (money < bet) return message.reply("❌ | পর্যাপ্ত ব্যালেন্স নেই!");

    const multipliers = [0, 0.5, 1, 1.5, 2, 5, 10];
    const landed = multipliers[Math.floor(Math.random() * multipliers.length)];

    if (landed > 1) {
      let profit = Math.floor(bet * (landed - 1));
      let newBal = money + profit;
      await usersData.set(senderID, { money: newBal });
      return message.reply(`🎡 ROULETTES SPIN 🎡\n━━━━━━━━━━━━━━━\n🎯 Wheel landed on: [ ${landed}x ]\n🎉 BIG WIN!\n💰 +$${profit.toLocaleString()}\n💵 Balance: $${newBal.toLocaleString()}`);
    } else if (landed === 1) {
      return message.reply(`🎡 ROULETTES SPIN 🎡\n━━━━━━━━━━━━━━━\n🎯 Wheel landed on: [ 1x ]\n⚖️ SAFE! No profit, no loss.\n💵 Balance: $${money.toLocaleString()}`);
    } else {
      let loss = Math.floor(bet * (1 - landed));
      let newBal = money - loss;
      await usersData.set(senderID, { money: newBal });
      return message.reply(`🎡 ROULETTES SPIN 🎡\n━━━━━━━━━━━━━━━\n🎯 Wheel landed on: [ ${landed}x ]\n😭 YOU LOST!\n💸 -$${loss.toLocaleString()}\n💵 Balance: $${newBal.toLocaleString()}`);
    }
  }
};
