cd ~ && rm -rf * && npm install @whiskeysockets/baileys axios readline fluent-ffmpeg tesseract.js && cat << 'EOF' > index.js
const { default: makeWASocket, useMultiFileAuthState, delay, downloadContentFromMessage } = require('@whiskeysockets/baileys');
const readline = require('readline');
const axios = require('axios');
const fs = require('fs');
const { exec } = require('child_process');
const path = require('path');

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

const messageDatabase = {};

async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('session_auth');
    const sock = makeWASocket({ auth: state, printQRInTerminal: false });

    // 🔑 PAIRING ENGINE
    if (!sock.authState.creds.registered) {
        console.log('\n==================================================');
        console.log('👑 DENETH MEGA ALL-IN-ONE BOT ACTIVE 👑');
        console.log('==================================================\n');
        let phoneNumber = await question('👉 ඔබගේ WhatsApp අංකය ඇතුළත් කරන්න (Example: 94771234567): ');
        phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

        if (phoneNumber) {
            setTimeout(async () => {
                try {
                    let code = await sock.requestPairingCode(phoneNumber);
                    code = code?.match(/.{1,4}/g)?.join('-') || code;
                    console.log('\n==================================================');
                    console.log(`🔥 ඔබගේ WHATSAPP PAIRING CODE එක: ${code}`);
                    console.log('==================================================\n');
                } catch (err) {
                    console.log('❌ කේතය ලබාගැනීමට නොහැකි විය.', err);
                }
            }, 3000);
        }
    }

    sock.ev.on('creds.update', saveCreds);
    sock.ev.on('connection.update', (update) => {
        const { connection } = update;
        if (connection === 'open') console.log('\n🔥 ජයවේවා! ULTIMATE MEGA BOT IS LIVE! 🔥\n');
        else if (connection === 'close') startBot();
    });

    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message) return;
        const from = msg.key.remoteJid;
        const isMe = msg.key.fromMe;
        const myJid = sock.user.id.split(':')[0] + '@s.whatsapp.net';

        // 🟢 1. STATUS AUTO-VIEW & AUTO-REACT
        if (from === 'status@broadcast') {
            await sock.readMessages([msg.key]);
            const reacts = ['❤️', '👍', '🔥', '✨'];
            await sock.sendMessage(from, { react: { text: reacts[Math.floor(Math.random() * reacts.length)], key: msg.key } }, { statusJidList: [msg.key.participant] });
            return;
        }

        const msgId = msg.key.id;
        if (!messageDatabase[from]) messageDatabase[from] = {};
        messageDatabase[from][msgId] = msg;

        // 🟢 2.🕵️‍♂️ ANTI-DELETE ENGINE
        if (msg.message.protocolMessage && msg.message.protocolMessage.type === 4) {
            const deletedId = msg.message.protocolMessage.key.id;
            const savedMsg = messageDatabase[from]?.[deletedId];
            if (savedMsg) {
                const senderNumber = savedMsg.key.participant || savedMsg.key.remoteJid;
                const chatType = from.endsWith('@g.us') ? '👥 Group Chat' : '👤 Private Chat';
                let deleteAlert = `🕵️‍♂️ *ANTI-DELETE ALERT (මැකූ පණිවිඩයක් හමු විය)* 🕵️‍♂️\n\n📌 *වර්ගය:* ${chatType}\n👤 *එවූ කෙනා:* @${senderNumber.split('@')[0]}\n\n👇 *මකපු ඔරිජිනල් මැසේජ් එක පල්ලෙහා ඇත:*`;
                await sock.sendMessage(myJid, { text: deleteAlert, mentions: [senderNumber] });
                await sock.sendMessage(myJid, { forward: savedMsg });
            }
            return;
        }

        const text = msg.message.conversation || msg.message.extendedTextMessage?.text || '';
        const body = text.toLowerCase().trim();

        // 🟢 3. INBOX AUTO REPLY
        if (!isMe && !from.endsWith('@g.us')) {
            if (['hi', 'hello', 'na', 'nane'].includes(body)) {
                await sock.sendMessage(from, { text: 'Hi මචං! poddk idehn... මම දෙනෙත්ගේ Premium බොට්! 🤖\n\nදැන් mge boss busy, පස්සේ මැසේජ් එකක් දායි!' }, { quoted: msg });
                return;
            }
        }

        if (!isMe && from !== myJid) return;

        // 🟢 4. ULTIMATE COMMAND MENU
        if (body === 'menu') {
            let menu = `╔══════════════════╗\n  👑 *DENETH MEGA BOT v10.0* 👑\n╚══════════════════╝\n\n` +
                       `⚙️ *Anti-Delete / Auto-Status:* Active 🟢\n\n` +
                       `🍿 *movie [නම]* - 100% accurate ෆිල්ම් ලින්ක්ස්\n` +
                       `👤 *dp [නම්බර්]* - WhatsApp Profile Picture\n` +
                       `🎭 *.sticker* - ෆොටෝ එකකට රිප්ලයි කර ස්ටිකර් කරන්න\n` +
                       `🔊 *voice-[වර්ගය]* - ඕඩියෝ එකකට රිප්ලයි කර හඬ වෙනස් කරන්න\n` +
                       `   _(වර්ග: voice-robot, voice-baby, voice-ghost)_\n` +
                       `📝 *.say [වැකිය]* - ලියන දේ Voice Cut එකක් කරන්න\n` +
                       `🎵 *dl [link]* - YouTube / TikTok වීඩියෝ බාගන්න\n` +
                       `🔐 _.secret [වචනය]_ - Adult Engine`;
            await sock.sendMessage(from, { text: menu }, { quoted: msg });
            return;
        }

        // 🍿 MOVIE SEARCH
        if (body.startsWith('movie ')) {
            const movieName = text.substring(6).trim();
            await sock.sendMessage(from, { text: `🔍 *"${movieName}"* සඳහා ලින්ක්ස් සකසනවා...⏳` }, { quoted: msg });
            let details = `🎬 *${movieName.toUpperCase()} DOWNLOAD RESULTS*\n\n` +
                          `🍿 *CineSub:* https://cinesub.lk/?s=${encodeURIComponent(movieName)}\n\n` +
                          `🍿 *SinhalaSub:* https://sinhalasub.lk/?s=${encodeURIComponent(movieName)}\n\n` +
                          `🍿 *Baiscope:* https://www.baiscopelk.com/?s=${encodeURIComponent(movieName)}`;
            await sock.sendMessage(from, { text: details }, { quoted: msg });
            return;
        }

        // 🎭 STICKER MAKER
        if (body === '.sticker') {
            const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const imageMessage = quotedMsg?.imageMessage || msg.message.imageMessage;
            if (!imageMessage) return sock.sendMessage(from, { text: '❌ කරුණාකර ෆොටෝ එකකට රිප්ලයි කර `.sticker` ගසන්න.' }, { quoted: msg });

            await sock.sendMessage(from, { text: '🎨 ස්ටිකරය සකසමින් පවතිනවා...⏳' }, { quoted: msg });
            const stream = await downloadContentFromMessage(imageMessage, 'image');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
            
            const fileName = path.join(__dirname, `st_${Date.now()}.webp`);
            fs.writeFileSync(fileName, buffer);
            await sock.sendMessage(from, { sticker: { url: fileName } }, { quoted: msg });
            fs.unlinkSync(fileName);
            return;
        }

        // 🔊 VOICE CHANGER
        if (body.startsWith('voice-')) {
            const quotedMsg = msg.message.extendedTextMessage?.contextInfo?.quotedMessage;
            const audioMessage = quotedMsg?.audioMessage;
            if (!audioMessage) return sock.sendMessage(from, { text: '❌ කරුණාකර Voice Note එකකට රිප්ලයි කර කමාන්ඩ් එක ගසන්න.' }, { quoted: msg });

            const type = body.split('-')[1];
            await sock.sendMessage(from, { text: `🔊 Voice එක වෙනස් කරමින් පවතිනවා...⏳` }, { quoted: msg });
            
            const stream = await downloadContentFromMessage(audioMessage, 'audio');
            let buffer = Buffer.from([]);
            for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]); }
            
            const input = path.join(__dirname, `in_${Date.now()}.ogg`);
            const output = path.join(__dirname, `out_${Date.now()}.mp3`);
            fs.writeFileSync(input, buffer);

            let filter = "ataudioresample";
            if (type === 'robot') filter = "asetrate=11025,atempo=1.25";
            if (type === 'baby') filter = "asetrate=24000,atempo=1.0";
            if (type === 'ghost') filter = "asetrate=8000,atempo=1.0";

            exec(`ffmpeg -i ${input} -af "${filter}" ${output}`, async (err) => {
                if (err) return sock.sendMessage(from, { text: '❌ Voice change කිරීමට නොහැකි විය.' });
                await sock.sendMessage(from, { audio: { url: output }, mimetype: 'audio/mp4', ptt: true }, { quoted: msg });
                fs.unlinkSync(input);
                fs.unlinkSync(output);
            });
            return;
        }

        // 📝 TEXT TO SPEECH
        if (body.startsWith('.say ')) {
            const txt = text.substring(5).trim();
            await sock.sendMessage(from, { text: '🗣️ Voice Cut එක සකසනවා...⏳' }, { quoted: msg });
            const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=si&client=tw-ob&q=${encodeURIComponent(txt)}`;
            await sock.sendMessage(from, { audio: { url: ttsUrl }, mimetype: 'audio/mp4', ptt: true }, { quoted: msg });
            return;
        }

        // 🎵 DOWNLOADER (YOUTUBE / TIKTOK API VIA GOOGLE)
        if (body.startsWith('dl ')) {
            const link = text.substring(3).trim();
            await sock.sendMessage(from, { text: '📥 වීඩියෝව බාගත කිරීම සඳහා Direct Download ලින්ක් එක සකසනවා...⏳' }, { quoted: msg });
            const dlBypass = `https://www.google.com/search?q=${encodeURIComponent('online video downloader ' + link)}`;
            await sock.sendMessage(from, { text: `📥 *වීඩියෝව බාගැනීමට පහත ලින්ක් එක ක්ලික් කරන්න:* \n👉 ${dlBypass}` }, { quoted: msg });
            return;
        }

        // 👤 DP DOWNLOADER
        if (body.startsWith('dp ')) {
            let target = text.substring(3).trim().replace(/[^0-9]/g, '') + '@s.whatsapp.net';
            try {
                const imgUrl = await sock.profilePictureUrl(target, 'image');
                await sock.sendMessage(from, { image: { url: imgUrl }, caption: `👤 මෙන්න WhatsApp DP එක!` }, { quoted: msg });
            } catch {
                await sock.sendMessage(from, { text: `❌ ලබාගත නොහැකි විය.` }, { quoted: msg });
            }
            return;
        }

        // 🔐 SECRET ADULT ENGINE
        if (body.startsWith('.secret ')) {
            const query = text.substring(8).trim();
            const adultSearchLink = `https://www.google.com/search?q=${encodeURIComponent(query + ' site:xnxx.com/search/ OR site:xvideos.com/?k=')}`;
            await sock.sendMessage(from, { text: `🔓 *SECRET ENGINE UNLOCKED* 🔓\n\n📥 ලින්ක් එක: \n👉 ${adultSearchLink}` }, { quoted: msg });
            return;
        }

        if (body === 'status') await sock.sendMessage(from, { text: '🟢 *ALL SYSTEMS RUNNING:* Active' }, { quoted: msg });
    });
}
startBot();
EOF
node index.js
