const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "anivid",
        aliases: ["anisearch", "animevid"],
        version: "1.0",
        author: "Pratik Shah",
        countDown: 5,
        role: 0,
        description: {
            bn: "টিকটক ও সোশ্যাল এপিআই সোর্স থেকে সেরা অ্যানিমে এডিট ক্লিপ এনে দেবে"
        },
        category: "media",
        guide: {
            bn: "{pn} <অ্যানিমে বা ক্যারেক্টারের নাম>"
        }
    },

    onStart: async function ({ api, event, args, message }) {
        const query = args.join(" ");
        if (!query) {
            return message.reply("❌ যেকোনো অ্যানিমে বা ক্যারেক্টারের নাম লেখো! (যেমন: #anivid jin woo)");
        }

        api.setMessageReaction("✨", event.messageID, () => {}, true);

        const cacheDir = path.join(__dirname, "cache");
        fs.ensureDirSync(cacheDir);
        const videoPath = path.join(cacheDir, `anivid_${event.senderID}_${Date.now()}.mp4`);

        try {
            const searchKeyword = encodeURIComponent(`${query} anime edit`);
            const apiUrl = `https://lyric-search-neon.vercel.app/kshitiz?keyword=${searchKeyword}`;
            
            const res = await axios.get(apiUrl);
            const videos = res.data;

            if (!videos || !Array.isArray(videos) || videos.length === 0) {
                api.setMessageReaction("🥹", event.messageID, () => {}, true);
                return message.reply(`× "${query}" এর কোনো অ্যানিমে ক্লিপ পাওয়া যায়নি!`);
            }

            const selectedVideo = videos[Math.floor(Math.random() * videos.length)];
            const videoUrl = selectedVideo.videoUrl || selectedVideo.url || selectedVideo;

            if (!videoUrl || typeof videoUrl !== "string") {
                throw new Error("Invalid Video URL structure");
            }

            const videoStream = await axios.get(videoUrl, { responseType: "arraybuffer" });
            fs.writeFileSync(videoPath, Buffer.from(videoStream.data));

            api.setMessageReaction("✅", event.messageID, () => {}, true);

            return message.reply({
                body: `🔥 **Here's your Anime Edit:** ${query.toUpperCase()} ✨`,
                attachment: fs.createReadStream(videoPath)
            }, () => {
                if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            });

        } catch (err) {
            console.error("Anivid Error:", err);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            return message.reply("× ভিডিও প্রসেস করতে সমস্যা হয়েছে, একটু পর আবার চেষ্টা করো!");
        }
    }
};
