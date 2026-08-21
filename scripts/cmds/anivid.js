const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "anivid",
        aliases: ["ar", "anisr", "animevid"],
        version: "8.0",
        author: "Pratik Shah",
        countDown: 5,
        role: 0,
        description: {
            en: "Search and receive anime video edits seamlessly without 403 blocks"
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

            // Using Invidious / Piped API Instance to Bypass 403 Cloudflare Blocks
            const searchUrl = `https://pipedapi.kavin.rocks/search?q=${encodeURIComponent(query + " anime edit shorts")}&filter=all`;
            
            const searchRes = await axios.get(searchUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
                },
                timeout: 15000
            });

            const items = searchRes.data?.items?.filter(item => item.type === "stream");

            if (!items || items.length === 0) {
                api.setMessageReaction("❌", event.messageID, () => {}, true);
                return message.reply(`× No anime edit videos found for "${query}"!`);
            }

            const selectedVideo = items[Math.floor(Math.random() * items.length)];
            const videoId = selectedVideo.url.split("v=")[1];

            // Direct Video Download URL via Cobalt/Piped Stream API
            const streamRes = await axios.get(`https://pipedapi.kavin.rocks/streams/${videoId}`, {
                timeout: 15000
            });

            const streams = streamRes.data?.videoStreams || [];
            // Find combined audio+video or highest quality mp4 stream
            const targetStream = streams.find(s => s.mimeType.includes("mp4") && s.videoOnly === false) || streams[0];

            if (!targetStream || !targetStream.url) {
                throw new Error("Unable to parse stream url");
            }

            // Downloading stream with Custom Headers to prevent 403
            const videoStream = await axios({
                method: "get",
                url: targetStream.url,
                responseType: "stream",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
                    "Referer": "https://piped.video/"
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
            console.error("Anivid Error:", err.message);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            return message.reply(`× Error fetching video: ${err.message || "Failed to download"}`);
        }
    }
};
