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

const handler = async (m, { isAdmin, isROwner, text }) => {
  const senderNumber = String(m.sender || '').replace(/\D/g, '')
  
  // مسار البوت الفرعي المرتبط بهذا الرقم إن وجد
  const botPath = path.join('./2BSubBot', senderNumber)
  const isSocketUser = fs.existsSync(botPath)

  // هل الشخص مشرف أو مطور أساسي أو يملك بوت فرعي؟
  if (!(isAdmin || isROwner || isSocketUser)) {
    return sendThemedText(
      conn,
      m,
      '🚫 𝘼𝘾𝘾𝙀𝙎𝙎 𝗗𝙴𝙽𝙸𝙴𝙳',
      '❌ لا تملك صلاحية استخدام هذا الأمر.'
    )
  }

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  const chatData = global.db.data.chats[m.chat]

  // إذا تم عمل منشن أو ريبلاي لشخص معين (والمطور هو من نفذها)
  let targetSubBotPath = null
  let targetName = 'هذه المجموعة'

  const mentioned = m.mentionedJid?.[0] || m.quoted?.sender
  if (mentioned && isROwner) {
    const targetNumber = String(mentioned).replace(/\D/g, '')
    const checkPath = path.join('./2BSubBot', targetNumber)
    if (fs.existsSync(checkPath)) {
      targetSubBotPath = checkPath
      targetName = `البوت الفرعي (@${targetNumber})`
    }
  }

  // المنطق الذكي للإيقاف:
  // 1. إذا كان المطور الأساسي كتب الأمر ولا يوجد استهداف محدد -> إيقاف الجروب كلياً للبوت الرئيسي
  // 2. إذا كان صاحب بوت فرعي أو تم استهداف بوت فرعي -> يتم تسجيل إيقاف خاص بالفرعي
  if (targetSubBotPath) {
    // إيقاف بوت فرعي معين عبر المطور
    chatData.subBotsBanned = chatData.subBotsBanned || {}
    chatData.subBotsBanned[targetSubBotPath] = true
  } else if (isSocketUser && !isROwner) {
    // صاحب البوت الفرعي يوقف بوت نفسه فقط في الجروب
    chatData.subBotsBanned = chatData.subBotsBanned || {}
    chatData.subBotsBanned[botPath] = true
  } else if (isROwner) {
    // المطور الأساسي بدون تحديد يوقف البوت العام في الجروب
    chatData.isBanned = true
  } else if (isAdmin) {
    // المشرف العادي يوقف البوت في الجروب
    chatData.isBanned = true
  }

  const successContent = [
    { type: 'title', text: '✦  Τ𝙷𝙰𝚃𝚂 𝘽𝘼𝙽𝙽𝙴𝐃 ✦' },
    { type: 'divider' },
    { type: 'line', text: `🔒 تم تعطيل التشغيل في ${targetName} بنجاح.` },
    { type: 'line', text: '🛡️ الحالة: *BANNED*' },
    { type: 'line', text: '🌑 النظام: *JOKER & ITACHI CONTROL*' },
    { type: 'divider' },
    { type: 'line', text: '💡 البوت يراقب أوامر فك الحظر للعودة للعمل فوراً.' }
  ]

  return conn.reply(m.chat, theme.build(successContent), m)
}

handler.help = ['حظر_جروب', 'وقف_هنا', 'بانشات']
handler.tags = ['group']
handler.command = ['حظر_جروب', 'وقف_هنا', 'بانشات']
handler.group = true

export default handler
