const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "anivid",
        aliases: ["ar", "anisr", "animevid"],
        version: "23.0",
        author: "Pratik Shah",
        countDown: 3,
        role: 0,
        description: {
            en: "Get working short anime edits via Pinterest engine"
        },
        category: "anime",
        guide: {
            en: "{pn} <anime character name>"
        }
    },

    onStart: async function ({ api, event, args, message }) {
        const query = args.join(" ") || "anime edit";
        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        const cacheDir = path.join(__dirname, "cache");
        fs.ensureDirSync(cacheDir);
        const videoPath = path.join(cacheDir, `anivid_${event.senderID}_${Date.now()}.mp4`);

        try {
            // ১. Pinterest Video Scraper (Fast & Reliable)
            const searchUrl = `https://api.vyturex.com/pinterest?query=${encodeURIComponent(query + " anime edit video")}`;
            const searchRes = await axios.get(searchUrl, { timeout: 10000 });

            let videoUrl = "";

            if (searchRes.data && Array.isArray(searchRes.data)) {
                // ভিডিও লিঙ্কগুলো আলাদা ফিল্টার করা
                const videoList = searchRes.data.filter(item => typeof item === "string" && item.endsWith(".mp4"));
                if (videoList.length > 0) {
                    videoUrl = videoList[Math.floor(Math.random() * videoList.length)];
                }
            }

            // ব্যাকআপ সিস্টেম: যদি পিন্টারেস্টে না পাওয়া যায়
            if (!videoUrl) {
                const altRes = await axios.get(`https://raw.githubusercontent.com/Shinobu-Discord-Bot/Anime-Videos/main/anime_edits.json`, { timeout: 8000 });
                if (altRes.data && Array.isArray(altRes.data)) {
                    videoUrl = altRes.data[Math.floor(Math.random() * altRes.data.length)];
                }
            }

            if (!videoUrl) {
                api.setMessageReaction("❌", event.messageID, () => {}, true);
                return message.reply(`❌ "${query}" এর কোনো ভিডিও পাওয়া যায়নি!`);
            }

            // ২. ডাইরেক্ট MP4 স্ট্রিম ডাউনলোড
            const response = await axios({
                method: "get",
                url: videoUrl,
                responseType: "stream",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
                },
                timeout: 30000
            });

            const writer = fs.createWriteStream(videoPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            api.setMessageReaction("✅", event.messageID, () => {}, true);

            // ৩. মেসেঞ্জারে পাঠানো
            return message.reply({
                body: `🔥 **Anime Edit:** ${query.toUpperCase()} ✨`,
                attachment: fs.createReadStream(videoPath)
            }, () => {
                if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            });

        } catch (err) {
            console.error("Anivid Final Error:", err.message);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            return message.reply("❌ ভিডিও ডাউনলোড করতে সমস্যা হয়েছে। আবার ট্রাই কর মামা!");
        }
    }
};
