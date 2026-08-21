const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

const baseApiUrl = async () => {
    const base = await axios.get("https://raw.githubusercontent.com/mahmudx7/HINATA/main/baseApiUrl.json");
    return base.data.mahmud;
};

module.exports = {
    config: {
        name: "anivid",
        aliases: ["ansr", "av"],
        version: "2.0",
        author: "Pratik Shah",
        countDown: 5,
        role: 0,
        description: {
            bn: "যেকোনো অ্যানিমে সার্চ করে ভিডিও ক্লিপ দেখুন"
        },
        category: "anime",
        guide: {
            bn: "{pn} <অ্যানিমের নাম বা ক্যারেক্টার>"
        }
    },

    onStart: async function ({ api, event, args, message }) {
        const kw = args.join(" ");
        if (!kw) {
            return message.reply("❌ যেকোনো অ্যানিমে বা ক্যারেক্টারের নাম লেখো! (যেমন: #anivid jin woo)");
        }

        const cacheDir = path.join(__dirname, "cache");
        fs.ensureDirSync(cacheDir);
        const videoPath = path.join(cacheDir, `anivid_${Date.now()}.mp4`);

        try {
            api.setMessageReaction("⏳", event.messageID, () => {}, true);

            const base = await baseApiUrl();
            const apiUrl = `${base}/api/anisr?search=${encodeURIComponent(kw)}`;

            const response = await axios({
                method: "get",
                url: apiUrl,
                responseType: "stream",
                timeout: 60000
            });

            const writer = fs.createWriteStream(videoPath);
            response.data.pipe(writer);

            await new Promise((resolve, reject) => {
                writer.on("finish", resolve);
                writer.on("error", reject);
            });

            if (fs.statSync(videoPath).size < 100) {
                throw new Error("ফাইল খালি বা ইনভ্যালিড।");
            }

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
            return message.reply("× ভিডিও ডাউনলোড করতে সমস্যা হয়েছে, একটু পর আবার চেষ্টা করো!");
        }
    }
};
