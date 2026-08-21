const fs = require("fs-extra");
const path = require("path");
const yts = require("yt-search");
const ytdl = require("@distube/ytdl-core");

module.exports = {
    config: {
        name: "anivid",
        aliases: ["ar", "anisr", "animevid"],
        version: "11.0",
        author: "Pratik Shah",
        countDown: 5,
        role: 0,
        description: {
            en: "Search and download anime video edits directly from YouTube"
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

            // ১. ইউটিউবে সার্চ করা
            const searchResults = await yts(`${query} anime edit shorts`);
            const videos = searchResults.videos;

            if (!videos || videos.length === 0) {
                api.setMessageReaction("❌", event.messageID, () => {}, true);
                return message.reply(`× No anime videos found for "${query}"!`);
            }

            // প্রথম ৫টি ফলাফলের মধ্যে থেকে র্যান্ডম একটি বেছে নেওয়া
            const selectedVid = videos[Math.floor(Math.random() * Math.min(videos.length, 5))];

            // ২. distube/ytdl-core দিয়ে ডাইরেক্ট ভিডিও ফাইল ডাউনলোড
            const stream = ytdl(selectedVid.url, {
                filter: "videoandaudio",
                quality: "highestvideo"
            });

            const writer = fs.createWriteStream(videoPath);
            stream.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            api.setMessageReaction("✅", event.messageID, () => {}, true);

            return message.reply({
                body: `🔥 **Here's your Anime Edit:** ${query.toUpperCase()} ✨\n🎬 Title: ${selectedVid.title}`,
                attachment: fs.createReadStream(videoPath)
            }, () => {
                if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            });

        } catch (err) {
            console.error("Anivid YTDL Error:", err);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            return message.reply(`× Error downloading video: ${err.message || "Failed to process video"}`);
        }
    }
};
