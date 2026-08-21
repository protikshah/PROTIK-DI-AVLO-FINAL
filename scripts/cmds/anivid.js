const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "anivid",
        aliases: ["ar", "anisr", "animevid"],
        version: "7.0",
        author: "Pratik Shah",
        countDown: 5,
        role: 0,
        description: {
            en: "Search and send anime video edits directly"
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

            // API Method: Using Direct TikTok Scraping Proxy (AhaVideo / Tikwm Web)
            const searchUrl = `https://tikwm.com/api/feed/search`;
            
            const searchRes = await axios.post(
                searchUrl,
                new URLSearchParams({
                    keywords: `${query} anime edit`,
                    count: '10',
                    cursor: '0',
                    web: '1'
                }),
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "User-Agent": "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36"
                    },
                    timeout: 15000
                }
            );

            const videos = searchRes.data?.data?.videos;

            if (!videos || videos.length === 0) {
                api.setMessageReaction("❌", event.messageID, () => {}, true);
                return message.reply(`× No anime edits found for "${query}"!`);
            }

            // Random video selection
            const randomVid = videos[Math.floor(Math.random() * videos.length)];
            let playUrl = randomVid.play;
            if (!playUrl.startsWith("http")) {
                playUrl = `https://tikwm.com${playUrl}`;
            }

            // Download video stream
            const videoStream = await axios({
                method: "get",
                url: playUrl,
                responseType: "stream",
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
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

            return message.reply({
                body: `🔥 **Here's your Anime Edit:** ${query.toUpperCase()} ✨`,
                attachment: fs.createReadStream(videoPath)
            }, () => {
                if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            });

        } catch (err) {
            console.error("--- ANIVID ERROR LOG ---", err.response ? err.response.data : err.message);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            
            // Output actual error for testing
            const errMsg = err.message || "Unknown error";
            return message.reply(`× Error fetching video: ${errMsg}`);
        }
    }
};
