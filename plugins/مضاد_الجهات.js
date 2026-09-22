/*
⌁ 𝐉𝐎𝐊𝐄𝐑 𝐗 𝐈𝐓𝐀𝐂𝐇𝐈 ⌁
 𝙹𝙾𝙺𝙴𝚁 𝙴𝙳𝙸𝚃𝙸𝙾𝙽

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 」
「 لا تحذف الحقوق 🖤 」
*/

import fs from 'fs'
import path from 'path'

class AntiContactGuard {
   constructor() {
      this.dbPath = path.join(process.cwd(), 'porn.json')
      this.initDatabase()
   }

   initDatabase() {
      if (!fs.existsSync(this.dbPath)) {
         const initial = {
            antiContact: {}
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

         if (!data.antiContact) {
            data.antiContact = {}
         }

         return data
      } catch {
         return {
            antiContact: {}
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

   extractContactCard(m) {
      const rawMessage =
         m.message?.ephemeralMessage?.message ||
         m.message?.viewOnceMessage?.message ||
         m.message

      return (
         rawMessage?.contactMessage ||
         rawMessage?.contactsArrayMessage ||
         rawMessage?.messageContextInfo?.quotedMessage?.contactMessage ||
         rawMessage?.messageContextInfo?.quotedMessage?.contactsArrayMessage ||
         m.mtype === 'contactMessage' ||
         m.mtype === 'contactsArrayMessage'
      )
   }

   async processEvent(m, conn) {
      if (!m.isGroup) return

      const db = this.getDb()

      if (!db.antiContact[m.chat]) {
         return
      }

      const isContactCard = this.extractContactCard(m)

      if (!isContactCard) {
         return
      }

      console.log(
         `[Joker AntiContact] 🚨 تم اكتشاف كارت جهة اتصال في الجروب: ${m.chat}`
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
               '⚠️ *[ نظام حماية إتاشي ]*\nتم حذف كارت جهة اتصال تلقائياً لمنع ثغرات الحظر. تم قفل الجروب بنجاح!'

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
            '[Joker AntiContact] 🔒 تم قفل الجروب بنجاح.'
         )

      } catch (e) {
         console.error(
            '⚠️ [AntiContact Error]:',
            e?.message || e
         )
      }
   }
}

const guard = new AntiContactGuard()

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
      db.antiContact[m.chat] = true

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
         '✅ تم تفعيل حماية جهات الاتصال (طابع إتاشي) وقفل الجروب التلقائي ضد الحظر.\n\n> 🥷 𝐉𝐎𝐊𝐄𝐑 - 𝐁𝐎𝐓'
      )
   }

   if (
      ['off', 'إيقاف', 'ايقاف', 'تعطيل'].includes(state)
   ) {
      db.antiContact[m.chat] = false

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
         '🚫 تم إيقاف حماية جهات الاتصال في هذه المجموعة.\n\n> 🥷 𝐉𝐎𝐊𝐄𝐑 - 𝐁𝐎𝐓'
      )
   }

   const status = db.antiContact[m.chat]
      ? 'مفعل ✅'
      : 'معطل ❌'

   return m.reply(
      `🛡️ *نظام حماية الجروب من كروت الحظر (ايتاشي)*\n\n` +
      `📊 *الحالة الحالية:* ${status}\n\n` +
      `⚙️ *طريقة الاستخدام:*\n` +
      `▸ *${usedPrefix + command} on* — لتشغيل النظام\n` +
      `▸ *${usedPrefix + command} off* — لإيقاف النظام\n\n` +
      `> 🃏 𝐉𝐎𝐊𝐄𝐑 - 𝐁𝐎𝐓`
   )
}

handler.before = async function (m, { conn }) {
   await guard.processEvent(m, conn)
}

handler.command = /^(مضاد_الجهات|مضاد_جهات|anticontact|anti-contact)$/i

export default handler
