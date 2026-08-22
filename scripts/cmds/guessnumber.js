const { randomString, getTime, convertTime } = global.utils;
const { createCanvas } = require('canvas');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userID: { type: String, required: true, unique: true },
    wallet: { type: Number, default: 1000 },
    guessNumberStats: {
        points: { type: Number, default: 0 },
        wins: [{ col: Number, timeSuccess: Number, date: String }],
        losses: [{ col: Number, timeSuccess: Number, date: String }]
    }
});

const User = mongoose.models.BankUser || mongoose.model('BankUser', userSchema);

const rows = [
    { col: 4, row: 10, rewardPoint: 1 },
    { col: 5, row: 12, rewardPoint: 2 },
    { col: 6, row: 15, rewardPoint: 3 }
];

module.exports = {
    config: {
        name: "guessnumber",
        aliases: ["guessnum"],
        version: "2.0",
        author: "Protik Shah",
        countDown: 5,
        role: 0,
        description: {
            vi: "Game đoán số kết nối Royal Vault",
            en: "Guess number game connected to Royal Vault"
        },
        category: "games",
        guide: {
            en: "  {pn} [4 | 5 | 6] [single | multi]\n  {pn} rank\n  {pn} info\n  {pn} reset"
        }
    },

    langs: {
        en: {
            noScore: "╔══ [ ❌ ɴᴏ sᴄᴏʀᴇ ] ══╗\n  ᴛʜᴇʀᴇ ɪs ɴᴏ ᴏɴᴇ ɪɴ ᴛʜᴇ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ ʏᴇᴛ!\n╚═════════════════════╝",
            noPermissionReset: "╔══ [ ❌ ᴅᴇɴɪᴇᴅ ] ══╗\n  ᴏɴʟʏ ʙᴏᴛ ᴀᴅᴍɪɴs ᴄᴀɴ ʀᴇsᴇᴛ ᴛʜᴇ ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ!\n╚═════════════════════╝",
            notFoundUser: "╔══ [ ❌ ɴᴏᴛ ғᴏᴜɴᴅ ] ══╗\n  ᴄᴏᴜʟᴅ ɴᴏᴛ ғɪɴᴅ ᴜsᴇʀ ᴅᴀᴛᴀ ɪɴ ᴛʜᴇ ᴠᴀᴜʟᴛ.\n╚═══════════════════════╝",
            resetRankSuccess: "╔══ [ ✅ sᴜᴄᴄᴇss ] ══╗\n  ʟᴇᴀᴅᴇʀʙᴏᴀʀᴅ ʜᴀs ʙᴇᴇɴ ʀᴇsᴇᴛ sᴜᴄᴄᴇssғᴜʟʟʏ.\n╚══════════════════════╝",
            invalidCol: "╔══ [ ❌ ɪɴᴠᴀʟɪᴅ ᴅɪɢɪᴛs ] ══╗\n  ᴘʟᴇᴀsᴇ ᴄʜᴏᴏsᴇ 4, 5, ᴏʀ 6 ᴅɪɢɪᴛs!\n╚══════════════════════════╝",
            created: "╔══ [ 🎮 ɢᴀᴍᴇ ᴄʀᴇᴀᴛᴇᴅ ] ══╗\n  ɢᴜᴇss ᴛʜᴇ %1-ᴅɪɢɪᴛ ɴᴜᴍʙᴇʀ! ʏᴏᴜ ʜᴀᴠᴇ %2 ᴛʀɪᴇs.\n╚══════════════════════════╝",
            invalidNumbers: "╔══ [ ❌ ɪɴᴠᴀʟɪᴅ ɪɴᴘᴜᴛ ] ══╗\n  ᴘʟᴇᴀsᴇ ᴇɴᴛᴇʀ ᴇxᴀᴄᴛʟʏ %1 ᴅɪɢɪᴛs.\n╚══════════════════════════╝",
            win: "🎉 ᴄᴏɴɢʀᴀᴛᴜʟᴀᴛɪᴏɴs! ʏᴏᴜ ɢᴜᴇssᴇᴅ %1 ɪɴ %2 ᴛʀɪᴇs ᴀɴᴅ ᴇᴀʀɴᴇᴅ +%3 ᴠᴀᴜʟᴛ ᴘᴏɪɴᴛs!",
            loss: "🤦‍♂️ ɢᴀᴍᴇ ᴏᴠᴇʀ! ᴛʜᴇ ᴄᴏʀʀᴇᴄᴛ ɴᴜᴍʙᴇʀ ᴡᴀs %1."
        }
    },

    onStart: async function ({ message, event, getLang, commandName, args, usersData, role }) {
        const BANK_NAME = "🏛️ ᴅɪ-ᴀʙʟᴏ ᴊɪ-sᴏᴏ ʀᴏʏᴀʟ ᴠᴀᴜʟᴛ 🏛️";

        if (args[0] == "rank") {
            const users = await User.find({ "guessNumberStats.points": { $gt: 0 } }).sort({ "guessNumberStats.points": -1 }).limit(30);
            if (!users.length) return message.reply(getLang("noScore"));

            const medals = ["🥇", "🥈", "🥉"];
            let rankText = "";
            
            for (let i = 0; i < users.length; i++) {
                const u = users[i];
                const userName = await usersData.getName(u.userID);
                const medal = medals[i] || `${i + 1}.`;
                const wins = u.guessNumberStats.wins?.length || 0;
                const losses = u.guessNumberStats.losses?.length || 0;
                const pts = u.guessNumberStats.points || 0;
                rankText += `  ${medal} ${userName} • ${pts} ᴘᴛs (${wins}ᴡ/${losses}ʟ)\n`;
            }

            return message.reply(
                `╔════════════════════════════════╗\n` +
                `      🏆 ɢᴜᴇss ɴᴜᴍʙᴇʀ ʀᴀɴᴋɪɴɢ 🏆\n` +
                `╠════════════════════════════════╣\n` +
                `${rankText}` +
                `╠════════════════════════════════╣\n` +
                `  🏦 ${BANK_NAME}\n` +
                `╚════════════════════════════════╝`
            );
        }

        if (args[0] == "info") {
            let targetID = event.senderID;
            if (Object.keys(event.mentions).length) targetID = Object.keys(event.mentions)[0];
            else if (event.messageReply) targetID = event.messageReply.senderID;
            else if (!isNaN(args[1])) targetID = args[1];

            const user = await User.findOne({ userID: targetID });
            if (!user || !user.guessNumberStats) return message.reply(getLang("notFoundUser"));

            const userName = await usersData.getName(targetID);
            const stats = user.guessNumberStats;
            const winNumber = stats.wins?.length || 0;
            const lossNumber = stats.losses?.length || 0;
            const playNumber = winNumber + lossNumber;
            const winRate = playNumber > 0 ? ((winNumber / playNumber) * 100).toFixed(1) : "0.0";
            
            const totalPlayTime = (stats.wins?.reduce((a, b) => a + b.timeSuccess, 0) || 0) + 
                                  (stats.losses?.reduce((a, b) => a + b.timeSuccess, 0) || 0);

            return message.reply(
                `╔════════════════════════════════╗\n` +
                `      🏆 ᴘʟᴀʏᴇʀ ᴠᴀᴜʟᴛ sᴛᴀᴛs 🏆\n` +
                `╠════════════════════════════════╣\n` +
                `  👤 ᴘʟᴀʏᴇʀ   : ${userName}\n` +
                `  ⭐ ᴘᴏɪɴᴛs   : ${stats.points || 0}\n` +
                `  🎮 ᴛᴏᴛᴀʟ    : ${playNumber} ɢᴀᴍᴇs\n` +
                `  🥇 ᴡɪɴs     : ${winNumber}\n` +
                `  💀 ʟᴏssᴇs   : ${lossNumber}\n` +
                `  📈 ᴡɪɴ ʀᴀᴛᴇ  : ${winRate}%\n` +
                `  ⏱️ ᴘʟᴀʏ ᴛɪᴍᴇ : ${convertTime(totalPlayTime)}\n` +
                `╠════════════════════════════════╣\n` +
                `  🏦 ${BANK_NAME}\n` +
                `╚════════════════════════════════╝`
            );
        }

        if (args[0] == "reset") {
            if (role < 2) return message.reply(getLang("noPermissionReset"));
            await User.updateMany({}, { $set: { "guessNumberStats.points": 0, "guessNumberStats.wins": [], "guessNumberStats.losses": [] } });
            return message.reply(getLang("resetRankSuccess"));
        }

        const col = parseInt(args.join(" ").match(/(\d+)/)?.[1] || 4);
        const levelOfDifficult = rows.find(item => item.col == col);
        if (!levelOfDifficult) return message.reply(getLang("invalidCol"));
        
        const mode = args.join(" ").match(/(single|multi|-s|-m)/)?.[1] || "single";
        const row = levelOfDifficult.row || 10;

        const options = {
            col,
            row,
            timeStart: parseInt(getTime("x")),
            numbers: [],
            tryNumber: 0,
            ctx: null,
            canvas: null,
            answer: randomString(col, true, "0123456789"),
            gameName: "GUESS NUMBER GAME",
            gameGuide: `You have ${row} guesses.\nHints: Correct digits (Left) | Correct spot (Right).`,
            gameNote: "Digits 0-9, unique numbers, can start with 0."
        };

        const gameData = guessNumberGame(options);
        gameData.mode = mode;

        const messageData = message.reply(`${getLang("created", col, row)}\n\n🎮 Reply to the board below with ${col} digits to guess!`);
        gameData.messageData = messageData;

        message.reply({
            attachment: gameData.imageStream
        }, (err, info) => {
            global.GoatBot.onReply.set(info.messageID, {
                commandName,
                messageID: info.messageID,
                author: event.senderID,
                gameData
            });
        });
    },

    onReply: async ({ message, Reply, event, getLang, commandName }) => {
        const { gameData: oldGameData } = Reply;
        if (event.senderID != Reply.author && oldGameData.mode == "single") return;

        const numbers = (event.body || "").split("").map(item => item.trim()).filter(item => item != "" && !isNaN(item));
        if (numbers.length != oldGameData.col) return message.reply(getLang("invalidNumbers", oldGameData.col));
        global.GoatBot.onReply.delete(Reply.messageID);

        oldGameData.numbers = numbers;
        const gameData = guessNumberGame(oldGameData);

        if (gameData.isWin == null) {
            message.reply({
                attachment: gameData.imageStream
            }, (err, info) => {
                message.unsend(Reply.messageID);
                global.GoatBot.onReply.set(info.messageID, {
                    commandName,
                    messageID: info.messageID,
                    author: event.senderID,
                    gameData
                });
            });
        } else {
            const rewardPoint = rows.find(item => item.col == gameData.col)?.rewardPoint || 0;
            const messageText = gameData.isWin ?
                getLang("win", gameData.answer, gameData.tryNumber - 1, rewardPoint) :
                getLang("loss", gameData.answer);

            message.unsend((await oldGameData.messageData).messageID);
            message.unsend(Reply.messageID);
            message.reply({
                body: messageText,
                attachment: gameData.imageStream
            });

            // MongoDB Database Permanent Update
            let user = await User.findOne({ userID: event.senderID }) || await User.create({ userID: event.senderID });
            if (!user.guessNumberStats) {
                user.guessNumberStats = { points: 0, wins: [], losses: [] };
            }

            const data = {
                col: gameData.col,
                timeSuccess: parseInt(getTime("x") - oldGameData.timeStart),
                date: getTime()
            };

            if (gameData.isWin === true) {
                user.guessNumberStats.wins.push(data);
                user.guessNumberStats.points += rewardPoint;
            } else {
                user.guessNumberStats.losses.push(data);
            }

            await user.save();
        }
    }
};

