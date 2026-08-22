const Canvas = require("canvas");
const { uploadZippyshare, randomString } = global.utils;

const defaultFontName = "BeVietnamPro-SemiBold";
const defaultPathFontName = `${__dirname}/assets/font/BeVietnamPro-SemiBold.ttf`;
const percentage = total => total / 100;

Canvas.registerFont(`${__dirname}/assets/font/BeVietnamPro-Bold.ttf`, {
	family: "BeVietnamPro-Bold"
});
Canvas.registerFont(defaultPathFontName, {
	family: defaultFontName
});

let deltaNext;
const expToLevel = (exp, deltaNextLevel = deltaNext) => Math.floor((1 + Math.sqrt(1 + 8 * exp / deltaNextLevel)) / 2);
const levelToExp = (level, deltaNextLevel = deltaNext) => Math.floor(((Math.pow(level, 2) - level) * deltaNextLevel) / 2);
global.client.makeRankCard = makeRankCard;

module.exports = {
	config: {
		name: "bankrank",
		version: "2.0",
		author: "NTKhang & Restyled for Bank Theme",
		countDown: 5,
		role: 0,
		description: {
			vi: "Xem thẻ ব্যাংক VIP/Level của bạn",
			en: "View your Bank Tier & Balance Level Card"
		},
		category: "bank",
		guide: {
			vi: "   {pn} [để trống | @tags]",
			en: "   {pn} [empty | @tags]"
		},
		envConfig: {
			deltaNext: 5
		}
	},

	onStart: async function ({ message, event, usersData, threadsData, commandName, envCommands, api }) {
		deltaNext = envCommands[commandName].deltaNext;
		let targetUsers;
		const arrayMentions = Object.keys(event.mentions);

		if (arrayMentions.length == 0)
			targetUsers = [event.senderID];
		else
			targetUsers = arrayMentions;

		const rankCards = await Promise.all(targetUsers.map(async userID => {
			const rankCard = await makeRankCard(userID, usersData, threadsData, event.threadID, deltaNext, api);
			rankCard.path = `${randomString(10)}.png`;
			return rankCard;
		}));

		return message.reply({
			attachment: rankCards
		});
	},

	onChat: async function ({ usersData, event }) {
		let { exp } = await usersData.get(event.senderID);
		if (isNaN(exp) || typeof exp != "number")
			exp = 0;
		try {
			await usersData.set(event.senderID, {
				exp: exp + 1
			});
		}
		catch (e) { }
	}
};

const defaultDesignCard = {
	widthCard: 2000,
	heightCard: 1100, // Credit card proportion
	main_color: ["#0f2027", "#203a43", "#2c5364"], // Bank Dark Metallic Gradient
	sub_color: "rgba(255, 255, 255, 0.08)",
	exp_color: "#f2994a", // Gold Accent
	expNextLevel_color: "rgba(255, 255, 255, 0.2)",
	text_color: "#ffffff"
};

async function makeRankCard(userID, usersData, threadsData, threadID, deltaNext, api = global.GoatBot.fcaApi) {
	const { exp } = await usersData.get(userID);
	const levelUser = expToLevel(exp, deltaNext);

	const expNextLevel = levelToExp(levelUser + 1, deltaNext) - levelToExp(levelUser, deltaNext);
	const currentExp = expNextLevel - (levelToExp(levelUser + 1, deltaNext) - exp);

	const allUser = await usersData.getAll();
	allUser.sort((a, b) => b.exp - a.exp);
	const rank = allUser.findIndex(user => user.userID == userID) + 1;

	const dataLevel = {
		exp: currentExp,
		expNextLevel,
		name: allUser[rank - 1].name || "VALUED CUSTOMER",
		rank: `#${rank}`,
		totalUsers: allUser.length,
		level: levelUser,
		avatar: await usersData.getAvatarUrl(userID)
	};

	const image = new BankRankCard({
		...defaultDesignCard,
		...dataLevel
	});
	return await image.buildCard();
}

