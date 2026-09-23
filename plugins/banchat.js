/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪ𝚃𝙰𝙲𝙷𝙸

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝙅𝙾𝙆𝙴𝙍 𝘽𝙾𝚃 」
「 لا تحذف الحقوق 🖤 」
*/

import fs from 'fs'
import path from 'path'
import { theme } from '../core/theme.js'

const allowedNumbers = [
  '249916221538',
  '249927142037'
]

const sendThemedText = async (conn, m, titleText, descText) => {
  const content = [
    { type: 'title', text: titleText },
    { type: 'divider' },
    { type: 'line', text: descText }
  ]
  return conn.reply(m.chat, theme.build(content), m)
}

const handler = async (m, { isAdmin, isROwner }) => {

  const senderNumber =
    String(m.sender || '')
      .replace(/\D/g, '')

  const isAllowedNumber = allowedNumbers.includes(senderNumber)

  const botPath =
    path.join(
      './2BSubBot',
      senderNumber
    )

  const isSocketUser =
    fs.existsSync(botPath)

  if (!(isAdmin || isROwner || isSocketUser || isAllowedNumber)) {
    return sendThemedText(
      conn,
      m,
      '🚫 𝘼𝘾𝘾𝙀𝙎𝙎 𝗗𝙴𝙽𝙸𝙴𝙳',
      '❌ لا تملك صلاحية استخدام هذا الأمر.\n\n🛡️ المسموح لهم:\n• مشرف المجموعة\n• مالك البوت / المطورون\n• مستخدمو الـ SubBot'
    )
  }

  global.db.data.chats[m.chat] =
    global.db.data.chats[m.chat] || {}

  global.db.data.chats[m.chat].isBanned = true

  const successContent = [
    { type: 'title', text: '✦  Τ𝙷𝙰𝚃𝚂 𝘽𝘼𝙽𝙽𝙴𝙳 ✦' },
    { type: 'divider' },
    { type: 'line', text: '🔒 تم تعطيل البوت في هذه المجموعة بنجاح.' },
    { type: 'line', text: '🛡️ الحالة: *BANNED*' },
    { type: 'line', text: '🌑 النظام: *JOKER & ITACHI CONTROL*' },
    { type: 'divider' },
    { type: 'line', text: '💡 لإعادة التفعيل استخدم أمر فك الحظر الخاص بالمجموعة.' }
  ]

  return conn.reply(m.chat, theme.build(successContent), m)
}

handler.help = [
  'حظر_جروب',
  'وقف_هنا',
  'بانشات'
]

handler.tags = [
  'group'
]

handler.command = [
  'حظر_جروب',
  'وقف_هنا',
  'بانشات'
]

handler.group = true

export default handler
