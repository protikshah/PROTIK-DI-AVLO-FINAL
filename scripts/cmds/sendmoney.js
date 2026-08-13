module.exports = {
  config: {
    name: "sendmoney",
    aliases: ["pay", "transfer", "send"],
    version: "1.0",
    author: "Protik / Assistant",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Send money to another user" },
    category: "economy",
    guide: { en: "{pn} [Amount] (Reply to user or mention)" }
  },

  onStart: async function ({ message, args, event, usersData }) {
    const { senderID } = event;
    let targetID;
    let amount;

    // ১. রিপ্লাই বা মেনশন থেকে টার্গেট ইউজার এবং অ্যামাউন্ট বের করা
    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
      amount = parseInt(args[0]);
    } else if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
      // মেনশন পার্ট বাদ দিয়ে অ্যামাউন্ট নেওয়া
      amount = parseInt(args[args.length - 1]);
    } else {
      return message.reply("❌ | মামা, যাকে টাকা পাঠাতে চাও তাকে রিপ্লাই দাও অথবা মেনশন করে টাকার পরিমাণ লেখো!\n\nউদাহরণ: !sendmoney 5000000 (রিপ্লাই করে)");
    }

    // ২. ইনপুট ও সেলফ-ট্রান্সফার ভ্যালিডেশন
    if (targetID === senderID) {
      return message.reply("❌ | নিজের একাউন্টে নিজে টাকা পাঠাতে পারবে না!");
    }

    if (isNaN(amount) || amount <= 0) {
      return message.reply("❌ | সঠিক টাকার পরিমাণ প্রদান করো!");
    }

    // ৩. সেন্ডার ও রিসিভারের ডাটাবেস ব্যালেন্স চেক
    let senderData = await usersData.get(senderID);
    let senderMoney = (senderData.data && senderData.data.money !== undefined) ? senderData.data.money : 10000000;

    if (senderMoney < amount) {
      return message.reply(`❌ | তোমার একাউন্টে পর্যাপ্ত টাকা নেই!\n💸 বর্তমান ব্যালেন্স: $${senderMoney.toLocaleString()}`);
    }

    let targetData = await usersData.get(targetID);
    let targetMoney = (targetData.data && targetData.data.money !== undefined) ? targetData.data.money : 10000000;

    // ৪. ব্যালেন্স আপডেট করা (সেন্ডারের কমবে, রিসিভারের বাড়বে)
    let newSenderBal = senderMoney - amount;
    let newTargetBal = targetMoney + amount;

    await usersData.set(senderID, { money: newSenderBal });
    await usersData.set(targetID, { money: newTargetBal });

    const targetName = targetData.name || "User";

    return message.reply(
      `💸 𝐒𝐄𝐍𝐃 𝐌𝐎𝐍𝐄𝐘 𝐒𝐔𝐂𝐂𝐄𝐒𝐒 💸\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `👤 Sender: You\n` +
      `👤 Receiver: ${targetName}\n` +
      `💰 Amount Sent: $${amount.toLocaleString()}\n` +
      `━━━━━━━━━━━━━━━━━━━\n` +
      `💵 Your Remaining Balance: $${newSenderBal.toLocaleString()}`
    );
  }
};
