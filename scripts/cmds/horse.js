module.exports.config = {
    name: "horse",
    version: "1.0.0",
    role: 0,
    credits: "Pratik Shah",
    description: "রেস ট্র্যাকে ঘোড়ায় বাজি ধরুন",
    category: "games",
    guide: {
        en: "{pref}horse <ঘোড়া নম্বর ১-৪> <বাজি>"
    },
    countDown: 15
};

module.exports.onStart = async function({ api, event, args, usersData }) {
    const { threadID, messageID, senderID } = event;
    const chosenHorse = parseInt(args[0]);
    const bet = parseInt(args[1]);

    if (isNaN(chosenHorse) || chosenHorse < 1 || chosenHorse > 4) return api.sendMessage("❌ [SYSTEM]: ১ থেকে ৪ নম্বর ঘোড়ার যেকোনো একটি বেছে নিন।\nউদাহরণ: #horse 3 500", threadID, messageID);
    if (isNaN(bet) || bet <= 0) return api.sendMessage("❌ [SYSTEM]: সঠিক বাজির পরিমাণ দিন।", threadID, messageID);

    let userData = await usersData.get(senderID);
    let userMoney = userData.money || 0;

    if (bet > userMoney) return api.sendMessage(`❌ [SYSTEM]: আপনার কাছে পর্যাপ্ত কয়েন নেই!`, threadID, messageID);

    await usersData.set(senderID, { money: userMoney - bet });

    const horses = ["⚡ Thunder", "🔥 Blaze", "🌪️ Shadow", "🚀 Rocket"];
    const winningIndex = Math.floor(Math.random() * 4);

    let msg = `==========================\n`;
    msg += `    🏇 ROYAL HORSE RACE 🏇\n`;
    msg += `==========================\n`;
    msg += `🎯 আপনার ঘোড়া: #${chosenHorse} - ${horses[chosenHorse - 1]}\n`;
    msg += `💰 বাজি ধরলেন: $${bet}\n`;
    msg += `--------------------------\n`;
    msg += `🏁 রেস শুরু হলো... 🐎💨\n`;
    msg += `1. 🐎💨 ${horses[0]}\n`;
    msg += `2. 🐎💨 ${horses[1]}\n`;
    msg += `3. 🐎💨 ${horses[2]}\n`;
    msg += `4. 🐎💨 ${horses[3]}\n`;
    msg += `--------------------------\n`;
    msg += `🏆 প্রথম স্থানে ফিনিশ করলো: #${winningIndex + 1} - ${horses[winningIndex]}\n`;
    msg += `--------------------------\n`;

    if (chosenHorse - 1 === winningIndex) {
        const reward = bet * 4;
        let currentData = await usersData.get(senderID);
        await usersData.set(senderID, { money: (currentData.money || 0) + reward });
        msg += `🎉 চমৎকার! আপনার ঘোড়া প্রথম হয়েছে! আপনি জিতলেন $${reward} কয়েন! 🚀\n`;
    } else {
        msg += `❌ আফসোস! আপনার ঘোড়া রেসে পিছিয়ে পড়েছে। আপনি $${bet} কয়েন হারিয়েছেন।\n`;
    }
    msg += `==========================`;

    return api.sendMessage(msg, threadID, messageID);
};
