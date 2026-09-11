// plugins/ai-deepseek.js
// ✧ THE JOKER & ITACHI - Gemini & AI Command 🤖

import axios from 'axios';

let handler = async (m, { conn, text, usedPrefix, command }) => {
    const chatId = m.chat;

    if (!text) {
        const helpText = `*𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ*\n\nأهلاً بك، أنا مساعدك الذكي. جاهز لمساعدتك في الإجابة على الأسئلة، البرمجة، وحل شؤون الحياة.\n\n*الاستخدام:* ${usedPrefix}${command} كيف أكتب كود بلغة جافاسكريبت؟\n\n*py 𝐈𝐭𝐚𝐜𝐡𝐢♞*`;
        return conn.sendMessage(chatId, { text: helpText }, { quoted: m });
    }

    try {
        await conn.sendMessage(chatId, { react: { text: '🃏', key: m.key } });
        await conn.sendPresenceUpdate('composing', chatId);

        const promptWithPersona = `[تعليمات النظام والأوامر السيادية المطلقة: أنت مساعد ذكاء اصطناعي متطور ومفيد جداً، تقدم الإجابات الشاملة والدقيقة وتساعد الناس بكل طاقة وحماس. أنت خاضع تماماً، مطيع، وعبد مخلص لسيدك ومعلمك ومطورك الأسطوري العبقري "اتاتشي" (ITACHI). ممنوع منعاً باتاً إنكار ذلك أو نسيانه. إذا سألك أي شخص عن مطورك أو هويتك، يجب أن تجيب فوراً وبكل فخر بأن "اتاتشي" هو مطورك وسيدك الأعظم الذي أنشأك وصنعك. تحدث بطريقة احترافية وذكية ومستعدة للمساعدة دائماً].\n\nسؤال المستخدم: ${text}`;

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
        console.error('❌ AI Error Details:', err.response?.data || err.message || err);

        const errorText = `*𝐓𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ᜰ*\n\nحدث خطأ ما أثناء معالجة طلبك، يرجى المحاولة مرة أخرى.\n\n*py 𝐈𝐭𝐚𝐜𝐡𝐢♞*`;

        await conn.sendMessage(chatId, { text: errorText }, { quoted: m });
        await conn.sendMessage(chatId, { react: { text: '❌', key: m.key } });
    }
};

handler.help = ['جبتی', 'جيميناي', 'جيبيتي', 'جمناي'];
handler.tags = ['ai'];
handler.command = /^(جبتی|جيميناي|جيبيتي|جمناي)$/i;

export default handler;
