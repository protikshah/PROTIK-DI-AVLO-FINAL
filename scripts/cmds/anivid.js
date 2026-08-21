const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "anivid",
        aliases: ["ar", "anisr", "animevid"],
        version: "12.0",
        author: "Pratik Shah",
        countDown: 5,
        role: 0,
        description: {
            en: "Search and receive anime video edits via Pinterest"
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

            // Pinterest Video Search Endpoint
            const searchUrl = `https://api.vyturex.com/pinterest?query=${encodeURIComponent(query + " anime edit video")}`;
            const searchRes = await axios.get(searchUrl, { timeout: 15000 });

            let videos = [];
            if (Array.isArray(searchRes.data)) {
                videos = searchRes.data.filter(url => typeof url === 'string' && (url.includes(".mp4") || url.includes("720p") || url.includes("v1")));
            }

            // Backup Pinterest scraper API
            if (videos.length === 0) {
                const altUrl = `https://bk9.fun/pinterest/search?q=${encodeURIComponent(query + " anime edit video")}`;
                const altRes = await axios.get(altUrl, { timeout: 15000 });
                if (altRes.data && altRes.data.status && Array.isArray(altRes.data.BK9)) {
                    videos = altRes.data.BK9.map(item => item.video || item.url).filter(url => url && url.includes(".mp4"));
                }
            }

            if (videos.length === 0) {
                api.setMessageReaction("❌", event.messageID, () => {}, true);
                return message.reply(`× No anime videos found for "${query}"!`);
            }

            const selectedVideoUrl = videos[Math.floor(Math.random() * videos.length)];

            // Video Download
            const videoStream = await axios({
                method: "get",
                url: selectedVideoUrl,
                responseType: "stream",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
                timeout: 45000
            });

            const writer = fs.createWriteStream(videoPath);
            videoStream.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            api.setMessageReaction("✅", event.messageID, () => {}, true);

            return message.reply({
                body: `🔥 **Here's your Anime Edit:** ${query.toUpperCase()} ✨`,
                attachment: fs.createReadStream(videoPath)
            }, () => {
                if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            });

        } catch (err) {
            console.error("Anivid Execution Error:", err.message);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            return message.reply(`× Error fetching video: ${err.message || "Failed to download"}`);
        }
    }
};
