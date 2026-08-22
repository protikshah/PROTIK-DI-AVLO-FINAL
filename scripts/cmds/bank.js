const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    wallet: { type: Number, default: 1000 },
    bank: { type: Number, default: 0 },
    loan: { type: Number, default: 0 },
    lastInterest: { type: Number, default: Date.now }
});

const User = mongoose.models.BankUser || mongoose.model("BankUser", userSchema);

module.exports = {
    config: {
        name: "bank",
        aliases: ["banking", "atm"],
        version: "3.0",
        author: "Pratik Shah",
        countDown: 3,
        role: 0,
        description: {
            en: "DI-ABLO JI-SOO ROYAL VAULT - Ultra Stylish Economy System"
        },
        category: "economy",
        guide: {
            en: "{pn} [deposit / withdraw / transfer / loan / payloan / check]"
        }
    },

    onStart: async function ({ api, event, args, message }) {
        const ADMIN_ID = "61591412309835"; // 👑 Protik Shah UID
        const BANK_NAME = "🏛️ ᴅɪ-ᴀʙʟᴏ ᴊɪ-sᴏᴏ ʀᴏʏᴀʟ ᴠᴀᴜʟᴛ 🏛️";
        const senderID = event.senderID;
        const subCommand = args[0]?.toLowerCase();
        const amount = parseInt(args[1]);

        try {
            let user = await User.findOne({ userID: senderID }) || await User.create({ userID: senderID });

            // 2% Daily Interest Logic
            const now = Date.now();
            const oneDay = 24 * 60 * 60 * 1000;
            if (now - user.lastInterest >= oneDay && user.bank > 0) {
                const interest = Math.floor(user.bank * 0.02);
                user.bank += interest;
                user.lastInterest = now;
                await user.save();
                message.reply(`╔═════ [ ${BANK_NAME} ] ═════╗\n  📈 ᴅᴀɪʟʏ ɪɴᴛᴇʀᴇsᴛ ᴄʀᴇᴅɪᴛ: +$${interest.toLocaleString()}\n╚═════════════════════════════╝`);
            }

            const format = (num) => num.toLocaleString();

            // --- STATEMENT / CHECK ---
            if (!subCommand || subCommand === "check") {
                return message.reply(
                    `╔════════════════════════════════╗\n` +
                    `       ${BANK_NAME}\n` +
                    `   "sᴇᴄᴜʀɪɴɢ ʏᴏᴜʀ ᴇᴍᴘɪʀᴇ's ғᴏʀᴛᴜɴᴇ"\n` +
                    `╠════════════════════════════════╣\n` +
                    `  💳 ᴀᴄᴄᴏᴜɴᴛ ʜᴏʟᴅᴇʀ : <@${senderID}>\n` +
                    `  ───────────────────────────────\n` +
                    `  💵 ᴄᴀsʜ ᴡᴀʟʟᴇᴛ    : $${format(user.wallet)}\n` +
                    `  🛡️ sᴇᴄᴜʀᴇ ᴠᴀᴜʟᴛ   : $${format(user.bank)}\n` +
                    `  ⚠️ ᴀᴄᴛɪᴠᴇ ᴅᴇʙᴛ    : $${format(user.loan)}\n` +
                    `╠════════════════════════════════╣\n` +
                    `  💡 ᴠᴀᴜʟᴛ ғᴜɴᴅs ᴀʀᴇ 100% ɪᴍᴍᴜɴᴇ ᴛᴏ #ʀᴏʙ!\n` +
                    `╚════════════════════════════════╝`
                );
            }

            // --- DEPOSIT ---
            if (subCommand === "deposit" || subCommand === "dep") {
                if (isNaN(amount) || amount <= 0) return message.reply("╔══ [ ❌ ᴅᴇᴘᴏsɪᴛ ᴇʀʀᴏʀ ] ══╗\n  sᴘᴇᴄɪғʏ ᴀ ᴠᴀʟɪᴅ ᴅᴇᴘᴏsɪᴛ ᴀᴍᴏᴜɴᴛ!\n╚══════════════════════════╝");
                if (user.wallet < amount) return message.reply("╔══ [ ❌ ᴅᴇᴘᴏsɪᴛ ᴇʀʀᴏʀ ] ══╗\n  ɪɴsᴜғғɪᴄɪᴇɴᴛ ᴄᴀsʜ ɪɴ ʏᴏᴜʀ ᴡᴀʟʟᴇᴛ!\n╚══════════════════════════╝");

                user.wallet -= amount;
                user.bank += amount;
                await user.save();

                return message.reply(
                    `╔════════ [ 📥 ᴠᴀᴜʟᴛ ᴅᴇᴘᴏsɪᴛ ] ════════╗\n` +
                    `  🏦 ɪɴsᴛɪᴛᴜᴛɪᴏɴ  : ${BANK_NAME}\n` +
                    `  📥 ᴀᴍᴏᴜɴᴛ sᴛᴀsʜᴇᴅ: $${format(amount)}\n` +
                    `  🛡️ ᴛᴏᴛᴀʟ ᴠᴀᴜʟᴛ   : $${format(user.bank)}\n` +
                    `  💵 ᴡᴀʟʟᴇᴛ ʟᴇғᴛ   : $${format(user.wallet)}\n` +
                    `╚══════════════════════════════════════╝`
                );
            }

            // --- WITHDRAW ---
            if (subCommand === "withdraw" || subCommand === "wd") {
                if (isNaN(amount) || amount <= 0) return message.reply("╔══ [ ❌ ᴡɪᴛʜᴅʀᴀᴡ ᴇʀʀᴏʀ ] ══╗\n  sᴘᴇᴄɪғʏ ᴀ ᴠᴀʟɪᴅ ᴡɪᴛʜᴅʀᴀᴡᴀʟ ᴀᴍᴏᴜɴᴛ!\n╚═══════════════════════════╝");
                if (user.bank < amount) return message.reply("╔══ [ ❌ ᴡɪᴛʜᴅʀᴀᴡ ᴇʀʀᴏʀ ] ══╗\n  ɪɴsᴜғғɪᴄɪᴇɴᴛ ғᴜɴᴅs ɪɴ ʏᴏᴜʀ ᴠᴀᴜʟᴛ!\n╚═══════════════════════════╝");

                user.bank -= amount;
                user.wallet += amount;
                await user.save();

                return message.reply(
                    `╔════════ [ 📤 ᴠᴀᴜʟᴛ ᴡɪᴛʜᴅʀᴀᴡ ] ════════╗\n` +
                    `  🏦 ɪɴsᴛɪᴛᴜᴛɪᴏɴ   : ${BANK_NAME}\n` +
                    `  💳 ᴄᴀsʜ ᴅɪsᴘᴇɴsᴇᴅ: $${format(amount)}\n` +
                    `  💵 ᴄᴀsʜ ᴡᴀʟʟᴇᴛ   : $${format(user.wallet)}\n` +
                    `  🛡️ ᴠᴀᴜʟᴛ ʀᴇᴍ.    : $${format(user.bank)}\n` +
                    `╚═══════════════════════════════════════╝`
                );
            }

            // --- TRANSFER ---
            if (subCommand === "transfer" || subCommand === "pay") {
                const mentionID = Object.keys(event.mentions)[0];
                const transferAmt = parseInt(args[2]) || amount;

                if (!mentionID) return message.reply("╔══ [ ❌ ᴡɪʀᴇ ᴇʀʀᴏʀ ] ══╗\n  ᴍᴇɴᴛɪᴏɴ ʀᴇᴄɪᴘɪᴇɴᴛ! sʏɴᴛᴀx: #ʙᴀɴᴋ ᴛʀᴀɴsғᴇʀ @ᴜsᴇʀ <ᴀᴍᴏᴜɴᴛ>\n╚═══════════════════════╝");
                if (isNaN(transferAmt) || transferAmt <= 0) return message.reply("╔══ [ ❌ ᴡɪʀᴇ ᴇʀʀᴏʀ ] ══╗\n  ᴇɴᴛᴇʀ ᴀ ᴠᴀʟɪᴅ ᴛʀᴀɴsғᴇʀ ᴀᴍᴏᴜɴᴛ!\n╚═══════════════════════╝");
                if (user.bank < transferAmt) return message.reply("╔══ [ ❌ ᴡɪʀᴇ ᴇʀʀᴏʀ ] ══╗\n  ɪɴsᴜғғɪᴄɪᴇɴᴛ ᴠᴀᴜʟᴛ ʙᴀʟᴀɴᴄᴇ ᴛᴏ ᴄᴏᴍᴘʟᴇᴛᴇ ᴡɪʀᴇ!\n╚═══════════════════════╝");

                let targetUser = await User.findOne({ userID: mentionID }) || await User.create({ userID: mentionID });

                const fee = Math.floor(transferAmt * 0.02);
                const finalAmt = transferAmt - fee;

                user.bank -= transferAmt;
                targetUser.bank += finalAmt;

                await user.save();
                await targetUser.save();

                return message.reply(
                    `╔════════ [ 💸 ᴡɪʀᴇ ᴛʀᴀɴsғᴇʀ ] ════════╗\n` +
                    `  👤 ʀᴇᴄɪᴘɪᴇɴᴛ    : <@${mentionID}>\n` +
                    `  📦 ᴡɪʀᴇᴅ ᴀᴍᴏᴜɴᴛ : $${format(finalAmt)}\n` +
                    `  🏷️ ʙᴀɴᴋ ғᴇᴇ     : $${format(fee)} (2%)\n` +
                    `  🛡️ ᴠᴀᴜʟᴛ ʀᴇᴍ.   : $${format(user.bank)}\n` +
                    `╚══════════════════════════════════════╝`
                );
            }

            // --- LOAN ---
            if (subCommand === "loan") {
                if (user.loan > 0) return message.reply(`╔══ [ ❌ ʟᴏᴀɴ ᴇʀʀᴏʀ ] ══╗\n  ʀᴇᴘᴀʏ ʏᴏᴜʀ ᴀᴄᴛɪᴠᴇ ᴅᴇʙᴛ ᴏғ $${format(user.loan)} ғɪʀsᴛ!\n╚═══════════════════════╝`);
                if (isNaN(amount) || amount <= 0 || amount > 50000) return message.reply("╔══ [ ❌ ʟᴏᴀɴ ᴇʀʀᴏʀ ] ══╗\n  ᴍᴀxɪᴍᴜᴍ ᴀʟʟᴏᴡᴀʙʟᴇ ʟᴏᴀɴ ɪs $50,000!\n╚═══════════════════════╝");

                user.loan = amount;
                user.wallet += amount;
                await user.save();

                return message.reply(
                    `╔════════ [ 🏛️ ʟᴏᴀɴ ᴀᴘᴘʀᴏᴠᴇᴅ ] ════════╗\n` +
                    `  🏦 ʟᴇɴᴅᴇʀ       : ${BANK_NAME}\n` +
                    `  💰 ᴄʀᴇᴅɪᴛ ᴘᴀɪᴅ  : $${format(amount)}\n` +
                    `  💵 ᴡᴀʟʟᴇᴛ ᴛᴏᴛᴀʟ : $${format(user.wallet)}\n` +
                    `  ⚠️ ᴅᴇʙᴛ ʀᴇᴘᴀʏ   : $${format(user.loan)}\n` +
                    `╚══════════════════════════════════════╝`
                );
            }

            // --- PAY LOAN ---
            if (subCommand === "payloan") {
                if (user.loan === 0) return message.reply("╔══ [ ℹ️ ᴅᴇʙᴛ ғʀᴇᴇ ] ══╗\n  ʏᴏᴜ ʜᴀᴠᴇ ɴᴏ ᴀᴄᴛɪᴠᴇ ʟᴏᴀɴs ᴡɪᴛʜ ᴛʜᴇ ʙᴀɴᴋ!\n╚══════════════════════╝");
                if (user.wallet < user.loan) return message.reply(`╔══ [ ❌ ʀᴇᴘᴀʏ ᴇʀʀᴏʀ ] ══╗\n  ʏᴏᴜ ɴᴇᴇᴅ $${format(user.loan)} ᴄᴀsʜ ɪɴ ᴡᴀʟʟᴇᴛ ᴛᴏ ʀᴇᴘᴀʏ!\n╚════════════════════════╝`);

                user.wallet -= user.loan;
                const paid = user.loan;
                user.loan = 0;
                await user.save();

                return message.reply(
                    `╔════════ [ ✅ ᴅᴇʙᴛ ᴄʟᴇᴀʀᴇᴅ ] ════════╗\n` +
                    `  💳 sᴇᴛᴛʟᴇᴅ ᴀᴍᴏᴜɴᴛ : $${format(paid)}\n` +
                    `  💵 ᴡᴀʟʟᴇᴛ ʀᴇᴍ.    : $${format(user.wallet)}\n` +
                    `  ✨ ᴄʀᴇᴅɪᴛ ʀᴀᴛɪɴɢ  : ᴇxᴄᴇʟʟᴇɴᴛ (ᴀ+)\n` +
                    `╚═════════════════════════════════════╝`
                );
            }

            // 👑 --- ADMIN OVERRIDE CONTROL --- 👑
            if (subCommand === "admin") {
                if (senderID !== ADMIN_ID) return message.reply("╔══ [ 🚨 ᴀᴄᴄᴇss ᴅᴇɴɪᴇᴅ ] ══╗\n  ᴜɴᴀᴜᴛʜᴏʀɪᴢᴇᴅ ᴀᴄᴄᴇss ᴀᴛᴛᴇᴍᴘᴛ ʟᴏɢɢᴇᴅ!\n╚══════════════════════════╝");

                const action = args[1]?.toLowerCase();
                const targetID = Object.keys(event.mentions)[0] || args[2];
                const adminAmt = parseInt(args[3]);

                if (!action || !targetID || isNaN(adminAmt)) {
                    return message.reply("╔══ [ 👑 ᴀᴅᴍɪɴ ᴏᴠᴇʀʀɪᴅᴇ ] ══╗\n  #ʙᴀɴᴋ ᴀᴅᴍɪɴ ᴄᴜᴛ @ᴜsᴇʀ <ᴀᴍᴏᴜɴᴛ>\n  #ʙᴀɴᴋ ᴀᴅᴍɪɴ ᴀᴅᴅ @ᴜsᴇʀ <ᴀᴍᴏᴜɴᴛ>\n╚═══════════════════════════╝");
                }

                let targetUser = await User.findOne({ userID: targetID }) || await User.create({ userID: targetID });

                if (action === "cut" || action === "deduct") {
                    targetUser.bank = Math.max(0, targetUser.bank - adminAmt);
                    await targetUser.save();
                    return message.reply(
                        `╔════════ [ 🚨 ᴀᴅᴍɪɴ ᴅᴇᴅᴜᴄᴛɪᴏɴ ] ════════╗\n` +
                        `  👤 ᴛᴀʀɢᴇᴛ ᴜsᴇʀ : <@${targetID}>\n` +
                        `  ✂️ ᴅᴇᴅᴜᴄᴛɪᴏɴ    : -$${format(adminAmt)}\n` +
                        `  🛡️ ᴠᴀᴜʟᴛ ʀᴇᴍ.   : $${format(targetUser.bank)}\n` +
                        `╚════════════════════════════════════════╝`
                    );
                }

                if (action === "add") {
                    targetUser.bank += adminAmt;
                    await targetUser.save();
                    return message.reply(
                        `╔════════ [ 👑 ᴀᴅᴍɪɴ ᴄʀᴇᴅɪᴛ ] ════════╗\n` +
                        `  👤 ᴛᴀʀɢᴇᴛ ᴜsᴇʀ : <@${targetID}>\n` +
                        `  ➕ ɪɴᴊᴇᴄᴛɪᴏɴ    : +$${format(adminAmt)}\n` +
                        `  🛡️ ᴠᴀᴜʟᴛ ᴛᴏᴛᴀʟ  : $${format(targetUser.bank)}\n` +
                        `╚══════════════════════════════════════╝`
                    );
                }
            }

        } catch (err) {
            console.error(err);
            return message.reply("╔══ [ ❌ sʏsᴛᴇᴍ ᴇʀʀᴏʀ ] ══╗\n  ɪɴᴛᴇʀɴᴀʟ ʙᴀɴᴋɪɴɢ ғᴀɪʟᴜʀᴇ!\n╚═════════════════════════╝");
        }
    }
};
