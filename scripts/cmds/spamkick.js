module.exports = {
  config: {
    name: "spamkick",
    aliases: ["autokick"],
    version: "1.0.1",
    author: "DI-ABLO JI-SOO",
    countDown: 0,
    role: 2, // Bot Admin only
    shortDescription: "Automatically kick users who spam emojis or stickers (more than 4 times)",
    category: "admin",
    guide: { en: "{p}spamkick [on/off]" }
  },

  // ফেসবুক আইডি (UID)
  adminUIDs: ["61591412309835"], 

  // স্প্যাম ট্র্যাকিং মেমোরি
  spamMap: new Map(),

  onStart: async function ({ api, event, message, args }) {
    const senderID = event.senderID;
    const sendMsg = (txt) => message && typeof message.reply === "function" ? message.reply(txt) : api.sendMessage(txt, event.threadID, event.messageID);

    // সিকিউরিটি চেক: 
    if (!this.adminUIDs.includes(senderID)) {
      return sendMsg("❌ ᴏɴʟʏ ᴍʏ ʙᴏss ᴅɪ-ᴀʙʟᴏ ᴄᴀɴ ᴄᴏɴᴛʀᴏʟ sᴘᴀᴍᴋɪᴄᴋ sʏsᴛᴇᴍ!");
    }

    const status = args[0]?.toLowerCase();
    if (status === "on") {
      global.spamKickActive = true;
      return sendMsg("✅ ꜱᴘᴀᴍ ᴋɪᴄᴋ ꜱʏꜱᴛᴇᴍ ɪꜱ ɴᴏᴡ ᴀᴄᴛɪᴠᴀᴛᴇᴅ!");
    } else if (status === "off") {
      global.spamKickActive = false;
      return sendMsg("❌ ꜱᴘᴀᴍ ᴋɪᴄᴋ ꜱʏꜱᴛᴇᴍ ɪꜱ ɴᴏᴡ ᴅᴇᴀᴄᴛɪᴠᴀᴛᴇᴅ!");
    } else {
      return sendMsg("❌ ᴜꜱᴀɢᴇ: #ꜱᴘᴀᴍᴋɪᴄᴋ [ᴏɴ/ᴏꜰꜰ]");
    }
  },

  handleEvent: async function ({ api, event }) {
    if (global.spamKickActive === false) return;

    const { threadID, senderID, body, type, messageID } = event;

    if (senderID === api.getCurrentUserID()) return;

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const adminIDs = threadInfo.adminIDs.map(item => item.id);

      // গ্রুপের অ্যাডমিনদের কিক করবে না
      if (adminIDs.includes(senderID)) return;

      const isSticker = type === "sticker" || event.attachments?.some(att => att.type === "sticker");
      const emojiRegex = /^[\p{Extended_Pictographic}\s]+$/u;
      const isOnlyEmoji = body && emojiRegex.test(body.trim());

      if (isSticker || isOnlyEmoji) {
        const userKey = `${threadID}_${senderID}`;
        let userData = this.spamMap.get(userKey) || { count: 0, timer: null };

        userData.count += 1;

        if (userData.timer) clearTimeout(userData.timer);
        userData.timer = setTimeout(() => {
          this.spamMap.delete(userKey);
        }, 5000);

        this.spamMap.set(userKey, userData);

        if (userData.count > 4) {
          this.spamMap.delete(userKey);

          const botID = api.getCurrentUserID();
          const isBotAdmin = adminIDs.includes(botID);

          if (!isBotAdmin) {
            return api.sendMessage("⚠️ ꜱᴘᴀᴍ ᴅᴇᴛᴇᴄᴛᴇᴅ! ᴘʟᴇᴀꜱᴇ ᴍᴀᴋᴇ ᴍᴇ ᴀᴅᴍɪɴ ᴛᴏ ᴋɪᴄᴋ ꜱᴘᴀᴍᴍᴇʀꜱ.", threadID, messageID);
          }

          // মেসেজ পুরো ইংরেজিতে আপডেট করা হয়েছে
          await api.sendMessage("🚫 ⚠️ ꜱᴘᴀᴍ ᴅᴇᴛᴇᴄᴛᴇᴅ!\n\nᴜꜱᴇʀ ʜᴀꜱ ʙᴇᴇɴ ᴋɪᴄᴋᴇᴅ ꜰᴏʀ ꜱᴘᴀᴍᴍɪɴɢ ᴍᴏʀᴇ ᴛʜᴀɴ 4 ᴇᴍᴏᴊɪꜱ/ꜱᴛɪᴄᴋᴇʀꜱ.", threadID);
          
          api.removeUserFromGroup(senderID, threadID, (err) => {
            if (err) console.error("Failed to kick user:", err);
          });
        }
      }
    } catch (err) {
      console.error("SpamKick Error:", err);
    }
  }
};
