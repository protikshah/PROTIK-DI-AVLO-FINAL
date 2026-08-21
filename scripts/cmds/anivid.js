const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");
const yts = require("yt-search");
const ytdl = require("@distube/ytdl-core");

module.exports = {
    config: {
        name: "anivid",
        aliases: ["ar", "anr", "a3td"],
        version: "16.0",
        author: "Pratik Shah",
        countDown: 5,
        role: 0,
        description: {
            en: "Get short, specific Anime Edit videos"
        },
        category: "anime",
        guide: {
            en: "{pn} <anime character name>"
        }
    },

    onStart: async function ({ api, event, args, message }) {
        const query = args.join(" ");
        if (!query) return message.reply("❌ Give me an anime character name! (e.g. #ar gojo)");

        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        try {
            // ১. কুয়েরি আপডেট: 'Anime Edit' যোগ করে দিলাম যাতে অন্য ভিডিও না আসে
            const searchResults = await yts(`${query} anime edit shorts`);
            
            // ২. লজিক: শুধুমাত্র ৬০ সেকেন্ডের নিচের ভিডিওগুলো ফিল্টার করা
            const shortVideos = searchResults.videos.filter(v => v.seconds < 65);
            
            if (shortVideos.length === 0) {
                api.setMessageReaction("❌", event.messageID, () => {}, true);
                return message.reply(`❌ No short anime edits found for "${query}".`);
            }

            // র্যান্ডমলি একটি সেরা শর্ট ভিডিও নেয়া
            const selectedVid = shortVideos[Math.floor(Math.random() * Math.min(shortVideos.length, 5))];

            // ৩. ডাউনলোড স্ট্রিম
            const cacheDir = path.join(__dirname, "cache");
            fs.ensureDirSync(cacheDir);
            const videoPath = path.join(cacheDir, `video_${event.senderID}.mp4`);
            
            const stream = ytdl(selectedVid.url, {
                filter: "videoandaudio",
                quality: "highest",
            });

            const writer = fs.createWriteStream(videoPath);
            stream.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            // ৪. পাঠানো
            api.setMessageReaction("✅", event.messageID, () => {}, true);
            await message.reply({
                body: `🔥 **Anime Edit: ${selectedVid.title}**\n⏱️ Duration: ${selectedVid.timestamp}`,
                attachment: fs.createReadStream(videoPath)
            });

            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);

        } catch (err) {
            console.error(err);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            return message.reply("❌ Error processing video. Please try again!");
        }
    }
};
