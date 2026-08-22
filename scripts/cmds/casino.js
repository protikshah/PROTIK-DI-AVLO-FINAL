const { createCanvas } = require("canvas");
const fs = require("fs-extra");
const path = require("path");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    wallet: { type: Number, default: 1000 },
    bank: { type: Number, default: 0 }
});

const User = mongoose.models.BankUser || mongoose.model("BankUser", userSchema);

module.exports = {
    config: {
        name: "casino",
        aliases: ["poker"],
        version: "6.0",
        author: "Pratik Shah",
        countDown: 3,
        role: 0,
        description: { en: "High stakes VIP casino poker game connected to Royal Vault" },
        category: "games",
        guide: { en: "{pn} [bet_amount]" }
    },

    onStart: async function ({ message, args, event }) {
        const { senderID } = event;
        const BANK_NAME = "🏛️ ᴅɪ-ᴀʙʟᴏ ᴊɪ-sᴏᴏ ʀᴏʏᴀʟ ᴠᴀᴜʟᴛ 🏛️";
        
        const parseBet = (input) => {
            if (!input) return NaN;
            const lower = input.toLowerCase();
            if (lower.endsWith("k")) return parseFloat(lower) * 1000;
            if (lower.endsWith("m")) return parseFloat(lower) * 1000000;
            if (lower.endsWith("b")) return parseFloat(lower) * 1000000000;
            return parseInt(input);
        };

        const bet = parseBet(args[0]);

        if (isNaN(bet) || bet <= 0) {
            return message.reply("╔══ [ ❌ ɪɴᴠᴀʟɪᴅ ʙᴇᴛ ] ══╗\n  ᴜsᴀɢᴇ: #ᴄᴀsɪɴᴏ <ʙᴇᴛ_ᴀᴍᴏᴜɴᴛ>\n  ᴇxᴀᴍᴘʟᴇ: #ᴄᴀsɪɴᴏ 5ᴋ\n╚═══════════════════════╝");
        }
        if (bet > 50000000000) {
            return message.reply("╔══ [ ❌ ʟɪᴍɪᴛ ᴇxᴄᴇᴇᴅᴇᴅ ] ══╗\n  ᴍᴀxɪᴍᴜᴍ ʙᴇᴛ ʟɪᴍɪᴛ ɪs $50 ʙɪʟʟɪᴏɴ!\n╚═══════════════════════════╝");
        }

        let user = await User.findOne({ userID: senderID }) || await User.create({ userID: senderID });

        if (user.wallet < bet) {
            return message.reply(
                `╔══ [ ❌ ɪɴsᴜғғɪᴄɪᴇɴᴛ ғᴜɴᴅs ] ══╗\n` +
                `  ʏᴏᴜ ɴᴇᴇᴅ $${bet.toLocaleString()} ɪɴ ʏᴏᴜʀ ᴡᴀʟʟᴇᴛ!\n` +
                `  💡 ᴡɪᴛʜᴅʀᴀᴡ ғᴜɴᴅs: #ʙᴀɴᴋ ᴡɪᴛʜᴅʀᴀᴡ <ᴀᴍᴏᴜɴᴛ>\n` +
                `╚════════════════════════════════╝`
            );
        }

        const isWin = Math.random() < 0.45;
        const winAmount = bet * 2;

        if (isWin) {
            user.wallet += winAmount;
        } else {
            user.wallet -= bet;
        }

        await user.save();

        const canvas = createCanvas(800, 450);
        const ctx = canvas.getContext("2d");

        // Background
        ctx.fillStyle = isWin ? "#0b1d12" : "#1d0b0b";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Stylish Dual Border Frame
        ctx.strokeStyle = isWin ? "#2ecc71" : "#e74c3c";
        ctx.lineWidth = 8;
        ctx.strokeRect(15, 15, canvas.width - 30, canvas.height - 30);
        
        ctx.strokeStyle = "#f1c40f";
        ctx.lineWidth = 2;
        ctx.strokeRect(22, 22, canvas.width - 44, canvas.height - 44);

        // Header Title
        ctx.fillStyle = isWin ? "#2ecc71" : "#e74c3c";
        ctx.font = "bold 42px Sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(isWin ? "👑 HIGH STAKES WIN 👑" : "♠️ CASINO TABLE LOSS ♠️", 400, 80);

        // Result Status
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 36px Sans-serif";
        ctx.fillText(isWin ? "🃏 ROYAL FLUSH / WINNER" : "🃏 HOUSE TOOK THE CHIPS", 400, 160);

        // Amount Display
        ctx.font = "bold 38px Sans-serif";
        ctx.fillStyle = isWin ? "#2ecc71" : "#e74c3c";
        ctx.fillText(isWin ? `+ $${winAmount.toLocaleString()}` : `- $${bet.toLocaleString()}`, 400, 240);

        // Wallet Balance
        ctx.fillStyle = "#f1c40f";
        ctx.font = "bold 28px Sans-serif";
        ctx.fillText(`💳 WALLET BALANCE: $${user.wallet.toLocaleString()}`, 400, 320);

        // Footer Branding
        ctx.fillStyle = "#888888";
        ctx.font = "italic 20px Sans-serif";
        ctx.fillText("DI-ABLO JI-SOO ROYAL VAULT • VIP POKER ROOM", 400, 390);

        const cardPath = path.join(__dirname, `cache_casino_${senderID}.png`);
        fs.writeFileSync(cardPath, canvas.toBuffer("image/png"));

        const msgText = isWin
            ? `╔════════ [ 🃏 ᴄᴀsɪɴᴏ ᴠɪᴄᴛᴏʀʏ ] ════════╗\n` +
              `  🎰 ʀᴇsᴜʟᴛ  : ᴡᴏɴ $${winAmount.toLocaleString()}\n` +
              `  💳 ᴡᴀʟʟᴇᴛ  : $${user.wallet.toLocaleString()}\n` +
              `  🏦 ʙᴀɴᴋ    : ${BANK_NAME}\n` +
              `╚══════════════════════════════════════╝`
            : `╔════════ [ 🃏 ᴄᴀsɪɴᴏ ᴅᴇғᴇᴀᴛ ] ════════╗\n` +
              `  💸 ʟᴏss    : -$${bet.toLocaleString()}\n` +
              `  💳 ᴡᴀʟʟᴇᴛ  : $${user.wallet.toLocaleString()}\n` +
              `  🏦 ʙᴀɴᴋ    : ${BANK_NAME}\n` +
              `╚══════════════════════════════════════╝`;

        return message.reply({
            body: msgText,
            attachment: fs.createReadStream(cardPath)
        }, () => {
            if (fs.existsSync(cardPath)) fs.unlinkSync(cardPath);
        });
    }
};
