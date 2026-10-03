// plugins/group-lock.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑱𝑶𝑲𝑬𝑹 ᜰ - التحكم في المجموعة 🔒

import { prepareWAMessageMedia, generateWAMessageFromContent } from '@whiskeysockets/baileys';
import { theme } from '../core/theme.js';

let handler = async (m, { conn, args, usedPrefix, command, isAdmin, isOwner }) => {
    if (!isAdmin && !isOwner) {
        return conn.reply(m.chat, theme.build([
            { type: 'title', text: '❌ خـطـأ' },
            { type: 'subtitle', text: 'هذا الأمر مخصص للمشرفين فقط' },
            { type: 'divider' },
            { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
        ]), m);
    }

    // تحديد حالة القفل أو الفتح بناءً على الأمر أو الـ args
    let action = '';
    if (command === 'قفل' || args[0] === 'قفل') action = 'قفل';
    if (command === 'فتح' || args[0] === 'فتح') action = 'فتح';

    // إذا تم كتابة أمر مباشر (قفل أو فتح) أو عبر الأزرار
    if (action) {
        let isClose = {
            'فتح': 'not_announcement',
            'قفل': 'announcement',
        }[action];

        try {
            await conn.groupSettingUpdate(m.chat, isClose);

            const responseText = isClose === 'announcement'
                ? theme.build([
                    { type: 'title', text: '🔒 تـم قـفـل الـمـجـمـوعـة' },
                    { type: 'line', text: 'الجميع لا يستطيع الكلام الآن' },
                    { type: 'divider' },
                    { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
                  ])
                : theme.build([
                    { type: 'title', text: '🔓 تـم فـتـح الـمـجـمـوعـة' },
                    { type: 'line', text: 'الجميع يستطيع الكلام الآن' },
                    { type: 'divider' },
                    { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
                  ]);
            return conn.reply(m.chat, responseText, m);
        } catch (e) {
            console.error(e);
            return conn.reply(m.chat, theme.build([
                { type: 'title', text: '❌ خـطـأ' },
                { type: 'error', text: 'حدث خطأ أثناء تعديل إعدادات المجموعة' },
                { type: 'divider' },
                { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
            ]), m);
        }
    }

    // إرسال الأزرار في حال تم استدعاء الأمر الرئيسي (جروب أو group) بدون محددات
    try {
        const thumbnail = await prepareWAMessageMedia(
            { image: { url: "https://i.postimg.cc/c1QzZdtP/709d2a215ad4bd49f895cec71e75cea8.jpg" } },
            { upload: conn.waUploadToServer }
        );

        const dataMessage = theme.build([
            { type: 'title', text: '🔒 الـتـحـكـم فـي الـمـجـمـوعـة' },
            { type: 'divider' },
            { type: 'line', text: '❄️ اختر إجراء من الأزرار أدناه أو استخدم .قفل / .فتح مباشرة' },
            { type: 'divider' },
            { type: 'info', label: '🔒 قفل', value: 'يمنع الأعضاء من الكلام' },
            { type: 'info', label: '🔓 فتح', value: 'يسمح للجميع بالكلام' },
            { type: 'divider' },
            { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
        ]);

        let buttons = [
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '🔒 قفل المجموعة',
                    id: `${usedPrefix}جروب قفل`
                })
            },
            {
                name: 'quick_reply',
                buttonParamsJson: JSON.stringify({
                    display_text: '🔓 فتح المجموعة',
                    id: `${usedPrefix}جروب فتح`
                })
            }
        ];

        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    interactiveMessage: {
                        body: { text: dataMessage },
                        footer: { text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' },
                        header: {
                            hasMediaAttachment: true,
                            imageMessage: thumbnail.imageMessage,
                        },
                        nativeFlowMessage: {
                            buttons: buttons,
                            messageParamsJson: "",
                        },
                    },
                },
            },
        }, { userJid: conn.user.jid, quoted: m });

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
    } catch (e) {
        console.error(e);
        conn.reply(m.chat, theme.build([
            { type: 'title', text: '❌ خـطـأ' },
            { type: 'error', text: 'حدث خطأ أثناء إنشاء الأزرار' },
            { type: 'divider' },
            { type: 'line', text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ' }
        ]), m);
    }
};

handler.help = ['جروب <قفل/فتح>', 'قفل', 'فتح'];
handler.tags = ['group'];
handler.command = /^(جروب|group|قفل|فتح)$/i;
handler.botAdmin = true;
handler.group = true;

export default handler;
