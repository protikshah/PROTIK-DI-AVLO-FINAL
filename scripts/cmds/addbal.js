module.exports = {
  config: {
    name: "addbal",
    aliases: ["deposit", "addmoney"],
    version: "1.0",
    author: "Protik / Assistant",
    countDown: 2,
    role: 2, // শুধু বটের অ্যাডমিন ব্যবহার করতে পারবে
    shortDescription: { en: "Deposit money to user account" },
    category: "economy",
    guide: { en: "{pn} [Amount] (reply/mention user)" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    let targetID;
    let amount;

    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
      amount = parseInt(args[0]);
    } else if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
      amount = parseInt(args[1]);
    } else {
      return message.reply("❌ | মামা, কাউকে রিপ্লাই দিয়ে বা মেনশন করে টাকার পরিমাণ লেখো!");
    }

    if (isNaN(amount) || amount <= 0) {
      return message.reply("❌ | সঠিক টাকার পরিমাণ প্রদান করো!");
    }

    let userData = await usersData.get(targetID);
    let currentMoney = (userData.data && userData.data.money !== undefined) ? userData.data.money : 10000000;
    
    let newBalance = currentMoney + amount;
    await usersData.set(targetID, { money: newBalance });

    return message.reply(`✅ | সফলভাবে $${amount.toLocaleString()} ডিপোজিট করা হয়েছে!\n💰 নতুন ব্যালেন্স: $${newBalance.toLocaleString()}`);
  }
};
