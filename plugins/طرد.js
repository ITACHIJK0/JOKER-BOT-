// plugins/kick.js
// ✧ UCHIHA - Uchiha Itachi - أمر الطرد 🚫

import { theme } from '../core/theme.js';
import { sticker } from '../Z/sticker.js';
import fetch from 'node-fetch';
import baileys from '@whiskeysockets/baileys';

const generateWAMessageFromContent = baileys.generateWAMessageFromContent || baileys.default?.generateWAMessageFromContent;
const proto = baileys.proto || baileys.default?.proto;

let handler = async (m, { conn, participants, isAdmin, isBotAdmin, text }) => {
    // قائمة المطورين الممنوع طردهم (حماية مطلقة ضد الطرد)
    const allowedOwners = [
        '249916221538@s.whatsapp.net',
        '14904274759837@lid',
        '212408480080003@lid'
    ];

    if (!m.isGroup) return conn.reply(m.chat, theme.error("هذا الأمر يعمل في المجموعات فقط."), m);
    if (!isBotAdmin) return conn.reply(m.chat, theme.error("يجب أن أكون مشرفاً (Admin) لأتمكن من طرد الأعضاء."), m);
    if (!isAdmin) return conn.reply(m.chat, theme.error("هذا الأمر مخصص للمشرفين فقط."), m);

    let target = null;
    if (m.quoted) {
        target = m.quoted.sender;
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
        target = m.mentionedJid[0];
    } else if (text) {
        let match = text.replace(/[^0-9]/g, "").match(/(\d{7,15})/);
        if (match) {
            target = match[1] + '@s.whatsapp.net';
        }
    }

    if (!target) {
        const menuText = theme.build([
            { type: 'title', text: '🚫 إتاتشي: "وحدة الطرد والعدالة"' },
            { type: 'subtitle', text: 'قم بمنشن الهدف المراد طرده أو الرد على رسالته' },
            { type: 'divider' },
            { type: 'line', text: '⚔️ مثال: .طرد @user' }
        ]);

        const interactiveMessage = {
            body: { text: menuText },
            footer: { text: '⛩️ Uchiha Itachi - Sharingan Kick ⛩️' },
            nativeFlowMessage: {
                buttons: [{
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📢 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ',
                        copy_code: '120363429074575231@newsletter'
                    })
                }]
            }
        };

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject(interactiveMessage)
                }
            }
        }, { userJid: conn.user.jid, quoted: m });

        return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    }

    // فحص حماية المطور بدقة تامة
    let targetNumber = target.replace(/[^0-9]/g, "");
    const isDeveloper = allowedOwners.some(dev => {
        let devClean = dev.replace(/[^0-9]/g, '');
        return targetNumber === devClean;
    });

    if (isDeveloper) {
        const warningText = theme.build([
            { type: 'title', text: '⚠️ إتاتشي: "العقاب الإلهي"' },
            { type: 'subtitle', text: 'أيها الأحمق.. أتحاول طرد مطور هذا الوجود "إتاتشي"؟' },
            { type: 'line', text: '⚡ سيعاقبك التسوكيومي فوراً ويطردك أنت من الواقع!' }
        ]);

        const interactiveMessage = {
            body: { text: warningText },
            footer: { text: '⛩️ Uchiha Itachi - Ultimate Protection ⛩️' },
            nativeFlowMessage: {
                buttons: [{
                    name: 'cta_copy',
                    buttonParamsJson: JSON.stringify({
                        display_text: '📢 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ',
                        copy_code: '120363429074575231@newsletter'
                    })
                }]
            }
        };

        const msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: proto.Message.InteractiveMessage.fromObject(interactiveMessage)
                }
            }
        }, { userJid: conn.user.jid, quoted: m });

        return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    }

    let freshMeta = await conn.groupMetadata(m.chat, false);
    let matched = freshMeta.participants.find(p =>
        p.id.replace(/[^0-9]/g, "") === targetNumber ||
        p.phoneNumber?.replace(/[^0-9]/g, "") === targetNumber
    );

    if (!matched) return conn.reply(m.chat, theme.error("هذا الشخص غير موجود في المجموعة."), m);
    if (matched.admin) return conn.reply(m.chat, theme.error("لا يمكنك طرد مشرف آخر!"), m);

    let removeId = matched.phoneNumber || matched.id;

    try {
        try {
            await conn.groupParticipantsUpdateRaw(m.chat, [removeId], "remove");
        } catch {
            await conn.groupParticipantsUpdate(m.chat, [target], 'remove');
        }
    } catch (e) {
        return conn.reply(m.chat, theme.error("حصل خطأ: " + (e.message || e)), m);
    }

    let updatedMeta = await conn.groupMetadata(m.chat, false);
    let stillThere = updatedMeta.participants.find(p =>
        p.id.replace(/[^0-9]/g, "") === targetNumber ||
        p.phoneNumber?.replace(/[^0-9]/g, "") === targetNumber
    );

    if (stillThere) {
        return conn.reply(m.chat, theme.error("فشل الطرد فعليًا ❌"), m);
    } else {
        // إرسال الملصق بالرابط المطلوب عند نجاح الطرد
        const imageUrl = 'https://i.postimg.cc/L8Nh6nxC/1790348747495.png';
        try {
            const imgRes = await fetch(imageUrl);
            const imgBuffer = await imgRes.buffer();
            let stiker = await sticker(imgBuffer, null, '🚫 تم الطرد بنجاح', '✧ 𝚰𝚻𝚫𝚂𝚮𝚰 ♞ 𝐔𝐂𝐇𝚰𝚫 ✧');
            await conn.sendMessage(m.chat, { sticker: stiker }, { quoted: m });
        } catch (err) {
            console.error('فشل إرسال ملصق الطرد:', err);
        }

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    }
};

handler.help = ['طرد @user'];
handler.tags = ['group'];
handler.command = ['kick', 'طرد'];
handler.admin = true;
handler.group = true;
handler.botAdmin = true;

export default handler;
