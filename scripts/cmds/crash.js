module.exports.config = {
    name: "crash",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "Protik Shah",
    description: "রকেট ক্র্যাশ করার আগে মাল্টিপ্লায়ারে ক্যাশআউট করুন",
    commandCategory: "games",
    usages: "!crash <টার্গেট মাল্টিপ্লায়ার যেমন: 1.5/2.0/5.0> <বাজি>",
    cooldowns: 10
};

module.exports.run = async function({ api, event, args, Currencies }) {
    const { threadID, messageID, senderID } = event;
    const targetMulti = parseFloat(args[0]);
    const bet = parseInt(args[1]);

    if (isNaN(targetMulti) || targetMulti < 1.1) return api.sendMessage("❌ [SYSTEM]: সর্বনিম্ন মাল্টিপ্লায়ার 1.1 দিতে হবে।\nউদাহরণ: !crash 2.5 300", threadID, messageID);
    if (isNaN(bet) || bet <= 0) return api.sendMessage("❌ [SYSTEM]: সঠিক বাজির পরিমাণ দিন।", threadID, messageID);

    let userMoney = (await Currencies.getData(senderID)).money || 0;
    if (bet > userMoney) return api.sendMessage(`❌ [SYSTEM]: আপনার কাছে পর্যাপ্ত কয়েন নেই!`, threadID, messageID);

    await Currencies.decreaseMoney(senderID, bet);

    // ক্র্যাশ মাল্টিপ্লায়ার জেনারেটর
    const crashPoint = parseFloat((Math.random() * (5.0 - 1.0) + 1.0).toFixed(2));

    let msg = `==========================\n`;
    msg += `    🚀 ROCKET CRASH ARENA 🚀\n`;
    msg += `==========================\n`;
    msg += `🎯 ক্যাশআউট টার্গেট: [ ${targetMulti}x ]\n`;
    msg += `💰 বাজির পরিমাণ: $${bet}\n`;
    msg += `--------------------------\n`;
    msg += `🚀 রকেট উড্ডয়ন করছে... 📈\n`;
    msg += `💥 রকেট ক্র্যাশ করেছে: [ ${crashPoint}x ]-এ!\n`;
    msg += `--------------------------\n`;

    if (targetMulti <= crashPoint) {
        const reward = Math.floor(bet * targetMulti);
        await Currencies.increaseMoney(senderID, reward);
        msg += `✅ ক্র্যাশের আগেই ক্যাশআউট সফল! \n🎉 আপনি জিতেছেন $${reward} কয়েন! 💸\n`;
    } else {
        msg += `💥 রকেট ক্র্যাশ করার পর আপনি ক্যাশআউট করতে চেয়েছেন!\n❌ আপনার $${bet} কয়েন পুরো ছাই হয়ে গেছে! 💀\n`;
    }
    msg += `==========================`;

    return api.sendMessage(msg, threadID, messageID);
};
