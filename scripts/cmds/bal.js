module.exports = {
  config: {
    name: "bal",
    aliases: ["money", "balance", "card"],
    version: "7.0",
    author: "Protik / Assistant",
    countDown: 3,
    role: 0,
    shortDescription: { en: "Check your bank card balance" },
    category: "economy",
    guide: { en: "{pn} [reply/mention/UID/empty]" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    let targetID = event.senderID;

    if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
    } else if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
    } else if (args[0] && !isNaN(args[0])) {
      targetID = args[0];
    }

    let userData = await usersData.get(targetID);
    if (!userData) return message.reply("> 💳\n• User record not found in system!");

    let currentMoney = typeof userData.money === "number" ? userData.money : (userData.data?.money || 0);

    const formatMoney = (num) => {
      if (num >= 1000000000) return (num / 1000000000).toFixed(2) + "B";
      if (num >= 1000000) return (num / 1000000).toFixed(2) + "M";
      if (num >= 1000) return (num / 1000).toFixed(2) + "K";
      return num.toLocaleString();
    };

    const name = await usersData.getName(targetID);
    
    // Masked Card Number Generator based on UID
    const cardNum = `${targetID.slice(0, 4)} •••• •••• ${targetID.slice(-4)}`;

    const cardResponse = 
      `┌─────────────────────┐\n` +
      `│ 💳  DI-ABLO BANK OF JISOO    │\n` +
      `│ ░░░░  [ CHIP ]   VIP     │\n` +
      `│                          │\n` +
      `│  NUMBER : ${cardNum}   │\n` +
      `│  HOLDER : ${name.toUpperCase().slice(0, 16)}   │\n` +
      `│                          │\n` +
      `│  BALANCE : $${formatMoney(currentMoney)}           │\n` +
      `└─────────────────────┘\n` +
      `> 🏛️ Vault Status: Secure & Active`;

    return message.reply(cardResponse);
  }
};
