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
  const senderNumber = String(m.sender || '').replace(/\D/g, '')
  const botPath = path.join('./2BSubBot', senderNumber)
  const isSocketUser = fs.existsSync(botPath)

  // التحقق من الصلاحية (مطور أو صاحب بوت فرعي أو مشرف)
  if (!(isROwner || isOwner || isSocketUser || isAdmin)) {
    return sendThemedText(
      conn,
      m,
      '🚫 𝘼𝘾𝘾𝙀𝙎𝙎 𝗗𝙴𝙽𝙸𝙴𝙳',
      '❌ لا تملك صلاحية استخدام هذا الأمر.'
    )
  }

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  const chatData = global.db.data.chats[m.chat]
  chatData.subBotsBanned = chatData.subBotsBanned || {}

  let targetPath = botPath
  let targetName = 'البوت الفرعي الخاص بك'

  // إذا كان المطور يقوم بعمل منشن أو ريبلاي لشخص معين لتعطيل بوته الفرعي
  const mentioned = m.mentionedJid?.[0] || m.quoted?.sender
  if (mentioned && (isROwner || isOwner)) {
    const targetNumber = String(mentioned).replace(/\D/g, '')
    const checkPath = path.join('./2BSubBot', targetNumber)
    if (fs.existsSync(checkPath)) {
      targetPath = checkPath
      targetName = `البوت الفرعي (@${targetNumber})`
    } else {
      return sendThemedText(conn, m, '⚠️ 𝙒𝘼𝚁𝙽𝙸𝙽𝙶', '❌ الشخص المستهدف ليس لديه بوت فرعي مسجل.')
    }
  } else if (!isSocketUser && !isROwner && !isOwner) {
    return sendThemedText(conn, m, '🚫 𝘼𝘾𝘾𝙀𝙎𝙎 𝗗𝙴𝙽𝙸𝙴𝙳', '❌ هذا الأمر خاص بأصحاب البوتات الفرعية أو المطور.')
  }

  // تسجيل إيقاف البوت الفرعي المحدد فقط
  chatData.subBotsBanned[targetPath] = true

  const successContent = [
    { type: 'title', text: '✦  SUB-BOT BANNED ✦' },
    { type: 'divider' },
    { type: 'line', text: `🔒 تم إيقاف ${targetName} في هذه المجموعة بنجاح.` },
    { type: 'line', text: '🛡️ الحالة: *SUB-BOT DISABLED*' },
    { type: 'line', text: '💡 ملاحظة: *البوت الرئيسي لا يزال يعمل بشكل طبيعي.*' }
  ]

  return conn.reply(m.chat, theme.build(successContent), m)
}

handler.help = ['حظر_فرعي', 'وقف_فرعي']
handler.tags = ['group']
handler.command = /^(حظر_فرعي|وقف_فرعي)$/i
handler.group = true

export default handler
