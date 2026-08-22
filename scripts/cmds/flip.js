const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    wallet: { type: Number, default: 1000 },
    bank: { type: Number, default: 0 },
    flipStats: {
        wins: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    }
});

const User = mongoose.models.BankUser || mongoose.model("BankUser", userSchema);

module.exports = {
    config: {
        name: "flip",
        aliases: ["coinflip", "cf"],
        version: "8.0",
        author: "Pratik Shah",
        countDown: 3,
        role: 0,
        description: { en: "High Stakes Coin Flip connected to Royal Vault" },
        category: "games",
        guide: { en: "{pn} [heads/tails] [bet_amount]" }
    },

    onStart: async function ({ message, args, event }) {
        const { senderID } = event;
        const BANK_NAME = "🏛️ ᴅɪ-ᴀʙʟᴏ ᴊɪ-sᴏᴏ ʀᴏʏᴀʟ ᴠᴀᴜʟᴛ 🏛️";

        const choiceInput = args[0] ? args[0].toLowerCase() : null;
        const rawBet = args[1];

        if (!choiceInput || !["heads", "tails", "head", "tail", "h", "t"].includes(choiceInput) || !rawBet) {
            return message.reply("╔══ [ ❌ ɪɴᴠᴀʟɪᴅ ᴜsᴀɢᴇ ] ══╗\n  ᴜsᴀɢᴇ: #ғʟɪᴘ <ʜᴇᴀᴅs/ᴛᴀɪʟs> <ʙᴇᴛ>\n  ᴇxᴀᴍᴘʟᴇ: #ғʟɪᴘ ʜᴇᴀᴅs 5ᴍ\n╚═══════════════════════╝");
        }

        const userChoice = ["h", "head", "heads"].includes(choiceInput) ? "Heads" : "Tails";

        const parseBet = (input) => {
            if (!input) return NaN;
            const lower = input.toLowerCase();
            if (lower.endsWith("k")) return parseFloat(lower) * 1000;
            if (lower.endsWith("m")) return parseFloat(lower) * 1000000;
            if (lower.endsWith("b")) return parseFloat(lower) * 1000000000;
            return parseInt(input);
        };

        const bet = parseBet(rawBet);
        if (isNaN(bet) || bet <= 0) {
            return message.reply("╔══ [ ❌ ɪɴᴠᴀʟɪᴅ ʙᴇᴛ ] ══╗\n  ᴘʟᴇᴀsᴇ ᴇɴᴛᴇʀ ᴀ ᴠᴀʟɪᴅ ʙᴇᴛ ᴀᴍᴏᴜɴᴛ!\n╚═══════════════════════╝");
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

        const outcome = Math.random() < 0.50 ? "Heads" : "Tails";
        const isWin = userChoice === outcome;

        if (!user.flipStats) {
            user.flipStats = { wins: 0, total: 0 };
        }

        user.flipStats.total += 1;

        if (isWin) {
            user.wallet += bet;
            user.flipStats.wins += 1;
        } else {
            user.wallet -= bet;
        }

        await user.save();

        const totalGames = user.flipStats.total;
        const totalWins = user.flipStats.wins;
        const winRate = ((totalWins / totalGames) * 100).toFixed(1);

        const formatMoney = (num) => {
            if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
            if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
            if (num >= 1000) return (num / 1000).toFixed(1) + "K";
            return num.toLocaleString();
        };

        const coinIcon = outcome === "Heads" ? "👑 (Heads)" : "⚡ (Tails)";
        const statusMsg = isWin 
            ? `👑 ʀᴏʏᴀʟ ᴡɪɴ! ʏᴏᴜ ᴘʀᴇᴅɪᴄᴛᴇᴅ ʀɪɢʜᴛ +$${formatMoney(bet)}`
            : `💀 ᴜɴʟᴜᴄᴋʏ ғʟɪᴘ! ʏᴏᴜ ʟᴏsᴛ -$${formatMoney(bet)}`;

        const response = 
            `╔════════════════════════════════╗\n` +
            `       🪙 ᴄᴏɪɴ ғʟɪᴘ ᴀʀᴇɴᴀ 🪙\n` +
            `╠════════════════════════════════╣\n` +
            `  ${statusMsg}\n` +
            `  ───────────────────────────────\n` +
            `  🪙 ʀᴇsᴜʟᴛ  : ${coinIcon}\n` +
            `  🎯 ᴄʜᴏɪᴄᴇ  : ${userChoice}\n` +
            `  ───────────────────────────────\n` +
            `  📈 ᴡɪɴ ʀᴀᴛᴇ   : ${winRate}% (${totalWins}/${totalGames})\n` +
            `  💳 ᴡᴀʟʟᴇᴛ    : $${formatMoney(user.wallet)}\n` +
            `  🏦 ɪɴsᴛɪᴛᴜᴛɪᴏɴ: ${BANK_NAME}\n` +
            `╚════════════════════════════════╝`;

        return message.reply(response);
    }
};
