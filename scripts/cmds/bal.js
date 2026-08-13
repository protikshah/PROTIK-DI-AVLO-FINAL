module.exports = {
  config: {
    name: "bal",
    aliases: ["balance", "wallet"],
    version: "1.0",
    author: "Protik / Assistant",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Check your wallet balance" },
    category: "economy",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message, event, usersData }) {
    const { senderID } = event;
    let userData = await usersData.get(senderID);

    // নতুন ইউজার হলে ১০ মিলিয়ন স্টার্টিং ব্যালেন্স দেওয়া হবে
    if (!userData.data || userData.data.money === undefined) {
      await usersData.set(senderID, {
        money: 10000000
      });
      userData = await usersData.get(senderID);
    }

    const money = userData.data.money || 0;
    const name = userData.name || "User";

    const msg = `💳 𝐖𝐀𝐋𝐋𝐄𝐓 𝐁𝐀𝐋𝐀𝐍𝐂𝐄 💳\n━━━━━━━━━━━━━━━\n👤 Account: ${name}\n💰 Balance: $${money.toLocaleString()}\n━━━━━━━━━━━━━━━`;
    return message.reply(msg);
  }
};
