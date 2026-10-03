/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪ𝚃𝙰𝙷𝙸
*/

import { theme } from '../core/theme.js';

let handler = async (m, { conn, text, command, usedPrefix }) => {

    // 🛡️ منع تحذير البوت نفسه
    if (m.mentionedJid && m.mentionedJid.includes(conn.user.jid)) {
        return conn.reply(m.chat, theme.build([
            { type: 'title', text: '🃏 تـنـبـيـه الـعـدم' },
            { type: 'divider' },
            { type: 'error', text: 'لا يمكنك تحذير كيان البوت نفسه.. كيف تحاكم الظل يا صديقي؟' }
        ]), m);
    }

    // منع تحذير المطورين المصرح لهم
    const developers = ['249927142037@s.whatsapp.net'];
    if (m.mentionedJid && developers.some(dev => m.mentionedJid.includes(dev))) {
        return conn.reply(m.chat, theme.build([
            { type: 'title', text: '👑 صَلاحيّة الـمـاسـتـر' },
            { type: 'divider' },
            { type: 'error', text: 'لا يمكنك تحذير المطور الأسطوري (إيتاشي).. الأسياد لا يخضعون لقواعد البشر.' }
        ]), m);
    }

    let who = null;

    // الحصول على المستخدم المستهدف
    if (m.mentionedJid && m.mentionedJid[0]) {
        who = m.mentionedJid[0];
    } else if (m.quoted && m.quoted.sender) {
        who = m.quoted.sender;
    } else {
        await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });
        return conn.reply(m.chat, theme.build([
            { type: 'title', text: '🃏 نِظام الإنذارات' },
            { type: 'divider' },
            { type: 'info', label: 'الاستخدام', value: `قم بالرد على رسالة الشخص أو اكتب:\n${usedPrefix + command} @user` }
        ]), m);
    }

    if (!who) return;

    who = who.split('@')[0] + '@s.whatsapp.net';

    // قاعدة البيانات
    if (!global.db.data.users) global.db.data.users = {};
    if (!global.db.data.users[who]) global.db.data.users[who] = { warn: 0 };

    let user = global.db.data.users[who];
    let targetName = who.split('@')[0];

    try {
        let name = await conn.getName(who);
        if (name) targetName = name;
    } catch(e) {}

    // ========== تحذير / إنذار ==========
    if (command === 'تحذير' || command === 'انذار' || command === 'warn') {
        const reason = text ? text.replace(/@\d+-?\d*/g, '').trim() : 'بدون سبب معلن';
        user.warn = (user.warn || 0) + 1;

        await conn.sendMessage(m.chat, { react: { text: '⚠️', key: m.key } });

        let warnMsg = theme.build([
            { type: 'title', text: '⚠️ إِنـذار جَـديـد' },
            { type: 'divider' },
            { type: 'info', label: '👤 العضو', value: targetName },
            { type: 'info', label: '📝 السبب', value: reason },
            { type: 'info', label: '📊 العداد', value: `${user.warn}/3 إنذارات` }
        ]);

        await conn.sendMessage(m.chat, { text: warnMsg, mentions: [who] }, { quoted: m });

        // طرد العضو إذا بلغ 3 إنذارات
        if (user.warn >= 3) {
            user.warn = 0;
            let kickMsg = theme.build([
                { type: 'title', text: '🚫 طـرد مـن الـعـدم' },
                { type: 'divider' },
                { type: 'info', label: '👤 العضو', value: targetName },
                { type: 'error', text: 'تم طرده خارج الحدود لبلوغه الحد الأقصى (3 إنذارات).' }
            ]);
            await conn.sendMessage(m.chat, { text: kickMsg, mentions: [who] }, { quoted: m });
            await conn.groupParticipantsUpdate(m.chat, [who], 'remove');
        }
    }

    // ========== إلغاء تحذير / إلغاء ==========
    if (command === 'الغاء_انذار' || command === 'الغاء') {
        if (!user.warn || user.warn === 0) {
            return conn.reply(m.chat, theme.build([
                { type: 'title', text: '🃏 سِجِل نَظِيف' },
                { type: 'divider' },
                { type: 'line', text: `هذا العضو (${targetName}) ليس لديه أي إنذارات مسجلة.` }
            ]), m);
        }

        user.warn -= 1;

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } });

        let unWarnMsg = theme.build([
            { type: 'title', text: '✅ تَـم إلـغـاء الإنـذار' },
            { type: 'divider' },
            { type: 'info', label: '👤 العضو', value: targetName },
            { type: 'info', label: '📊 المتبقي', value: `${user.warn}/3 إنذارات` }
        ]);

        await conn.sendMessage(m.chat, { text: unWarnMsg, mentions: [who] }, { quoted: m });
    }
};

handler.command = ['تحذير', 'انذار', 'warn', 'الغاء_انذار', 'فك_انذار'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
