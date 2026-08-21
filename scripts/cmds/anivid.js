const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const https = require("https");

// Ignore SSL Certificate Errors (Fixes 526 Cloudflare issue)
const agent = new https.Agent({
    rejectUnauthorized: false
});

module.exports = {
    config: {
        name: "anivid",
        aliases: ["ar", "anisr", "animevid"],
        version: "9.0",
        author: "Pratik Shah",
        countDown: 5,
        role: 0,
        description: {
            en: "Search and receive anime video edits seamlessly"
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

            let videoUrl = null;

            // Source 1: TikTok Search API via TikWM
            try {
                const searchRes = await axios.post("https://tikwm.com/api/feed/search", 
                    new URLSearchParams({
                        keywords: `${query} anime edit`,
                        count: '12',
                        cursor: '0',
                        web: '1'
                    }), {
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        httpsAgent: agent,
                        timeout: 12000
                    }
                );

                const videos = searchRes.data?.data?.videos;
                if (videos && videos.length > 0) {
                    const randomVid = videos[Math.floor(Math.random() * videos.length)];
                    videoUrl = randomVid.play.startsWith("http") ? randomVid.play : `https://tikwm.com${randomVid.play}`;
                }
            } catch (e) {
                console.log("Source 1 Failed, trying Backup...");
            }

            // Source 2: Alternative Public Endpoint if TikWM fails
            if (!videoUrl) {
                const altRes = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(query + " anime edit")}`, {
                    httpsAgent: agent,
                    timeout: 12000
                });
                if (altRes.data?.video?.noWatermark) {
                    videoUrl = altRes.data.video.noWatermark;
                }
            }

            if (!videoUrl) {
                throw new Error("Unable to locate a valid video stream.");
            }

            // Download Video Stream bypassing SSL strictness
            const videoStream = await axios({
                method: "get",
                url: videoUrl,
                responseType: "stream",
                httpsAgent: agent,
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
