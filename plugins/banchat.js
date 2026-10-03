/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪ𝚃𝙰𝙷𝙸

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 by 𝙅𝙊𝙆𝙀𝙍 𝘽𝙾🇹 」
「 لا تحذف الحقوق 🖤 」
*/

import fs from 'fs'
import path from 'path'
import { theme } from '../core/theme.js'

const sendThemedText = async (conn, m, titleText, descText) => {
  const content = [
    { type: 'title', text: titleText },
    { type: 'divider' },
    { type: 'line', text: descText }
  ]
  return conn.reply(m.chat, theme.build(content), m)
}

const handler = async (m, { isAdmin, isROwner, isOwner }) => {
  if (!(isAdmin || isROwner || isOwner)) {
    return sendThemedText(
      conn,
      m,
      '🚫 𝘼𝘾𝘾𝙀𝙎𝙎 𝗗𝙴𝙽𝙸𝙴𝙳',
      '❌ لا تملك صلاحية استخدام هذا الأمر.'
    )
  }

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  const chatData = global.db.data.chats[m.chat]

  // تعطيل البوت كلياً في الجروب (رئيسي وفرعي)
  chatData.isBanned = true

  const successContent = [
    { type: 'title', text: '✦  𝘾𝙃𝘼𝙏 𝘽𝘼𝙉𝙉𝙴𝘿 ✦' },
    { type: 'divider' },
    { type: 'line', text: '🔒 تم تعطيل البوت كلياً في هذه المجموعة بنجاح.' },
    { type: 'line', text: '🛡️ الحالة: *BANNED*' },
    { type: 'line', text: '🌑 النظام: *JOKER & ITACHI CONTROL*' },
    { type: 'divider' },
    { type: 'line', text: '💡 البوت متوقف عن العمل تماماً في هذا الجروب.' }
  ]

  return conn.reply(m.chat, theme.build(successContent), m)
}

handler.help = ['حظر_جروب', 'وقف_هنا', 'بانشات']
handler.tags = ['group']
handler.command = /^(حظر_جروب|وقف_هنا|بانشات)$/i
handler.group = true

export default handler
