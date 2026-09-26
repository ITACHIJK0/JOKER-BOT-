/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪ𝚃𝙰𝙷𝙸

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝙅O𝙺𝙴𝙍 𝘽𝙾🇹 」
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

const handler = async (m, { conn, isAdmin, isROwner }) => {

  if (!m.isGroup) {
    return sendThemedText(
      conn,
      m,
      '❌ خطا في الاستخدام',
      'هذا الأمر مخصص للمجموعات فقط.'
    )
  }

  const senderNumber = String(m.sender || '').replace(/\D/g, '')
  const botPath = path.join('./2BSubBot', senderNumber)
  const isSocketUser = fs.existsSync(botPath)

  if (!(isAdmin || isROwner || isSocketUser)) {
    return sendThemedText(
      conn,
      m,
      '🚫 𝘼𝘾𝘾𝙀𝙎𝙎 𝗗𝙴𝙽𝙸𝙴𝙳',
      '❌ ليس لديك صلاحية استخدام هذا الأمر.'
    )
  }

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  const chatData = global.db.data.chats[m.chat]

  let targetSubBotPath = null
  let targetName = 'هذه المجموعة'

  // التحقق هل المطور حدد شخصاً بمنشن أو ريبلاي لفك الحظر عن بوت فرعي معين
  const mentioned = m.mentionedJid?.[0] || m.quoted?.sender
  if (mentioned && isROwner) {
    const targetNumber = String(mentioned).replace(/\D/g, '')
    const checkPath = path.join('./2BSubBot', targetNumber)
    if (fs.existsSync(checkPath)) {
      targetSubBotPath = checkPath
      targetName = `البوت الفرعي (@${targetNumber})`
    }
  }

  // منطق فك الحظر الذكي
  if (targetSubBotPath) {
    // فك حظر بوت فرعي محدد عبر المطور
    if (chatData.subBotsBanned) {
      chatData.subBotsBanned[targetSubBotPath] = false
    }
  } else if (isSocketUser && !isROwner) {
    // صاحب البوت الفرعي يفك حظر بوته هو فقط
    if (chatData.subBotsBanned) {
      chatData.subBotsBanned[botPath] = false
    }
  } else {
    // فك الحظر العام عن الجروب (للبوت الرئيسي)
    chatData.isBanned = false
  }

  const successContent = [
    { type: 'title', text: '✦ 𝐔𝐍𝐁𝐀𝐍 𝐂𝐇𝐀𝐓 ✦' },
    { type: 'divider' },
    { type: 'line', text: `✅ تم فك حظر التشغيل في ${targetName} بنجاح.` },
    { type: 'line', text: '🌓 الحالة: *ACTIVE*' },
    { type: 'line', text: '🔱 النظام: *JOKER & ITACHI CONTROL*' },
    { type: 'divider' },
    { type: 'line', text: '⚡ البوت جاهز لاستقبال الأوامر من جديد.' }
  ]

  return conn.reply(m.chat, theme.build(successContent), m, {
    mentions: mentioned ? [mentioned] : []
  })
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
