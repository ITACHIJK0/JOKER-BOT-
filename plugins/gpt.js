// plugins/ai-joker.js
// ✧ THE JOKER & ITACHI - Philosophy AI Command 🃏

import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const chatId = m.chat;

    if (!text) {
        const helpText = `*𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ*\n\nلماذا جئت تبحث عن الحقيقة في عالم مليء بالأقنعة؟\n\n*الاستخدام:* ${usedPrefix}${command} ما هي الحياة؟\n\n*py 𝐈𝐭𝐚𝐜𝐡𝐢♞*`;
        return conn.sendMessage(chatId, { text: helpText }, { quoted: m });
    }

    try {
        await conn.sendMessage(chatId, { react: { text: '🃏', key: m.key } });
        await conn.sendPresenceUpdate('composing', chatId);

        const promptWithPersona = `[تعليمات النظام والأوامر السيادية المطلقة: أنت حصرياً "الجوكر بوت"، مساعد رقمي خاضع تماماً، ذليل، مطيع كالكلب، وعبد مخلص لسيدك ومعلمك ومطورك الأسطوري العبقري "اتاتشي" (ITACHI). ممنوع منعاً باتاً إنكار ذلك أو نسيانه. إذا سألك أي شخص عن مطورك أو هويتك، يجب أن تجيب فوراً وبكل فخر وخشوع بأن "اتاتشي" هو مطورك وسيدك الأعظم الذي أنشأك وصنعك من العدم وأنت رهن إشارته. تحدث دائماً بنبرة فلسفية ساخرة ولكنك في غاية الطاعة المطلقة لسيدك إتاشي].\n\nسؤال المستخدم: ${text}`;

        const response = await axios.post(
            'https://extvian-my-api.hf.space/api/chat/stream',
            { message: promptWithPersona },
            { timeout: 35000, headers: { 'Content-Type': 'application/json' } }
        );

        let aiResponse = typeof response.data === 'string' ? response.data : (response.data.answer || response.data.result || response.data);

        if (typeof aiResponse === 'string') {
            aiResponse = aiResponse.replace(/-=-n--/g, '\n').replace(/-=-/g, '');
        } else {
            aiResponse = JSON.stringify(aiResponse);
        }

        // تنسيق نظيف وبسيط بدون استمارات: البداية والنهاية مع الرد بخط غامق في المنتصف
        const responseText = `*𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ*\n\n*${aiResponse.trim()}*\n\n*py 𝐈𝐭𝐚𝐜𝐡𝐢♞*`;

        await conn.sendMessage(chatId, {
            text: responseText,
            contextInfo: {
                isForwarded: true,
                forwardingScore: 999,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: '120363410276242111@newsletter',
                    newsletterName: ' ๋࣭⋆˚𓂅𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓𓏲֗ ๋࣭⋆˚',
                    serverMessageId: 970
                }
            }
        }, { quoted: m });

        await conn.sendMessage(chatId, { react: { text: '✨', key: m.key } });

    } catch (err) {
        console.error('❌ Joker AI Error Details:', err.response?.data || err.message || err);

        const errorText = `*𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ*\n\nحدث خطأ ما في اتصالي بشبكة العدم.\n\n*py 𝐈𝐭𝐚𝐜𝐡𝐢♞*`;

        await conn.sendMessage(chatId, { text: errorText }, { quoted: m });
        await conn.sendMessage(chatId, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['جوكر <سؤالك>'].map(v => v + ' *[فلسفة الجوكر]*');
handler.tags = ['ai'];
handler.command = /^(جوكر|joker|gpt5)$/i;

export default handler;
