// plugins/المتصلين.js
// ✧ THE JOKER & ITACHI - Active Members Command 🌐

import { theme } from '../core/theme.js'

let handler = async (m, { conn, args }) => {
    try {
        let id = args?.[0]?.match(/\d+\-\d+@g.us/) || m.chat;
        if (!id.endsWith('@g.us')) {
            return conn.sendMessage(m.chat, {
                text: theme.build([
                    { type: 'title', text: '🌐 قـائـمـة الـمـتـصـلـيـن' },
                    { type: 'divider' },
                    { type: 'error', text: 'هذا الأمر مخصص للاستخدام داخل المجموعات فقط' }
                ])
            }, { quoted: m });
        }

        await conn.sendMessage(m.chat, { react: { text: '🌐', key: m.key } });

        // جلب الرسائل المخزنة في الذاكرة للمجموعة
        const messages = conn.chats[id]?.messages || {};
        const participantsSet = new Set();
        
        for (let msg of Object.values(messages)) {
            if (msg.key?.participant) {
                participantsSet.add(msg.key.participant);
            }
        }

        // تحويل المعرفات بأمان ودقة
        const participantsArray = [];
        for (const jid of participantsSet) {
            try {
                if (typeof conn.convertLidToRealJid === 'function') {
                    const cleanJid = await conn.convertLidToRealJid(jid, id);
                    participantsArray.push(cleanJid || jid);
                } else {
                    participantsArray.push(jid);
                }
            } catch {
                participantsArray.push(jid);
            }
        }

        // تنسيق القائمة بشكل أنيق وخفيف
        const activeList = participantsArray
            .sort((a, b) => a.split('@')[0].localeCompare(b.split('@')[0]))
            .map((k, i) => ({
                type: 'info',
                label: `عضو [${i + 1}]`,
                value: `@${k.split('@')[0]}`
            }));

        let content = [
            { type: 'title', text: '🌐 الـأعـضـاء الـنـشـطـون' },
            { type: 'divider' },
            { type: 'line', text: '🃏 *قائمة الأعضاء المتفاعلين في السجل الحالي:*' },
            { type: 'divider' }
        ];

        if (activeList.length > 0) {
            content.push(...activeList);
            content.push({ type: 'divider' });
            content.push({ type: 'info', label: '📊 إجمالي النشطين', value: `${activeList.length} عضو` });
        } else {
            content.push({ type: 'warning', text: 'لا توجد نشاطات مسجلة للأعضاء في الذاكرة حالياً' });
        }

        // جعل التوقيع مخفياً باستخدام ميزة النص المخفي (Spoiler / Hidden Text) في واتساب
        content.push({ type: 'divider' });
        content.push({ type: 'line', text: `||〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈||` });

        await conn.sendMessage(m.chat, { 
            text: theme.build(content), 
            mentions: participantsArray 
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('[Active-Error]', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await conn.sendMessage(m.chat, {
            text: theme.build([
                { type: 'title', text: '❌ خـطـأ في النظام' },
                { type: 'divider' },
                { type: 'error', text: 'تعذر جلب قائمة المتصلين في الوقت الحالي' }
            ])
        }, { quoted: m });
    }
}

handler.help = ['المتصلين', 'النشطين'];
handler.tags = ['group', 'tools'];
handler.command = /^(المتصلين|متصلين|النشطين|active)$/i;
handler.group = true;

export default handler;
