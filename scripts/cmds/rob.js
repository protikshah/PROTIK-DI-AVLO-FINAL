module.exports.config = {
    name: "rob",
    aliases: ["steal"],
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Pratik Shah",
    description: "অন্য ইউজারের অ্যাকাউন্ট থেকে কয়েন চুরি করার চেষ্টা করুন",
    commandCategory: "games",
    usages: "!rob @mention",
    cooldowns: 30
};

module.exports.run = async function({ api, event, args, Currencies }) {
    const { threadID, messageID, senderID, mentions } = event;
    const mentionKeys = Object.keys(mentions);

    if (mentionKeys.length === 0) return api.sendMessage("❌ [SYSTEM]: যাকে চুরি করতে চান তাকে মেনশন করুন!\nউদাহরণ: !rob @friend", threadID, messageID);

    const victimID = mentionKeys[0];
    const victimName = mentions[victimID].replace("@", "");

    if (victimID === senderID) return api.sendMessage("❌ [SYSTEM]: নিজের পকেট চুরি করতে পারবেন না!", threadID, messageID);

    let robberMoney = (await Currencies.getData(senderID)).money || 0;
    let victimMoney = (await Currencies.getData(victimID)).money || 0;

    if (victimMoney < 200) return api.sendMessage(`❌ [SYSTEM]: ${victimName}-এর পকেটে পর্যাপ্ত কয়েন নেই (কমপক্ষে $২০০ লাগবে)।`, threadID, messageID);
    if (robberMoney < 100) return api.sendMessage(`❌ [SYSTEM]: চুরি করতে গিয়ে ধরা খেলে জরিমানার দেওয়ার মতো $১০০ কয়েনও আপনার নেই`, threadID, messageID);

    const isSuccess = Math.random() < 0.45; // ৪৫% সফলতার সুযোগ
    let msg = `==========================\n`;
    msg += `    🕵️ HEIST OPERATION 🕵️\n`;
    msg += `==========================\n`;
    msg += `🎯 টার্গেট: [ ${victimName} ]\n`;
    msg += `--------------------------\n`;

    if (isSuccess) {
        const stolenAmount = Math.floor(Math.random() * (victimMoney * 0.3)) + 50; // সর্বোচ্চ ৩০% চুরি
        await Currencies.decreaseMoney(victimID, stolenAmount);
        await Currencies.increaseMoney(senderID, stolenAmount);
        msg += `✅ মিশন সফল! আপনি চুপিচুপি $${stolenAmount} কয়েন হাতিয়ে নিয়েছেন! 🤑\n`;
    } else {
        const fine = Math.min(robberMoney, Math.floor(Math.random() * 150) + 100);
        await Currencies.decreaseMoney(senderID, fine);
        await Currencies.increaseMoney(victimID, fine);
        msg += `🚨 মিশন ফেল! পুলিশ ও ${victimName} আপনাকে ধরে ফেলেছে!\n`;
        msg += `💸 জরিমানা হিসেবে আপনাকে $${fine} কয়েন দিতে হলো! 💀\n`;
    }
    msg += `==========================`;

    return api.sendMessage(msg, threadID, messageID);
};
