const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
    config: {
        name: "anivid",
        aliases: ["ar", "ansr", "an"],
        version: "5.0",
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

            // Step 1: Search on YouTube Shorts / Anime Edits using standard Piped Search
            const searchQuery = encodeURIComponent(`${query} anime edit shorts`);
            const searchRes = await axios.get(`https://pipedapi.kavin.rocks/search?q=${searchQuery}&filter=shorts`, {
                timeout: 10000
            });

            if (!searchRes.data || !searchRes.data.items || searchRes.data.items.length === 0) {
                api.setMessageReaction("❌", event.messageID, () => {}, true);
                return message.reply(`× No anime edit videos found for "${query}"!`);
            }

            // Pick a random video from the search results
            const items = searchRes.data.items.filter(item => item.type === "stream");
            if (items.length === 0) {
                api.setMessageReaction("❌", event.messageID, () => {}, true);
                return message.reply(`× Could not retrieve videos for "${query}".`);
            }

            const selectedVideo = items[Math.floor(Math.random() * items.length)];
            const videoId = selectedVideo.url.replace("/watch?v=", "");

            // Step 2: Fetch Direct Video Stream
            const streamRes = await axios.get(`https://pipedapi.kavin.rocks/streams/${videoId}`, {
                timeout: 15000
            });

            const videoStreams = streamRes.data.videoStreams;
            // Get best quality mp4 stream that has audio or fallback to combined stream
            const streamObj = videoStreams.find(s => s.mimeType.includes("mp4") && s.videoOnly === false) || videoStreams[0];

            if (!streamObj || !streamObj.url) {
                throw new Error("Failed to extract valid stream URL.");
            }

            // Step 3: Stream and download the video file
            const writer = fs.createWriteStream(videoPath);
            const response = await axios({
                method: "get",
                url: streamObj.url,
                responseType: "stream",
                timeout: 60000
            });

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
            return message.reply(`× Error fetching video: ${err.message || "Please try again later."}`);
        }
    }
};
