const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    wallet: { type: Number, default: 1000 },
    bank: { type: Number, default: 0 },
    betStats: {
        wins: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    }
});

const User = mongoose.models.BankUser || mongoose.model("BankUser", userSchema);

module.exports = {
    config: {
        name: "bet",
        aliases: ["qbet"],
        version: "8.0",
        author: "Pratik Shah",
        countDown: 3,
        role: 0,
        description: { en: "Quick money multiplier bet connected to Royal Vault" },
        category: "games",
        guide: { en: "{pn} [bet_amount]" }
    },

    onStart: async function ({ message, args, event }) {
        const { senderID } = event;
        const BANK_NAME = "🏛️ ᴅɪ-ᴀʙʟᴏ ᴊɪ-sᴏᴏ ʀᴏʏᴀʟ ᴠᴀᴜʟᴛ 🏛️";
        const rawBet = args[0];

        if (!rawBet) {
            return message.reply("╔══ [ ❌ ɪɴᴠᴀʟɪᴅ ᴜsᴀɢᴇ ] ══╗\n  ᴜsᴀɢᴇ: #ʙᴇᴛ <ʙᴇᴛ_ᴀᴍᴏᴜɴᴛ>\n  ᴇxᴀᴍᴘʟᴇ: #ʙᴇᴛ 2ᴍ\n╚═══════════════════════╝");
        }

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

        const isWin = Math.random() < 0.50;
        const winAmount = bet;

        if (!user.betStats) {
            user.betStats = { wins: 0, total: 0 };
        }

        user.betStats.total += 1;

        if (isWin) {
            user.wallet += winAmount;
            user.betStats.wins += 1;
        } else {
            user.wallet -= bet;
        }

        await user.save();

        const totalGames = user.betStats.total;
        const totalWins = user.betStats.wins;
        const winRate = ((totalWins / totalGames) * 100).toFixed(1);

        const formatMoney = (num) => {
            if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
            if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
            if (num >= 1000) return (num / 1000).toFixed(1) + "K";
            return num.toLocaleString();
        };

        const statusMsg = isWin 
            ? `👑 ʟᴜᴄᴋʏ ᴄʜᴏɪᴄᴇ! ʏᴏᴜ ᴅᴏᴜʙʟᴇᴅ +$${formatMoney(winAmount)}`
            : `💀 ʙᴀᴅ ʟᴜᴄᴋ! ʏᴏᴜ ʟᴏsᴛ -$${formatMoney(bet)}`;

        const iconResult = isWin ? "[ 💸 | 💎 | 💵 ]" : "[ 💣 | 💥 | 💀 ]";

        const response = 
            `╔════════════════════════════════╗\n` +
            `       🎲 ǫᴜɪᴄᴋ ʙᴇᴛ ᴀʀᴇɴᴀ 🎲\n` +
            `╠════════════════════════════════╣\n` +
            `  ${statusMsg}\n` +
            `  🎯 ᴍᴜʟᴛɪᴘʟɪᴇʀ : ${iconResult}\n` +
            `  ───────────────────────────────\n` +
            `  📈 ᴡɪɴ ʀᴀᴛᴇ   : ${winRate}% (${totalWins}/${totalGames})\n` +
            `  💳 ᴡᴀʟʟᴇᴛ    : $${formatMoney(user.wallet)}\n` +
            `  🏦 ɪɴsᴛɪᴛᴜᴛɪᴏɴ: ${BANK_NAME}\n` +
            `╚════════════════════════════════╝`;

        return message.reply(response);
    }
};
