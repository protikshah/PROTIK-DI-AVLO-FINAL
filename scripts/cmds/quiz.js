module.exports = {
  config: {
    name: "qz",
    aliases: ["quiz", "question"],
    version: "12.0",
    author: "Protik / Assistant",
    countDown: 5,
    role: 0,
    shortDescription: { en: "Answer MCQ quiz questions to win $1,000,000" },
    category: "games",
    guide: { en: "{pn}" }
  },

  onStart: async function ({ message, event, commandName }) {
    const { senderID } = event;

    const quizData = [
      { q: "ডেটাকে এনক্রিপশন ও ডিক্রিপশন করার পদ্ধতিকে কী বলে?", options: ["ক্রিপ্টোগ্রাফি", "ক্রিপ্টোলজি", "এনক্রিপ্টোগ্রাফি", "ডিক্রিপ্টোগ্রাফি"], correctIndex: 0, category: "ICT" },
      { q: "সুপারম্যানের আসল নাম কী?", options: ["Bruce Wayne", "Clark Kent", "Peter Parker", "Barry Allen"], correctIndex: 1, category: "DC Universe" },
      { q: "ক্রিস্টিয়ানো রোনালদো কোন দেশের ফুটবলার?", options: ["স্পেন", "আর্জেন্টিনা", "পর্তুগাল", "ব্রাজিল"], correctIndex: 2, category: "Sports" },
      { q: "কম্পিউটারের মস্তিষ্ক কাকে বলা হয়?", options: ["RAM", "ROM", "Hard Disk", "CPU"], correctIndex: 3, category: "ICT" },
      { q: "জাপান জাতীয় ফুটবল দলকে কী নামে ডাকা হয়?", options: ["Samurai Blue", "Red Devils", "La Roja", "The Blues"], correctIndex: 0, category: "Sports" },
      { q: "সুপারম্যানের হোম প্ল্যানেটের নাম কী?", options: ["Asgard", "Krypton", "Gotham", "Metropolis"], correctIndex: 1, category: "DC Universe" },
      { q: "ডিজিটাল কম্পিউটারের দ্বি-ভিত্তিক সংখ্যা পদ্ধতি কোনটি?", options: ["অক্টাল", "হেক্সাডিসিমেল", "বাইনারি", "দশমিক"], correctIndex: 2, category: "ICT" },
      { q: "লুভর মিউজিয়াম (Louvre Museum) কোন শহরে অবস্থিত?", options: ["লন্ডন", "নিউ ইয়র্ক", "রোম", "প্যারিস"], correctIndex: 3, category: "General Knowledge" },
      { q: "বিটকয়েন (Bitcoin) কত সালে চালু হয়?", options: ["2009", "2010", "2008", "2012"], correctIndex: 0, category: "Crypto" },
      { q: "আন্তর্জাতিক টেস্ট ক্রিকেটে এক ইনিংসে ৪০০ রান করা একমাত্র ব্যাটার কে?", options: ["শচীন টেন্ডুলকার", "ব্রায়ান লারা", "রিকি পন্টিং", "ডন ব্র্যাডম্যান"], correctIndex: 1, category: "Sports" },
      { q: "পৃথিবীর সবচেয়ে কঠিন প্রাকৃতিক পদার্থ কোনটি?", options: ["সোনা", "প্লাটিনাম", "হীরা", "লোহা"], correctIndex: 2, category: "Science" },
      { q: "সৌরজগতের বৃহত্তম গ্রহ কোনটি?", options: ["মঙ্গল", "পৃথিবী", "শনি", "বৃহস্পতি"], correctIndex: 3, category: "Science" },
      { q: "ইথেরিয়াম (Ethereum) ক্রিপ্টোকারেন্সির প্রতিষ্ঠাতা কে?", options: ["Vitalik Buterin", "Satoshi Nakamoto", "Charles Hoskinson", "Gavin Wood"], correctIndex: 0, category: "Crypto" },
      { q: "সুপারম্যানের প্রধান শত্রুর নাম কী?", options: ["Joker", "Lex Luthor", "Darkseid", "General Zod"], correctIndex: 1, category: "DC Universe" },
      { q: "বিশ্বকাপ ফুটবলের ইতিহাসে সবচেয়ে বেশি গোল কার?", options: ["Pele", "Maradona", "Miroslav Klose", "Cristiano Ronaldo"], correctIndex: 2, category: "Sports" },
      { q: "কম্পিউটার নেটওয়ার্কিংয়ে IP-এর পূর্ণরূপ কী?", options: ["Internal Protocol", "Internet Process", "Information Protocol", "Internet Protocol"], correctIndex: 3, category: "ICT" },
      { q: "জাপান কতবার AFC Asian Cup শিরোপা জিতেছে?", options: ["4 Times", "3 Times", "2 Times", "5 Times"], correctIndex: 0, category: "Sports" },
      { q: "বাংলাদেশের জাতীয় পাখির নাম কী?", options: ["ময়না", "দোয়েল", "কোকিল", "শ্যামা"], correctIndex: 1, category: "Bangladesh" },
      { q: "ফিফা বিশ্বকাপ ২০২২ এর আয়োজক দেশ কোনটি ছিল?", options: ["ব্রাজিল", "রাশিয়া", "কাতার", "জার্মানি"], correctIndex: 2, category: "Sports" },
      { q: "পদ্মা সেতুর দৈর্ঘ্য কত কিলোমিটার?", options: ["5.15 km", "7.15 km", "4.15 km", "6.15 km"], correctIndex: 3, category: "Bangladesh" },
      { q: "প্রথম টেস্ট ক্রিকেটে ট্রিপল সেঞ্চুরি করা ব্যাটার কে?", options: ["Andy Sandham", "Don Bradman", "Garry Sobers", "Hanif Mohammad"], correctIndex: 0, category: "Sports" },
      { q: "ব্যাটম্যানের আসল নাম কী?", options: ["Clark Kent", "Bruce Wayne", "Oliver Queen", "Arthur Curry"], correctIndex: 1, category: "DC Universe" },
      { q: "সবচেয়ে গতিশীল উইন্ড সোর্স কোনটি?", options: ["টর্নেডো", "টাইফুন", "সাইক্লোন", "হারিকেন"], correctIndex: 2, category: "Weather" },
      { q: "লাইফস্টাইল বা গেমিং প্ল্যাটফর্মে Garena Free Fire কোন দেশের কোম্পানি তৈরি করেছে?", options: ["দক্ষিণ কোরিয়া", "জাপান", "চীন", "সিঙ্গাপুর"], correctIndex: 3, category: "Gaming" },
      { q: "বাংলাদেশের স্বাধীনতা যুদ্ধ কত সালে হয়?", options: ["1971", "1952", "1969", "1990"], correctIndex: 0, category: "History" },
      { q: "ফুটবল ইতিহাসের প্রথম অফিশিয়াল আন্তর্জাতিক ম্যাচ কাদের মধ্যে হয়েছিল?", options: ["ইংল্যান্ড ও ব্রাজিল", "স্কটল্যান্ড ও ইংল্যান্ড", "আর্জেন্টিনা ও উরুগুয়ে", "ইতালি ও ফ্রান্স"], correctIndex: 1, category: "Sports History" },
      { q: "কোন গ্রহে সূর্য পশ্চিমে ওঠে এবং পূর্বে অস্ত যায়?", options: ["মঙ্গল", "বুধ", "শুক্র", "বৃহস্পতি"], correctIndex: 2, category: "Science" },
      { q: "সবচেয়ে ক্ষুদ্রতম মহাদেশ কোনটি?", options: ["এশিয়া", "আফ্রিকা", "ইউরোপ", "ওশেনিয়া / অস্ট্রেলিয়া"], correctIndex: 3, category: "Geography" },
      { q: "DC Extended Universe (DCEU)-এ ওয়ান্ডার ওম্যান চরিত্রে কে অভিনয় করেছেন?", options: ["Gal Gadot", "Margot Robbie", "Amber Heard", "Amy Adams"], correctIndex: 0, category: "Movies" },
      { q: "মানবদেহে মোট অস্থির (Bone) সংখ্যা কতটি?", options: ["208 টি", "206 টি", "300 টি", "201 টি"], correctIndex: 1, category: "Science" },
      { q: "ফুটবলে এক ম্যাচে একাই ৫ গোল করা প্লেয়ারকে কী বলা হয়?", options: ["Hat-trick", "Poker", "Repoker / Glut", "Brace"], correctIndex: 2, category: "Sports" },
      { q: "উইন্ডোজ ১১ প্রো (Windows 11 Pro)-এর প্রসেসর আর্কিটেকচার কোনটি?", options: ["x86", "ARM32", "x32", "x64 / ARM64"], correctIndex: 3, category: "Tech" },
      { q: "এশিয়ার দীর্ঘতম নদী কোনটি?", options: ["ইয়াংসি (Yangtze)", "গঙ্গা", "মেকং", "সিন্ধু"], correctIndex: 0, category: "Geography" },
      { q: "হংকং কোন দেশের প্রশাসনিক অঞ্চল?", options: ["জাপান", "চীন", "তাইওয়ান", "দক্ষিণ কোরিয়া"], correctIndex: 1, category: "General Knowledge" },
      { q: "বিশ্বের বৃহত্তম ম্যানগ্রোভ বন কোনটি?", options: ["অ্যামাজন", "আফ্রিকার রেইনফরেস্ট", "সুন্দরবন", "কঙ্গো বেসিন"], correctIndex: 2, category: "Bangladesh" },
      { q: "ইন্টারনেটের জনক কাকে বলা হয়?", options: ["Tim Berners-Lee", "Bill Gates", "Steve Jobs", "Vint Cerf"], correctIndex: 3, category: "Tech" },
      { q: "প্রথম ফুটবল বিশ্বকাপ কত সালে অনুষ্ঠিত হয়?", options: ["1930", "1934", "1950", "1928"], correctIndex: 0, category: "Sports" },
      { q: "সুপারম্যান প্রথম কোন কমিক বইয়ে আবির্ভূত হন?", options: ["Detective Comics #27", "Action Comics #1", "Superman #1", "Justice League #1"], correctIndex: 1, category: "DC Universe" },
      { q: "ব্লকচেইন টেকনোলজির মূল ভিত্তি কী?", options: ["Central Server", "Cloud Database", "Decentralized Ledger", "Local Memory"], correctIndex: 2, category: "Crypto" },
      { q: "ক্রিকেটের বাইবেল বলা হয় কোন সাময়িকীকে?", options: ["Cricinfo", "Sports Illustrated", "The Athletic", "Wisden"], correctIndex: 3, category: "Sports" },
      { q: "টাইটানিক জাহাজ কত সালে ডুবে যায়?", options: ["1912", "1914", "1905", "1920"], correctIndex: 0, category: "History" },
      { q: "কোন ভিটামিনের অভাবে রাতকানা রোগ হয়?", options: ["ভিটামিন B", "ভিটামিন A", "ভিটামিন C", "ভিটামিন D"], correctIndex: 1, category: "Science" },
      { q: "Free Fire গেমটির ডেভেলপার কোম্পানি কোনটি?", options: ["Tencent", "Krafton", "111dots Studio", "Epic Games"], correctIndex: 2, category: "Gaming" },
      { q: "সবচেয়ে বেশি বিশ্বকাপ জয়ী দেশ কোনটি?", options: ["জার্মানি", "ইতালি", "আর্জেন্টিনা", "ব্রাজিল"], correctIndex: 3, category: "Sports" },
      { q: "ক্ল্যাশ অফ ক্ল্যানস (Clash of Clans) গেমের ডেভেলপার কে?", options: ["Supercell", "Riot Games", "Ubisoft", "EA Sports"], correctIndex: 0, category: "Gaming" },
      { q: "কোন দেশকে 'সূর্যোদয়ের দেশ' বলা হয়?", options: ["চীন", "জাপান", "নরওয়ে", "থাইল্যান্ড"], correctIndex: 1, category: "General Knowledge" },
      { q: "ক্রিস্টিয়ানো রোনালদো আন্তর্জাতিক ফুটবলে প্রথম গোল কার বিরুদ্ধে করেন?", options: ["স্পেন", "নেদারল্যান্ডস", "গ্রিস", "ইংল্যান্ড"], correctIndex: 2, category: "Sports" },
      { q: "কম্পিউটারের সবচেয়ে দ্রুততম মেমোরি কোনটি?", options: ["RAM", "ROM", "HDD", "Cache Memory"], correctIndex: 3, category: "Tech" },
      { q: "সাইক্লোনের কেন্দ্রে শান্ত অঞ্চলকে কী বলা হয়?", options: ["Eye of Storm", "Core", "Center Zone", "Vortex"], correctIndex: 0, category: "Weather" },
      { q: "প্রথম আন্তর্জাতিক টি-টোয়েন্টি ম্যাচ কবে খেলা হয়?", options: ["2007", "2005", "2003", "2010"], correctIndex: 1, category: "Sports" }
    ];

    const randomQuiz = quizData[Math.floor(Math.random() * quizData.length)];
    const rewardMoney = 1000000;
    const optionLabels = ["A", "B", "C", "D"];
    const correctAnswerLetter = optionLabels[randomQuiz.correctIndex];
    const correctAnswerText = randomQuiz.options[randomQuiz.correctIndex];

    const quizBox = 
      `╔══════════════════════════════╗\n` +
      `      🔮  DI-ABLO BRAIN QUIZ  🔮\n` +
      `╚══════════════════════════════╝\n\n` +
      `❓  ${randomQuiz.q}\n\n` +
      ` ┣► 🅰️  ${randomQuiz.options[0]}\n` +
      ` ┣► 🅱️  ${randomQuiz.options[1]}\n` +
      ` ┣► 🅲  ${randomQuiz.options[2]}\n` +
      ` ┗► 🅳  ${randomQuiz.options[3]}\n\n` +
      `───────────── • 🎖️ • ─────────────\n` +
      `🏷️ Category : ${randomQuiz.category}\n` +
      `💰 Reward   : $1,000,000\n` +
      `⏳ Time Limit: 30 Seconds\n\n` +
      `👉 Reply with A, B, C, or D to claim!`;

    const sentMessage = await message.reply(quizBox);

    // Timeout object handle to clear timer on reply
    const timerID = setTimeout(() => {
      if (global.GoatBot.onReply.has(sentMessage.messageID)) {
        global.GoatBot.onReply.delete(sentMessage.messageID);
        message.reply(`> ⌛\n• সময় শেষ! কুইজটির সঠিক উত্তর ছিল: ${correctAnswerLetter}) ${correctAnswerText}`);
      }
    }, 30000);

    global.GoatBot.onReply.set(sentMessage.messageID, {
      commandName: commandName,
      author: senderID,
      correctLetter: correctAnswerLetter,
      correctText: correctAnswerText.toLowerCase(),
      reward: rewardMoney,
      timerID: timerID
    });
  },

  onReply: async function ({ message, event, Reply, usersData }) {
    const { senderID, body } = event;
    const { correctLetter, correctText, reward, author, timerID } = Reply;

    if (senderID !== author) {
      return message.reply("> ⚠️\n• এটি আপনার কুইজ নয়! নতুন কুইজ খেলতে #qz লিখুন।");
    }

    // Clear timeout when user responds
    clearTimeout(timerID);

    const userInput = body.trim().toLowerCase();
    const isCorrect = (userInput === correctLetter.toLowerCase()) || (userInput === correctText);

    let userData = await usersData.get(senderID);
    if (!userData.data) userData.data = {};
    if (!userData.data.quizStats) userData.data.quizStats = { wins: 0, total: 0 };

    userData.data.quizStats.total += 1;

    if (isCorrect) {
      userData.data.quizStats.wins += 1;
      let currentMoney = typeof userData.money === "number" ? userData.money : (userData.data?.money || 0);
      let newBalance = currentMoney + reward;

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

      const winRate = ((userData.data.quizStats.wins / userData.data.quizStats.total) * 100).toFixed(1);

      const response = 
        `> 🎯\n` +
        `• Congratulations! Correct Answer: [ ${correctLetter} ]\n` +
        `• Reward Credited: +$${formatMoney(reward)}\n\n` +
        `📊 Win Rate: ${winRate}% (${userData.data.quizStats.wins}/${userData.data.quizStats.total})\n` +
        `💳 Balance: $${formatMoney(newBalance)}`;

      return message.reply(response);
    } else {
      await usersData.set(senderID, userData);
      global.GoatBot.onReply.delete(Reply.messageID);

      return message.reply(`> ❌\n• Wrong answer! The correct choice was ${correctLetter}. Try again!`);
    }
  }
};
