module.exports.config = {
    name: "number",
    version: "1.0.0",
    role: 0,
    credits: "Protik Shah",
    description: "১ থেকে ১০ এর মধ্যে সংখ্যা ধরে বাজি ধরুন",
    category: "games",
    guide: {
        en: "{pref}number <১-১০ সংখ্যা> <বাজির পরিমাণ>"
    },
    countDown: 5
};

module.exports.onStart = async function({ api, event, args, Users, Currencies }) {
    const { threadID, messageID, senderID } = event;
    const guess = parseInt(args[0]);
    const bet = parseInt(args[1]);

    if (isNaN(guess) || guess < 1 || guess > 10) return api.sendMessage("❌ [SYSTEM]: ১ থেকে ১০ এর মধ্যে একটি সংখ্যা দিন।\nউদাহরণ: #number 7 100", threadID, messageID);
    if (isNaN(bet) || bet <= 0) return api.sendMessage("❌ [SYSTEM]: সঠিক বাজির পরিমাণ লিখুন।", threadID, messageID);

    let userMoney = (await Currencies.getData(senderID)).money || 0;
    if (bet > userMoney) return api.sendMessage(`❌ [SYSTEM]: আপনার কাছে পর্যাপ্ত কয়েন নেই! বর্তমান ব্যালেন্স: $${userMoney}`, threadID, messageID);

    const targetNumber = Math.floor(Math.random() * 10) + 1;
    await Currencies.decreaseMoney(senderID, bet);

    let msg = `==========================\n`;
    msg += `   🎯 LUCKY NUMBER ARENA 🎯\n`;
    msg += `==========================\n`;
    msg += `➤ আপনার গেস: [ ${guess} ]\n`;
    msg += `➤ বাজির পরিমাণ: $${bet}\n`;
    msg += `--------------------------\n`;
    msg += `🎰 নম্বর ঘোরা হচ্ছে... [ 🎲 ]\n`;
    msg += `➤ সিক্রেট নম্বরটি ছিল: [ ${targetNumber} ]\n`;
    msg += `--------------------------\n`;

    if (guess === targetNumber) {
        const winAmount = bet * 3;
        await Currencies.increaseMoney(senderID, winAmount);
        msg += `🎉 ফলাফল: নিখুঁত অনুমান! আপনি জিতেছেন $${winAmount} কয়েন! 🚀\n`;
    } else {
        msg += `💀 ফলাফল: ভুল অনুমান! আপনি $${bet} কয়েন হারিয়েছেন। ❌\n`;
    }
    msg += `==========================`;

    return api.sendMessage(msg, threadID, messageID);
};
