module.exports = {
  config: {
    name: "spamkick",
    aliases: ["autokick"],
    version: "1.0.2",
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

  // GoatBot-এ মেসেজ ক্যাচ করার জন্য onChat ব্যবহার করা হলো
  onChat: async function ({ api, event }) {
    if (global.spamKickActive === false) return;

    const { threadID, senderID, body, type, attachments, messageID } = event;

    // বটে
    if (senderID === api.getCurrentUserID() || this.adminUIDs.includes(senderID)) return;

    try {
      const threadInfo = await api.getThreadInfo(threadID);
      const adminIDs = threadInfo.adminIDs.map(item => item.id);

      // গ্রুপের অ্যাডমিনদের কিক করবে না
      if (adminIDs.includes(senderID)) return;

      // স্টিকার বা ইমোজি সনাক্তকরণ (সব ইমোজি ফরম্যাট সহ)
      const isSticker = type === "sticker" || (attachments && attachments.some(att => att.type === "sticker" || att.type === "animated_image"));
      const isEmojiText = body && (/^[\p{Extended_Pictographic}\u{1F300}-\u{1F9FF}\s]+$/u.test(body.trim()));

      if (isSticker || isEmojiText) {
        const userKey = `${threadID}_${senderID}`;
        let userData = this.spamMap.get(userKey) || { count: 0, timer: null };

        userData.count += 1;

        if (userData.timer) clearTimeout(userData.timer);
        userData.timer = setTimeout(() => {
          this.spamMap.delete(userKey);
        }, 7000); // ৭ সেকেন্ডের উইন্ডো

        this.spamMap.set(userKey, userData);

        if (userData.count > 4) {
          this.spamMap.delete(userKey);

          const botID = api.getCurrentUserID();
          const isBotAdmin = adminIDs.includes(botID);

          if (!isBotAdmin) {
            return api.sendMessage("⚠️ ꜱᴘᴀᴍ ᴅᴇᴛᴇᴄᴛᴇᴅ! ᴘʟᴇᴀꜱᴇ ᴍᴀᴋᴇ ᴍᴇ ᴀᴅᴍɪɴ ᴛᴏ ᴋɪᴄᴋ ꜱᴘᴀᴍᴍᴇʀꜱ.", threadID, messageID);
          }

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
