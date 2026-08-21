const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "anivid",
        aliases: ["ar", "av"],
        version: "3.0",
        author: "Protik Shah",
        countDown: 5,
        role: 0,
        description: {
            en: "Search and watch anime video edits easily"
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
        const videoPath = path.join(cacheDir, `anivid_${Date.now()}.mp4`);

        try {
            api.setMessageReaction("⏳", event.messageID, () => {}, true);

            let videoUrl = null;

            // Try API 1
            try {
                const res1 = await axios.get(`https://samirxpikachu.onrender.com/anime/edit?query=${encodeURIComponent(kw)}`);
                if (res1.data && res1.data.url) {
                    videoUrl = res1.data.url;
                }
            } catch (e) {
                console.log("API 1 failed, trying API 2...");
            }

            // Try API 2 if API 1 fails
            if (!videoUrl) {
                const res2 = await axios.get(`https://deku-rest-api.gleeze.com/tiktok/searchvideo?keywords=${encodeURIComponent(kw + " anime edit")}`);
                if (res2.data && res2.data.result && res2.data.result.length > 0) {
                    const randomVid = res2.data.result[Math.floor(Math.random() * res2.data.result.length)];
                    videoUrl = randomVid.play || randomVid.wmplay;
                }
            }

            if (!videoUrl) {
                throw new Error("No video link found from APIs.");
            }

            // Download video stream
            const videoStream = await axios({
                method: "get",
                url: videoUrl,
                responseType: "stream",
                timeout: 60000
            });

            const writer = fs.createWriteStream(videoPath);
            videoStream.data.pipe(writer);

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
            return message.reply("× Error fetching video! Please try searching with a different character or keyword.");
        }
    }
};
