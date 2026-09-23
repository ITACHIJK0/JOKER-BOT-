// ✧ THE JOKER & ITACHI - Fake Message Command 🃏

import { delay } from '@whiskeysockets/baileys';

const handler = async (m, { conn, text }) => {
    let footerText = "> 亗 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞";

    if (!m.quoted) {
        let errQuoteTeks = `🃏 القائمة الرئيسية
❖ ── ✦ ── [ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
 ┠ 📌 ╎ رد على رسالة واكتب النص الجديد بجانب الأمر.
 ┠ ⚙️ ╎ مثال: .فيك مرحباً بكم
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞
${footerText}`;
        await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
        return m.reply(errQuoteTeks);
    }

    if (!text) {
        let errTextTeks = `🃏 القائمة الرئيسية
❖ ── ✦ ── [ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
 ┠ 📌 ╎ الرجاء كتابة النص البديل المطلوب إرساله.
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞
${footerText}`;
        await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
        return m.reply(errTextTeks);
    }

    const stanzaId = m.quoted.id;

    try {
        const tempId = await conn.relayMessage(m.chat, {
            extendedTextMessage: {
                text: '',
                contextInfo: { isGroupStatus: true }
            }
        }, {});

        const tempId2 = await conn.relayMessage(m.chat, {
            protocolMessage: {
                key: { jid: m.chat, fromMe: true, id: tempId },
                type: 14,
                editedMessage: {
                    extendedTextMessage: {
                        text,
                        contextInfo: { isGroupStatus: false }
                    }
                }
            }
        }, { messageId: stanzaId });

        await delay(100);

        await Promise.allSettled([
            conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, id: tempId, fromMe: true } }),
            conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, id: tempId2, fromMe: true } })
        ]);

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
    } catch (e) {
        console.error('[fakemsg]', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        
        let errorTeks = `🃏 القائمة الرئيسية
❖ ── ✦ ── [ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
 ┠ ❌ ╎ حدث خطأ: ${e?.message || e}
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞
${footerText}`;
        m.reply(errorTeks);
    }
};

handler.command = /^فيك$/i;
handler.tags = ['owner'];
handler.owner = true;
handler.group = true;

export default handler;
