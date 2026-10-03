/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪ𝚃𝙰𝙷𝙸

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 by 𝙅𝙊𝙆𝙀𝙍 𝘽𝙾🇹 」
「 لا تحذف الحقوق 🖤 」
*/

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
      '❌ هذا الأمر خاص بالمشرفين والمطور فقط.'
    )
  }

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  const chatData = global.db.data.chats[m.chat]

  // تبديل حالة وضع المشرفين فقط (تشغيل / إيقاف)
  chatData.adminOnly = !chatData.adminOnly

  const statusText = chatData.adminOnly ? 'مفعل (الرد للمشرفين فقط 🛡️)' : 'معطل (الرد متاح للجميع 👥)'

  const successContent = [
    { type: 'title', text: '✦  ADMINS ONLY MODE ✦' },
    { type: 'divider' },
    { type: 'line', text: `⚙️ حالة الوضع الجديد: *${statusText}*` },
    { type: 'divider' },
    { type: 'line', text: chatData.adminOnly ? '🔒 البوت الآن لن يستجيب إلا لأوامر المشرفين في هذا الجروب.' : '🔓 البوت يستجيب لجميع الأعضاء.' }
  ]

  return conn.reply(m.chat, theme.build(successContent), m)
}

handler.help = ['حظر_اعضاء', 'مشرفين_فقط']
handler.tags = ['group']
handler.command = /^(حظر_اعضاء|مشرفين_فقط)$/i
handler.group = true

export default handler
