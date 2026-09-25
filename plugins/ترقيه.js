// plugins/ترقيه.js
// ✧ THE JOKER & ITACHI - ترقية أو إعفاء عضو 👑

import { theme } from '../core/theme.js';
import { sticker } from '../Z/sticker.js';
import fetch from 'node-fetch';

let handler = async (m, { conn, usedPrefix, command, isAdmin, isOwner, isBotAdmin, text }) => {

    if (!m.isGroup) {
        return m.reply(theme.build([
            { type: 'title', text: 'خـطـأ في الاستخدام' },
            { type: 'divider' },
            { type: 'error', text: 'هذا الأمر يشتغل في المجموعات فقط.' }
        ]));
    }

    if (!isBotAdmin) {
        return m.reply(theme.build([
            { type: 'title', text: 'خـطـأ في الصلاحيات' },
            { type: 'divider' },
            { type: 'error', text: 'يجب أن يكون البوت مشرفاً لتنفيذ هذا الأمر.' }
        ]));
    }

    if (!isAdmin && !isOwner) {
        return m.reply(theme.build([
            { type: 'title', text: 'خـطـأ في الصلاحيات' },
            { type: 'divider' },
            { type: 'error', text: 'هذا الأمر مخصص للمشرفين فقط.' }
        ]));
    }

    let target = null;

    // تحديد المستهدف (منشن، رد، أو رقم)
    if (m.mentionedJid && m.mentionedJid.length > 0) {
        target = m.mentionedJid[0];
    } else if (m.quoted && m.quoted.sender) {
        target = m.quoted.sender;
    } else if (text) {
        let match = text.replace(/[^0-9]/g, "").match(/(\d{7,15})/);
        if (match) {
            target = match[1] + '@s.whatsapp.net';
        }
    }

    if (!target) {
        await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
        return m.reply(theme.build([
            { type: 'title', text: 'إدارة المشرفين' },
            { type: 'divider' },
            { type: 'line', text: 'استخدم إحدى الطرق التالية لتحديد العضو:' },
            { type: 'info', label: 'منشن', value: `.${command} @user` },
            { type: 'info', label: 'رد', value: `الرد على رسالة العضو` },
            { type: 'info', label: 'رقم', value: `.${command} 249916221538` }
        ]), {
            quoted: m,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 1,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363410276242111@newsletter',
                    newsletterName: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚',
                    serverMessageId: 970
                }
            }
        });
    }

    let targetNumber = target.replace(/[^0-9]/g, "");
    let freshMeta = await conn.groupMetadata(m.chat, false);

    let matched = freshMeta.participants.find(p =>
        p.id.replace(/[^0-9]/g, "") === targetNumber ||
        p.phoneNumber?.replace(/[^0-9]/g, "") === targetNumber
    );

    if (!matched) {
        return m.reply(theme.build([
            { type: 'title', text: 'تنبيه' },
            { type: 'divider' },
            { type: 'error', text: 'الشخص غير موجود في هذه المجموعة.' }
        ]));
    }

    let actionId = matched.phoneNumber || matched.id;

    try {
        // ترقية عضو
        if (command.match(/^(ترقيه|رفع|ارفع|promote|اديلو)$/i)) {
            if (matched.admin) {
                return m.reply(theme.build([
                    { type: 'title', text: 'تنبيه' },
                    { type: 'divider' },
                    { type: 'line', text: 'هذا الشخص مشرف بالفعل في المجموعة.' }
                ]));
            }

            // استخدام الطريقة المستقرة للترقية
            try {
                await conn.groupParticipantsUpdateRaw(m.chat, [actionId], "promote");
            } catch {
                await conn.groupParticipantsUpdate(m.chat, [target], 'promote');
            }

            // التحقق من نجاح الترقية عبر الميتافيتا المحدثة
            let updatedMeta = await conn.groupMetadata(m.chat, false);
            let nowAdmin = updatedMeta.participants.find(p =>
                (p.id === matched.id || p.phoneNumber === matched.phoneNumber) && p.admin
            );

            if (nowAdmin) {
                // استخدام الرابط الجديد المطلوب للملصق
                const imageUrl = 'https://i.postimg.cc/g2KBTPN4/1790347609225.png';
                try {
                    const imgRes = await fetch(imageUrl);
                    const imgBuffer = await imgRes.buffer();
                    let stiker = await sticker(imgBuffer, null, '❄️ مبروك اصبحت مشرف', '✧ 𝚰𝚻𝚫𝚂𝚮𝚰 ♞ 𝐔𝐂𝐇𝚰𝚫 ✧');
                    await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m });
                } catch (err) {
                    console.error('خطأ في إرسال ملصق الترقية:', err);
                }

                // تم إلغاء رسالة النص تماماً ليعتمد البوت على نظام الأحداث والتغيرات
                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
            } else {
                throw new Error('فشلت عملية الترقية فعلياً');
            }
        }

        // إعفاء عضو
        else if (command.match(/^(اعفاء|تنزيل|demote|خفض|شيلو|مايستاهل)$/i)) {
            try {
                await conn.groupParticipantsUpdateRaw(m.chat, [actionId], "demote");
            } catch {
                await conn.groupParticipantsUpdate(m.chat, [target], 'demote');
            }

            // تم إلغاء رسالة الإعفاء النصية والاكتفاء بالحدث التلقائي والتفاعل
            await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
        }

    } catch (e) {
        console.error(e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        m.reply(theme.build([
            { type: 'title', text: 'فـشـل الـعـمـلـيـة' },
            { type: 'divider' },
            { type: 'error', text: e.message?.slice(0, 100) || 'حدث خطأ غير معروف.' }
        ]));
    }
};

handler.help = ['ترقيه', 'اعفاء'];
handler.tags = ['group'];
handler.command = /^(ترقيه|رفع|ارفع|promote|اديلو|اعفاء|تنزيل|demote|خفض|شيلو|مايستاهل)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
