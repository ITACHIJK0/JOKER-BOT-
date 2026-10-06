/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
 𝙹𝙾𝙺𝙴𝚁 𝙴𝙳𝙸𝚃𝙸𝙾𝙽

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝙉𝙊𝙆𝙴𝙍 𝘽𝙊𝙏 」
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
            antiLink: {},
            warnings: {}
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

         if (!data.antiLink) data.antiLink = {}
         if (!data.warnings) data.warnings = {}

         return data
      } catch {
         return {
            antiLink: {},
            warnings: {}
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
      // استثناء المشرفين وصناع البوت
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
         `[Joker AntiLink] 🚨 تم اكتشاف رابط ممنوع في الجروب من العضو: ${m.sender}`
      )

      try {
         // 1. حذف الرابط فوراً بسرعة البرق
         await conn.sendMessage(
            m.chat,
            { delete: m.key }
         )

         // 2. تهيئة نظام الإنذارات للعضو داخل الجروب
         if (!db.warnings[m.chat]) {
            db.warnings[m.chat] = {}
         }
         if (!db.warnings[m.chat][m.sender]) {
            db.warnings[m.chat][m.sender] = 0
         }

         db.warnings[m.chat][m.sender] += 1
         let currentWarnings = db.warnings[m.chat][m.sender]
         this.saveDb(db)

         const userName = m.pushName || m.sender.split('@')[0]

         if (currentWarnings >= 3) {
            // إذا وصل للإنذار الثالث -> طرد مباشر وتصفير إنذاراته
            db.warnings[m.chat][m.sender] = 0
            this.saveDb(db)

            await conn.sendMessage(
               m.chat,
               {
                  text: `⚠️ *[ نظام عقوبات إتاشي ]*\n\n👤 المستخدم: @${m.sender.split('@')[0]}\n❌ لقد تجاوزت الحد المسموح (3/3 إنذارات) بسبب نشر الروابط!\n👢 *تم طردك من المجموعة بنجاح.*`,
                  mentions: [m.sender]
               }
            )

            await conn.groupParticipantsUpdate(
               m.chat,
               [m.sender],
               'remove'
            )

            console.log(`[Joker AntiLink] 👢 تم طرد العضو ${m.sender} لتخاوزه 3 إنذارات.`)
         } else {
            // إعطاء إنذار مع تنبيه
            await conn.sendMessage(
               m.chat,
               {
                  text: `⚠️ *[ نظام حماية الروابط ]*\n\n@${m.sender.split('@')[0]} ممنوع إرسال الروابط هنا!\n📌 *تم حذف رسالتك وإعطاؤك إنذار (${currentWarnings}/3).*`,
                  mentions: [m.sender]
               }
            )
         }

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
         '✅ تم تفعيل مضاد الروابط الذكي (حذف + إنذارات تلقائية تصل للطرد).\n\n> 🥷 𝐉𝐎𝐊𝐄𝐑 - 𝐁𝐎𝐓'
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
      `🛡️ *نظام حماية الجروب من الروابط (إتاشي وجوكر)*\n\n` +
      `📊 *الحالة الحالية:* ${status}\n` +
      `⚙️ *آلية العمل:* حذف الرابط فوراً + إنذار (3 إنذارات = طرد تلقائي)\n\n` +
      `⚙️️ *طريقة الاستخدام:*\n` +
      `▸ *${usedPrefix + command} on* — لتشغيل النظام\n` +
      `▸ *${usedPrefix + command} off* — لإيقاف النظام\n\n` +
      `> 🃏 𝐉𝐎𝐊𝐄𝐑 - 𝐁𝐎𝐓`
   )
}

handler.before = async function (m, { conn }) {
   await guard.processEvent(m, conn)
}

handler.command = /^(مضاد_الروابط|مضاد_رابط|antilink|anti-link)$/i

export default handler
