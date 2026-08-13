module.exports = {
  config: {
    name: "dice",
    aliases: ["roll"],
    version: "1.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Guess dice number and win 5x" },
    category: "games",
    guide: { en: "{pn} [1-6] [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const guess = parseInt(args[0]);
    const bet = parseInt(args[1]);

    if (isNaN(guess) || guess < 1 || guess > 6 || isNaN(bet) || bet <= 0) {
      return message.reply("❌ | ফরম্যাট: !dice [১-৬ এর মধ্যে সংখ্যা] [bet_amount]");
    }
    if (bet > 10000000) return message.reply("❌ | সর্বোচ্চ বেট লিমিট $10,000,000 (10M)!");

    let userData = await usersData.get(senderID);
    let money = (userData.data && userData.data.money !== undefined) ? userData.data.money : 10000000;

    if (money < bet) return message.reply("❌ | পর্যাপ্ত ব্যালেন্স নেই!");

    const rolled = Math.floor(Math.random() * 6) + 1;

    if (guess === rolled) {
      let prize = bet * 5;
      let newBal = money + prize;
      await usersData.set(senderID, { money: newBal });
      return message.reply(`🎲 DICE ROLL 🎲\n━━━━━━━━━━━━━━━\n🎯 Your Guess: ${guess}\n🎲 Dice Rolled: ${rolled}\n━━━━━━━━━━━━━━━\n🎉 PERFECT GUESS! (5x Win)\n💰 +$${prize.toLocaleString()}\n💵 Balance: $${newBal.toLocaleString()}`);
    } else {
      let newBal = money - bet;
      await usersData.set(senderID, { money: newBal });
      return message.reply(`🎲 DICE ROLL 🎲\n━━━━━━━━━━━━━━━\n🎯 Your Guess: ${guess}\n🎲 Dice Rolled: ${rolled}\n━━━━━━━━━━━━━━━\n😭 YOU LOST!\n💸 -$${bet.toLocaleString()}\n💵 Balance: $${newBal.toLocaleString()}`);
    }
  }
};
