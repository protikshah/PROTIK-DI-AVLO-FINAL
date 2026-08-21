const fs = require("fs-extra");
const path = require("path");
const yts = require("yt-search");
const ytdl = require("@distube/ytdl-core");

module.exports = {
    config: {
        name: "anivid",
        aliases: ["ar", "anisr", "animevid"],
        version: "18.0",
        author: "Protik Shah",
        countDown: 3,
        role: 0,
        description: {
            en: "Get random short anime edits every time"
        },
        category: "anime",
        guide: {
            en: "{pn} <character name>"
        }
    },

    onStart: async function ({ api, event, args, message }) {
        const query = args.join(" ");
        if (!query) return message.reply("❌ নাম দে মামা! (যেমন: #ar gojo)");

        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        try {
            // ১. সার্চে শুধু অ্যানিমে শর্টস ও এডিট রেজাল্ট টানা
            const searchResults = await yts(`${query} anime edit shorts amv`);
            
            if (!searchResults.videos || searchResults.videos.length === 0) {
                api.setMessageReaction("❌", event.messageID, () => {}, true);
                return message.reply(`❌ "${query}" দিয়ে কোনো অ্যানিমে এডিট পেলাম না!`);
            }

            // ২. ১৫ থেকে ৯০ সেকেন্ডের মধ্যে সব অ্যানিমে ভিডিও ফিল্টার করা
            const animeShorts = searchResults.videos.filter(v => v.seconds >= 10 && v.seconds <= 90);
            
            // ফিল্টার করা ভিডিও না পেলে নরমাল রেজাল্ট থেকে নেওয়া
            const finalPool = animeShorts.length > 0 ? animeShorts : searchResults.videos;

            // ৩. র‍্যান্ডমাইজেশন: প্রতিবার নতুন ও আলাদা ভিডিও বেছে নেওয়া
            const selectedVid = finalPool[Math.floor(Math.random() * Math.min(finalPool.length, 10))];

            // ৪. ভিডিও ডাউনলোড
            const cacheDir = path.join(__dirname, "cache");
            fs.ensureDirSync(cacheDir);
            const videoPath = path.join(cacheDir, `anivid_${event.senderID}_${Date.now()}.mp4`);

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

            // ৫. রেসপন্স ও অটো-ক্লিনআপ
            return message.reply({
                body: `🔥 **Anime Edit:** ${selectedVid.title}\n⏱️ Duration: ${selectedVid.timestamp}`,
                attachment: fs.createReadStream(videoPath)
            }, () => {
                if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            });

        } catch (err) {
            console.error(err);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            return message.reply("❌ ভিডিও ডাউনলোড করতে সমস্যা হয়েছে, আবার ট্রাই কর!");
        }
    }
};
