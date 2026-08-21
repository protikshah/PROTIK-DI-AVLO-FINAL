const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "anivid",
        aliases: ["ar", "anisr", "animevid"],
        version: "6.0",
        author: "Pratik Shah",
        countDown: 5,
        role: 0,
        description: {
            en: "Search and receive anime video edits directly"
        },
        category: "anime",
        guide: {
            en: "{pn} <anime or character name>"
        }
    },

    onStart: async function ({ api, event, args, message }) {
        const query = args.join(" ");
        if (!query) {
            return message.reply("❌ Please provide an anime or character name! (Example: #anivid jin woo)");
        }

        const cacheDir = path.join(__dirname, "cache");
        fs.ensureDirSync(cacheDir);
        const videoPath = path.join(cacheDir, `anivid_${event.senderID}_${Date.now()}.mp4`);

        try {
            api.setMessageReaction("⏳", event.messageID, () => {}, true);

            // TikTok direct video proxy query
            const searchUrl = `https://api.tiklydown.eu.org/api/download?url=https://www.tiktok.com/search?q=${encodeURIComponent(query + " anime edit")}`;
            
            // Backup endpoint: Rapid stable video resolver
            const res = await axios.get(`https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(query + " anime edit")}&count=12`, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36"
                },
                timeout: 15000
            });

            if (!res.data || !res.data.data || !res.data.data.videos || res.data.data.videos.length === 0) {
                api.setMessageReaction("❌", event.messageID, () => {}, true);
                return message.reply(`× No video found for "${query}".`);
            }

            const videoList = res.data.data.videos;
            const randomVideo = videoList[Math.floor(Math.random() * videoList.length)];
            const playUrl = randomVideo.play.startsWith("http") ? randomVideo.play : `https://www.tikwm.com${randomVideo.play}`;

            // Download binary stream directly
            const response = await axios({
                method: "get",
                url: playUrl,
                responseType: "arraybuffer",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                },
                timeout: 30000
            });

            fs.writeFileSync(videoPath, Buffer.from(response.data));

            api.setMessageReaction("✅", event.messageID, () => {}, true);

            return message.reply({
                body: `🔥 **Here's your Anime Edit:** ${query.toUpperCase()} ✨`,
                attachment: fs.createReadStream(videoPath)
            }, () => {
                if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            });

        } catch (err) {
            console.error("Anivid Error:", err.message);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            return message.reply("× Error fetching video! Please try searching again in a moment.");
        }
    }
};
