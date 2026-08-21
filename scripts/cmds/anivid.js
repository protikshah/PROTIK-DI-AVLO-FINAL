const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "anivid",
        aliases: ["ar", "anisr", "animevid"],
        version: "20.0",
        author: "Pratik Shah",
        countDown: 3,
        role: 0,
        description: {
            en: "Get short anime video edits reliably"
        },
        category: "anime",
        guide: {
            en: "{pn} <character name>"
        }
    },

    onStart: async function ({ api, event, args, message }) {
        const query = args.join(" ");
        if (!query) return message.reply("❌ কোনো অ্যানিমে বা ক্যারেক্টারের নাম দে মামা!");

        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        const cacheDir = path.join(__dirname, "cache");
        fs.ensureDirSync(cacheDir);
        const videoPath = path.join(cacheDir, `anivid_${event.senderID}_${Date.now()}.mp4`);

        let videoUrl = "";

        // সোর্স ১: TikTok Video Scraper API
        try {
            const res1 = await axios.get(`https://tikwm.com/api/feed/search?keywords=${encodeURIComponent(query + " anime edit shorts")}`);
            if (res1.data && res1.data.data && res1.data.data.videos && res1.data.data.videos.length > 0) {
                const randomVid = res1.data.data.videos[Math.floor(Math.random() * Math.min(res1.data.data.videos.length, 8))];
                videoUrl = randomVid.play;
            }
        } catch (e) {
            console.log("Source 1 failed, trying source 2...");
        }

        // সোর্স ২: ব্যাকআপ অ্যানিমে এপিআই (যদি ১ কাজ না করে)
        if (!videoUrl) {
            try {
                const res2 = await axios.get(`https://api.kenliejugarap.com/tiktoksearch/?search=${encodeURIComponent(query + " anime edit")}`);
                if (res2.data && res2.data.videos && res2.data.videos.length > 0) {
                    const randomVid = res2.data.videos[Math.floor(Math.random() * Math.min(res2.data.videos.length, 5))];
                    videoUrl = randomVid.play;
                }
            } catch (e) {
                console.log("Source 2 failed...");
            }
        }

        // রেজাল্ট না পেলে নোটিফাই করা
        if (!videoUrl) {
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            return message.reply(`❌ "${query}" এর জন্য কোনো ভিডিও সোর্স পাওয়া যায়নি!`);
        }

        // ভিডিও ডাউনলোড ও পাঠানো
        try {
            const response = await axios({
                method: "get",
                url: videoUrl,
                responseType: "stream",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
                timeout: 25000
            });

            const writer = fs.createWriteStream(videoPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            api.setMessageReaction("✅", event.messageID, () => {}, true);

            return message.reply({
                body: `🔥 **Anime Edit:** ${query.toUpperCase()} ✨`,
                attachment: fs.createReadStream(videoPath)
            }, () => {
                if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            });

        } catch (err) {
            console.error("Download Error:", err.message);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            return message.reply("❌ ভিডিও স্ট্রিম করার সময় ফাইল রাইট করতে প্রবলেম হয়েছে। আবার ট্রাই কর!");
        }
    }
};
