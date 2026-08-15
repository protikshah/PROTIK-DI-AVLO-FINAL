module.exports = {
  config: {
    name: "sendmoney",
    aliases: ["pay", "transfer", "send"],
    version: "2.5",
    author: "Protik / Assistant",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Send money to another user" },
    category: "economy",
    guide: { en: "{pn} [Amount] (Reply to user or mention)" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    let targetID;
    let amount;

    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
      amount = parseInt(args[0]);
    } else if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
      amount = parseInt(args[args.length - 1]);
    } else {
      return message.reply("❌ | Please reply to a user or mention someone to send money!");
    }

    if (targetID === senderID) return message.reply("❌ | You cannot send money to yourself!");
    if (isNaN(amount) || amount <= 0) return message.reply("❌ | Please enter a valid amount!");

    const senderMoney = await usersData.getMoney(senderID);

    if (senderMoney < amount) {
      return message.reply(`❌ | Insufficient funds in your account!\n💸 Current Balance: $${senderMoney.toLocaleString()}`);
    }

    const updatedSender = await usersData.subtractMoney(senderID, amount);
    await usersData.addMoney(targetID, amount);

    return message.reply(`💸 𝐒𝐄𝐍𝐃 𝐌𝐎𝐍𝐄𝐘 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 💸\n💰 Amount: $${amount.toLocaleString()}\n💵 Remaining Balance: $${updatedSender.money.toLocaleString()}`);
  }
};
