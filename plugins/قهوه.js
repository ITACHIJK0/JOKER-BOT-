/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪᴛ𝙰𝙲𝙷𝙸

| 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 |
| لا تحذف الحقوق 🖤 |
*/

import { theme } from '../core/theme.js';

let handler = async (m, { conn, usedPrefix, command }) => {
    if (!m.isGroup) return conn.reply(m.chat, theme.error("هذا الأمر يعمل في المجموعات فقط."), m);

    let who;
    if (m.mentionedJid.length > 0) {
        who = m.mentionedJid[0];
    } else if (m.quoted) {
        who = m.quoted.sender;
    } else {
        who = m.sender;
    }

    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);
    await m.react('☕');

    let str;
    if (m.mentionedJid.length > 0 || m.quoted) {
        str = theme.build([
            { type: 'title', text: 'جلسة قهوة رايقة ☕' },
            { type: 'line', text: `👤 *${name2}*` },
            { type: 'line', text: 'يشرب فنجان قهوة مع' },
            { type: 'line', text: `🎯 *${name || who}*` }
        ]);
    } else {
        str = theme.build([
            { type: 'title', text: 'جلسة قهوة رايقة ☕' },
            { type: 'line', text: `👤 *${name2}*` },
            { type: 'line', text: 'يستمتع بفنجان قهوة بمفرده 🖤' }
        ]);
    }

    let pp = 'https://files.catbox.moe/k6bzj0.mp4';
    let pp2 = 'https://files.catbox.moe/3pj3nx.mp4';
    let pp3 = 'https://files.catbox.moe/wcpe4z.mp4';
    let pp4 = 'https://files.catbox.moe/64t3cf.mp4';
    let pp5 = 'https://files.catbox.moe/qy1qmo.mp4';
    let pp6 = 'https://files.catbox.moe/va1mu7.mp4';
    let pp7 = 'https://files.catbox.moe/zqqre3.mp4';
    let pp8 = 'https://files.catbox.moe/duydzw.mp4';
    let pp9 = 'https://files.catbox.moe/4mn95m.mp4';

    const videos = [pp, pp2, pp3, pp4, pp5, pp6, pp7, pp8, pp9];
    const video = videos[Math.floor(Math.random() * videos.length)];

    let mentions = [who];

    await conn.sendMessage(
        m.chat,
        {
            video: { url: video },
            gifPlayback: true,
            caption: str,
            mentions
        },
        { quoted: m }
    );
};

handler.help = ['قهوة @منشن'];
handler.tags = ['ترفيه'];
handler.command = ['قهوة', 'كهوة'];
handler.group = true;

export default handler;
