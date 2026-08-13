module.exports = {
  config: {
    name: "bal",
    aliases: ["balance", "wallet"],
    version: "1.1",
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
    let uData = userData.data || {};

    if (uData.money === undefined) {
      uData.money = 10000000;
      await usersData.set(senderID, { data: uData });
    }

    const money = uData.money;
    const name = userData.name || "User";

    const msg = `💳 𝐖𝐀𝐋𝐋𝐄𝐓 𝐁𝐀𝐋𝐀𝐍𝐂𝐄 💳\n━━━━━━━━━━━━━━━\n👤 Account: ${name}\n💰 Balance: $${money.toLocaleString()}\n━━━━━━━━━━━━━━━`;
    return message.reply(msg);
  }
};
