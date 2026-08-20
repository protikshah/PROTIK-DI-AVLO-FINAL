module.exports.config = {
    name: "card",
    version: "1.0.0",
    role: 0,
    credits: "Pratik Shah",
    description: "হাই/লো কার্ড বাজি ধরুন",
    category: "games",
    guide: {
        en: "{pref}card <high/low> <বাজি>"
    },
    countDown: 5
};

module.exports.onStart = async function({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;
    const predict = args[0] ? args[0].toLowerCase() : "";
    const bet = parseInt(args[1]);

    if (predict !== "high" && predict !== "low") return api.sendMessage("❌ [SYSTEM]: High অথবা Low বেছে নিন।\nউদাহরণ: #card high 200", threadID, messageID);
    if (isNaN(bet) || bet <= 0) return api.sendMessage("❌ [SYSTEM]: সঠিক বাজির পরিমাণ দিন।", threadID, messageID);

    let userData = await usersData.get(senderID);
    let userMoney = userData.money || 0;

    if (bet > userMoney) return api.sendMessage(`❌ [SYSTEM]: আপনার কাছে পর্যাপ্ত কয়েন নেই!`, threadID, messageID);

    await usersData.set(senderID, { money: userMoney - bet });

    const cards = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14];
    const cardNames = { 11: 'J', 12: 'Q', 13: 'K', 14: 'A' };

    const firstCard = cards[Math.floor(Math.random() * cards.length)];
    let secondCard = cards[Math.floor(Math.random() * cards.length)];

    while (secondCard === firstCard) {
        secondCard = cards[Math.floor(Math.random() * cards.length)];
    }

    const showFirst = cardNames[firstCard] || firstCard;
    const showSecond = cardNames[secondCard] || secondCard;

    const isHigh = secondCard > firstCard;
    const userWon = (predict === "high" && isHigh) || (predict === "low" && !isHigh);

    let msg = `==========================\n`;
    msg += `    🃏 HIGH-LOW CARD ARENA 🃏\n`;
    msg += `==========================\n`;
    msg += `🎴 প্রথম কার্ড: [ ${showFirst} ]\n`;
    msg += `🎯 আপনার প্রেডিকশন: [ ${predict.toUpperCase()} ]\n`;
    msg += `--------------------------\n`;
    msg += `🎴 দ্বিতীয় কার্ড টানা হলো: [ ${showSecond} ]\n`;
    msg += `--------------------------\n`;

    if (userWon) {
        const reward = bet * 2;
        let currentData = await usersData.get(senderID);
        await usersData.set(senderID, { money: (currentData.money || 0) + reward });
        msg += `🏆 সঠিক অনুমান! আপনি জিতলেন $${reward} কয়েন! 💰\n`;
    } else {
        msg += `❌ ভুল অনুমান! আপনি $${bet} কয়েন হারিয়েছেন।\n`;
    }
    msg += `==========================`;

    return api.sendMessage(msg, threadID, messageID);
};
