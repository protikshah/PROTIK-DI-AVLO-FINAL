const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "anivid",
        aliases: ["ar", "anisr", "animevid"],
        version: "15.0",
        author: "Pratik Shah",
        countDown: 5,
        role: 0,
        description: {
            en: "Download and send anime edits as video attachments"
        },
        category: "anime",
        guide: {
            en: "{pn} <anime name>"
        }
    },

    onStart: async function ({ api, event, args, message }) {
        const query = args.join(" ");
        if (!query) return message.reply("❌ Give me an anime name!");

        api.setMessageReaction("⏳", event.messageID, () => {}, true);

        try {
            // ১. বিং থেকে লিংক খোঁজা
            const searchUrl = `https://www.bing.com/videos/search?q=${encodeURIComponent(query + " anime edit tiktok")}`;
            const response = await axios.get(searchUrl, {
                headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
            });
            const regex = /murl&quot;:&quot;(https:\/\/www\.tiktok\.com\/.*?\/video\/\d+)/g;
            const match = response.data.match(regex);
            if (!match) throw new Error("No video found");
            const tiktokUrl = match[0].split('quot;')[2];

            // ২. TikWM API দিয়ে ভিডিওর সরাসরি MP4 ডাউনলোড লিংক বের করা
            const tikwm = await axios.get(`https://www.tikwm.com/api/?url=${tiktokUrl}`);
            const videoUrl = tikwm.data.data.play;

            // ৩. ভিডিও ফাইল ডাউনলোড করা
            const cacheDir = path.join(__dirname, "cache");
            fs.ensureDirSync(cacheDir);
            const videoPath = path.join(cacheDir, `video_${event.senderID}.mp4`);
            
            const videoStream = await axios({
                method: "get",
                url: videoUrl,
                responseType: "stream"
            });

            const writer = fs.createWriteStream(videoPath);
            videoStream.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            // ৪. ভিডিও ফাইল পাঠানো
            api.setMessageReaction("✅", event.messageID, () => {}, true);
            await message.reply({
                body: `🔥 **Here is your edit for ${query.toUpperCase()}!**`,
                attachment: fs.createReadStream(videoPath)
            });

            // ক্লিনআপ
            if (fs.existsSync(videoPath)) fs.unlinkSync(videoPath);

        } catch (err) {
            console.error(err);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
            return message.reply("❌ Could not download video. Try another name.");
        }
    }
};
