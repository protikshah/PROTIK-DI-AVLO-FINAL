const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "anivid",
        aliases: ["ar", "ar4", "animevid0"],
        version: "6.0",
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

            // Source 1: TikWM Direct Stream
            try {
                const searchKeyword = `${query} anime edit`;
                const tikwmRes = await axios.get(`https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(searchKeyword)}&count=10`, { timeout: 8000 });
                if (tikwmRes.data?.data?.videos?.length > 0) {
                    const randomVid = tikwmRes.data.data.videos[Math.floor(Math.random() * tikwmRes.data.data.videos.length)];
                    videoUrl = randomVid.play.startsWith("http") ? randomVid.play : `https://www.tikwm.com${randomVid.play}`;
                }
            } catch (e) {
                console.log("Source 1 failed, trying Backup Source...");
            }

            // Source 2: Backup TikTok API (Invision)
            if (!videoUrl) {
                try {
                    const tikRes = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(query)}`, { timeout: 8000 });
                    if (tikRes.data?.video?.noWatermark) {
                        videoUrl = tikRes.data.video.noWatermark;
                    }
                } catch (e) {
                    console.log("Source 2 failed...");
                }
            }

            if (!videoUrl) {
                throw new Error("All video sources are currently unavailable.");
            }

            // Download Video File
            const response = await axios({
                method: "get",
                url: videoUrl,
                responseType: "stream",
                timeout: 30000
            });

            const writer = fs.createWriteStream(videoPath);
            response.data.pipe(writer);

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
            return message.reply(`× Unable to fetch video. Please try searching again.`);
        }
    }
};
