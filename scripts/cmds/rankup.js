const deltaNext = global.GoatBot.configCommands.envCommands.rank.deltaNext;
const expToLevel = exp => Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNext)) / 2);
const { drive } = global.utils;

// ADMIN & BANK SYSTEM CONFIGURATION
const ADMIN_UID = "61591412309835";
const BANK_NAME = "DI-ABLO JI-SOO ROYAL VAULT";

module.exports = {
	config: {
		name: "rankup",
		version: "2.0",
		author: "NTKhang & Restyled for DI-ABLO JI-SOO ROYAL VAULT",
		countDown: 5,
		role: 0,
		description: {
			vi: "Bật/tắt thông báo nâng cấp thẻ BANK / VIP Tier",
			en: "Turn on/off Bank VIP Tier level up notifications"
		},
		category: "bank",
		guide: {
			en: "{pn} [on | off]"
		},
		envConfig: {
			deltaNext: 5
		}
	},

	langs: {
		vi: {
			syntaxError: "⚠️ Sai cú pháp! Sử dụng {pn} on hoặc {pn} off",
			turnedOn: "✅ Đã bật thông báo nâng cấp thẻ VIP BANK",
			turnedOff: "❌ Đã tắt thông báo nâng cấp thẻ VIP BANK",
			notiMessage: "🏦 💳 🏦"
		},
		en: {
			syntaxError: "⚠️ Invalid Syntax! Please use {pn} on or {pn} off",
			turnedOn: "✅ Enabled Bank Tier Upgrade Notifications!",
			turnedOff: "❌ Disabled Bank Tier Upgrade Notifications!",
			notiMessage: "🏦 💳 🏦"
		}
	},

	onStart: async function ({ message, event, threadsData, args, getLang }) {
		if (!["on", "off"].includes(args[0]))
			return message.reply(getLang("syntaxError"));
		await threadsData.set(event.threadID, args[0] == "on", "settings.sendRankupMessage");
		return message.reply(args[0] == "on" ? getLang("turnedOn") : getLang("turnedOff"));
	},

	onChat: async function ({ threadsData, usersData, event, message, getLang }) {
		const threadData = await threadsData.get(event.threadID);
		const sendRankupMessage = threadData.settings.sendRankupMessage;
		if (!sendRankupMessage)
			return;
			
		const { exp } = await usersData.get(event.senderID);
		const currentLevel = expToLevel(exp);
		
		if (currentLevel > expToLevel(exp - 1)) {
			let customMessage = await threadsData.get(event.threadID, "data.rankup.message");
			let isTag = false;
			let userData;
			const formMessage = {};

			if (customMessage) {
				userData = await usersData.get(event.senderID);
				customMessage = customMessage
					.replace(/{oldRank}/g, currentLevel - 1)
					.replace(/{currentRank}/g, currentLevel);
				if (customMessage.includes("{userNameTag}")) {
					isTag = true;
					customMessage = customMessage.replace(/{userNameTag}/g, `@${userData.name}`);
				}
				else {
					customMessage = customMessage.replace(/{userName}/g, userData.name);
				}

				formMessage.body = customMessage;
			}
			else {
				userData = await usersData.get(event.senderID);
				
				// STYLISH BANK TIER UPGRADE NOTIFICATION
				formMessage.body = 
					`🏦 ━━━━━━ [ 𝑫𝑰-𝑨𝑑𝑳𝑶 𝑱𝑰-𝑺𝑶𝑶 𝑹𝑑𝒀𝑨𝑳 𝑽𝑨𝑼𝑳𝑻 ] ━━━━━━ 🏦\n\n` +
					`🎉 🎉 𝑪𝑶𝑵𝑮𝑑𝑨𝑻𝑑𝑳𝑨𝑻𝑰𝑑𝑵𝑺 🎉 🎉\n\n` +
					`👤 𝑪𝒂𝒓𝒅𝒉𝒐𝒍𝒅𝒆𝒓: ${userData.name}\n` +
					`💳 𝑵𝒆𝒘 𝑨𝒄𝒄𝒐𝒖𝒏𝒕 𝑻𝒊𝒆𝒓: 𝑻𝑰𝑬𝑑 ${currentLevel} (𝑽𝑰𝑷)\n` +
					`📈 𝑷𝒓𝒆𝒗𝒊𝒐𝒖𝒔 𝑻𝒊𝒆𝒓: 𝑻𝑰𝑬𝑑 ${currentLevel - 1}\n` +
					`🪙 𝑺𝒕𝒂𝒕𝒖𝒔: 𝑨𝒄𝒄𝒐𝒖𝒏𝒕 𝑪𝒓𝒆𝒅𝒊𝒕 & 𝑳𝒊𝒎𝒊𝒕 𝑰𝒏𝒄𝒓𝒆𝒂𝒔𝒆𝒅!\n\n` +
					`━━━━━━━━━━━━━━━━━━━━━━━━━━\n` +
					`👑 𝑩𝒂𝒏𝒌 𝑨𝒅𝒎𝒊𝒏: 61591412309835`;
			}

			if (threadData.data.rankup?.attachments?.length > 0) {
				const files = threadData.data.rankup.attachments;
				const attachments = files.reduce((acc, file) => {
					acc.push(drive.getFile(file, "stream"));
					return acc;
				}, []);
				formMessage.attachment = (await Promise.allSettled(attachments))
					.filter(({ status }) => status == "fulfilled")
					.map(({ value }) => value);
			}

			if (isTag) {
				formMessage.mentions = [{
					tag: `@${userData.name}`,
					id: event.senderID
				}];
			}

			message.reply(formMessage);
		}
	}
};
