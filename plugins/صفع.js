// plugins/slap.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 𝜰 - نظام أمر الصفع الترفيهي 🖐

import { sticker } from '../lib/sticker.js'; // تأكد من مسار دالة صنع الملصقات في بوتك

let slapImages = [
    'https://i.postimg.cc/0Qy0WHTx/4065420b981100ae1bee9e74525434f6.jpg',
    'https://i.postimg.cc/8CDHWCwd/63b6605809c87821641e2ab044887175.jpg',
    'https://i.postimg.cc/tCKDqkxz/c15792aaf9dbb3b85284572e39a19fbb.jpg',
    'https://i.postimg.cc/6qScGL18/7135073105de6d8caf88da90434788bc.jpg'
];

// رقم المطور المحمي (تم تحويله بصيغة الـ JID للتحقق الدقيق)
const DEVELOPER_ID = '212408480080003@s.whatsapp.net'; // أو lid إذا لزم الأمر

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!m.isGroup) {
        return await conn.reply(m.chat, `⚠️ هذا الأمر مخصص للعمل داخل المجموعات فقط!`, m);
    }

    // تحديد الشخص المستهدف (إما بالمنشن أو بالرد على رسالته)
    let target = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.quoted ? m.quoted.sender : null);

    if (!target) {
        return await conn.reply(m.chat, `⚠️ يرجى منشن الشخص المراد صفعه أو الرد على رسالته!\nمثال: ${usedPrefix + command} @منشن`, m);
    }

    // 🛡️ حماية المطور
    if (target.includes('212408480080003') || target === DEVELOPER_ID) {
        return await conn.reply(m.chat, `⚠️ هذا الشخص محمي ولا يمكنك صفعه ايها العاق 😒🔥`, m, { mentions: [m.sender] });
    }

    // اختيار صورة عشوائية من القائمة
    let randomImage = slapImages[Math.floor(Math.random() * slapImages.length)];
    let senderName = m.pushName || m.sender.split('@')[0];
    let targetName = target.split('@')[0];

    try {
        // تحويل الصورة العشوائية إلى ملصق مع وضع الحقوق
        let stiker = await sticker(false, randomImage, `تم صفع @${targetName} بنجاح 🤣`, `By: ${senderName}`);
        
        let captionText = `خذ يا @${targetName}!\nتم صفع @${targetName} بنجاح 🤣🔥`;

        if (stiker) {
            // إرسال الملصق مع النص في رسالة واحدة متناسقة
            await conn.sendMessage(m.chat, { 
                sticker: stiker,
                caption: captionText,
                mentions: [target]
            }, { quoted: m });
        } else {
            // احتياطي في حال فشل تحويل الملصق يتم إرسال الصورة كصورة عادية مع النص
            await conn.sendMessage(m.chat, { 
                image: { url: randomImage }, 
                caption: captionText,
                mentions: [target] 
            }, { quoted: m });
        }

    } catch (e) {
        console.error('[Slap Error]', e);
        await conn.reply(m.chat, `> 🃏 *ITACHI & JOKER: "خطأ"*\n> 🔮 حدث خطأ أثناء تنفيذ الصفعة!`, m);
    }
};

handler.help = ['صفع [@منشن]'];
handler.tags = ['game', 'fun'];
handler.command = /^(صفع|slap)$/i;
handler.group = true;

export default handler;
