const mongoose = require("mongoose");

// MongoDB User Schema setup
const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    wallet: { type: Number, default: 1000 },
    bank: { type: Number, default: 0 }
});

const User = mongoose.models.BankUser || mongoose.model("BankUser", userSchema);

module.exports.config = {
    name: "rob",
    aliases: ["steal", "heist"],
    version: "2.0.0",
    role: 0,
    credits: "Pratik Shah & DI-ABLO JI-SOO",
    description: "Attempt to rob wallet coins from a tagged user",
    category: "games",
    guide: {
        en: "{pref}rob @mention"
    },
    countDown: 30
};

module.exports.onStart = async function({ api, event, args }) {
    const { threadID, messageID, senderID, mentions } = event;
    const mentionKeys = Object.keys(mentions);

    if (mentionKeys.length === 0) {
        return api.sendMessage("❌ [𝑆𝑌𝑆𝑇𝐸𝑀]: 𝑃𝑙𝑒𝑎𝑠𝑒 𝑚𝑒𝑛𝑡𝑖𝑜𝑛 𝑎 𝑡𝑎𝑟𝑔𝑒𝑡 𝑡𝑜 𝑟𝑜𝑏!\n𝐸𝑥𝑎𝑚𝑝𝑙𝑒: #rob @friend", threadID, messageID);
    }

    const victimID = mentionKeys[0];
    const victimName = mentions[victimID].replace("@", "");

    if (victimID === senderID) {
        return api.sendMessage("❌ [𝑆𝑌𝑆𝑇𝐸𝑀]: 𝑌𝑜𝑢 𝑐𝑎𝑛𝑛𝑜𝑡 𝑟𝑜𝑏 𝑦𝑜𝑢𝑟 𝑜𝑤𝑛 𝑤𝑎𝑙𝑙𝑒𝑡!", threadID, messageID);
    }

    // Fetch MongoDB records
    let robber = await User.findOne({ userID: senderID });
    if (!robber) robber = await User.create({ userID: senderID });

    let victim = await User.findOne({ userID: victimID });
    if (!victim) victim = await User.create({ userID: victimID });

    let robberMoney = robber.wallet || 0;
    let victimMoney = victim.wallet || 0;

    if (victimMoney < 200) {
        return api.sendMessage(`❌ [𝑆𝑌𝑆𝑇𝐸𝑀]: ${victimName} 𝑑𝑜𝑒𝑠 𝑛𝑜𝑡 ℎ𝑎𝑣𝑒 𝑒𝑛𝑜𝑢𝑔ℎ 𝑤𝑎𝑙𝑙𝑒𝑡 𝑐𝑎𝑠ℎ (𝑀𝑖𝑛𝑖𝑚𝑢𝑚 $200 𝑟𝑒𝑞𝑢𝑖𝑟𝑒𝑑).`, threadID, messageID);
    }
    if (robberMoney < 100) {
        return api.sendMessage(`❌ [𝑆𝑌𝑆𝑇𝐸𝑀]: 𝑌𝑜𝑢 𝑛𝑒𝑒𝑑 𝑎𝑡 𝑙𝑒𝑎𝑠𝑡 $100 𝑖𝑛 𝑦𝑜𝑢𝑟 𝑤𝑎𝑙𝑙𝑒𝑡 𝑡𝑜 𝑐𝑜𝑣𝑒𝑟 𝑝𝑜𝑡𝑒𝑛𝑡𝑖𝑎𝑙 𝑝𝑜𝑙𝑖𝑐𝑒 𝑓𝑖𝑛𝑒𝑠!`, threadID, messageID);
    }

    const isSuccess = Math.random() < 0.45;
    
    let msg = `🏦 ━━━━ [ 𝑫𝑰-𝑨𝑩𝑳𝑶 𝑱𝑰-𝑺𝑶𝑶 𝑯𝑬𝑰𝑺𝑻 ] ━━━━ 🏦\n\n`;
    msg += `🎯 𝑇𝑎𝑟𝑔𝑒𝑡: [ ${victimName} ]\n`;
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;

    if (isSuccess) {
        const stolenAmount = Math.floor(Math.random() * (victimMoney * 0.3)) + 50;
        
        victim.wallet -= stolenAmount;
        robber.wallet += stolenAmount;
        await victim.save();
        await robber.save();

        msg += `✅ 𝑴𝑰𝑺𝑺𝑰𝑶𝑵 𝑺𝑼𝑪𝑪𝑬𝑺𝑺𝑭𝑼𝑳!\n`;
        msg += `💰 𝑌𝑜𝑢 𝑠𝑡𝑒𝑎𝑙𝑡ℎ𝑖𝑙𝑦 𝑠𝑛𝑎𝑡𝑐ℎ𝑒𝑑: $${stolenAmount} 𝑓𝑟𝑜𝑚 𝑡ℎ𝑒𝑖𝑟 𝑤𝑎𝑙𝑙𝑒𝑡! 🤑\n`;
        msg += `🛡️ 𝑁𝑜𝑡𝑒: 𝑇ℎ𝑒𝑖𝑟 𝑏𝑎𝑛𝑘 𝑣𝑎𝑢𝑙𝑡 𝑓𝑢𝑛𝑑𝑠 𝑟𝑒𝑚𝑎𝑖𝑛𝑒𝑑 100% 𝑠𝑎𝑓𝑒!\n`;
    } else {
        const fine = Math.min(robberMoney, Math.floor(Math.random() * 150) + 100);
        
        robber.wallet -= fine;
        victim.wallet += fine;
        await robber.save();
        await victim.save();

        msg += `🚨 𝑴𝑰𝑺𝑺𝑰𝑶𝑵 𝑭𝑨𝑰𝑳𝑬𝑫!\n`;
        msg += `🚔 𝑌𝑜𝑢 𝑔𝑜𝑡 𝑐𝑎𝑢𝑔ℎ𝑡 𝑏𝑦 𝑠𝑒𝑐𝑢𝑟𝑖𝑡𝑦 & ${victimName}!\n`;
        msg += `💸 𝐹𝑖𝑛𝑒 𝑃𝑎𝑖𝑑 𝑡𝑜 𝑉𝑖𝑐𝑡𝑖𝑚: $${fine} 💀\n`;
    }
    
    msg += `━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
    msg += `👑 𝑩𝒂𝒏𝒌 𝑨𝒅𝒎𝒊𝒏: 61591412309835`;

    return api.sendMessage(msg, threadID, messageID);
};
