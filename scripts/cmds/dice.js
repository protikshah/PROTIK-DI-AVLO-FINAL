const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    wallet: { type: Number, default: 1000 },
    bank: { type: Number, default: 0 },
    diceStats: {
        wins: { type: Number, default: 0 },
        total: { type: Number, default: 0 }
    }
});

const User = mongoose.models.BankUser || mongoose.model("BankUser", userSchema);

module.exports = {
    config: {
        name: "dice",
        aliases: ["roll"],
        version: "8.0",
        author: "Pratik Shah",
        countDown: 3,
        role: 0,
        description: { en: "Roll the lucky dice connected to Royal Vault" },
        category: "games",
        guide: { en: "{pn} [bet_amount]" }
    },

    onStart: async function ({ message, args, event }) {
        const { senderID } = event;
        const BANK_NAME = "🏛️ ᴅɪ-ᴀʙʟᴏ ᴊɪ-sᴏᴏ ʀᴏʏᴀʟ ᴠᴀᴜʟᴛ 🏛️";
        const rawBet = args[0];

        if (!rawBet) {
            return message.reply("╔══ [ ❌ ɪɴᴠᴀʟɪᴅ ᴜsᴀɢᴇ ] ══╗\n  ᴜsᴀɢᴇ: #ᴅɪᴄᴇ <ʙᴇᴛ_ᴀᴍᴏᴜɴᴛ>\n  ᴇxᴀᴍᴘʟᴇ: #ᴅɪᴄᴇ 1ᴍ\n╚═══════════════════════╝");
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

        const diceIcons = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
        const userRollIdx = Math.floor(Math.random() * 6);
        const botRollIdx = Math.floor(Math.random() * 6);

        const userRoll = userRollIdx + 1;
        const botRoll = botRollIdx + 1;

        const isWin = userRoll > botRoll;
        const isDraw = userRoll === botRoll;

        if (!user.diceStats) {
            user.diceStats = { wins: 0, total: 0 };
        }

        user.diceStats.total += 1;

        if (isWin) {
            user.wallet += bet;
            user.diceStats.wins += 1;
        } else if (!isDraw) {
            user.wallet -= bet;
        }

        await user.save();

        const totalGames = user.diceStats.total;
        const totalWins = user.diceStats.wins;
        const winRate = ((totalWins / totalGames) * 100).toFixed(1);

        const formatMoney = (num) => {
            if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
            if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
            if (num >= 1000) return (num / 1000).toFixed(1) + "K";
            return num.toLocaleString();
        };

        let statusMsg = "";
        if (isWin) statusMsg = `👑 ʜɪɢʜ ʀᴏʟʟ! ʏᴏᴜ ᴡᴏɴ +$${formatMoney(bet)}`;
        else if (isDraw) statusMsg = `🤝 ᴅʀᴀᴡ ᴍᴀᴛᴄʜ! ɴᴏ ʟᴏss ᴏᴄᴄᴜʀʀᴇᴅ`;
        else statusMsg = `💀 ʟᴏᴡ ʀᴏʟʟ! ʏᴏᴜ ʟᴏsᴛ -$${formatMoney(bet)}`;

        const response = 
            `╔════════════════════════════════╗\n` +
            `        🎲 ʀᴏʏᴀʟ ᴅɪᴄᴇ ᴀʀᴇɴᴀ 🎲\n` +
            `╠════════════════════════════════╣\n` +
            `  ${statusMsg}\n` +
            `  ───────────────────────────────\n` +
            `  🎲 ʏᴏᴜ : [ ${diceIcons[userRollIdx]} ${userRoll} ]\n` +
            `  🤖 ʙᴏᴛ : [ ${diceIcons[botRollIdx]} ${botRoll} ]\n` +
            `  ───────────────────────────────\n` +
            `  📈 ᴡɪɴ ʀᴀᴛᴇ   : ${winRate}% (${totalWins}/${totalGames})\n` +
            `  💳 ᴡᴀʟʟᴇᴛ    : $${formatMoney(user.wallet)}\n` +
            `  🏦 ɪɴsᴛɪᴛᴜᴛɪᴏɴ: ${BANK_NAME}\n` +
            `╚════════════════════════════════╝`;

        return message.reply(response);
    }
};
