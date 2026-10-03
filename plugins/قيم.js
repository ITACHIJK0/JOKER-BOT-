// plugins/rate.js
// 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 𝜰 — نظام التقييم والتواصل الرسمي ⭐

import { generateWAMessageFromContent, prepareWAMessageMedia, proto } from '@whiskeysockets/baileys';

// تحديد المطورين المعتمدين (تم ضبط الأرقام بدقة لتصلهم الإشعارات)
const allowedOwners = [
    '212408480080003@lid',
    '249927142037@s.whatsapp.net'
];

const channelUrl = 'https://whatsapp.com/channel/0029VbDHUIRGzzKUabkgin1z';
const channelName = '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ';

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        await conn.sendMessage(m.chat, { react: { text: '⭐', key: m.key } });

        const imageUrl = 'https://i.postimg.cc/qRP4k4jD/060dd92527391a0367195f8fe94db60c.jpg';
        const mediaMessage = await prepareWAMessageMedia(
            { image: { url: imageUrl } },
            { upload: conn.waUploadToServer }
        );

        const interactiveMessage = {
            body: {
                text: `*꒷︶꒷꒦꒷ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯』 ꒷︶꒷꒦꒷*\n\n` +
                      `   ♡ ⦓ ⭐ وحدة التقييم والآراء ⦔ ♡\n\n` +
                      `*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n\n` +
                      `┠ 👤╎المستخدم : @${m.sender.split('@')[0]}\n\n` +
                      `> 🌟╎أهلاً بك يا صديقي! نسعى دائماً لتقديم أفضل تجربة مميزة لك.\n` +
                      `> 📌╎يرجى اختيار تقييمك المناسب أو إرسال ملاحظاتك لتطوير البوت نحو الأفضل.\n\n` +
                      `*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n` +
                      `        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞\n` +
                      `> ꒷︶ 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞`
            },
            footer: {
                text: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 𝜰'
            },
            header: {
                hasMediaAttachment: true,
                imageMessage: mediaMessage.imageMessage
            },
            nativeFlowMessage: {
                buttons: [
                    {
                        name: "single_select",
                        buttonParamsJson: JSON.stringify({
                            title: "🪔 قـيـم تـجـربـتك",
                            sections: [
                                {
                                    title: "🔮 خيارات التقييم 🍀",
                                    rows: [
                                        {
                                            header: "⭐ [ 1 نجمة ]",
                                            id: `${usedPrefix}rate_submit 1`,
                                            title: "غير راضي أبداً ❌",
                                            description: "تقييم منخفض، يحتاج البوت لتحسينات."
                                        },
                                        {
                                            header: "⭐⭐ [ نجمتان ]",
                                            id: `${usedPrefix}rate_submit 2`,
                                            title: "غير راضي 😕",
                                            description: "هناك بعض الملاحظات والقصور."
                                        },
                                        {
                                            header: "⭐⭐⭐ [ 3 نجوم ]",
                                            id: `${usedPrefix}rate_submit 3`,
                                            title: "محايد 😐",
                                            description: "الأداء مقبول وعادي."
                                        },
                                        {
                                            header: "⭐⭐⭐⭐ [ 4 نجوم ]",
                                            id: `${usedPrefix}rate_submit 4`,
                                            title: "راضي وجيد 👍",
                                            description: "التجربة ممتازة وتلبي الاحتياجات."
                                        },
                                        {
                                            header: "⭐⭐⭐⭐⭐ [ 5 نجوم ]",
                                            id: `${usedPrefix}rate_submit 5`,
                                            title: "راضي جداً وبوت أسطوري 😍🔥",
                                            description: "أداء رائع جداً ومميز!"
                                        },
                                        {
                                            header: "📝 [ ارسل ملاحظاتك ]",
                                            id: `${usedPrefix}rate_feedback`,
                                            title: "إرسال اقتراح أو ملاحظة للمطور 📨",
                                            description: "تواصل مباشرة مع المطور لتسجيل ملاحظتك."
                                        }
                                    ]
                                }
                            ]
                        })
                    },
                    {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: "📢 تابع القناة الرسمية",
                            url: channelUrl,
                            merchant_url: channelUrl
                        })
                    }
                ],
                messageParamsJson: JSON.stringify({
                    bottom_sheet: {
                        list_title: "⭐ وحدة التقييم والآراء",
                        button_title: "📂 اختر تقييمك ⚡"
                    }
                })
            }
        };

        const msg = generateWAMessageFromContent(
            m.chat,
            {
                viewOnceMessage: {
                    message: {
                        interactiveMessage: proto.Message.InteractiveMessage.fromObject(interactiveMessage)
                    }
                }
            },
            {
                userJid: conn.user.jid,
                quoted: m
            }
        );

        await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch (e) {
        console.error('[ITACHI-Rate Error]:', e);
        await conn.reply(
            m.chat,
            `*꒷︶꒷꒦꒷ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯』 ꒷︶꒷꒦꒷*\n\n` +
            `   ♡ ⦓ ❌ خطأ في النظام ⦔ ♡\n\n` +
            `*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n\n` +
            `> ⚠️╎${e.message || 'حدث خطأ غير متوقع في تحميل نظام التقييم'}\n\n` +
            `*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n` +
            `        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞\n` +
            `> ꒷︶ 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞`,
            m
        );
    }
};

