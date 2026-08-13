const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "top",
    aliases: ["leaderboard"],
    version: "2.5",
    author: "Protik / Assistant",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Top richest users luxury card" },
    category: "economy",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message, usersData }) {
    const allUsers = await usersData.getAll();
    allUsers.sort((a, b) => ((b.data?.money || 10000000) - (a.data?.money || 10000000)));

    let top = allUsers.slice(0, 10);

    const canvas = createCanvas(800, 750);
    const ctx = canvas.getContext("2d");

    // Background
    ctx.fillStyle = "#0D0B18";
    ctx.fillRect(0, 0, 800, 750);

    // Gold Border
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 6;
    ctx.strokeRect(15, 15, 770, 720);

    // Header
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText("🏆 RICHEST TRILLIONAIRES 🏆", 150, 70);

    let y = 130;
    top.forEach((u, i) => {
      let money = u.data?.money !== undefined ? u.data.money : 10000000;
      let medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`;

      ctx.fillStyle = i < 3 ? "#FFD700" : "#FFFFFF";
      ctx.font = "bold 24px sans-serif";
      ctx.fillText(`${medal} ${u.name || "User"}`, 40, y);

      ctx.fillStyle = "#00FF66";
      ctx.fillText(`$${money.toLocaleString()}`, 520, y);

      y += 58;
    });

    const cachePath = path.join(__dirname, "cache", `top_board.png`);
    await fs.ensureDir(path.join(__dirname, "cache"));
    await fs.writeFile(cachePath, canvas.toBuffer("image/png"));

    return message.reply({
      body: "🏆 𝐓𝐎𝐏 𝐑𝐈𝐂𝐇𝐄𝐒𝐓 𝐋𝐄𝐀𝐃𝐄𝐑𝐁𝐎𝐀𝐑𝐃 🏆",
      attachment: fs.createReadStream(cachePath)
    }, () => fs.unlinkSync(cachePath));
  }
};
