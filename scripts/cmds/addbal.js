module.exports = {
  config: {
    name: "addbal",
    aliases: ["deposit", "addmoney"],
    version: "2.5",
    author: "Protik / Assistant",
    countDown: 2,
    role: 2,
    shortDescription: { en: "Deposit money to user account" },
    category: "economy",
    guide: { en: "{pn} [Amount] (reply/mention user)" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    let targetID;
    let amount;

    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
      amount = parseInt(args[0]);
    } else if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
      amount = parseInt(args[args.length - 1]);
    } else {
      return message.reply("❌ | Please reply to a user or mention someone to specify the amount!");
    }

    if (isNaN(amount) || amount <= 0) return message.reply("❌ | Please provide a valid positive amount!");

    const updatedUser = await usersData.addMoney(targetID, amount);
    const newBalance = updatedUser.money;

    return message.reply(`✅ | Successfully deposited $${amount.toLocaleString()}!\n💰 New Balance: $${newBalance.toLocaleString()}`);
  }
};
