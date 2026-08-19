module.exports = {
  config: {
    name: "sendmoney",
    aliases: ["pay", "transfer", "paymoney"],
    version: "7.0",
    author: "Protik / Assistant",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Transfer money to another user" },
    category: "economy",
    guide: { en: "{pn} [reply/mention/UID] [amount]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const senderID = event.senderID;
    let receiverID = null;
    let amountInput = null;

    if (Object.keys(event.mentions).length > 0) {
      receiverID = Object.keys(event.mentions)[0];
      amountInput = args[1];
    } else if (event.type === "message_reply") {
      receiverID = event.messageReply.senderID;
      amountInput = args[0];
    } else if (args.length >= 2 && !isNaN(args[0])) {
      receiverID = args[0];
      amountInput = args[1];
    }

    if (!receiverID || !amountInput) {
      return message.reply("> 💸\n• Usage: !pay [reply/mention/UID] [amount]\n• Example: !pay @friend 5m");
    }

    if (receiverID === senderID) {
      return message.reply("> 💸\n• You cannot send money to yourself!");
    }

    const parseAmount = (input) => {
      if (!input) return NaN;
      const lower = input.toLowerCase();
      if (lower.endsWith("k")) return parseFloat(lower) * 1000;
      if (lower.endsWith("m")) return parseFloat(lower) * 1000000;
      if (lower.endsWith("b")) return parseFloat(lower) * 1000000000;
      return parseInt(input);
    };

    const transferAmount = parseAmount(amountInput);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      return message.reply("> 💸\n• Please enter a valid transfer amount!");
    }

    // Sender Data Check
    let senderData = await usersData.get(senderID);
    let senderMoney = typeof senderData.money === "number" ? senderData.money : (senderData.data?.money || 0);

    if (senderMoney < transferAmount) {
      return message.reply("> 💸\n• Insufficient funds to complete this transfer!");
    }

    // Receiver Data Check
    let receiverData = await usersData.get(receiverID);
    if (!receiverData) {
      return message.reply("> 💸\n• Receiver profile not found in database!");
    }
    let receiverMoney = typeof receiverData.money === "number" ? receiverData.money : (receiverData.data?.money || 0);

    // Balance Updates
    const newSenderBalance = senderMoney - transferAmount;
    const newReceiverBalance = receiverMoney + transferAmount;

    // Save Sender Data Permanently
    senderData.money = newSenderBalance;
    if (!senderData.data) senderData.data = {};
    senderData.data.money = newSenderBalance;
    await usersData.set(senderID, senderData);

    // Save Receiver Data Permanently
    receiverData.money = newReceiverBalance;
    if (!receiverData.data) receiverData.data = {};
    receiverData.data.money = newReceiverBalance;
    await usersData.set(receiverID, receiverData);

    const formatMoney = (num) => {
      if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(1) + "K";
      return num.toLocaleString();
    };

    const receiverName = await usersData.getName(receiverID);

    const response = 
      `> 💸\n` +
      `• Money Transfer Successful!\n` +
      `• Sent To: ${receiverName}\n` +
      `• Amount Transferred: $${formatMoney(transferAmount)}\n\n` +
      `💳 Remaining Balance: $${formatMoney(newSenderBalance)}`;

    return message.reply(response);
  }
};
