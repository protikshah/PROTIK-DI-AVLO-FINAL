const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "anivid",
        aliases: ["ar", "anisr", "animevid"],
        version: "21.0",
        author: "Pratik Shah",
        countDown: 3,
        role: 0,
        description: {
            en: "Get guaranteed short anime video edits without API block"
        },
        category: "anime",
        guide: {
            en: "{pn} <anime character name>"
        }
    },

    onStart: async function ({ api, event, args, message }) {
        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        const cacheDir = path.join(__dirname, "cache");
        fs.ensureDirSync(cacheDir);
        const videoPath = path.join(cacheDir, `anivid_${event.senderID}_${Date.now()}.mp4`);

        try {
            // ১. GitHub Hosted Verified Anime Edits Dataset
            const rawUrl = "https://raw.githubusercontent.com/Shinobu-Discord-Bot/Anime-Videos/main/anime_edits.json";
            
            let videoList = [];
            
            try {
                const res = await axios.get(rawUrl, { timeout: 10000 });
                if (Array.isArray(res.data) && res.data.length > 0) {
                    videoList = res.data;
                }
            } catch (e) {
                console.log("GitHub database failed, switching to backup...");
            }

            // ব্যাকআপ ডেটাসেট (যদি ১ম টা ফেল করে)
            if (videoList.length === 0) {
                const altRes = await axios.get("https://raw.githubusercontent.com/Krypton-Byte/Anime-Edit-Video/main/videos.json", { timeout: 10000 });
                if (Array.isArray(altRes.data)) videoList = altRes.data;
            }

            if (!videoList || videoList.length === 0) {
                api.setMessageReaction("❌", event.messageID, () => {}, true);
                return message.reply("❌ ভিডিও ডাটাবেজ কানেক্ট করা যাচ্ছে না, একটু পর ট্রাই কর মামা!");
            }

            // ২. প্রতিবার নতুন ও র্যান্ডম অ্যানিমে এডিট সিলেক্ট করা
            const selectedVideo = videoList[Math.floor(Math.random() * videoList.length)];
            const streamUrl = typeof selectedVideo === "object" ? selectedVideo.url : selectedVideo;

            // ৩. ভিডিও ডাউনলোড
            const videoStream = await axios({
                method: "get",
                url: streamUrl,
                responseType: "stream",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
                timeout: 30000
            });

            const writer = fs.createWriteStream(videoPath);
            videoStream.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            api.setMessageReaction("✅", event.messageID, () => {}, true);

            // ৪. মেসেঞ্জারে পাঠানো
            return message.reply({
                body: `🔥 **Here is your Anime Edit Video!** ✨\n🎬 Enjoy your Short Edit!`,
                attachment: fs.createReadStream(videoPath)
            }, () => {
                if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            });

        } catch (err) {
            console.error("Anivid Database Error:", err.message);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            return message.reply("❌ ভিডিও ডাউনলোড করতে সমস্যা হয়েছে। আবার `#ar` দে!");
        }
    }
};