class BankRankCard {
	constructor(options) {
		this.widthCard = 2000;
		this.heightCard = 1100;
		this.main_color = ["#0f2027", "#203a43", "#2c5364"];
		this.sub_color = "rgba(255, 255, 255, 0.08)";
		this.exp_color = "#f2994a";
		this.expNextLevel_color = "rgba(255, 255, 255, 0.2)";
		this.text_color = "#ffffff";
		this.fontName = "BeVietnamPro-Bold";

		for (const key in options)
			this[key] = options[key];
	}

	async buildCard() {
		const { widthCard, heightCard, exp, expNextLevel, name, level, rank, totalUsers, avatar } = this;
		const canvas = Canvas.createCanvas(widthCard, heightCard);
		const ctx = canvas.getContext("2d");

		// 1. Background Card Design (Metallic Dark Gradient)
		const gradient = ctx.createLinearGradient(0, 0, widthCard, heightCard);
		gradient.addColorStop(0, "#0f2027");
		gradient.addColorStop(0.5, "#203a43");
		gradient.addColorStop(1, "#2c5364");
		ctx.fillStyle = gradient;
		drawRoundedRect(ctx, 40, 40, widthCard - 80, heightCard - 80, 50, true);

		// Gold Border Accent
		ctx.lineWidth = 6;
		ctx.strokeStyle = "#f2994a";
		drawRoundedRect(ctx, 40, 40, widthCard - 80, heightCard - 80, 50, false, true);

		// 2. Bank Header / Logo Text
		ctx.fillStyle = "#f2994a";
		ctx.font = `60px ${this.fontName}`;
		ctx.textAlign = "left";
		ctx.fillText("VIP BANKING", 120, 140);

		ctx.fillStyle = "#ffffff";
		ctx.font = `35px ${this.fontName}`;
		ctx.fillText("PREMIUM CREDIT CARD", 120, 190);

		// 3. EMV Gold Chip Visual
		drawChip(ctx, 120, 260, 180, 130);

		// 4. Contactless Symbol
		drawContactlessSymbol(ctx, 350, 325);

		// 5. User Avatar (Positioned like Hologram/Photo on Card)
		const avatarSize = 260;
		const avatarX = widthCard - 120 - avatarSize;
		const avatarY = 120;
		
		ctx.save();
		ctx.beginPath();
		ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2, 0, Math.PI * 2);
		ctx.clip();
		const avatarImg = await Canvas.loadImage(avatar);
		ctx.drawImage(avatarImg, avatarX, avatarY, avatarSize, avatarSize);
		ctx.restore();

		// Avatar Outer Ring
		ctx.lineWidth = 8;
		ctx.strokeStyle = "#f2994a";
		ctx.beginPath();
		ctx.arc(avatarX + avatarSize / 2, avatarY + avatarSize / 2, avatarSize / 2 + 4, 0, Math.PI * 2);
		ctx.stroke();

		// 6. Fake Credit Card Number (Format: LEVEL - RANK - EXP)
		const formattedCardNumber = `4582 •••• ${String(level).padStart(4, '0')} ${String(exp).padStart(4, '0')}`;
		ctx.fillStyle = "#e0e0e0";
		ctx.font = `65px monospace`;
		ctx.textAlign = "left";
		ctx.fillText(formattedCardNumber, 120, 480);

		// 7. Balance / Experience Progress Bar
		const barX = 120;
		const barY = 560;
		const barWidth = widthCard - 240;
		const barHeight = 40;
		const progress = Math.min(exp / expNextLevel, 1);

		// Background Progress Track
		ctx.fillStyle = "rgba(255, 255, 255, 0.15)";
		drawRoundedRect(ctx, barX, barY, barWidth, barHeight, 20, true);

