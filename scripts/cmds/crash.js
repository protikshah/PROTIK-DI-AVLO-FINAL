const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    wallet: { type: Number, default: 1000 },
    bank: { type: Number, default: 0 }
});

const User = mongoose.models.BankUser || mongoose.model("BankUser", userSchema);

module.exports = {
    config: {
        name: "crash",
        version: "2.0.0",
        role: 0,
        author: "Pratik Shah",
        description: { en: "Cash out before the rocket crashes for dynamic vault rewards" },
        category: "games",
        guide: {
            en: "{pn} <target_multiplier e.g. 1.5/2.0> <bet_amount>"
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

        const targetMulti = parseFloat(args[0]);
        const bet = parseBet(args[1]);

        if (isNaN(targetMulti) || targetMulti < 1.1) {
            return message.reply("╔══ [ ❌ ɪɴᴠᴀʟɪᴅ ᴍᴜʟᴛɪᴘʟɪᴇʀ ] ══╗\n  ᴍɪɴɪᴍᴜᴍ ᴍᴜʟᴛɪᴘʟɪᴇʀ ɪs 1.1x!\n  sʏɴᴛᴀx: #ᴄʀᴀsʜ <ᴍᴜʟᴛɪᴘʟɪᴇʀ> <ʙᴇᴛ>\n  ᴇxᴀᴍᴘʟᴇ: #ᴄʀᴀsʜ 2.5 500\n╚═════════════════════════════╝");
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

        user.wallet -= bet;

        const crashPoint = parseFloat((Math.random() * (5.0 - 1.0) + 1.0).toFixed(2));
        const isWin = targetMulti <= crashPoint;

        let outcomeMsg = "";
        let netProfit = 0;

        if (isWin) {
            const reward = Math.floor(bet * targetMulti);
            user.wallet += reward;
            netProfit = reward - bet;
            outcomeMsg = `✅ ᴄᴀsʜᴏᴜᴛ sᴜᴄᴄᴇssғᴜʟ ʙᴇғᴏʀᴇ ᴄʀᴀsʜ!\n  🎉 ᴡɪɴɴɪɴɢs : +$${reward.toLocaleString()} (+$${netProfit.toLocaleString()} ɴᴇᴛ)`;
        } else {
            outcomeMsg = `💥 ʀᴏᴄᴋᴇᴛ ᴄʀᴀsʜᴇᴅ ʙᴇғᴏʀᴇ ʏᴏᴜʀ ᴄᴀsʜᴏᴜᴛ!\n  ❌ ʟᴏss     : -$${bet.toLocaleString()}`;
        }

        await user.save();

        const response = 
            `╔════════════════════════════════╗\n` +
            `    🚀 ʀᴏᴄᴋᴇᴛ ᴄʀᴀsʜ ᴀʀᴇɴᴀ 🚀\n` +
            `╠════════════════════════════════╣\n` +
            `  🎯 ᴛᴀʀɢᴇᴛ   : [ ${targetMulti.toFixed(1)}x ]\n` +
            `  💵 ʙᴇᴛ      : $${bet.toLocaleString()}\n` +
            `  ───────────────────────────────\n` +
            `  🚀 ᴛᴀᴋᴇᴏғғ... 📈\n` +
            `  💥 ᴄʀᴀsʜᴇᴅ ᴀᴛ: [ ${crashPoint.toFixed(2)}x ]\n` +
            `  ───────────────────────────────\n` +
            `  ${outcomeMsg}\n` +
            `  ───────────────────────────────\n` +
            `  💳 ᴡᴀʟʟᴇᴛ ʙᴀʟᴀɴᴄᴇ : $${user.wallet.toLocaleString()}\n` +
            `  🏦 ɪɴsᴛɪᴛᴜᴛɪᴏɴ     : ${BANK_NAME}\n` +
            `╚════════════════════════════════╝`;

        return message.reply(response);
    }
};
