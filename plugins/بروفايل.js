// plugins/بروفايل.js
// ✧ ITACHI | THE JOKER - نظام عرض الملف الشخصي الذكي 🃏

import PhoneNumber from 'awesome-phonenumber';
import { theme } from '../core/theme.js';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: '👤', key: m.key } });

        // تحديد الهدف تلقائياً (الرد على رسالة، أو المنشن، أو المستخدم نفسه)
        let target = m.sender;
        if (m.quoted) {
            target = m.quoted.sender;
        } else if (m.mentionedJid && m.mentionedJid.length > 0) {
            target = m.mentionedJid[0];
        }

        // جلب صورة البروفايل بدقة مع التعامل الآمن إذا لم يكن يمتلك صورة
        let pp = null;
        try {
            pp = await conn.profilePictureUrl(target, 'image');
        } catch (e) {
            pp = null;
        }

        // جلب الاسم أو تحديد رسالة تدل على عدم وجود صورة
        let name = 'غير معروف';
        try {
            name = await conn.getName(target);
        } catch (e) {}

        // جلب الحالة (Bio) أو التعبير عنها بشكل دقيق
        let about = 'متصل علي واتساب';
        try {
            let statusObj = await conn.fetchStatus(target);
            if (statusObj && statusObj.status) {
                about = statusObj.status;
            }
        } catch (e) {
            about = 'متصل علي واتساب';
        }

        let phoneNumber = target.split('@')[0];
        // معالجة الرقم بشكل سليم تماماً بدون أي دمج (لضمان ظهوره بشكل منسق دولياً)
        let phoneObj = new PhoneNumber('+' + phoneNumber);
        let formattedPhone = phoneObj.isValid() ? phoneObj.getNumber('international') : '+' + phoneNumber;

        // صياغة النص باستخدام محرك theme.js المعتمد
        let profileText = theme.build([
            { type: 'title', text: 'الملف الشخصي' },
            { type: 'divider' },
            { type: 'line', text: `الاسم: @${phoneNumber}` },
            { type: 'info', label: 'الرقم', value: formattedPhone },
            { type: 'info', label: 'رابط مباشر', value: `wa.me/${phoneNumber}` },
            { type: 'info', label: 'الحالة', value: about },
            { type: 'divider' },
            { type: 'line', text: pp ? 'صورة البروفايل متاحة' : (target === m.sender ? 'ليس لديك صورة بروفايل' : 'ليس لديه صورة بروفايل') },
            { type: 'divider' },
            { type: 'line', text: 'JOKER BOT BY ITACHI' }
        ]);

        // إرسال الصورة إذا وجت، أو إرسال نص فقط مع المنشن الصحيح
        if (pp) {
            await conn.sendMessage(m.chat, {
                image: { url: pp },
                caption: profileText,
                mentions: [target]
            }, { quoted: m });
        } else {
            await conn.sendMessage(m.chat, {
                text: profileText,
                mentions: [target]
            }, { quoted: m });
        }

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (err) {
        console.error('[PROFILE-ERROR]', err);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        
        let errText = theme.build([
            { type: 'title', text: 'خطأ' },
            { type: 'divider' },
            { type: 'error', text: 'حدث خطأ بسيط أثناء جلب البروفايل، حاول لاحقاً.' },
            { type: 'divider' },
            { type: 'line', text: 'JOKER BOT BY ITACHI' }
        ]);
        await conn.reply(m.chat, errText, m);
    }
};

handler.command = ['بروفايل', 'بروفايلي', 'profile', 'myprofile'];
handler.tags = ['tools', 'group'];
handler.help = ['بروفايل'];

export default handler;
