const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "anivid",
        aliases: ["ar", "anisr", "animevid"],
        version: "19.0",
        author: "Pratik Shah",
        countDown: 3,
        role: 0,
        description: {
            en: "Get instant anime video edits"
        },
        category: "anime",
        guide: {
            en: "{pn} <character name>"
        }
    },

    onStart: async function ({ api, event, args, message }) {
        const query = args.join(" ");
        if (!query) return message.reply("❌ কোনো অ্যানিমে বা ক্যারেক্টারের নাম দে মামা!");

        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        const cacheDir = path.join(__dirname, "cache");
        fs.ensureDirSync(cacheDir);
        const videoPath = path.join(cacheDir, `anivid_${event.senderID}_${Date.now()}.mp4`);

        try {
            // ১. অটোমেটেড অ্যানিমে ভিডিও API-তে কল করা
            const apiUrl = `https://raw.githubusercontent.com/Animetos/anime-video-api/main/video.json`;
            
            // ব্যাকআপ টিকটক/পিন্টারেস্ট দ্রুতগতির এপিআই
            const searchUrl = `https://api.kenliejugarap.com/tiktoksearch/?search=${encodeURIComponent(query + " anime edit shorts")}`;
            
            const res = await axios.get(searchUrl, { timeout: 10000 });
            
            let downloadUrl = "";

            if (res.data && res.data.status && res.data.videos && res.data.videos.length > 0) {
                // ১০-১৫টি শর্ট এডিটের মধ্যে থেকে প্রতিবার র্যান্ডম একটি বেছে নেওয়া
                const randomVid = res.data.videos[Math.floor(Math.random() * Math.min(res.data.videos.length, 10))];
                downloadUrl = randomVid.play || randomVid.wmplay;
            }

            // ব্যাকআপ না পেলে ডাইরেক্ট অ্যানিমে সোর্স
            if (!downloadUrl) {
                const altRes = await axios.get(`https://api.vyturex.com/anime?query=${encodeURIComponent(query)}`);
                downloadUrl = altRes.data.video;
            }

            if (!downloadUrl) {
                api.setMessageReaction("❌", event.messageID, () => {}, true);
                return message.reply(`❌ "${query}" এর কোনো অ্যানিমে এডিট পাওয়া যায়নি!`);
            }

            // ২. অতি দ্রুত মেমোরি ছাড়াই ভিডিও ডাউনলোড
            const videoStream = await axios({
                method: "get",
                url: downloadUrl,
                responseType: "stream",
                timeout: 30000
            });

            const writer = fs.createWriteStream(videoPath);
            videoStream.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            api.setMessageReaction("✅", event.messageID, () => {}, true);

            // ৩. মেসেঞ্জারে পাঠানো
            return message.reply({
                body: `🔥 **Anime Edit:** ${query.toUpperCase()} ✨`,
                attachment: fs.createReadStream(videoPath)
            }, () => {
                if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            });

        } catch (err) {
            console.error("Anivid API Error:", err.message);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);
            return message.reply("❌ ভিডিও স্ট্রিম করতে সমস্যা হয়েছে, আবার কমান্ড দে!");
        }
    }
};
