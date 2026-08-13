module.exports = {
  config: {
    name: "top",
    aliases: ["leaderboard"],
    version: "1.0",
    author: "Protik / Assistant",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Top richest users" },
    category: "economy",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message, usersData }) {
    const allUsers = await usersData.getAll();
    allUsers.sort((a, b) => ((b.data?.money || 0) - (a.data?.money || 0)));

    let msg = "🏆 𝐓𝐎𝐏 𝐁𝐀𝐋𝐀𝐍𝐂𝐄 𝐋𝐄𝐀𝐃𝐄𝐑𝐁𝐎𝐀𝐑𝐃 🏆\n━━━━━━━━━━━━━━━━━━━\n";
    let top = allUsers.slice(0, 10);

    top.forEach((u, index) => {
      let badge = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "👤";
      let money = u.data?.money !== undefined ? u.data.money : 10000000;
      msg += `${badge} ${index + 1}. ${u.name || "User"}: $${money.toLocaleString()}\n`;
    });

    return message.reply(msg);
  }
};
