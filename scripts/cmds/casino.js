module.exports = {
  config: {
    name: "casino",
    aliases: ["evenodd"],
    version: "1.1",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Play even or odd casino" },
    category: "games",
    guide: { en: "{pn} [even/odd] [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const choice = args[0]?.toLowerCase();
    const bet = parseInt(args[1]);

    if (!choice || (choice !== "even" && choice !== "odd")) {
      return message.reply("❌ | সঠিক ফরম্যাট: !casino [even/odd] [bet_amount]");
    }
    if (isNaN(bet) || bet <= 0) return message.reply("❌ | সঠিক বেটের পরিমাণ লেখো!");
    
    // কঠোরভাবে ১০ মিলিয়ন (10M) বেট লিমিট
    if (bet > 10000000) return message.reply("❌ | সর্বোচ্চ বেট লিমিট $10,000,000 (10M)!");

    let userData = await usersData.get(senderID);
    let uData = userData.data || {};
    let money = uData.money !== undefined ? uData.money : 10000000;

    if (money < bet) return message.reply("❌ | পর্যাপ্ত ব্যালেন্স নেই!");

    const randNum = Math.floor(Math.random() * 100) + 1;
    const isEven = randNum % 2 === 0;
    const resultType = isEven ? "even" : "odd";

    if (choice === resultType) {
      let newBal = money + bet;
      uData.money = newBal;
      await usersData.set(senderID, { data: uData });
      return message.reply(`🚨 EVEN / ODD 🚨\n🎯 You chose: ${choice.toUpperCase()}\n1️⃣2️⃣3️⃣ Number: ${randNum} -> ${resultType.toUpperCase()}\n\n🎉 YOU WON!\n💰 +$${bet.toLocaleString()}\n💵 Balance: $${newBal.toLocaleString()}`);
    } else {
      let newBal = money - bet;
      uData.money = newBal;
      await usersData.set(senderID, { data: uData });
      return message.reply(`🚨 EVEN / ODD 🚨\n🎯 You chose: ${choice.toUpperCase()}\n1️⃣2️⃣3️⃣ Number: ${randNum} -> ${resultType.toUpperCase()}\n\n😭 YOU LOST!\n💸 -$${bet.toLocaleString()}\n💵 Balance: $${newBal.toLocaleString()}`);
    }
  }
};