handler.before = async (m, { conn, usedPrefix }) => {
    if (!m.text) return false;
    const cmdText = m.text.trim();

    if (cmdText.startsWith(`${usedPrefix}rate_submit `)) {
        const rating = cmdText.replace(`${usedPrefix}rate_submit `, '').trim();
        const stars = '⭐'.repeat(Number(rating) || 1);
        const userJid = m.sender;
        const userName = m.pushName || 'مستخدم';

        await conn.reply(
            m.chat,
            `*꒷︶꒷꒦꒷ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯』 ꒷︶꒷꒦꒷*\n\n` +
            `   ♡ ⦓ ⭐ شكراً لتقييمك الراقي ⦔ ♡\n\n` +
            `*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n\n` +
            `┠ 🎯╎تقييمك المسجل : ${stars} (${rating}/5)\n\n` +
            `> 🎉╎تم إرسال تقييمك بنجاح إلى المطورين!\n\n` +
            `*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n` +
            `        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞\n` +
            `> ꒷︶ 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞`,
            m
        );

        // إرسال إشعار التقييم للمطورين عبر الـ JIDs المحددة بدقة
        for (const ownerJid of allowedOwners) {
            try {
                // إذا كان الرابط ينتهي بـ @lid أو @s.whatsapp.net، يتم توجيهه بشكل صحيح
                let targetJid = ownerJid.includes('@') ? ownerJid : ownerJid + '@s.whatsapp.net';
                await conn.sendMessage(targetJid, {
                    text: `*꒷︶꒷꒦꒷ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯』 ꒷︶꒷꒦꒷*\n\n` +
                          `   ♡ ⦓ 📊 إشعار تقييم جديد ⦔ ♡\n\n` +
                          `*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n\n` +
                          `┠ 👤╎المستخدم : @${userJid.split('@')[0]} (${userName})\n` +
                          `┠ 🌟╎التقييم : ${stars} (${rating} نجوم)\n` +
                          `┠ 📌╎المجموعة : ${m.chat}\n\n` +
                          `> 🚀╎تم استلام التقييم بنجاح.\n\n` +
                          `*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n` +
                          `        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞`,
                    mentions: [userJid]
                });
            } catch (err) {
                console.error(`[Rate Owner Notice Error to ${ownerJid}]:`, err);
            }
        }
        return true;
    }

    if (cmdText === `${usedPrefix}rate_feedback`) {
        await conn.reply(
            m.chat,
            `*꒷︶꒷꒦꒷ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯』 ꒷︶꒷꒦꒷*\n\n` +
            `   ♡ ⦓ 💬 صندوق الاقتراحات والملاحظات ⦔ ♡\n\n` +
            `*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n\n` +
            `> 📌╎يرجى الرد (Reply) على هذه الرسالة وا كتابة اقتراحك أو ملاحظتك، وسيقوم المطور بالاطلاع عليها قريباً!\n\n` +
            `*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n` +
            `        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞\n` +
            `> ꒷︶ 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞`,
            m
        );
        return true;
    }

    return false;
};

handler.command = ['rate', 'تقييم', 'قيم'];
handler.help = ['rate'];
handler.tags = ['main'];

export default handler;
