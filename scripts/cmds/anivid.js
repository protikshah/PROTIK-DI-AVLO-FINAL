const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "anivid",
        aliases: ["ar", "anisr", "animevid"],
        version: "22.0",
        author: "Pratik Shah",
        countDown: 3,
        role: 0,
        description: {
            en: "Get short anime video edits"
        },
        category: "anime",
        guide: {
            en: "{pn} <character name>"
        }
    },

    onStart: async function ({ api, event, args, message }) {
        const query = args.join(" ") || "anime edit";
        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        const cacheDir = path.join(__dirname, "cache");
        fs.ensureDirSync(cacheDir);
        const videoPath = path.join(cacheDir, `anivid_${event.senderID}_${Date.now()}.mp4`);

        try {
            // ১. TikTok Search API endpoint
            const searchUrl = `https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(query + " anime edit")}&count=12&cursor=0`;
            const searchRes = await axios.get(searchUrl, { timeout: 10000 });

            const videos = searchRes.data?.data?.videos;

            if (!videos || videos.length === 0) {
                api.setMessageReaction("❌", event.messageID, () => {}, true);
                return message.reply(`❌ "${query}" এর কোনো অ্যানিমে এডিট পাওয়া যায়নি!`);
            }

            // ২. র্যান্ডমলি একটি ওয়ার্কিং ভিডিও বেছে নেওয়া
            const randomVid = videos[Math.floor(Math.random() * videos.length)];
            const downloadUrl = `https://www.tikwm.com${randomVid.play}`;

            // ৩. ভিডিও ডাউনলোড স্ট্রিম
            const response = await axios({
                method: "get",
                url: downloadUrl,
                responseType: "stream",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
                timeout: 20000
            });

            const writer = fs.createWriteStream(videoPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            api.setMessageReaction("✅", event.messageID, () => {}, true);

            // ৪. পাঠানো এবং ক্লিনআপ
            return message.reply({
                body: `🔥 **Anime Edit:** ${randomVid.title || query.toUpperCase()}\n⏱️ Duration: ${randomVid.duration}s`,
                attachment: fs.createReadStream(videoPath)
            }, () => {
                if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            });

        } catch (err) {
            console.error("Anivid Final Error:", err.message);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            return message.reply("❌ সার্ভার রেসপন্স করছে না। আরেকবার ট্রাই কর মামা!");
        }
    }
};
