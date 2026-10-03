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

const handler = async (m, { conn, isAdmin, isROwner, isOwner, command, text }) => {

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

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  const chatData = global.db.data.chats[m.chat]

  // معالجة أمر .فك_اعضاء (إلغاء وضع حظر الأعضاء / المشرفين فقط)
  if (command === 'فك_اعضاء' || command === 'إلغاء_حظر_اعضاء') {
    if (!(isAdmin || isROwner || isOwner)) {
      return sendThemedText(conn, m, '🚫 𝘼𝘾𝘾𝙀𝙎𝙎 𝗗𝙴𝙽𝙸𝙴𝙳', '❌ هذا الأمر مخصص للمشرفين والمطور فقط.')
    }
    
    chatData.adminOnly = false

    const successContent = [
      { type: 'title', text: '✦ MEMBERS UNBANNED ✦' },
      { type: 'divider' },
      { type: 'line', text: '🔓 تم إلغاء وضع المشرفين فقط بنجاح.' },
      { type: 'line', text: '👥 الحالة: *الرد متاح لجميع الأعضاء*' }
    ]
    return conn.reply(m.chat, theme.build(successContent), m)
  }

  // معالجة أمر .فك_فرعي (فك حظر بوت فرعي)
  if (command === 'فك_فرعي' || command === 'فك_حظر_فرعي') {
    if (!(isROwner || isOwner || isSocketUser || isAdmin)) {
      return sendThemedText(conn, m, '🚫 𝘼𝘾𝘾𝙀𝙎𝙎 𝗗𝙴𝙽𝙸𝙴𝙳', '❌ لا تملك صلاحية استخدام هذا الأمر.')
    }

    chatData.subBotsBanned = chatData.subBotsBanned || {}
    let targetPath = botPath
    let targetName = 'البوت الفرعي الخاص بك'

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
    } else if (!isSocketUser && !(isROwner || isOwner)) {
      return sendThemedText(conn, m, '🚫 𝘼𝘾𝘾𝙀𝙎𝙎 𝗗𝙴𝙽𝙸𝙴𝙳', '❌ هذا الأمر خاص بأصحاب البوتات الفرعية أو المطور.')
    }

    chatData.subBotsBanned[targetPath] = false

    const successContent = [
      { type: 'title', text: '✦ SUB-BOT UNBANNED ✦' },
      { type: 'divider' },
      { type: 'line', text: `✅ تم إعادة تفعيل ${targetName} في هذه المجموعة بنجاح.` },
      { type: 'line', text: '🔱 النظام: *ACTIVE*' }
    ]
    return conn.reply(m.chat, theme.build(successContent), m, {
      mentions: mentioned ? [mentioned] : []
    })
  }

  // الأمر الافتراضي (فك حظر الجروب العام / البوت الرئيسي)
  if (!(isAdmin || isROwner || isSocketUser)) {
    return sendThemedText(
      conn,
      m,
      '🚫 𝘼𝘾𝘾𝙀𝙎𝙎 𝗗𝙴𝙽𝙸𝙴𝙳',
      '❌ ليس لديك صلاحية استخدام هذا الأمر.'
    )
  }

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

  if (targetSubBotPath) {
    if (chatData.subBotsBanned) {
      chatData.subBotsBanned[targetSubBotPath] = false
    }
  } else if (isSocketUser && !isROwner) {
    if (chatData.subBotsBanned) {
      chatData.subBotsBanned[botPath] = false
    }
  } else {
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
  'unbanchat',
  'فك_اعضاء',
  'فك_فرعي'
]

handler.tags = [
  'group'
]

handler.command = [
  'اشتغل_هنا',
  'فك_بانشات',
  'بانشاتفك',
  'desbanearbot',
  'unbanchat',
  'فك_اعضاء',
  'فك_فرعي'
]

handler.group = true

export default handler