		// Active Progress Fill (Gold Gradient)
		const goldGrad = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
		goldGrad.addColorStop(0, "#f2994a");
		goldGrad.addColorStop(1, "#f2c94c");
		ctx.fillStyle = goldGrad;
		drawRoundedRect(ctx, barX, barY, Math.max(barWidth * progress, 40), barHeight, 20, true);

		// 8. Cardholder Name & Bank Details Grid
		// NAME
		ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
		ctx.font = `30px ${this.fontName}`;
		ctx.fillText("CARD HOLDER", 120, 680);

		ctx.fillStyle = "#ffffff";
		ctx.font = `55px ${this.fontName}`;
		ctx.fillText(name.toUpperCase(), 120, 750);

		// ACCOUNT TIER (LEVEL)
		ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
		ctx.font = `30px ${this.fontName}`;
		ctx.fillText("ACCOUNT TIER", 850, 680);

		ctx.fillStyle = "#f2c94c";
		ctx.font = `50px ${this.fontName}`;
		ctx.fillText(`TIER ${level} (GOLD)`, 850, 750);

		// GLOBAL RANK
		ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
		ctx.font = `30px ${this.fontName}`;
		ctx.fillText("GLOBAL RANK", 1450, 680);

		ctx.fillStyle = "#ffffff";
		ctx.font = `50px ${this.fontName}`;
		ctx.fillText(`${rank} / ${totalUsers}`, 1450, 750);

		// 9. EXP Balance Details
		ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
		ctx.font = `32px ${this.fontName}`;
		ctx.fillText("CREDIT BALANCE (EXP)", 120, 860);

		ctx.fillStyle = "#ffffff";
		ctx.font = `45px ${this.fontName}`;
		ctx.fillText(`${exp.toLocaleString()} / ${expNextLevel.toLocaleString()} PTS`, 120, 930);

		// 10. Card Brand Logo (Visa/Mastercard style overlap circles)
		drawCardBrandLogo(ctx, widthCard - 240, heightCard - 200);

		return canvas.createPNGStream();
	}
}

// Helper Functions for Drawing Bank Elements
function drawRoundedRect(ctx, x, y, width, height, radius, fill = true, stroke = false) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.lineTo(x + width - radius, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
	ctx.lineTo(x + width, y + height - radius);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
	ctx.lineTo(x + radius, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
	ctx.lineTo(x, y + radius);
	ctx.quadraticCurveTo(x, y, x + radius, y);
	ctx.closePath();
	if (fill) ctx.fill();
	if (stroke) ctx.stroke();
}

function drawChip(ctx, x, y, w, h) {
	ctx.fillStyle = "#d4af37"; // Gold Chip Base
	drawRoundedRect(ctx, x, y, w, h, 20, true);
	ctx.strokeStyle = "#8a7322";
	ctx.lineWidth = 3;
	drawRoundedRect(ctx, x + 15, y + 15, w - 30, h - 30, 10, false, true);

	ctx.beginPath();
	ctx.moveTo(x + w / 2, y + 15);
	ctx.lineTo(x + w / 2, y + h - 15);
	ctx.moveTo(x + 15, y + h / 2);
	ctx.lineTo(x + w - 15, y + h / 2);
	ctx.stroke();
}

function drawContactlessSymbol(ctx, x, y) {
	ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
	ctx.lineWidth = 5;
	for (let i = 1; i <= 3; i++) {
		ctx.beginPath();
		ctx.arc(x, y, i * 15, -Math.PI / 4, Math.PI / 4, false);
		ctx.stroke();
	}
}

function drawCardBrandLogo(ctx, x, y) {
	ctx.globalAlpha = 0.85;
	ctx.fillStyle = "#eb001b";
	ctx.beginPath();
	ctx.arc(x, y, 60, 0, Math.PI * 2);
	ctx.fill();

	ctx.fillStyle = "#f79e1b";
	ctx.beginPath();
	ctx.arc(x + 70, y, 60, 0, Math.PI * 2);
	ctx.fill();
	ctx.globalAlpha = 1.0;
}
