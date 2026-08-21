const axios = require("axios");

module.exports = {
    config: {
        name: "anivid",
        aliases: ["ar", "anisr", "animevid"],
        version: "13.0",
        author: "Pratik Shah",
        countDown: 5,
        role: 0,
        description: {
            en: "Get anime edits directly from Pinterest"
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
            // Pinterest search API (most stable right now)
            const res = await axios.get(`https://api.vyturex.com/pinterest?query=${encodeURIComponent(query + " anime edit")}`);
            
            // ফিল্টার করে শুধু ভিডিও লিঙ্কগুলো বের করা
            const links = res.data.filter(i => i.endsWith('.mp4'));
            
            if (!links || links.length === 0) {
                api.setMessageReaction("❌", event.messageID, () => {}, true);
                return message.reply("❌ No edits found for " + query);
            }

            const videoUrl = links[Math.floor(Math.random() * links.length)];

            // ডাউনলোড না করে সরাসরি ভিডিওর লিংকটা পাঠিয়ে দিচ্ছি (এতে সার্ভার ক্র্যাশ করবে না)
            api.setMessageReaction("✅", event.messageID, () => {}, true);
            return message.reply({
                body: `🔥 **Anime Edit for ${query.toUpperCase()}:**\n${videoUrl}`
            });

        } catch (err) {
            console.error(err);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            return message.reply("❌ Server error, try again later.");
        }
    }
};
