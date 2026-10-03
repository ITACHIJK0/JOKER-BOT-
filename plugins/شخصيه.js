// plugins/personality.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - تحليل الشخصية الأسطوري 🎭

import { theme } from '../core/theme.js';

let handler = async (m, { conn, command, text, usedPrefix }) => {
    // قائمة المطورين المعتمدة (تتضمن الأرقام والـ LID الجديد)
    const allowedOwners = [
        '249927142037@s.whatsapp.net',
        '212408480080003@lid',
        '14904274759837@lid'
    ];

    const getCleanJid = (jid) => {
        if (!jid) return '';
        return typeof conn.convertLidToRealJid === 'function' 
            ? conn.convertLidToRealJid(jid, m.chat).catch(() => jid) 
            : jid;
    };

    let targetJid = '';

    if (m.mentionedJid && m.mentionedJid[0]) {
        targetJid = await getCleanJid(m.mentionedJid[0]);
    } else if (m.quoted && m.quoted.sender) {
        targetJid = await getCleanJid(m.quoted.sender);
    } else if (text && text.trim()) {
        const input = text.trim();
        if (input.startsWith('@') && /^\d+$/.test(input.slice(1))) {
            targetJid = input.slice(1) + '@s.whatsapp.net';
        } else if (/^\d+$/.test(input)) {             targetJid = input + '@s.whatsapp.net';         } else if (/^\+\d+$/.test(input)) {
            targetJid = input.replace(/[^0-9]/g, '') + '@s.whatsapp.net';
        }
    }

    if (!targetJid) {
        targetJid = await getCleanJid(m.sender);
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } });

    // التحقق من أن المستهدف هو المطور
    const isDeveloper = targetJid ? allowedOwners.some(dev => {
        let devClean = dev.replace(/[^0-9]/g, '');
        let targetClean = targetJid.replace(/[^0-9]/g, '');
        return targetClean === devClean;
    }) : false;

    const mentionsList = targetJid && targetJid.endsWith('@s.whatsapp.net') ? [targetJid] : [];
    const displayName = targetJid ? `@${targetJid.split('@')[0]}` : 'مستخدم مجهول';

    let personalityContent = '';

    if (isDeveloper) {
        // 👑 استمارة المطور الأسطورية
        personalityContent = theme.build([
            { type: 'title', text: `⚜️ تـحـلـيـل الـشـخـصـيـة (الـمـاسـتـر)` },
            { type: 'spacer' },
            { type: 'info', label: '👤 الـاسـم', value: displayName },
            { type: 'divider' },
            { type: 'info', label: '🧠 نـسـبـة الـذكـاء', value: `${randRange(92, 99)}%` },
            { type: 'info', label: '🤪 نـسـبـة الـغـبـاء', value: `${randRange(1, 8)}%` },
            { type: 'info', label: '❤️ يـحـب', value: pickRandom(['البرمجة والتطوير', 'الصيانة والأفكار', 'التصميم والمعلومات', 'الدراسة والمثابرة']) },
            { type: 'info', label: '🌟 نـسـبـة الـشـهـرة', value: `${randRange(85, 98)}%` },
            { type: 'info', label: '🔥 نـسـبـة الـانـحـراف', value: `${randRange(5, 25)}%` },
            { type: 'divider' },
            { type: 'info', label: '📌 مُـلاحـظـة', value: pickRandom(['فنان بمعنى الكلمة 👑', 'من افضل الاشخاص في العالم ✨', 'غني جداً وأمير زمانه 💰', 'والديه راضيين عليه تماماً 🌟']) }
        ]);
    } else {
        // 👤 استمارة المستخدم العادي
        personalityContent = theme.build([
            { type: 'title', text: `🎭 تـحـلـيـل الـشـخـصـيـة الـعـام` },
            { type: 'spacer' },
            { type: 'info', label: '👤 الـاسـم', value: displayName },
            { type: 'divider' },
            { type: 'info', label: '🧠 نـسـبـة الـذكـاء', value: `${randRange(10, 95)}%` },
            { type: 'info', label: '🤪 نـسـبـة الـغـبـاء', value: `${randRange(10, 95)}%` },
            { type: 'info', label: '❤️ يـحـب', value: pickRandom(['الهدوء والراحة 🌿', 'السفر والسياحة ✈️', 'النوم والكسل 💤', 'الألعاب والتلفون 📱', 'التصميم والرسم 🎨', 'الأكل والنوم 🍕', 'الرياضة والعمل ⚡', 'الدراسة والاجتهاد 📚']) },
            { type: 'info', label: '🌟 نـسـبـة الـشـهـرة', value: `${randRange(5, 90)}%` },
            { type: 'info', label: '🔥 نـسـبـة الـانـحـراف', value: `${randRange(5, 95)}%` },
            { type: 'divider' },
            { type: 'info', label: '📌 مُـلاحـظـة', value: pickRandom(['الشخص دا عنده جفاف عاطفي 🌵', 'الشخص دا مريض نفسي شوية 🧩', 'الشخص دا محتاج حنان وعناية 🥺', 'الشخص دا فيه أمل للمستقبل 🌅', 'الشخص دا فاقد الأمل خالص 💀', 'الشخص دا غني بس مخبي 💸', 'الشخص دا فقير ومسكين 📉', 'الشخص دا ما يتصدق على الفقراء 🐒']) }
        ]);
    }

    // جلب صورة البروفايل مع صورة احتياطية
    let profilePic;
    try {
        profilePic = await conn.profilePictureUrl(targetJid, 'image');
    } catch {
        profilePic = 'https://i.postimg.cc/Dz49XDBJ/32882135c22085dfaabfd5bed46f3197.jpg';
    }

    await conn.sendMessage(m.chat, {
        image: { url: profilePic },
        caption: personalityContent,
        mentions: mentionsList
    }, { quoted: m });

    await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });
};

handler.help = ['شخصية'];
handler.tags = ['fun'];
handler.command = /^(شخصية|شخصيه)$/i;

export default handler;

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function randRange(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
