/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪ𝚃𝙰𝙲𝙷𝙸

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝙅𝙊𝙺𝙴𝙍 𝘽𝙊𝙏 」
「 لا تحذف الحقوق 🖤 」
*/

import { theme } from '../core/theme.js'

const allowedNumbers = [
    '249927142037',
    '249916221538'
]

const sendThemedText = async (conn, m, titleText, descText, mentions = []) => {
    const content = [
        { type: 'title', text: titleText },
        { type: 'divider' },
        { type: 'line', text: descText }
    ]
    return conn.reply(m.chat, theme.build(content), m, { mentions })
}

let handler = async (m, { conn }) => {

    const sender = String(m.sender || '')
        .replace(/[^0-9]/g, '')

    if (!allowedNumbers.includes(sender)) {
        return sendThemedText(
            conn,
            m,
            '⛔ 𝐀𝐂𝐂𝐄𝐒𝐒 𝗗𝙴𝙽𝙸𝙴𝙳',
            '❌ هذا الأمر مخصص للمطورين فقط.'
        )
    }

    if (!m.quoted && !m.mentionedJid?.length) {
        return sendThemedText(
            conn,
            m,
            '🚫 𝐁𝐀𝐍 𝐌𝐄𝐍𝐔',
            '⚠️ حدد المستخدم أولاً:\n\n• منشن المستخدم\n• أو اعمل ريبلاي على رسالته'
        )
    }

    let who

    if (m.isGroup) {
        who =
            m.mentionedJid?.[0] ||
            m.quoted?.sender ||
            null
    } else {
        who = m.chat
    }

    if (!who) {
        return sendThemedText(
            conn,
            m,
            '⚠️ خطأ في التحديد',
            'لم أتمكن من تحديد المستخدم المستهدف.'
        )
    }

    const users = global.db?.data?.users

    if (!users) {
        return sendThemedText(
            conn,
            m,
            '❌ خطأ في قاعدة البيانات',
            'قاعدة بيانات المستخدمين غير متوفرة حالياً.'
        )
    }

    if (!users[who]) {
        users[who] = {}
    }

    if (users[who].banned) {
        const userTag = `@${who.split('@')[0]}`
        return sendThemedText(
            conn,
            m,
            '⚠️ تنبيه بالحظر',
            `المستخدم ${userTag} محظور بالفعل من استخدام البوت.`,
            [who]
        )
    }

    users[who].banned = true

    await m.react('🚫')

    const userTag = `@${who.split('@')[0]}`
    const successContent = [
        { type: 'title', text: '✦ 𝐁𝐀𝐍𝐍𝐄𝐃 𝐒𝐔𝐂𝐂𝐄𝐒𝐒𝐅𝐔𝐋𝐋𝐘 ✦' },
        { type: 'divider' },
        { type: 'line', text: '✓ تم حظر المستخدم بنجاح' },
        { type: 'line', text: `👤 المستخدم: ${userTag}` },
        { type: 'line', text: '🔒 الحالة: *BANNED*' },
        { type: 'line', text: '⚡ بواسطة: *JOKER & ITACHI BOT*' },
        { type: 'divider' },
        { type: 'line', text: '📝 لن يتمكن المستخدم من استخدام أوامر البوت بعد الآن.' }
    ]

    return conn.reply(m.chat, theme.build(successContent), m, {
        mentions: [who]
    })
}

handler.help = ['بان <@tag>']
handler.command = ['banuser', 'بان', 'ban']
handler.tags = ['owner']

export default handler
