module.exports = {
  config: {
    name: "addbal",
    aliases: ["addmoney", "givemoney"],
    version: "8.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 2, // 2 = Bot Admin / Operator
    shortDescription: { en: "Add money to user account" },
    category: "admin",
    guide: { en: "{pn} [reply/mention/UID] [amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    let targetID = null;
    let amountInput = null;

    // 1. Reply Check
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
      amountInput = args[0];
    } 
    // 2. Mention Check
    else if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
      // Get the last argument after mention as amount
      amountInput = args[args.length - 1];
    } 
    // 3. Direct UID Check (#addbal [UID] [Amount])
    else if (args.length >= 2 && !isNaN(args[0])) {
      targetID = args[0];
      amountInput = args[1];
    }
    // 4. Self Add (#addbal [Amount])
    else if (args.length === 1) {
      targetID = event.senderID;
      amountInput = args[0];
    }

    if (!targetID || !amountInput) {
      return message.reply(
        `> 🏦\n` +
        `• Usage: #addbal [reply/mention/UID] [amount]\n` +
        `• Examples:\n` +
        `  - Reply to user: #addbal 10m\n` +
        `  - Mention user: #addbal @user 10m\n` +
        `  - Direct UID: #addbal 100083 10m`
      );
    }

    const parseAmount = (input) => {
      if (!input) return NaN;
      const lower = String(input).toLowerCase().trim();
      if (lower.endsWith("k")) return parseFloat(lower) * 1000;
      if (lower.endsWith("m")) return parseFloat(lower) * 1000000;
      if (lower.endsWith("b")) return parseFloat(lower) * 1000000000;
      return parseInt(lower);
    };

    const addAmount = parseAmount(amountInput);
    if (isNaN(addAmount) || addAmount <= 0) {
      return message.reply("> 🏦\n• Please enter a valid amount to add! (e.g., 1000, 10k, 10m)");
    }

    let userData = await usersData.get(targetID);
    if (!userData) {
      return message.reply("> 🏦\n• User record not found in database!");
    }

    let currentMoney = typeof userData.money === "number" ? userData.money : (userData.data?.money || 0);
    let newBalance = currentMoney + addAmount;

    // Permanent Save to DB
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
