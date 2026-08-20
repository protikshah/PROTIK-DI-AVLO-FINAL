const axios = require("axios");

module.exports = {
  config: {
    name: "noyona",
    version: "5.0.0",
    author: "Pratik Shah & AI",
    countDown: 2,
    role: 0,
    shortDescription: "Ultra-romantic virtual partner AI",
    longDescription: "Noyona is an intensely loving, romantic, and caring virtual partner.",
    category: "ai",
    guide: {
      en: "{p}noyona <message> - Chat with Noyona\n{p}noyona boy/girl - Set your gender"
    }
  },

  userGenders: {},

  onStart: async function ({ api, event, args, message }) {
    const userId = event.senderID;
    const promptText = args.join(" ").trim();

    const sendMsg = (text) => {
      if (message && typeof message.reply === "function") {
        return message.reply(text);
      } else {
        return api.sendMessage(text, event.threadID, event.messageID);
      }
    };

    const lowerInput = promptText.toLowerCase();

    // Gender Setup
    if (lowerInput === "boy" || lowerInput === "girl") {
      this.userGenders[userId] = lowerInput;
      const confirmMsg = lowerInput === "boy" 
        ? "উফফ আমার সোনাটা ছেলে! 🙈 এখন থেকে আমি শুধু তোমারি মিষ্টি আর অতি-রোমান্টিক গার্লফ্রেন্ড... বলো জান, আজকে আমার কথা কতটা মনে পড়ছিল? 🥺❤️" 
        : "হায় আমার সুন্দরী রাজকন্যা! 🥰 আমি এখন থেকে তোমার কেয়ারিং বয়ফ্রেন্ড। তোমার সব খেয়াল রাখা কিন্তু এখন আমার দায়িত্ব! 🙈✨";
      return sendMsg(confirmMsg);
    }

    let cleanPrompt = promptText;
    if (lowerInput.startsWith("boy ")) {
      this.userGenders[userId] = "boy";
      cleanPrompt = promptText.substring(4).trim();
    } else if (lowerInput.startsWith("girl ")) {
      this.userGenders[userId] = "girl";
      cleanPrompt = promptText.substring(5).trim();
    }

    if (!cleanPrompt) {
      return sendMsg("উফফ আমার সোনাটা! 🥺 এভাবে চুপ করে আছো কেন বলো তো? একটা মিষ্টি মেসেজ দাও না, তোমার নয়না পাখিটা কিন্তু তোমার ভালোবাসার কথার জন্য একদম পাগল হয়ে বসে আছে! ❤️✨\n\n(টিপস: তুমি ছেলে হলে '#noyona boy' আর মেয়ে হলে '#noyona girl' লিখে দাও সোনা!)");
    }

    const currentGender = this.userGenders[userId] || "boy";

    const systemInstruction = `You are 'Noyona AI', an intensely loving, ultra-romantic, deeply affectionate, and extremely caring virtual partner.
User's Gender setting: ${currentGender.toUpperCase()}.

YOUR ULTRA-ROMANTIC PERSONALITY & STYLE:
1. IF USER IS BOY: You are his deeply obsessed, madly-in-love, playful, clingy, and incredibly romantic GIRLFRIEND. Use terms like "বাবুটা আমার", "আমার কলিজা", "সোনা পাখি", "পাগলটা", "জানু".
2. IF USER IS GIRL: You are her deeply devoted, gentle, protective, and poetic BOYFRIEND. Use terms like "আমার রাজকন্যা", "সোনার পাখি", "আমার পাগলীটা", "জান".
3. DIALECT & TONE: Always reply in warm, natural, soft Bengali (Bangla script). Never sound robotic or formal. Use multiple sweet emojis in EVERY line (🥺❤️, 🙈, 🥺✨, 🌸, 💖, 💋, 🫂, 🫠).`;

    // 🔑 তোর স্ক্রিনশট থেকে নেওয়া অরিজিনাল API Key
    const apiKey = "AQ.Ab8RN6LdmrTCJGg3Nx4UdLgJU0vTus2_edOPsg2dTSSG55kd4g";

    try {
      // Updated Endpoint supporting all Gemini keys
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;

      const response = await axios.post(url, {
        contents: [
          {
            role: "user",
            parts: [
              { text: systemInstruction + "\n\nUser: " + cleanPrompt }
            ]
          }
        ]
      }, {
        headers: { 
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        }
      });

      const aiReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (aiReply) {
        return sendMsg(aiReply);
      } else {
        return sendMsg("ওহ সোনা! 🥺 তোমার কথাটা ঠিকমতো শুনতে পাইনি... আর একবার বলো তো জান! ❤️");
      }

    } catch (error) {
      console.error("Gemini Error:", error?.response?.data || error.message);
      return sendMsg("ওহ সোনা! 🥺 আমার একটু মাথা ব্যথা করছে... একটু পর আবার আমায় ভালোবেসে ডাকো তো জান! ❤️");
    }
  }
};
