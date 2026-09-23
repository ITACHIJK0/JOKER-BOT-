/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪ𝚃𝙰𝙲𝙷𝙸

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝙅O𝙆𝙴𝙍 𝘽𝙊𝙏 」
「 لا تحذف الحقوق 🖤 」
*/

import { theme } from '../core/theme.js'

const allowedNumbers = [
    '249927142037',
    '249916221538'
]

const handler = async (m, { conn }) => {

    const sender = String(m.sender || '')
        .replace(/[^0-9]/g, '')

    if (!allowedNumbers.includes(sender)) {
        const denyContent = [
            { type: 'title', text: '⛔ 𝐀𝐂𝐂𝐄𝐒𝐒 𝗗𝙴𝙽𝙸𝙴𝙳' },
            { type: 'divider' },
            { type: 'line', text: '❌ هذا الأمر مخصص للمطورين فقط.' }
        ]
        return conn.reply(m.chat, theme.build(denyContent), m)
    }

    const chats = Object.entries(
        global.db?.data?.chats || {}
    ).filter(([_, chat]) => chat?.isBanned)

    const users = Object.entries(
        global.db?.data?.users || {}
    ).filter(([_, user]) => user?.banned)

    const mentions = []

    const userList = users.length
        ? users.map(([jid], index) => {
            let number = String(jid)
                .split('@')[0]
                .replace(/[^0-9]/g, '')

            if (!number) {
                number = 'غير معروف'
            }

            const mentionJid =
                jid.includes('@')
                    ? jid
                    : `${number}@s.whatsapp.net`

            if (number !== 'غير معروف') {
                mentions.push(mentionJid)
            }

            return `• ${index + 1}. @${number}`
        }).join('\n')
        : '• لا يوجد مستخدمون محظورون.'

    const chatList = chats.length
        ? chats.map(([jid], index) =>
            `• ${index + 1}. ${jid}`
        ).join('\n')
        : '• لا توجد مجموعات محظورة.'

    const content = [
        { type: 'title', text: '✦ 𝐁𝐀𝐍𝐍𝐄𝐃 𝐋𝐈𝐒𝐓 ✦' },
        { type: 'divider' },
        { type: 'line', text: '👤 *المستخدمون المحظورون:*' },
        { type: 'line', text: `📊 العدد: ${users.length}` },
        { type: 'line', text: userList },
        { type: 'divider' },
        { type: 'line', text: '💬 *المجموعات المحظورة:*' },
        { type: 'line', text: `📊 العدد: ${chats.length}` },
        { type: 'line', text: chatList },
        { type: 'divider' },
        { type: 'line', text: '⚡ قائمة المحظورين المسجلين في قاعدة بيانات JOKER BOT' }
    ]

    return conn.reply(m.chat, theme.build(content), m, {
        mentions
    })
}

handler.command = [
    'banlist',
    'listban',
    'المتبندين',
    'المحظورين'
]

handler.help = ['المتبندين']
handler.tags = ['owner']

export default handler
