module.exports = {
  config: {
    name: "qz",
    aliases: ["quiz", "question"],
    version: "10.0",
    author: "Protik / Assistant",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Answer MCQ quiz questions to win 1M" },
    category: "games",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message, event, usersData, commandName }) {
    const { senderID } = event;

    const quizData = [
      {
        q: "ডেটাকে এনক্রিপশন ও ডিক্রিপশন করার পদ্ধতিকে কী বলে?",
        options: ["ক্রিপ্টোগ্রাফি", "ক্রিপ্টোলজি", "এনক্রিপ্টোগ্রাফি", "ডিক্রিপ্টোগ্রাফি"],
        correctIndex: 0, // A
        category: "ict"
      },
      {
        q: "সুপারম্যানের আসল নাম কী?",
        options: ["Bruce Wayne", "Clark Kent", "Peter Parker", "Barry Allen"],
        correctIndex: 1, // B
        category: "dc universe"
      },
      {
        q: "ক্রিস্টিয়ানো রোনালদো কোন দেশের ফুটবলার?",
        options: ["স্পেন", "আর্জেন্টিনা", "পর্তুগাল", "ব্রাজিল"],
        correctIndex: 2, // C
        category: "sports"
      },
      {
        q: "কম্পিউটারের মস্তিষ্ক কাকে বলা হয়?",
        options: ["RAM", "ROM", "Hard Disk", "CPU"],
        correctIndex: 3, // D
        category: "ict"
      },
      {
        q: "জাপান জাতীয় ফুটবল দলকে কী নামে ডাকা হয়?",
        options: ["Samurai Blue", "Red Devils", "La Roja", "The Blues"],
        correctIndex: 0, // A
        category: "sports"
      },
      {
        q: "সুপারম্যানের হোম প্ল্যানেটের নাম কী?",
        options: ["Asgard", "Krypton", "Gotham", "Metropolis"],
        correctIndex: 1, // B
        category: "dc universe"
      },
      {
        q: "ডিজিটাল কম্পিউটারের দ্বি-ভিত্তিক সংখ্যা পদ্ধতি কোনটি?",
        options: ["অক্টাল", "হেক্সাডিসিমেল", "বাইনারি", "দশমিক"],
        correctIndex: 2, // C
        category: "ict"
      },
      {
        q: "লুভর মিউজিয়াম (Louvre Museum) কোন শহরে অবস্থিত?",
        options: ["লন্ডন", "নিউ ইয়র্ক", "রোম", "প্যারিস"],
        correctIndex: 3, // D
        category: "general knowledge"
      },
      {
        q: "বিটকয়েন (Bitcoin) কত সালে চালু হয়?",
        options: ["2009", "2010", "2008", "2012"],
        correctIndex: 0, // A
        category: "crypto"
      },
      {
        q: "আন্তর্জাতিক টেস্ট ক্রিকেটে এক ইনিংসে ৪০০ রান করা একমাত্র ব্যাটার কে?",
        options: ["শচীন টেন্ডুলকার", "ব্রায়ান লারা", "রিকি পন্টিং", "ডন ব্র্যাডম্যান"],
        correctIndex: 1, // B
        category: "sports"
      },
      {
        q: "পৃথিবীর সবচেয়ে কঠিন প্রাকৃতিক পদার্থ কোনটি?",
        options: ["সোনা", "প্লাটিনাম", "হীরা", "লোহা"],
        correctIndex: 2, // C
        category: "science"
      },
      {
        q: "সৌরজগতের বৃহত্তম গ্রহ কোনটি?",
        options: ["মঙ্গল", "পৃথিবী", "শনি", "বৃহস্পতি"],
        correctIndex: 3, // D
        category: "science"
      },
      {
        q: "ডিএনএ (DNA) এর পূর্ণরূপ কী?",
        options: ["Deoxyribonucleic Acid", "Ribonucleic Acid", "Dual Nucleic Acid", "Dynamic Nucleic Acid"],
        correctIndex: 0, // A
        category: "science"
      },
      {
        q: "প্রথম ফিফা ফুটবল বিশ্বকাপ অনুষ্ঠিত হয় কত সালে?",
        options: ["1920", "1930", "1940", "1950"],
        correctIndex: 1, // B
        category: "sports"
      },
      {
        q: "সুপারম্যানের একমাত্র দুর্বলতা কোনটি?",
        options: ["আগুন", "পানি", "ক্রিপ্টোনাইট", "সূর্য"],
        correctIndex: 2, // C
        category: "dc universe"
      },
      {
        q: "ফেসবুকের প্রতিষ্ঠাতা কে?",
        options: ["Elon Musk", "Bill Gates", "Jeff Bezos", "Mark Zuckerberg"],
        correctIndex: 3, // D
        category: "technology"
      }
    ];

    const randomQuiz = quizData[Math.floor(Math.random() * quizData.length)];
    const rewardMoney = 1000000; // $1 Million

    const optionLabels = ["A", "B", "C", "D"];
    const correctAnswerLetter = optionLabels[randomQuiz.correctIndex];
    const correctAnswerText = randomQuiz.options[randomQuiz.correctIndex];

    const quizBox = 
      `┌─── ❖  [ ROYAL BRAIN QUIZ ]  ❖ ───┐\n` +
      `│\n` +
      `│ ❓  ${randomQuiz.q}\n` +
      `│\n` +
      `├─► 🅰️  ${randomQuiz.options[0]}\n` +
      `├─► 🅱️  ${randomQuiz.options[1]}\n` +
      `├─► 🅲  ${randomQuiz.options[2]}\n` +
      `├─► 🅳  ${randomQuiz.options[3]}\n` +
      `│\n` +
      `└───────────────────────────────►\n` +
      `• 🏷️ Category: ${randomQuiz.category}\n` +
      `• 💰 Reward: $1,000,000\n` +
      `• 💬 Reply with A, B, C, or D within 30s!`;

    const sentMessage = await message.reply(quizBox);

    global.GoatBot.onReply.set(sentMessage.messageID, {
      commandName: commandName,
      author: senderID,
      correctLetter: correctAnswerLetter,
      correctText: correctAnswerText.toLowerCase(),
      reward: rewardMoney
    });

    // Timeout after 30s
    setTimeout(() => {
      if (global.GoatBot.onReply.has(sentMessage.messageID)) {
        global.GoatBot.onReply.delete(sentMessage.messageID);
        message.reply(`> ⌛\n• সময় শেষ! কুইজটির সঠিক উত্তর ছিল: ${correctAnswerLetter}) ${correctAnswerText}`);
      }
    }, 30000);
  },

  onReply: async function ({ message, event, Reply, usersData }) {
    const { senderID, body } = event;
    const { correctLetter, correctText, reward, author } = Reply;

    if (senderID !== author) {
      return message.reply("> ⚠️\n• এটি আপনার জন্য তৈরি কুইজ নয়! নিজের কুইজ খেলতে !qz লিখুন।");
    }

    const userInput = body.trim().toLowerCase();
    const isCorrect = (userInput === correctLetter.toLowerCase()) || (userInput === correctText);

    if (isCorrect) {
      let userData = await usersData.get(senderID);
      let currentMoney = typeof userData.money === "number" ? userData.money : (userData.data?.money || 0);
      let newBalance = currentMoney + reward;

      // Stats Update
      if (!userData.data) userData.data = {};
      if (!userData.data.quizStats) userData.data.quizStats = { wins: 0, total: 0 };
      userData.data.quizStats.total += 1;
      userData.data.quizStats.wins += 1;

      const totalGames = userData.data.quizStats.total;
      const totalWins = userData.data.quizStats.wins;
      const winRate = ((totalWins / totalGames) * 100).toFixed(1);

      // Save to Database permanently
      userData.money = newBalance;
      userData.data.money = newBalance;
      await usersData.set(senderID, userData);

      global.GoatBot.onReply.delete(Reply.messageID);

      const formatMoney = (num) => {
        if (num >= 1000000000) return (num / 1000000000).toFixed(1) + "B";
        if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
        if (num >= 1000) return (num / 1000).toFixed(1) + "K";
        return num.toLocaleString();
      };

      const response = 
        `> 🎯\n` +
        `• Congratulations! Correct Answer: [ ${correctLetter} ]\n` +
        `• Reward Credited: +$${formatMoney(reward)}\n\n` +
        `📊 Win Rate: ${winRate}% (${totalWins}/${totalGames})\n` +
        `💳 Balance: $${formatMoney(newBalance)}`;

      return message.reply(response);
    } else {
      let userData = await usersData.get(senderID);
      if (!userData.data) userData.data = {};
      if (!userData.data.quizStats) userData.data.quizStats = { wins: 0, total: 0 };
      userData.data.quizStats.total += 1;
      await usersData.set(senderID, userData);

      return message.reply(`> ❌\n• Wrong answer! The correct choice was ${correctLetter}. Try again!`);
    }
  }
};