function wrapTextGetHeight(ctx, text, maxWidth, lineHeight, margin = 0) {
    const lines = text.split('\n');
    let height = 0;
    let count = 0;
    for (let i = 0; i < lines.length; i++) {
        let line = '';
        const words = lines[i].split(' ');
        for (let n = 0; n < words.length; n++) {
            const textLine = line + words[n] + ' ';
            const textWidth = ctx.measureText(textLine).width;
            if (textWidth > maxWidth && n > 0) {
                line = words[n] + ' ';
                height += lineHeight;
                count++;
            } else {
                line = textLine;
            }
        }
        height += lineHeight;
        count++;
    }
    return height + margin * count;
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
    const yStart = y;
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
        let line = '';
        const words = lines[i].split(' ');
        for (let n = 0; n < words.length; n++) {
            const textLine = line + words[n] + ' ';
            const metrics = ctx.measureText(textLine);
            const textWidth = metrics.width;
            if (textWidth > maxWidth && n > 0) {
                ctx.fillText(line, x, y);
                line = words[n] + ' ';
                y += lineHeight;
            } else {
                line = textLine;
            }
        }
        ctx.fillText(line, x, y);
        y += lineHeight;
    }
    return y - yStart;
}

function drawBorderSquareRadius(ctx, x, y, width, height, radius = 5, lineWidth = 1, strokeStyle = '#000', fill) {
    ctx.save();
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
    if (fill) {
        ctx.fillStyle = strokeStyle;
        ctx.fill();
    } else {
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
    }
    ctx.restore();
}

