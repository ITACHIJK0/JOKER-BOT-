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

const handler = async (m, { conn, isAdmin, isROwner }) => {

  if (!m.isGroup) {
    return sendThemedText(
      conn,
      m,
      '❌ خطا في الاستخدام',
      'هذا الأمر مخصص للمجموعات فقط.'
    )
  }

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
      '🚫 𝘼𝘾𝘾𝙀𝐒𝙎 𝗗𝙴𝙽𝙸𝙴𝙳',
      '❌ ليس لديك صلاحية استخدام هذا الأمر.\n\n🛡️ المسموح لهم:\n• مشرف المجموعة\n• مالك البوت / المطورون\n• مستخدمو الـ SubBot'
    )
  }

  global.db.data.chats[m.chat] =
    global.db.data.chats[m.chat] || {}

  global.db.data.chats[m.chat].isBanned = false

  const successContent = [
    { type: 'title', text: '✦ 𝐔𝐍𝐁𝐀𝐍 𝐂𝐇𝐀𝐓 ✦' },
    { type: 'divider' },
    { type: 'line', text: '✅ تم فك حظر البوت بنجاح.' },
    { type: 'line', text: '🌓 الحالة: *ACTIVE*' },
    { type: 'line', text: '🔱 النظام: *JOKER & ITACHI CONTROL*' },
    { type: 'divider' },
    { type: 'line', text: '⚡ البوت جاهز لاستقبال الأوامر من جديد.' }
  ]

  return conn.reply(m.chat, theme.build(successContent), m)
}

handler.help = [
  'اشتغل_هنا',
  'فك_بانشات',
  'بانشاتفك',
  'desbanearbot',
  'unbanchat'
]

handler.tags = [
  'group'
]

handler.command = [
  'اشتغل_هنا',
  'فك_بانشات',
  'بانشاتفك',
  'desbanearbot',
  'unbanchat'
]

handler.group = true

export default handler
