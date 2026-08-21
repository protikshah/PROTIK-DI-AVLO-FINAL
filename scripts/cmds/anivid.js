const axios = require("axios");

module.exports = {
    config: {
        name: "anivid",
        aliases: ["ar", "anr", "nid"],
        version: "14.0",
        author: "Pratik Shah",
        countDown: 5,
        role: 0,
        description: {
            en: "Get anime edits directly via Google Search scraping"
        },
        category: "anime",
        guide: {
            en: "{pn} <anime name>"
        }
    },

    onStart: async function ({ api, event, args, message }) {
        const query = args.join(" ");
        if (!query) return message.reply("❌ Give me an anime name!");

        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        try {
            // Bing Video Search (বেশি স্টেবল এবং দ্রুত)
            const searchUrl = `https://www.bing.com/videos/search?q=${encodeURIComponent(query + " anime edit tiktok")}&qs=n&form=QBVR`;
            
            // একটি র্যান্ডম User-Agent ব্যবহার করা যাতে বট হিসেবে ডিটেক্ট না হয়
            const response = await axios.get(searchUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36"
                }
            });

            // রেসপন্স থেকে mp4 লিংক বের করার Regex
            const regex = /murl&quot;:&quot;(.*?)&quot;/g;
            const matches = [...response.data.matchAll(regex)];
            
            const videoLinks = matches
                .map(m => m[1])
                .filter(url => url.includes(".mp4") || url.includes("tiktok") || url.includes("cdn"));

            if (videoLinks.length === 0) {
                api.setMessageReaction("❌", event.messageID, () => {}, true);
                return message.reply("❌ No video results found. Try another character name.");
            }

            const videoUrl = videoLinks[Math.floor(Math.random() * Math.min(videoLinks.length, 5))];

            api.setMessageReaction("✅", event.messageID, () => {}, true);
            return message.reply({
                body: `🔥 **Here is your edit for ${query.toUpperCase()}:**\n${videoUrl}`
            });

        } catch (err) {
            console.error("Scraping Error:", err.message);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            return message.reply("❌ Server error! The site might be blocking the request. Try again later.");
        }
    }
};
