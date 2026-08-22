const axios = require("axios");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    wallet: { type: Number, default: 1000 },
    exp: { type: Number, default: 0 }
});

const User = mongoose.models.BankUser || mongoose.model("BankUser", userSchema);

const mahmud = async () => {
    const res = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
    return res.data.mahmud;
};

module.exports = {
    config: {
        name: "mathgame",
        aliases: ["math"],
        version: "2.0",
        author: "Pratik Shah",
        countDown: 10,
        role: 0,
        description: {
            en: "Play fun math quizzes to win coins and exp in Royal Vault"
        },
        category: "games",
        guide: {
            en: "  {pn}"
        }
    },

    langs: {
        en: {
            reply: "  💬 ʀᴇᴘʟʏ ᴡɪᴛʜ ʏᴏᴜʀ ᴀɴsᴡᴇʀ (ᴀ, ʙ, ᴄ, ᴏʀ ᴅ).",
            correct: "╔══ [ 🎉 ᴄᴏʀʀᴇᴄᴛ ᴀɴsᴡᴇʀ ] ══╗\n  ᴄᴏɴɢʀᴀᴛᴜʟᴀᴛɪᴏɴs! ʏᴏᴜ ᴡᴏɴ $1,000,000 ᴄᴏɪɴs ᴀɴᴅ 121 ᴇxᴘ!\n╚═══════════════════════════╝",
            wrong: "╔══ [ ❌ ᴡʀᴏɴɢ ᴀɴsᴡᴇʀ ] ══╗\n  ᴛʜᴇ ᴄᴏʀʀᴇᴄᴛ ᴀɴsᴡᴇʀ ᴡᴀs: %1\n╚══════════════════════════╝",
            notYour: "╔══ [ ⚠️ ᴅᴇɴɪᴇᴅ ] ══╗\n  ᴛʜɪs ɪs ɴᴏᴛ ʏᴏᴜʀ ǫᴜɪᴢ!\n╚═════════════════════╝",
            error: "╔══ [ ❌ ᴇʀʀᴏʀ ] ══╗\n  ᴀᴘɪ ᴇʀʀᴏʀ: %1\n╚═══════════════════╝"
        }
    },

    onStart: async function ({ api, event, getLang }) {
        const BANK_NAME = "🏛️ ᴅɪ-ᴀʙʟᴏ ᴊɪ-sᴏᴏ ʀᴏʏᴀʟ ᴠᴀᴜʟᴛ 🏛️";

        try {
            const apiUrl = await mahmud();
            const res = await axios.get(`${apiUrl}/api/math`);
            const quiz = res.data?.data || res.data;

            if (!quiz) return api.sendMessage("╔══ [ ❌ ᴇʀʀᴏʀ ] ══╗\n  ɴᴏ ᴍᴀᴛʜ ǫᴜɪᴢ ᴀᴠᴀɪʟᴀʙʟᴇ.\n╚═══════════════════╝", event.threadID, event.messageID);

            const { question, correctAnswer, options } = quiz;
            const { a, b, c, d } = options;

            let quizMsg = `╔════════════════════════════════╗\n`;
            quizMsg +=    `      🧠 ᴍᴀᴛʜ ǫᴜɪᴢ ᴄʜᴀʟʟᴇɴɢᴇ 🧠\n`;
            quizMsg +=    `╠════════════════════════════════╣\n`;
            quizMsg +=    `  ❓ ǫᴜᴇsᴛɪᴏɴ: ${question}\n`;
            quizMsg +=    `╠════════════════════════════════╣\n`;
            quizMsg +=    `  🅰️ ${a}\n`;
            quizMsg +=    `  🅱️ ${b}\n`;
            quizMsg +=    `  🅲️ ${c}\n`;
            quizMsg +=    `  🅳️ ${d}\n`;
            quizMsg +=    `╠════════════════════════════════╣\n`;
            quizMsg +=    `  🎁 ʀᴇᴡᴀʀᴅ: $1,000,000 ᴄᴏɪɴs + 121 ᴇxᴘ\n`;
            quizMsg +=    `${getLang("reply")}\n`;
            quizMsg +=    `╠════════════════════════════════╣\n`;
            quizMsg +=    `  🏦 ${BANK_NAME}\n`;
            quizMsg +=    `╚════════════════════════════════╝`;

            api.sendMessage(quizMsg, event.threadID, (error, info) => {
                global.GoatBot.onReply.set(info.messageID, {
                    type: "reply",
                    commandName: this.config.name,
                    author: event.senderID,
                    messageID: info.messageID,
                    correctAnswer
                });

                setTimeout(() => {
                    api.unsendMessage(info.messageID);
                }, 40000);
            }, event.messageID);

        } catch (error) {
            api.sendMessage(getLang("error", error.message), event.threadID, event.messageID);
        }
    },

    onReply: async function ({ event, api, Reply, getLang }) {
        const { correctAnswer, author } = Reply;
        if (event.senderID !== author) return api.sendMessage(getLang("notYour"), event.threadID, event.messageID);

        const userReply = event.body.trim().toLowerCase();
        const rewardCoins = 1000000;
        const rewardExp = 121;

        await api.unsendMessage(Reply.messageID);

        if (userReply === correctAnswer.toLowerCase()) {
            let user = await User.findOne({ userID: author }) || await User.create({ userID: author });
            user.wallet += rewardCoins;
            user.exp += rewardExp;
            await user.save();

            return api.sendMessage(getLang("correct"), event.threadID, event.messageID);
        } else {
            return api.sendMessage(getLang("wrong", correctAnswer), event.threadID, event.messageID);
        }
    }
};
