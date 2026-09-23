// plugins/lid.js
// ✧ THE JOKER & ITACHI - استخراج LID ومعلومات القنوات 🆔

import { generateWAMessageFromContent, proto } from '@whiskeysockets/baileys';

let handler = async (m, { conn, text, command }) => {
    let footerText = "> 亗 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞";

    if (!text) {
        let helpTeks = `🃏 القائمة الرئيسية
❖ ── ✦ ── [ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
 ┠ ⚙️ ╎ أدوات الاستخراج
 ┠ ⚠️ ╎ يرجى إدخال رقم الشخص أو رابط القناة.
 ┠ 📱 ╎ مثال LID: .${command} 249927142037
 ┠ 📢 ╎ مثال القناة: .${command} رابط القناة
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞
${footerText}`;
        return m.reply(helpTeks);
    }

    // الحالة الأولى: فحص إذا كان المُدخل رابط قناة واتساب
    if (text.includes('https://whatsapp.com/channel/')) {
        try {
            let result = text.split('https://whatsapp.com/channel/')[1];
            let channelId = result.split('/')[0];

            let res = await conn.newsletterMetadata('invite', channelId);
            let channelName = typeof res.name === 'object'
                ? (res.name?.text || res.name?.value || 'غير معروف')
                : (res.name || res.subject || res.title || 'غير معروف');
            let subscribersCount = res.subscribers ?? res.subscribersCount ?? res.subscribers_count ?? res.subscribersCountText ?? 'غير معروف';

            let timestamp = new Date().getTime();
            let formattedTime = new Date(timestamp).toLocaleString('ar-EG', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });

            let teks = `🃏 القائمة الرئيسية
❖ ── ✦ ── [ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
 ┠ 🆔 ╎ مـعـلـومـات الـقـنـاة
 ┠ 🧣 ╎ الاسم: ${channelName}
 ┠ 🆔 ╎ معرف القناة: ${res.id || 'غير متوفر'}
 ┠ 👤 ╎ المشتركين: ${subscribersCount}
 ┠ 🚦 ╎ الحالة: ${res.state || 'غير معروف'}
 ┠ ✅ ╎ التحقق: ${res.verification === 'VERIFIED' ? 'مُحققة' : 'غير مُحققة'}
 ┠ 🕓 ╎ الوقت: ${formattedTime}
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞
${footerText}`;

            let msg = generateWAMessageFromContent(m.chat, {
                viewOnceMessage: {
                    message: {
                        messageContextInfo: {
                            deviceListMetadata: {},
                            deviceListMetadataVersion: 2
                        },
                        interactiveMessage: proto.Message.InteractiveMessage.create({
                            body: proto.Message.InteractiveMessage.Body.create({ text: teks }),
                            footer: proto.Message.InteractiveMessage.Footer.create({ text: footerText }),
                            nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                                buttons: [
                                    {
                                        name: "cta_copy",
                                        buttonParamsJson: JSON.stringify({
                                            display_text: "📋 نسخ الـ ID",
                                            id: "copy_channel_id",
                                            copy_code: String(res.id || channelId)
                                        })
                                    }
                                ]
                            })
                        })
                    }
                }
            }, { quoted: m });

            return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

        } catch (error) {
            console.error("Channel Metadata Error:", error);
            let errTeks = `🃏 القائمة الرئيسية
❖ ── ✦ ── [ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
 ┠ ❌ ╎ حدث خطأ أثناء جلب بيانات القناة. تأكد من صحة الرابط.
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞
${footerText}`;
            return m.reply(errTeks);
        }
    }

    // الحالة الثانية: استخراج LID للأشخاص عبر الرقم
    const number = String(text || '').replace(/\D/g, '');

    if (!number) {
        let errNumTeks = `🃏 القائمة الرئيسية
❖ ── ✦ ── [ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
 ┠ ❌ ╎ الرجاء إدخال رقم صحيح لاستخراج الـ LID.
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞
${footerText}`;
        return m.reply(errNumTeks);
    }

    try {
        const jid = `${number}@s.whatsapp.net`;
        let lid = null;

        const map = conn?.signalRepository?.lidMapping;
        if (map?.getLIDForPN) {
            lid = await map.getLIDForPN(jid);
        }

        if (!lid && m.chat?.endsWith('@g.us')) {
            const metadata = await conn.groupMetadata(m.chat);
            const participants = metadata?.participants || [];

            const participant = participants.find(p => {
                const ids = [p.id, p.jid, p.phoneNumber, p.pn, p.user].filter(Boolean);
                return ids.some(id => String(id).split('@')[0].replace(/\D/g, '') === number);
            });

            lid = participant?.lid || null;
        }

        if (!lid) {
            let notFoundTeks = `🃏 القائمة الرئيسية
❖ ── ✦ ── [ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
 ┠ ⚠️ ╎ لم يتم العثور على LID للرقم: ${number}
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞
${footerText}`;
            return m.reply(notFoundTeks);
        }

        let teks = `🃏 القائمة الرئيسية
❖ ── ✦ ── [ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
 ┠ 🆔 ╎ تـم اسـتـخـراج LID
 ┠ 📱 ╎ الرقم: ${number}
 ┠ 🔑 ╎ الرمز: ${lid}
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞
${footerText}`;

        let msg = generateWAMessageFromContent(m.chat, {
            viewOnceMessage: {
                message: {
                    messageContextInfo: {
                        deviceListMetadata: {},
                        deviceListMetadataVersion: 2
                    },
                    interactiveMessage: proto.Message.InteractiveMessage.create({
                        body: proto.Message.InteractiveMessage.Body.create({ text: teks }),
                        footer: proto.Message.InteractiveMessage.Footer.create({ text: footerText }),
                        nativeFlowMessage: proto.Message.InteractiveMessage.NativeFlowMessage.create({
                            buttons: [
                                {
                                    name: "cta_copy",
                                    buttonParamsJson: JSON.stringify({
                                        display_text: "📋 نسخ LID",
                                        id: "copy_lid_action",
                                        copy_code: String(lid)
                                    })
                                }
                            ]
                        })
                    })
                }
            }
        }, { quoted: m });

        return await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });

    } catch (e) {
        console.error('LID ERROR:', e);
        let errorTeks = `🃏 القائمة الرئيسية
❖ ── ✦ ── [ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯 ] ── ✦ ── ❖
        🖤 ⦓ 𝕴𝖙𝖆𝖈𝖍𝖎 ♞ 𝕵𝖔𝖐𝖊𝖗 ⦔ 🖤
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
 ┠ ❌ ╎ حدث خطأ تقني: ${e?.message || 'غير معروف'}
❖ ── ✦ ── ❖ ── ✦ ── ❖ ── ✦ ── ❖
        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞
${footerText}`;
        return m.reply(errorTeks);
    }
};

handler.help = ['lid', 'لدج', 'لدج2'];
handler.tags = ['owner', 'tools'];
handler.command = /^(lid|لدج|لدج2)$/i;

export default handler;