function drawWrappedText(ctx, text, startY, wrapWidth, lineHeight, boldFirstLine, margin, marginText) {
    const splitText = text.split('\n');
    let y = startY;
    for (let i = 0; i < splitText.length; i++) {
        if (i === 0 && boldFirstLine) ctx.font = `bold ${ctx.font}`;
        else ctx.font = ctx.font.replace('bold ', '');
        const height = wrapText(ctx, splitText[i], margin / 2, y, wrapWidth, lineHeight);
        y += height + marginText;
    }
    return y;
}

function getPositionOfSquare(x, y, sizeOfOneSquare, distance, marginX, marginY, lineWidth, heightGameName) {
    const xOutSide = marginX + x * (sizeOfOneSquare + distance) + lineWidth / 2;
    const yOutSide = marginY + y * (sizeOfOneSquare + distance) + lineWidth / 2 + heightGameName;
    const xInSide = xOutSide + lineWidth;
    const yInSide = yOutSide + lineWidth;

    return { xOutSide, yOutSide, xInSide, yInSide };
}

function guessNumberGame(options) {
    let { numbers, ctx, canvas, tryNumber, row, ctxNumbers, canvasNumbers, ctxHightLight, canvasHightLight } = options;
    const { col, answer, gameName, gameGuide, gameNote } = options;
    tryNumber--;
    if (Array.isArray(numbers)) numbers = numbers.map(item => item.toString().trim());
    if (typeof numbers == 'string') numbers = numbers.split('').map(item => item.trim());

    if (numbers.length) options.allGuesss ? options.allGuesss.push(numbers) : options.allGuesss = [numbers];

    row = row || 10;

    const heightGameName = 40;
    const yGameName = 150;
    const sizeOfOneSquare = 100;
    const lineWidth = 6;
    const radius = 10;
    const distance = 10;
    const marginX = 150;
    const marginY = 100;
    const backgroundColor = '#F0F2F5';

    const fontGameGuide = '35px "Arial"';
    const fontGameName = 'bold 50px "Arial"';
    const fontNumbers = 'bold 60px "Arial"';
    const fontSuggest = 'bold 40px "Arial"';
    const fontResultWin = 'bold 150px "Times New Roman"';
    const fontResultLose = 'bold 150px "Arial"';
    const marginText = 2.9;
    const lineHeightGuideText = 38;

    if (!ctx && !canvas) {
        const xCanvas = col * sizeOfOneSquare + (col - 1) * distance + marginX * 2;
        canvas = createCanvas(1, 1);
        ctx = canvas.getContext('2d');
        ctx.font = fontGameGuide;

        const heightGameGuide = wrapTextGetHeight(ctx, gameGuide, xCanvas - marginX, lineHeightGuideText, marginText);
        const heightGameNote = wrapTextGetHeight(ctx, gameNote, xCanvas - marginX, lineHeightGuideText, marginText);
        const marginGuideNote = 10;

        canvas = createCanvas(
            col * sizeOfOneSquare + (col - 1) * distance + marginX * 2,
            heightGameName + row * sizeOfOneSquare + (row - 1) * distance + marginY * 2 + heightGameGuide + heightGameNote + marginGuideNote
        );
        ctx = canvas.getContext('2d');
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.font = fontGameName;
        ctx.fillStyle = '#404040';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(gameName, canvas.width / 2, yGameName / 2);

        ctx.font = fontGameGuide;
        ctx.fillStyle = '#404040';
        ctx.textAlign = 'left';
        const yGuide = heightGameName + marginY / 2 + row * (sizeOfOneSquare + distance) + marginY / 2 + lineHeightGuideText * 2;

        const yNote = drawWrappedText(ctx, gameGuide, yGuide, canvas.width - marginX, lineHeightGuideText, true, marginX, marginText);

        drawWrappedText(ctx, gameNote, yNote + 10, canvas.width - marginX, lineHeightGuideText, true, marginX, marginText);

        for (let i = 0; i < col; i++) {
            for (let j = 0; j < row; j++) {
                const { xOutSide, yOutSide, xInSide, yInSide } = getPositionOfSquare(i, j, sizeOfOneSquare, distance, marginX, marginY, lineWidth, heightGameName);
                drawBorderSquareRadius(ctx, xOutSide, yOutSide, sizeOfOneSquare, sizeOfOneSquare, radius, lineWidth, '#919191', true);
                drawBorderSquareRadius(ctx, xInSide, yInSide, sizeOfOneSquare - lineWidth * 2, sizeOfOneSquare - lineWidth * 2, radius / 2, lineWidth, backgroundColor, true);
            }
        }
    }

    if (!canvasHightLight) {
        canvasHightLight = createCanvas(canvas.width, canvas.height);
        ctxHightLight = canvasHightLight.getContext('2d');
        canvasNumbers = createCanvas(canvas.width, canvas.height);
        ctxNumbers = canvasNumbers.getContext('2d');
    }

    let isWin = null;
    if (numbers.length) {
        ctxNumbers.font = fontNumbers;
        ctxNumbers.fillStyle = '#f0f0f0';
        ctxNumbers.textAlign = 'center';
        ctxNumbers.textBaseline = 'middle';
        for (let i = 0; i < col; i++) {
            const { xOutSide, yOutSide, xInSide, yInSide } = getPositionOfSquare(i, tryNumber, sizeOfOneSquare, distance, marginX, marginY, lineWidth, heightGameName);
            drawBorderSquareRadius(ctx, xInSide, yInSide, sizeOfOneSquare - lineWidth * 2, sizeOfOneSquare - lineWidth * 2, radius / 2, lineWidth, '#a3a3a3', true);
            
            const x = xOutSide + sizeOfOneSquare / 2;
            const y = yOutSide + sizeOfOneSquare / 2;
            ctxNumbers.fillText(numbers[i], x, y);

            if (answer.includes(numbers[i]) || numbers[i] === answer[i]) {
                drawBorderSquareRadius(ctxHightLight, xOutSide, yOutSide, sizeOfOneSquare, sizeOfOneSquare, radius, lineWidth, numbers[i] == answer[i] ? '#417642' : '#A48502', true);
                drawBorderSquareRadius(ctxHightLight, xInSide, yInSide, sizeOfOneSquare - lineWidth * 2, sizeOfOneSquare - lineWidth * 2, radius / 2, lineWidth, numbers[i] == answer[i] ? '#57AC58' : '#E9BE00', true);
            }
        }

        let numberRight = 0;
        let numberRightPosition = 0;
        answer.split('').forEach((item, index) => {
            if (numbers.includes(item)) numberRight++;
            if (item == numbers[index]) numberRightPosition++;
        });

        ctx.font = fontSuggest;
        ctx.fillText(numberRight, marginX / 2, marginY + sizeOfOneSquare / 2 + heightGameName + tryNumber * (sizeOfOneSquare + distance));
        ctx.fillText(numberRightPosition, marginX + col * (sizeOfOneSquare) + distance * (col - 1) + marginX / 2, marginY + sizeOfOneSquare / 2 + heightGameName + tryNumber * (sizeOfOneSquare + distance));

        if ((numberRight == answer.length && numberRightPosition == answer.length) || tryNumber + 1 == row) {
            isWin = numberRight == answer.length && numberRightPosition == answer.length;
            ctx.save();
            ctx.drawImage(canvasHightLight, 0, 0);
            ctx.drawImage(canvasNumbers, 0, 0);

            ctx.font = isWin ? fontResultWin : fontResultLose;
            ctx.fillStyle = isWin ? '#005900' : '#590000';
            ctx.globalAlpha = 0.4;
            ctx.translate(canvas.width / 2, marginY + heightGameName + (row * (sizeOfOneSquare + distance)) / 2);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.rotate(-45 * Math.PI / 180);
            ctx.fillText(isWin ? 'YOU WIN' : answer.split('').join(' '), 0, 0);
            ctx.restore();
        } else {
            ctx.drawImage(canvasNumbers, 0, 0);
        }
    }

    tryNumber++;
    const imageStream = canvas.createPNGStream();
    imageStream.path = `guessNumber${Date.now()}.png`;

    return {
        ...options,
        imageStream,
        ctx,
        canvas,
        tryNumber: tryNumber + 1,
        isWin,
        ctxHightLight,
        canvasHightLight,
        ctxNumbers,
        canvasNumbers
    };
}
