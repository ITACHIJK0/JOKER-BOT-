/*
⌁ 𝐉𝐎𝐊𝐄𝐑 𝐗 𝐈𝐓𝐀𝐂𝐇𝐈 ⌁
 𝙹𝙾𝙺𝙴𝚁 𝙴𝙳𝙸𝚃𝙸𝙾𝙽

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 」
「 لا تحذف الحقوق 🖤 」
*/

import fs from 'fs'
import path from 'path'

class AntiLinkGuard {
   constructor() {
      this.dbPath = path.join(process.cwd(), 'porn.json')
      this.initDatabase()
   }

   initDatabase() {
      if (!fs.existsSync(this.dbPath)) {
         const initial = {
            antiLink: {}
         }

         fs.writeFileSync(
            this.dbPath,
            JSON.stringify(initial, null, 2),
            'utf-8'
         )
      }
   }

   getDb() {
      try {
         const data = JSON.parse(
            fs.readFileSync(this.dbPath, 'utf-8')
         )

         if (!data.antiLink) {
            data.antiLink = {}
         }

         return data
      } catch {
         return {
            antiLink: {}
         }
      }
   }

   saveDb(data) {
      fs.writeFileSync(
         this.dbPath,
         JSON.stringify(data, null, 2),
         'utf-8'
      )
   }

   isLink(text) {
      if (!text || typeof text !== 'string') return false
      // تعبير ريجكس شامل لفحص الروابط بمختلف أنواعها
      const urlRegex = /(https?:\/\/[^\s]+)|(www\.[^\s]+)|(chat\.whatsapp\.com\/[^\s]+)|(t\.me\/[^\s]+)/gi
      return urlRegex.test(text)
   }

   async processEvent(m, conn) {
      if (!m.isGroup) return
      // استثناء المشرفين لكي لا يتم حذف روابطهم أو قفل الجروب بسببهم
      if (m.isAdmin || m.isOwner) return

      const db = this.getDb()

      if (!db.antiLink[m.chat]) {
         return
      }

      const messageText = m.text || m.msg?.caption || ''
      const containsLink = this.isLink(messageText)

      if (!containsLink) {
         return
      }

      console.log(
         `[Joker AntiLink] 🚨 تم اكتشاف رابط ممنوع في الجروب: ${m.chat}`
      )

      try {
         const groupMetadata = await conn.groupMetadata(m.chat)

         const admins = groupMetadata.participants
            .filter(
               p =>
                  p.admin === 'admin' ||
                  p.admin === 'superadmin'
            )
            .map(p => p.id)

         await conn.sendMessage(
            m.chat,
            {
               delete: m.key
            }
         )

         if (admins.length > 0) {
            const caption =
               '⚠️ *[ نظام حماية إتاشي للروابط ]*\nتم حذف الرابط تلقائياً لمنع نشر الروابط الخارجية. تم قفل الجروب بنجاح!'

            const mentionText = admins
               .map(v => `@${v.split('@')[0]}`)
               .join(' ')

            await conn.sendMessage(
               m.chat,
               {
                  text: `${mentionText}\n\n${caption}`,
                  mentions: admins
               }
            )
         }

         await conn.groupSettingUpdate(
            m.chat,
            'announcement'
         )

         console.log(
            '[Joker AntiLink] 🔒 تم قفل الجروب بنجاح بسبب رابط.'
         )

      } catch (e) {
         console.error(
            '⚠️ [AntiLink Error]:',
            e?.message || e
         )
      }
   }
}

const guard = new AntiLinkGuard()

const handler = async (
   m,
   {
      conn,
      args,
      usedPrefix,
      command,
      isAdmin,
      isOwner
   }
) => {

   if (!m.isGroup) {
      return m.reply(
         '❌ هذا الأمر يشتغل في المجموعات فقط.'
      )
   }

   if (!isAdmin && !isOwner) {
      return m.reply(
         '❌ هذا الأمر مخصص للأدمن فقط يا غالي.'
      )
   }

   const db = guard.getDb()

   const state = (args[0] || '')
      .toLowerCase()
      .trim()

   if (
      ['on', 'تشغيل', 'تفعيل'].includes(state)
   ) {
      db.antiLink[m.chat] = true

      guard.saveDb(db)

      await conn.sendMessage(
         m.chat,
         {
            react: {
               text: '🃏',
               key: m.key
            }
         }
      )

      return m.reply(
         '✅ تم تفعيل حماية الروابط (طابع إتاشي) وقفل الجروب التلقائي.\n\n> 🥷 𝐉𝐎𝐊𝐄𝐑 - 𝐁𝐎𝐓'
      )
   }

   if (
      ['off', 'إيقاف', 'ايقاف', 'تعطيل'].includes(state)
   ) {
      db.antiLink[m.chat] = false

      guard.saveDb(db)

      await conn.sendMessage(
         m.chat,
         {
            react: {
               text: '✅',
               key: m.key
            }
         }
      )

      return m.reply(
         '🚫 تم إيقاف حماية الروابط في هذه المجموعة.\n\n> 🥷 𝐉𝐎𝐊𝐄𝐑 - 𝐁𝐎𝐓'
      )
   }

   const status = db.antiLink[m.chat]
      ? 'مفعل ✅'
      : 'معطل ❌'

   return m.reply(
      `🛡️ *نظام حماية الجروب من الروابط (ايتاشي)*\n\n` +
      `📊 *الحالة الحالية:* ${status}\n\n` +
      `⚙️ *طريقة الاستخدام:*\n` +
      `▸ *${usedPrefix + command} on* — لتشغيل نظام منع الروابط\n` +
      `▸ *${usedPrefix + command} off* — لإيقاف النظام\n\n` +
      `> 🃏 𝐉𝐎𝐊𝐄𝐑 - 𝐁𝐎𝐓`
   )
}

handler.before = async function (m, { conn }) {
   await guard.processEvent(m, conn)
}

handler.command = /^(مضاد_الروابط|مضاد_رابط|antilink|anti-link)$/i

export default handler
