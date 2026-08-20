module.exports.config = {
    name: "chest",
    version: "1.0.0",
    role: 0,
    credits: "Protik Shah",
    description: "ভাগ্যপরীক্ষা করে রহস্যময় বাক্স আনলক করুন",
    category: "games",
    guide: {
        en: "{pref}chest <১/২/৩ বাক্স নম্বর> <বাজি>"
    },
    countDown: 10
};

module.exports.onStart = async function({ api, event, args, Users, Currencies }) {
    const { threadID, messageID, senderID } = event;
    const choice = parseInt(args[0]);
    const bet = parseInt(args[1]);

    if (isNaN(choice) || choice < 1 || choice > 3) return api.sendMessage("❌ [SYSTEM]: ১, ২ অথবা ৩ নম্বর বাক্সের যেকোনো একটি বেছে নিন।\nউদাহরণ: #chest 2 500", threadID, messageID);
    if (isNaN(bet) || bet <= 0) return api.sendMessage("❌ [SYSTEM]: সঠিক বাজির পরিমাণ দিন।", threadID, messageID);

    let userMoney = (await Currencies.getData(senderID)).money || 0;
    if (bet > userMoney) return api.sendMessage(`❌ [SYSTEM]: আপনার কাছে পর্যাপ্ত কয়েন নেই!`, threadID, messageID);

    await Currencies.decreaseMoney(senderID, bet);

    const outcomes = ['jackpot', 'coins', 'empty'];
    outcomes.sort(() => Math.random() - 0.5);

    const userOutcome = outcomes[choice - 1];

    let msg = `==========================\n`;
    msg += `   🧰 MYSTERY CHEST ROOM 🧰\n`;
    msg += `==========================\n`;
    msg += `📦 আপনি নির্বাচন করেছেন: [ Box #${choice} ]\n`;
    msg += `🗝️ বাক্স খোলা হচ্ছে... [ 🔓 ]\n`;
    msg += `--------------------------\n`;

    if (userOutcome === 'jackpot') {
        const reward = bet * 5;
        await Currencies.increaseMoney(senderID, reward);
        msg += `💎 জ্যাকপট!! আপনি স্বর্ণভর্তি সিন্দুক পেয়েছেন! \n🎁 রিওয়ার্ড: $${reward} কয়েন (5x)! 🔥\n`;
    } else if (userOutcome === 'coins') {
        const reward = Math.floor(bet * 1.5);
        await Currencies.increaseMoney(senderID, reward);
        msg += `🪙 আপনি মাঝারি মানের ধনসম্পদ পেয়েছেন।\n🎁 রিওয়ার্ড: $${reward} কয়েন (1.5x)!\n`;
    } else {
        msg += `💀 আফসোস! বাক্সের ভেতরে শুধুই বিষাক্ত সাপ ও কঙ্কাল ছিল!\n❌ আপনি $${bet} কয়েন হারিয়েছেন।\n`;
    }
    msg += `==========================`;

    return api.sendMessage(msg, threadID, messageID);
};
