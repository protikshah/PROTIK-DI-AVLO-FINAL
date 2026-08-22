const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    wallet: { type: Number, default: 1000 }
});

const User = mongoose.models.BankUser || mongoose.model('BankUser', userSchema);

module.exports.config = {
    name: "horse",
    version: "2.0.0",
    role: 0,
    credits: "Pratik Shah",
    description: "Bet on horse racing with Royal Vault integration",
    category: "games",
    guide: {
        en: "{pref}horse <Horse No. 1-4> <Bet Amount>"
    },
    countDown: 15
};

module.exports.onStart = async function({ api, event, args }) {
    const { threadID, messageID, senderID } = event;
    const BANK_NAME = "🏛️ ᴅɪ-ᴀʙʟᴏ ᴊɪ-sᴏᴏ ʀᴏʏᴀʟ ᴠᴀᴜʟᴛ 🏛️";

    const chosenHorse = parseInt(args[0]);
    const bet = parseInt(args[1]);

    if (isNaN(chosenHorse) || chosenHorse < 1 || chosenHorse > 4) {
        return api.sendMessage(
            `╔══ [ ❌ ɪɴᴠᴀʟɪᴅ sᴇʟᴇᴄᴛɪᴏɴ ] ══╗\n` +
            `  ᴘʟᴇᴀsᴇ ᴄʜᴏᴏsᴇ ᴀ ʜᴏʀsᴇ ɴᴜᴍʙᴇʀ ʙᴇᴛᴡᴇᴇɴ 1 ᴀɴᴅ 4.\n` +
            `  💡 ᴇxᴀᴍᴘʟᴇ: #horse 3 500\n` +
            `╚═════════════════════════════╝`, 
            threadID, messageID
        );
    }

    if (isNaN(bet) || bet <= 0) {
        return api.sendMessage(
            `╔══ [ ❌ ɪɴᴠᴀʟɪᴅ ʙᴇᴛ ] ══╗\n` +
            `  ᴘʟᴇᴀsᴇ ᴇɴᴛᴇʀ ᴀ ᴠᴀʟɪᴅ ʙᴇᴛ ᴀᴍᴏᴜɴᴛ!\n` +
            `╚════════════════════════╝`, 
            threadID, messageID
        );
    }

    let user = await User.findOne({ userID: senderID }) || await User.create({ userID: senderID });

    if (bet > user.wallet) {
        return api.sendMessage(
            `╔══ [ ❌ ɪɴsᴜғғɪᴄɪᴇɴᴛ ғᴜɴᴅs ] ══╗\n` +
            `  ʏᴏᴜ ᴅᴏ ɴᴏᴛ ʜᴀᴠᴇ ᴇɴᴏᴜɢʜ ᴄᴏɪɴs ɪɴ ʏᴏᴜʀ ᴠᴀᴜʟᴛ!\n` +
            `  💰 ᴄᴜʀʀᴇɴᴛ ʙᴀʟᴀɴᴄᴇ: $${user.wallet}\n` +
            `╚═══════════════════════════════╝`, 
            threadID, messageID
        );
    }

    user.wallet -= bet;
    await user.save();

    const horses = ["⚡ Thunder", "🔥 Blaze", "🌪️ Shadow", "🚀 Rocket"];
    const winningIndex = Math.floor(Math.random() * 4);

    let msg = `╔════════════════════════════════╗\n`;
    msg +=    `      🏇 ʀᴏʏᴀʟ ʜᴏʀsᴇ ʀᴀᴄᴇ 🏇\n`;
    msg +=    `╠════════════════════════════════╣\n`;
    msg +=    `  🎯 ʏᴏᴜʀ ʜᴏʀsᴇ : #${chosenHorse} - ${horses[chosenHorse - 1]}\n`;
    msg +=    `  💰 ʏᴏᴜʀ ʙᴇᴛ   : $${bet}\n`;
    msg +=    `╠════════════════════════════════╣\n`;
    msg +=    `  🏁 ʀᴀᴄᴇ sᴛᴀʀᴛᴇᴅ... 🐎💨\n`;
    msg +=    `  1. 🐎💨 ${horses[0]}\n`;
    msg +=    `  2. 🐎💨 ${horses[1]}\n`;
    msg +=    `  3. 🐎💨 ${horses[2]}\n`;
    msg +=    `  4. 🐎💨 ${horses[3]}\n`;
    msg +=    `╠════════════════════════════════╣\n`;
    msg +=    `  🏆 ᴡɪɴɴᴇʀ     : #${winningIndex + 1} - ${horses[winningIndex]}\n`;
    msg +=    `╠════════════════════════════════╣\n`;

    if (chosenHorse - 1 === winningIndex) {
        const reward = bet * 4;
        user.wallet += reward;
        await user.save();
        msg += `  🎉 ᴄᴏɴɢʀᴀᴛs! ʏᴏᴜ ᴡᴏɴ $${reward} ᴄᴏɪɴs!\n`;
    } else {
        msg += `  ❌ ʏᴏᴜ ʟᴏsᴛ $${bet} ᴄᴏɪɴs. ʙᴇᴛᴛᴇʀ ʟᴜᴄᴋ ɴᴇxᴛ ᴛɪᴍᴇ!\n`;
    }

    msg +=    `  💰 ɴᴇᴡ ʙᴀʟᴀɴᴄᴇ: $${user.wallet}\n`;
    msg +=    `╠════════════════════════════════╣\n`;
    msg +=    `  🏦 ${BANK_NAME}\n`;
    msg +=    `╚════════════════════════════════╝`;

    return api.sendMessage(msg, threadID, messageID);
};
