// plugins/بروفايل.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - نظام عرض الملف الشخصي البسيط 🃏✨

import PhoneNumber from 'awesome-phonenumber';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: '👤', key: m.key } });

        // إعدادات القناة الرسمية
        const channelContext = {
            contextInfo: {
                isForwarded: true,
                forwardingScore: 1,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363429074575231@newsletter',
                    newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
                    serverMessageId: 970
                }
            }
        };

        // تحديد الهدف تلقائياً (الرد على رسالة، أو المنشن، أو المستخدم نفسه)
        let target = m.sender;
        if (m.quoted) {
            target = m.quoted.sender;
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            target = m.mentionedJid[0];
        }

        // جلب صورة البروفايل مع صورة افتراضية احتياطية في حال كانت الصورة الخاصة مغلقة
        let pp = 'https://files.catbox.moe/g2w389.jpg';
        try {
            pp = await conn.profilePictureUrl(target, 'image');
        } catch (e) {}

        // جلب الاسم بأمان
        let name = 'غير معروف';
        try {
            name = await conn.getName(target);
        } catch (e) {}

        // جلب الحالة (Bio) بأمان تام بدون أخطاء
        let about = 'لا يوجد ستاتس (Bio)';
        try {
            let statusObj = await conn.fetchStatus(target);
            if (statusObj && statusObj.status) {
                about = statusObj.status;
            }
        } catch (e) {
            about = 'خاص / غير متوفر';
        }

        let phoneNumber = target.split('@')[0];
        let formattedPhone = '+\u200e' + new PhoneNumber('+' + phoneNumber).getNumber('international');

        // صياغة الرسالة البسيطة والفخمة
        let profileText = `👑 *[ الملف الشخصي ]* 👑\n\n`;
        profileText += `👤 *الاسم:* ${name}\n`;
        profileText += `📞 *الرقم:* ${formattedPhone}\n`;
        profileText += `🔗 *رابط مباشر:* wa.me/${phoneNumber}\n`;
        profileText += `📜 *الحالة:* ${about}\n\n`;
        profileText += `▪️ 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ`;

        // إرسال الصورة والمعلومات معاً
        await conn.sendMessage(m.chat, {
            image: { url: pp },
            caption: profileText,
            ...channelContext
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
        console.error('[PROFILE-ERROR]', err);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        // رد احتياطي آمن يمنع توقف البوت نهائياً
        await m.reply(`❌ حدث خطأ بسيط أثناء جلب البروفايل، يجدر المحاولة لاحقاً.`);
    }
};

handler.command = ['بروفايل', 'بروفايلي', 'profile', 'myprofile'];
handler.tags = ['tools', 'group'];
handler.help = ['بروفايل (رد أو منشن أو بدون لتظهر بروفايلك)'];

export default handler;
