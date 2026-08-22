const moment = require("moment-timezone");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    wallet: { type: Number, default: 1000 },
    exp: { type: Number, default: 0 },
    lastTimeGetReward: { type: String, default: "" }
});

const User = mongoose.models.BankUser || mongoose.model("BankUser", userSchema);

module.exports = {
    config: {
        name: "daily",
        version: "2.0",
        author: "Pratik Shah",
        countDown: 5,
        role: 0,
        description: {
            en: "Claim daily rewards in Royal Vault"
        },
        category: "games",
        guide: {
            en: "  {pn}\n  {pn} info"
        },
        envConfig: {
            rewardFirstDay: {
                coin: 5000000,
                exp: 1000
            }
        }
    },

    langs: {
        en: {
            monday: "ᴍᴏɴᴅᴀʏ",
            tuesday: "ᴛᴜᴇsᴅᴀʏ",
            wednesday: "ᴡᴇᴅɴᴇsᴅᴀʏ",
            thursday: "ᴛʜᴜʀsᴅᴀʏ",
            friday: "ғʀɪᴅᴀʏ",
            saturday: "sᴀᴛᴜʀᴅᴀʏ",
            sunday: "sᴜɴᴅᴀʏ",
            alreadyReceived: "╔══ [ ⚠️ ᴀʟʀᴇᴀᴅʏ ᴄʟᴀɪᴍᴇᴅ ] ══╗\n  ʏᴏᴜ ʜᴀᴠᴇ ᴀʟʀᴇᴀᴅʏ ᴄʟᴀɪᴍᴇᴅ ʏᴏᴜʀ ᴅᴀɪʟʏ ʀᴇᴡᴀʀᴅ ᴛᴏᴅᴀʏ!\n  ⏰ ᴄᴏᴍᴇ ʙᴀᴄᴋ ᴛᴏᴍᴏʀʀᴏᴡ.\n╚═══════════════════════════╝",
            received: "╔══ [ 🎉 ᴅᴀɪʟʏ ʀᴇᴡᴀʀᴅ ᴄʟᴀɪᴍᴇᴅ ] ══╗\n  ʏᴏᴜ ʜᴀᴠᴇ ʀᴇᴄᴇɪᴠᴇᴅ +$%1 ᴄᴏɪɴs ᴀɴᴅ +%2 ᴇxᴘ!\n╚══════════════════════════════════╝"
        }
    },

    onStart: async function ({ args, message, event, envCommands, commandName, getLang }) {
        const BANK_NAME = "🏛️ ᴅɪ-ᴀʙʟᴏ ᴊɪ-sᴏᴏ ʀᴏʏᴀʟ ᴠᴀᴜʟᴛ 🏛️";
        const reward = envCommands[commandName].rewardFirstDay;
        const { senderID } = event;

        if (args[0] == "info") {
            let msg = `╔════════════════════════════════╗\n`;
            msg +=    `      📅 ᴅᴀɪʟʏ ʀᴇᴡᴀʀᴅ sᴄʜᴇᴅᴜʟᴇ 📅\n`;
            msg +=    `╠════════════════════════════════╣\n`;

            for (let i = 1; i < 8; i++) {
                const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** ((i == 0 ? 7 : i) - 1));
                const getExp = Math.floor(reward.exp * (1 + 20 / 100) ** ((i == 0 ? 7 : i) - 1));
                const day = i == 7 ? getLang("sunday") :
                    i == 6 ? getLang("saturday") :
                        i == 5 ? getLang("friday") :
                            i == 4 ? getLang("thursday") :
                                i == 3 ? getLang("wednesday") :
                                    i == 2 ? getLang("tuesday") :
                                        getLang("monday");
                msg += `  📌 ${day}: $${getCoin.toLocaleString()} ᴄᴏɪɴs | ${getExp} ᴇxᴘ\n`;
            }

            msg +=    `╠════════════════════════════════╣\n`;
            msg +=    `  🏦 ${BANK_NAME}\n`;
            msg +=    `╚════════════════════════════════╝`;
            return message.reply(msg);
        }

        const dateTime = moment.tz("Asia/Dhaka").format("DD/MM/YYYY");
        const date = new Date();
        const currentDay = date.getDay(); // 0: sunday, 1: monday, 2: tuesday, 3: wednesday, 4: thursday, 5: friday, 6: saturday

        let user = await User.findOne({ userID: senderID }) || await User.create({ userID: senderID });

        if (user.lastTimeGetReward === dateTime) {
            return message.reply(getLang("alreadyReceived"));
        }

        const getCoin = Math.floor(reward.coin * (1 + 20 / 100) ** ((currentDay == 0 ? 7 : currentDay) - 1));
        const getExp = Math.floor(reward.exp * (1 + 20 / 100) ** ((currentDay == 0 ? 7 : currentDay) - 1));

        user.lastTimeGetReward = dateTime;
        user.wallet += getCoin;
        user.exp += getExp;
        await user.save();

        let claimMsg = `${getLang("received", getCoin.toLocaleString(), getExp)}\n\n`;
        claimMsg +=    `╔════════════════════════════════╗\n`;
        claimMsg +=    `  💰 ᴄᴜʀʀᴇɴᴛ ʙᴀʟᴀɴᴄᴇ: $${user.wallet.toLocaleString()}\n`;
        claimMsg +=    `  ⭐ ᴛᴏᴛᴀʟ ᴇxᴘ: ${user.exp}\n`;
        claimMsg +=    `╠════════════════════════════════╣\n`;
        claimMsg +=    `  🏦 ${BANK_NAME}\n`;
        claimMsg +=    `╚════════════════════════════════╝`;

        return message.reply(claimMsg);
    }
};
