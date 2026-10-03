// plugins/المتصلين.js
// ✧ THE JOKER & ITACHI - Active Members Command 🌐

let handler = async (m, { conn, args }) => {
    try {
        let id = args?.[0]?.match(/\d+\-\d+@g.us/) || m.chat;
        if (!typeof id === 'string' || !id.endsWith('@g.us')) {
            id = m.chat;
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

        // بناء القائمة بالشكل المطلوب تماماً
        let activeRows = '';
        const sortedParticipants = participantsArray.sort((a, b) => a.split('@')[0].localeCompare(b.split('@')[0]));

        if (sortedParticipants.length > 0) {
            sortedParticipants.forEach((k, i) => {
                activeRows += `┠ 🔸╎عضو [${i + 1}]: @${k.split('@')[0]}\n`;
            });
        } else {
            activeRows += `┠ ⚠️╎لا توجد نشاطات مسجلة حالياً\n`;
        }

        let totalCount = sortedParticipants.length;

        // تركيب الرسالة بالشكل الملكي المستقل تماماً
        let msgText = `*꒷︶꒷꒦꒷ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯』 ꒷︶꒷꒦꒷*

   ♡ ⦓ 🌐 الأعضاء النشطون ⦔ ♡

*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*

*┠ 🛜╎قائمة الأعضاء النشطين حاليا* : ⇓⇓
${activeRows}
┠ 📊╎إجمالي النشطين: ${totalCount} عضو

   ♡ 𓆩 ألَا بِـذِڪْرِ اللَّهِ تَـطْـمَـئِـنُّ الْـقُـلُـوبُ 𓆪 ♡
*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*
        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞
> ꒷︶ 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞`;

        await conn.sendMessage(m.chat, { 
            text: msgText, 
            mentions: participantsArray 
        }, { quoted: m });

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

    } catch (e) {
        console.error('[Active-Error]', e);
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } });
        await conn.sendMessage(m.chat, {
            text: `*꒷︶꒷꒦꒷ 『𝒥𝒪𝒦𝐸𝑅 ♕ 𝐵𝒪𝒯』 ꒷︶꒷꒦꒷*\n\n   ♡ ⦓ ❌ خطأ في النظام ⦔ ♡\n\n*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n\n┠ ❌╎تعذر جلب قائمة المتصلين في الوقت الحالي.\n\n*꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷꒦꒷︶꒷*\n        ᵇʸ ➾ 𝐈𝐭𝐚𝐜𝐡𝐢 ♞`
        }, { quoted: m });
    }
}

handler.help = ['المتصلين', 'النشطين'];
handler.tags = ['group', 'tools'];
handler.command = /^(المتصلين|متصلين|النشطين|active)$/i;
handler.group = true;

export default handler;
