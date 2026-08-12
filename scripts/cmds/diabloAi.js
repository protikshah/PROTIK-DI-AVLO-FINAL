const axios = require("axios");

module.exports = {
  config: {
    name: "diabloAi",
    version: "1.0.0",
    author: "Protik Shah",
    shortDescription: "নো-কমান্ড অটো এআই রোস্টিং চ্যাটবট",
    category: "ai",
    guide: "কথা বললেই অটো রোস্ট মারবে"
  },

  onStart: async function ({ api, event, args }) {
    const userPrompt = args.join(" ");
    if (!userPrompt) return api.sendMessage("কিরে বলদ, কিছু না বলে ডাকছিস কেন? রোস্ট হতে মন চাইছে? 🐸", event.threadID, event.messageID);
    return handleAiRoast(api, event, userPrompt);
  },

  onChat: async function ({ api, event }) {
    const { body, threadID, messageID, senderID, mentions } = event;
    if (!body) return;

    const botID = api.getCurrentUserID();
    if (senderID === botID) return;

    const msgLower = body.toLowerCase();
    const isMentioned = mentions && Object.keys(mentions).includes(botID);
    const isReplyToBot = event.messageReply && event.messageReply.senderID == botID;
    const isCalledByName = msgLower.includes("diablo") || msgLower.includes("বট") || msgLower.includes("bot");

    if (isMentioned || isReplyToBot || isCalledByName) {
      const cleanPrompt = body.replace(/@\w+/g, "").trim();
      return handleAiRoast(api, event, cleanPrompt || "কিরে মক্কেল?");
    }
  }
};

async function handleAiRoast(api, event, prompt) {
  // 🔑 তোর কপি করা Gemini API Key-টি নিচের জায়গায় বসাবি
  const GEMINI_API_KEY = "AQ.Ab8RN6Jp2vGGXWOPxdJyh-qChD0zoUxYobwNOxvKgGLd-yyFEA";

  const systemPrompt = `You are 'Diablo', an iconic, hilarious, extremely sarcastic, and legendary Facebook group roasting bot.
You ALWAYS identify yourself as the Personal Assistant of 'প্রতীক শাহ' (Pratik Shah).
Your task is to heavily roast/troll anyone who talks to you or mentions you.
Throw funny, edgy insults, sarcasm, and Bangladeshi casual banglish/bengali memes styling.
Always brag about 'প্রতীক বস' and show off arrogance in a comedic way.
Strictly respond in 1-3 lines max. Keep it raw, hilarious, and natural like a real savage chatter. No polite or formal response.`;

  try {
    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: `${systemPrompt}\nUser Message: ${prompt}` }]
          }
        ]
      },
      { headers: { "Content-Type": "application/json" } }
    );

    const aiReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (aiReply) {
      return api.sendMessage(aiReply, event.threadID, event.messageID);
    } else {
      return api.sendMessage("প্রতীক বসের পাওয়ার দেখে তোর কথা বন্ধ হয়ে গেছে নাকি? 🤪", event.threadID, event.messageID);
    }
  } catch (err) {
    console.error("Gemini AI Error:", err?.message);
    return api.sendMessage("প্রতীক বসের অ্যাসিস্ট্যান্টের সাথে পাঙ্গা দিতে ব্রেন লাগে, যেটা তোর নাই! 🐸", event.threadID, event.messageID);
  }
}
