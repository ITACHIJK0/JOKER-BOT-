/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪᴛ𝙰𝙲𝙷𝙸

| 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 by 𝐉𝐎𝐊𝐄𝐑 𝐁𝐨𝐭 |
| لا تحذف الحقوق 🖤 |
*/

import { theme } from '../core/theme.js';

// رقم المطور المحمي بصيغة JID
const DEVELOPER_ID = '249927142037@s.whatsapp.net';

let handler = async (m, { conn, usedPrefix, command }) => {
    if (!m.isGroup) return conn.reply(m.chat, theme.error("هذا الأمر يعمل في المجموعات فقط."), m);

    let who;
    if (m.mentionedJid.length > 0) {
        who = m.mentionedJid[0];
    } else if (m.quoted) {
        who = m.quoted.sender;
    } else {
        return conn.reply(m.chat, theme.error(`⚠️ يرجى منشن الشخص المراد صفعه أو الرد على رسالته!\nمثال: ${usedPrefix + command} @منشن`), m);
    }

    // 🛡️ حماية المطور
    if (who.includes('249927142037') || who === DEVELOPER_ID) {
        return conn.reply(m.chat, theme.error("⚠️ هذا الشخص محمي ولا يمكنك صفعه ايها العاق 😒🔥"), m, { mentions: [m.sender] });
    }

    let name = conn.getName(who);
    let name2 = conn.getName(m.sender);
    await m.react('🖐️');

    let str = theme.build([
        { type: 'title', text: 'نظام الصفع والترفيه 🖐' },
        { type: 'line', text: `👤 الـضـارب: *${name2}*` },
        { type: 'line', text: `🎯 الـمـصـفـوع: *${name || who}*` },
        { type: 'line', text: '🤣 كف على السريع، استاهل ولا ما استاهل؟' }
    ]);

    // روابط فيديوهات/صور متحركة مخصصة لصفع
    let v1 = 'https://i.postimg.cc/0Qy0WHTx/4065420b981100ae1bee9e74525434f6.jpg'; // أو روابط فيديو إذا متوفرة، وتعمل بكفاءة كصورة أو فيديو
    
    // أو إذا أردت استخدام روابط فيديو تناسب النظام:
    let slapVideos = [
        'https://files.catbox.moe/k6bzj0.mp4',
        'https://files.catbox.moe/3pj3nx.mp4'
    ];
    let mediaUrl = slapVideos[Math.floor(Math.random() * slapVideos.length)];

    let mentions = [m.sender, who];

    await conn.sendMessage(
        m.chat,
        {
            video: { url: mediaUrl },
            gifPlayback: true,
            caption: str,
            mentions
        },
        { quoted: m }
    );
};

handler.help = ['صفع @منشن'];
handler.tags = ['ترفيه'];
handler.command = ['صفع', 'slap'];
handler.group = true;

export default handler;
