module.exports = {
  config: {
    name: "sendmoney",
    aliases: ["pay", "givemoney", "transfer"],
    version: "2.0",
    author: "Protik / Assistant",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Send money to another user" },
    category: "economy",
    guide: { en: "{pn} [@mention / reply / UID] [amount]" }
  },

  onStart: async function ({ message, event, args, usersData }) {
    const { senderID, mentions, messageReply } = event;

    // Helper to parse inputs like 5k, 1m, 2b to actual numbers
    const parseAmount = (str) => {
      if (!str) return NaN;
      let numStr = str.toLowerCase().trim();
      let multiplier = 1;

      if (numStr.endsWith("k")) {
        multiplier = 1000;
        numStr = numStr.slice(0, -1);
      } else if (numStr.endsWith("m")) {
        multiplier = 1000000;
        numStr = numStr.slice(0, -1);
      } else if (numStr.endsWith("b")) {
        multiplier = 1000000000;
        numStr = numStr.slice(0, -1);
      }

      const val = parseFloat(numStr);
      return isNaN(val) ? NaN : Math.floor(val * multiplier);
    };

    // Helper to format money for output
    const formatMoney = (num) => {
      if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(1) + "K";
      return num.toLocaleString();
    };

    let receiverID = null;
    let amountRaw = null;

    // 1. If replied to a message
    if (messageReply) {
      receiverID = messageReply.senderID;
      amountRaw = args[0];
    } 
    // 2. If mentioned a user
    else if (Object.keys(mentions).length > 0) {
      receiverID = Object.keys(mentions)[0];
      // Take the last argument as amount (handles names with spaces)
      amountRaw = args[args.length - 1];
    } 
    // 3. If passed UID directly
    else if (args.length >= 2 && !isNaN(args[0])) {
      receiverID = args[0];
      amountRaw = args[1];
    }

    if (!receiverID || !amountRaw) {
      return message.reply(
        `> 💸\n` +
        `• Usage: #sendmoney [@mention / reply / UID] [amount]\n` +
        `• Example: #sendmoney @friend 10000 or #sendmoney 5m`
      );
    }

    if (receiverID === senderID) {
      return message.reply("> ⚠️\n• আপনি নিজেকে টাকা পাঠাতে পারবেন না!");
    }

    const amount = parseAmount(amountRaw);

    if (isNaN(amount) || amount <= 0) {
      return message.reply("> 💸\n• Please enter a valid transfer amount!");
    }

    // Fetch Sender Data
    let senderData = await usersData.get(senderID);
    let senderBalance = typeof senderData.money === "number" ? senderData.money : (senderData.data?.money || 0);

    if (senderBalance < amount) {
      return message.reply(`> ❌\n• আপনার অ্যাকাউন্টে পর্যাপ্ত টাকা নেই!\n• বর্তমান ব্যালেন্স: $${formatMoney(senderBalance)}`);
    }

    // Fetch Receiver Data
    let receiverData = await usersData.get(receiverID);
    let receiverBalance = typeof receiverData.money === "number" ? receiverData.money : (receiverData.data?.money || 0);

    // Update Balances
    const newSenderBalance = senderBalance - amount;
    const newReceiverBalance = receiverBalance + amount;

    senderData.money = newSenderBalance;
    if (senderData.data) senderData.data.money = newSenderBalance;

    receiverData.money = newReceiverBalance;
    if (receiverData.data) receiverData.data.money = newReceiverBalance;

    // Save to database
    await usersData.set(senderID, senderData);
    await usersData.set(receiverID, receiverData);

    const receiverName = receiverData.name || "ইউজার";

    return message.reply(
      `> 💸  [ TRANSFER SUCCESSFUL ]  💸\n\n` +
      `• Sent To: ${receiverName}\n` +
      `• Amount Transferred: $${formatMoney(amount)}\n` +
      `• Your New Balance: $${formatMoney(newSenderBalance)}`
    );
  }
};
