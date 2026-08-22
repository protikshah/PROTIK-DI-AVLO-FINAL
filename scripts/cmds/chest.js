const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    wallet: { type: Number, default: 1000 },
    bank: { type: Number, default: 0 }
});

const User = mongoose.models.BankUser || mongoose.model("BankUser", userSchema);

module.exports = {
    config: {
        name: "chest",
        version: "2.0.0",
        role: 0,
        author: "Pratik Shah",
        description: { en: "Unlock mystery chests for massive vault rewards" },
        category: "games",
        guide: {
            en: "{pn} <chest_number 1-3> <bet_amount>"
        },
        countDown: 5
    },

    onStart: async function ({ api, event, args, message }) {
        const { threadID, messageID, senderID } = event;
        const BANK_NAME = "🏛️ ᴅɪ-ᴀʙʟᴏ ᴊɪ-sᴏᴏ ʀᴏʏᴀʟ ᴠᴀᴜʟᴛ 🏛️";

        const parseBet = (input) => {
            if (!input) return NaN;
            const lower = input.toLowerCase();
            if (lower.endsWith("k")) return parseFloat(lower) * 1000;
            if (lower.endsWith("m")) return parseFloat(lower) * 1000000;
            if (lower.endsWith("b")) return parseFloat(lower) * 1000000000;
            return parseInt(input);
        };

        const choice = parseInt(args[0]);
        const bet = parseBet(args[1]);

        if (isNaN(choice) || choice < 1 || choice > 3) {
            return message.reply("╔══ [ ❌ ɪɴᴠᴀʟɪᴅ ᴄʜᴏɪᴄᴇ ] ══╗\n  ᴄʜᴏᴏsᴇ ᴀ ᴄʜᴇsᴛ ɴᴜᴍʙᴇʀ ʙᴇᴛᴡᴇᴇɴ 1 ᴀɴᴅ 3!\n  sʏɴᴛᴀx: #ᴄʜᴇsᴛ <1-3> <ʙᴇᴛ>\n  ᴇxᴀᴍᴘʟᴇ: #ᴄʜᴇsᴛ 2 500\n╚═══════════════════════════╝");
        }

        if (isNaN(bet) || bet <= 0) {
            return message.reply("╔══ [ ❌ ɪɴᴠᴀʟɪᴅ ʙᴇᴛ ] ══╗\n  ᴘʟᴇᴀsᴇ ᴇɴᴛᴇʀ ᴀ ᴠᴀʟɪᴅ ʙᴇᴛ ᴀᴍᴏᴜɴᴛ!\n╚═══════════════════════╝");
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

        // Deduct initial bet
        user.wallet -= bet;

        const outcomes = ['jackpot', 'coins', 'empty'];
        outcomes.sort(() => Math.random() - 0.5);

        const userOutcome = outcomes[choice - 1];

        let resultMsg = "";
        let netProfit = 0;

        if (userOutcome === 'jackpot') {
            const reward = bet * 5;
            user.wallet += reward;
            netProfit = reward - bet;
            resultMsg = `💎 ᴊᴀᴄᴋᴘᴏᴛ!! ɢᴏʟᴅ-ғɪʟʟᴇᴅ ᴛʀᴇᴀsᴜʀᴇ ᴄʜᴇsᴛ!\n  🎁 ᴘʀᴏғɪᴛ: +$${reward.toLocaleString()} (5x Multiplier)`;
        } else if (userOutcome === 'coins') {
            const reward = Math.floor(bet * 1.5);
            user.wallet += reward;
            netProfit = reward - bet;
            resultMsg = `🪙 ᴍᴏᴅᴇʀᴀᴛᴇ ᴛʀᴇᴀsᴜʀᴇ ғᴏᴜɴᴅ!\n  🎁 ᴘʀᴏғɪᴛ: +$${reward.toLocaleString()} (1.5x Multiplier)`;
        } else {
            resultMsg = `💀 ᴛʀᴀᴘ! ᴏɴʟʏ ᴘᴏɪsᴏɴᴏᴜs sɴᴀᴋᴇs & sᴋᴇʟᴇᴛᴏɴs!\n  ❌ ʟᴏss: -$${bet.toLocaleString()}`;
        }

        await user.save();

        const response = 
            `╔════════════════════════════════╗\n` +
            `     🧰 ᴍʏsᴛᴇʀʏ ᴄʜᴇsᴛ ʀᴏᴏᴍ 🧰\n` +
            `╠════════════════════════════════╣\n` +
            `  📦 ᴄʜᴇsᴛ sᴇʟᴇᴄᴛᴇᴅ: [ ᴄʜᴇsᴛ #${choice} ]\n` +
            `  🗝️ ᴜɴʟᴏᴄᴋɪɴɢ Vault... [ 🔓 ]\n` +
            `  ───────────────────────────────\n` +
            `  ${resultMsg}\n` +
            `  ───────────────────────────────\n` +
            `  💳 ᴡᴀʟʟᴇᴛ ʙᴀʟᴀɴᴄᴇ : $${user.wallet.toLocaleString()}\n` +
            `  🏦 ɪɴsᴛɪᴛᴜᴛɪᴏɴ     : ${BANK_NAME}\n` +
            `╚════════════════════════════════╝`;

        return message.reply(response);
    }
};
