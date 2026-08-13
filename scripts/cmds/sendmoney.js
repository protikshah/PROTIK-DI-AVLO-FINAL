module.exports = {
  config: {
    name: "sendmoney",
    aliases: ["pay", "transfer", "send"],
    version: "1.1",
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

    if (event.type === "message_reply") {
      targetID = event.messageReply.senderID;
      amount = parseInt(args[0]);
    } else if (Object.keys(event.mentions).length > 0) {
      targetID = Object.keys(event.mentions)[0];
      amount = parseInt(args[args.length - 1]);
    } else {
      return message.reply("❌ | মামা, যাকে টাকা পাঠাতে চাও তাকে রিপ্লাই দাও অথবা মেনশন করে টাকার পরিমাণ লেখো!");
    }

    if (targetID === senderID) return message.reply("❌ | নিজের একাউন্টে নিজে টাকা পাঠাতে পারবে না!");
    if (isNaN(amount) || amount <= 0) return message.reply("❌ | সঠিক টাকার পরিমাণ প্রদান করো!");

    let senderData = await usersData.get(senderID);
    let sData = senderData.data || {};
    let senderMoney = sData.money !== undefined ? sData.money : 10000000;

    if (senderMoney < amount) {
      return message.reply(`❌ | তোমার একাউন্টে পর্যাপ্ত টাকা নেই!\n💸 বর্তমান ব্যালেন্স: $${senderMoney.toLocaleString()}`);
    }

    let targetData = await usersData.get(targetID);
    let tData = targetData.data || {};
    let targetMoney = tData.money !== undefined ? tData.money : 10000000;

    let newSenderBal = senderMoney - amount;
    let newTargetBal = targetMoney + amount;

    sData.money = newSenderBal;
    tData.money = newTargetBal;

    await usersData.set(senderID, { data: sData });
    await usersData.set(targetID, { data: tData });

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
