const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "bal",
    aliases: ["balance", "wallet"],
    version: "2.5",
    author: "Protik / Assistant",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Check your luxury wallet card" },
    category: "economy",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message, event, usersData, api }) {
    const { senderID } = event;
    let userData = await usersData.get(senderID);
    let uData = userData.data || {};

    if (uData.money === undefined) {
      uData.money = 10000000;
      await usersData.set(senderID, { data: uData });
    }

    const money = uData.money;
    const name = userData.name || "VIP User";

    const canvas = createCanvas(850, 480);
    const ctx = canvas.getContext("2d");

    // Dark Luxury Background
    const gradient = ctx.createLinearGradient(0, 0, 850, 480);
    gradient.addColorStop(0, "#0a0813");
    gradient.addColorStop(0.5, "#18132b");
    gradient.addColorStop(1, "#050308");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 850, 480);

    // Gold Luxury Border
    ctx.strokeStyle = "#D4AF37";
    ctx.lineWidth = 8;
    ctx.strokeRect(15, 15, 820, 450);

    ctx.strokeStyle = "#FFD700";
    ctx.lineWidth = 2;
    ctx.strokeRect(25, 25, 800, 430);

    // User Profile Picture
    let avatarUrl = await usersData.getAvatarUrl(senderID);
    try {
      let avatar = await loadImage(avatarUrl);
      ctx.save();
      ctx.beginPath();
      ctx.arc(110, 110, 50, 0, Math.PI * 2, true);
      ctx.closePath();
      ctx.clip();
      ctx.drawImage(avatar, 60, 60, 100, 100);
      ctx.restore();
      
      ctx.strokeStyle = "#D4AF37";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(110, 110, 52, 0, Math.PI * 2, true);
      ctx.stroke();
    } catch (e) {}

    // Title
    ctx.fillStyle = "#D4AF37";
    ctx.font = "bold 32px sans-serif";
    ctx.fillText("💎 VIP LUXURY CARD", 190, 100);

    // Name
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "bold 36px sans-serif";
    ctx.fillText(name.toUpperCase(), 50, 220);

    // Balance Title & Amount
    ctx.fillStyle = "#FFD700";
    ctx.font = "bold 24px sans-serif";
    ctx.fillText("CURRENT BALANCE", 50, 290);

    ctx.fillStyle = "#00FF66";
    ctx.font = "bold 50px sans-serif";
    ctx.fillText(`$${money.toLocaleString()}`, 50, 350);

    // Status
    ctx.fillStyle = "#D4AF37";
    ctx.font = "bold 20px sans-serif";
    ctx.fillText("MEMBERSHIP: TRILLIONAIRE VIP CLUB 👑", 50, 420);

    const cachePath = path.join(__dirname, "cache", `bal_${senderID}.png`);
    await fs.ensureDir(path.join(__dirname, "cache"));
    await fs.writeFile(cachePath, canvas.toBuffer("image/png"));

    return message.reply({
      body: `💳 𝐖𝐀𝐋𝐋𝐄𝐓 𝐂𝐀𝐑𝐃 💳\n👤 Account: ${name}\n💰 Balance: $${money.toLocaleString()}`,
      attachment: fs.createReadStream(cachePath)
    }, () => fs.unlinkSync(cachePath));
  }
};
