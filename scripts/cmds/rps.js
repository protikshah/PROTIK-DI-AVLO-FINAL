module.exports = {
  config: {
    name: "rps",
    version: "1.1",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Play Rock Paper Scissors" },
    category: "games",
    guide: { en: "{pn} [rock/paper/scissors] [bet_amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    const userChoice = args[0]?.toLowerCase();
    const bet = parseInt(args[1]);

    if (!userChoice || !["rock", "paper", "scissors"].includes(userChoice) || isNaN(bet) || bet <= 0) {
      return message.reply("❌ | সঠিক ফরম্যাট: !rps [rock/paper/scissors] [bet_amount]");
    }
    if (bet > 10000000) return message.reply("❌ | সর্বোচ্চ বেট লিমিট $10,000,000 (10M)!");

    let userData = await usersData.get(senderID);
    let uData = userData.data || {};
    let money = uData.money !== undefined ? uData.money : 10000000;

    if (money < bet) return message.reply("❌ | পর্যাপ্ত ব্যালেন্স নেই!");

    const choices = ["rock", "paper", "scissors"];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];
    const icons = { rock: "🪨", paper: "📄", scissors: "✂️" };

    if (userChoice === botChoice) {
      return message.reply(`✂️ ROCK PAPER SCISSORS ✂️\n You: ${icons[userChoice]} vs Bot: ${icons[botChoice]}\n🤝 DRAW! (টাকা ফেরত নেওয়া হয়েছে)`);
    }

    const isWin = 
      (userChoice === "rock" && botChoice === "scissors") ||
      (userChoice === "paper" && botChoice === "rock") ||
      (userChoice === "scissors" && botChoice === "paper");

    if (isWin) {
      let newBal = money + bet;
      uData.money = newBal;
      await usersData.set(senderID, { data: uData });
      return message.reply(`✂️ ROCK PAPER SCISSORS ✂️\n You: ${icons[userChoice]} vs Bot: ${icons[botChoice]}\n🎉 YOU WON!\n💰 +$${bet.toLocaleString()}\n💵 Balance: $${newBal.toLocaleString()}`);
    } else {
      let newBal = money - bet;
      uData.money = newBal;
      await usersData.set(senderID, { data: uData });
      return message.reply(`✂️ ROCK PAPER SCISSORS ✂️\n You: ${icons[userChoice]} vs Bot: ${icons[botChoice]}\n😭 YOU LOST!\n💸 -$${bet.toLocaleString()}\n💵 Balance: $${newBal.toLocaleString()}`);
    }
  }
};
