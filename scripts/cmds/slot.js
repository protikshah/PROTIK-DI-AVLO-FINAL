module.exports = {
  config: {
    name: "slot",
    aliases: ["slots"],
    version: "1.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Spin the slot machine" },
    category: "games",
    guide: { en: "{pn} [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const bet = parseInt(args[0]);

    if (isNaN(bet) || bet <= 0) return message.reply("❌ | ব্যবহারের নিয়ম: !slot [bet_amount]");
    if (bet > 10000000) return message.reply("❌ | সর্বোচ্চ বেট লিমিট $10,000,000 (10M)!");

    let userData = await usersData.get(senderID);
    let money = (userData.data && userData.data.money !== undefined) ? userData.data.money : 10000000;

    if (money < bet) return message.reply("❌ | পর্যাপ্ত ব্যালেন্স নেই!");

    const icons = ["🎰", "⭐", "💎", "🔔", "🍎"];
    const slot1 = icons[Math.floor(Math.random() * icons.length)];
    const slot2 = icons[Math.floor(Math.random() * icons.length)];
    const slot3 = icons[Math.floor(Math.random() * icons.length)];

    let winMultiplier = 0;
    if (slot1 === slot2 && slot2 === slot3) winMultiplier = 3; // Triple match (3x)
    else if (slot1 === slot2 || slot2 === slot3 || slot1 === slot3) winMultiplier = 1.5; // Double match (1.5x)

    if (winMultiplier > 0) {
      let prize = Math.floor(bet * winMultiplier);
      let newBal = money + prize;
      await usersData.set(senderID, { money: newBal });
      return message.reply(`🎰 SLOT MACHINE 🎰\n━━━━━━━━━━━━━━━\n[ ${slot1} | ${slot2} | ${slot3} ]\n━━━━━━━━━━━━━━━\n🎉 JACKPOT/WIN!\n💰 +$${prize.toLocaleString()}\n💵 Balance: $${newBal.toLocaleString()}`);
    } else {
      let newBal = money - bet;
      await usersData.set(senderID, { money: newBal });
      return message.reply(`🎰 SLOT MACHINE 🎰\n━━━━━━━━━━━━━━━\n[ ${slot1} | ${slot2} | ${slot3} ]\n━━━━━━━━━━━━━━━\n😭 YOU LOST!\n💸 -$${bet.toLocaleString()}\n💵 Balance: $${newBal.toLocaleString()}`);
    }
  }
};
