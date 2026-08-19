module.exports = {
  config: {
    name: "addbal",
    aliases: ["addmoney", "givemoney"],
    version: "7.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 2, // 2 = Bot Admin / Operator
    shortDescription: { en: "Add money to user account" },
    category: "admin",
    guide: { en: "{pn} [reply/mention/UID] [amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    let targetID = event.senderID;
    let amountInput = args[0];

    // Mention, Reply, or Direct UID Check
    if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
      amountInput = args[1];
    } else if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
      amountInput = args[0];
    } else if (args.length >= 2 && !isNaN(args[0])) {
      targetID = args[0];
      amountInput = args[1];
    }

    if (!amountInput) {
      return message.reply("> 🏦\n• Usage: !addbal [reply/mention/UID] [amount]\n• Example: !addbal @user 10m");
    }

    const parseAmount = (input) => {
      if (!input) return NaN;
      const lower = input.toLowerCase();
      if (lower.endsWith("k")) return parseFloat(lower) * 1000;
      if (lower.endsWith("m")) return parseFloat(lower) * 1000000;
      if (lower.endsWith("b")) return parseFloat(lower) * 1000000000;
      return parseInt(input);
    };

    const addAmount = parseAmount(amountInput);
    if (isNaN(addAmount) || addAmount <= 0) {
      return message.reply("> 🏦\n• Please enter a valid amount to add!");
    }

    let userData = await usersData.get(targetID);
    if (!userData) {
      return message.reply("> 🏦\n• User record not found in database!");
    }

    let currentMoney = typeof userData.money === "number" ? userData.money : (userData.data?.money || 0);
    let newBalance = currentMoney + addAmount;

    // Permanent Save
    userData.money = newBalance;
    if (!userData.data) userData.data = {};
    userData.data.money = newBalance;
    await usersData.set(targetID, userData);

    const formatMoney = (num) => {
      if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(1) + "K";
      return num.toLocaleString();
    };

    const targetName = await usersData.getName(targetID);

    const response = 
      `> 💳\n` +
      `• Admin Vault Injection Successful!\n` +
      `• Target User: ${targetName}\n` +
      `• Credited: +$${formatMoney(addAmount)}\n\n` +
      `📈 New Total Balance: $${formatMoney(newBalance)}`;

    return message.reply(response);
  }
};
