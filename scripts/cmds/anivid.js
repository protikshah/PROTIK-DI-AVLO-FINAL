const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "anivid",
        aliases: ["ar", "anvd"],
        version: "4.0",
        author: "Protik Shah",
        countDown: 5,
        role: 0,
        description: {
            en: "Search and send anime edit videos directly"
        },
        category: "anime",
        guide: {
            en: "{pn} <anime name or character>"
        }
    },

    onStart: async function ({ api, event, args, message }) {
        const kw = args.join(" ");
        if (!kw) {
            return message.reply("❌ Please provide an anime or character name! (Example: #anivid jin woo)");
        }

        const cacheDir = path.join(__dirname, "cache");
        fs.ensureDirSync(cacheDir);
        const videoPath = path.join(cacheDir, `anivid_${event.senderID}_${Date.now()}.mp4`);

        try {
            api.setMessageReaction("⏳", event.messageID, () => {}, true);

            // Using TikWM Official Search API
            const searchKeyword = `${kw} anime edit`;
            const searchUrl = `https://www.tikwm.com/api/feed/search?keywords=${encodeURIComponent(searchKeyword)}&count=10`;

            const res = await axios.get(searchUrl, {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"
                }
            });

            if (!res.data || !res.data.data || !res.data.data.videos || res.data.data.videos.length === 0) {
                api.setMessageReaction("❌", event.messageID, () => {}, true);
                return message.reply(`× No anime edit found for "${kw}"!`);
            }

            const videos = res.data.data.videos;
            // Picking a random video from top search results
            const randomVid = videos[Math.floor(Math.random() * videos.length)];
            
            // TikWM provides direct video stream without watermark
            const playUrl = `https://www.tikwm.com${randomVid.play}` || randomVid.play;

            // Stream & save file locally
            const response = await axios({
                method: "get",
                url: playUrl,
                responseType: "stream",
                timeout: 60000
            });

            const writer = fs.createWriteStream(videoPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            api.setMessageReaction("✅", event.messageID, () => {}, true);

            return message.reply({
                body: `🔥 **Here's your Anime Edit:** ${kw.toUpperCase()} ✨`,
                attachment: fs.createReadStream(videoPath)
            }, () => {
                if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            });

        } catch (err) {
            console.error("Anivid Error:", err);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            return message.reply("× Error fetching video! Please try searching again.");
        }
    }
};
