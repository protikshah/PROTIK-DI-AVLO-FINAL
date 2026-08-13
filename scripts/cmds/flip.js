module.exports = {
  config: {
    name: "flip",
    aliases: ["coin", "cointoss"],
    version: "1.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Coin flip game" },
    category: "games",
    guide: { en: "{pn} [head/tail] [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const choice = args[0]?.toLowerCase();
    const bet = parseInt(args[1]);

    if (!choice || (choice !== "head" && choice !== "tail") || isNaN(bet) || bet <= 0) {
      return message.reply("❌ | সঠিক ফরম্যাট: !flip [head/tail] [bet_amount]");
    }
    if (bet > 10000000) return message.reply("❌ | সর্বোচ্চ বেট লিমিট $10,000,000 (10M)!");

    let userData = await usersData.get(senderID);
    let money = (userData.data && userData.data.money !== undefined) ? userData.data.money : 10000000;

    if (money < bet) return message.reply("❌ | পর্যাপ্ত ব্যালেন্স নেই!");

    const flipResult = Math.random() < 0.5 ? "head" : "tail";

    if (choice === flipResult) {
      let newBal = money + bet;
      await usersData.set(senderID, { money: newBal });
      return message.reply(`🪙 COIN FLIP 🪙\n━━━━━━━━━━━━━━━\n🪙 Coin landed on: ${flipResult.toUpperCase()}\n🎉 YOU WON!\n💰 +$${bet.toLocaleString()}\n💵 Balance: $${newBal.toLocaleString()}`);
    } else {
      let newBal = money - bet;
      await usersData.set(senderID, { money: newBal });
      return message.reply(`🪙 COIN FLIP 🪙\n━━━━━━━━━━━━━━━\n🪙 Coin landed on: ${flipResult.toUpperCase()}\n😭 YOU LOST!\n💸 -$${bet.toLocaleString()}\n💵 Balance: $${newBal.toLocaleString()}`);
    }
  }
};
