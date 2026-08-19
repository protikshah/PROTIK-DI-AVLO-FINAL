module.exports = {
  config: {
    name: "top",
    aliases: ["leaderboard", "lb", "rich"],
    version: "7.0",
    author: "Protik / Assistant",
    countDown: 5,
    role: 0,
    shortDescription: { en: "View top 15 richest players" },
    category: "economy",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message, usersData }) {
    const allUsers = await usersData.getAll();

    if (!allUsers || allUsers.length === 0) {
      return message.reply("> 🏆\n• No user data found!");
    }

    // Filter and Sort by Money
    const sortedUsers = allUsers
      .map(u => {
        const money = typeof u.money === "number" ? u.money : (u.data?.money || 0);
        return {
          userID: u.userID,
          name: u.name || "Anonymous User",
          money: money
        };
      })
      .sort((a, b) => b.money - a.money)
      .slice(0, 15);

    const formatMoney = (num) => {
      if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
      if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
      if (num >= 1000) return (num / 1000).toFixed(1) + "K";
      return num.toLocaleString();
    };

    const getRankBadge = (rank) => {
      if (rank === 1) return "🥇 [TOP 1]";
      if (rank === 2) return "🥈 [TOP 2]";
      if (rank === 3) return "🥉 [TOP 3]";
      if (rank <= 5) return "💎 [VIP]";
      return "✨ [MEMBER]";
    };

    let leaderboardMsg = `🏆 ═══ [ DI-ABLO BANK TOP 15 RICHEST ] ═══ 🏆\n\n`;

    sortedUsers.forEach((user, index) => {
      const rank = index + 1;
      const badge = getRankBadge(rank);
      leaderboardMsg += `${badge} ${rank}. ${user.name}\n• Balance: $${formatMoney(user.money)}\n\n`;
    });

    leaderboardMsg += `────────────────────────────\n> 👑 Work hard to claim the #1 Crown!`;

    return message.reply(leaderboardMsg);
  }
};
