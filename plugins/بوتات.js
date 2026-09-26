/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪ𝚃𝙰𝙲𝙷𝙸

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 by 𝙅𝙾𝙺𝙴𝙍 𝘽𝙾𝙏 」
「 لا تحذف الحقوق 🖤 」
*/

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import ws from 'ws'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn, text, command, isROwner }) => {
    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)
    const carpetaBase = path.resolve(__dirname, '..', 'MB-2BSubBot')

    // تأمين مصفوفة الاتصالات
    const conns = Array.isArray(global.conns) ? global.conns : []
    const activeBots = conns.filter(
        c => c?.user && c?.ws?.socket && c.ws.socket.readyState !== ws.CLOSED
    )

    // 🛡️ معالجة أمر فصل السب بوت (للمطور فقط)
    if (/^(فصل|stopbot|disconnectbot)$/i.test(command)) {
        if (!isROwner) {
            return conn.reply(m.chat, '❌ هذا الأمر مخصص للمطور الأساسي فقط.', m)
        }

        let targetJid = ''
        if (m.mentionedJid && m.mentionedJid[0]) {
            targetJid = m.mentionedJid[0]
        } else if (m.quoted) {
            targetJid = m.quoted.sender
        } else if (text) {
            let cleanText = text.replace(/[^0-9]/g, '')
            let foundBot = activeBots.find(c => c.user.jid.includes(cleanText))
            if (foundBot) targetJid = foundBot.user.jid
        }

        if (!targetJid) {
            return conn.reply(m.chat, '⚠️ يرجى تحديد السب بوت المراد فصله عبر:\n• منشن الحساب\n• أو الرد على رسالته\n• أو كتابة رقمه بجانب الأمر.', m)
        }

        let botToClose = activeBots.find(c => c.user.jid === targetJid || c.user.jid.includes(targetJid.replace(/[^0-9]/g, '')))
        if (!botToClose) {
            return conn.reply(m.chat, '❌ لم يتم العثور على سب بوت متصل بهذا الرقم أو الحساب.', m)
        }

        try {
            await botToClose.ws.close()
            global.conns = global.conns.filter(c => c.user.jid !== botToClose.user.jid)
            
            // حذف مجلد الجلسة اختياري إذا أردت مسحه تماماً من السيرفر
            let targetNum = botToClose.user.jid.replace(/[^0-9]/g, '')
            let botFolderPath = path.join(carpetaBase, targetNum)
            if (fs.existsSync(botFolderPath)) {
                fs.rmSync(botFolderPath, { recursive: true, force: true })
            }

            await m.react('✅')
            return conn.reply(m.chat, `✓ تم فصل وإيقاف السب بوت (@${targetNum}) بنجاح وإغلاق جلسته.`, m, { mentions: [botToClose.user.jid] })
        } catch (e) {
            console.error(e)
            return conn.reply(m.chat, `❌ حدث خطأ أثناء محاولة فصل البوت: ${e.message}`, m)
        }
    }

    // 🛡️ معالجة أمر جلب آخر 40 رسالة للسب بوت المستهدف (للمطور فقط)
    if (/^(اخر40|last40|اخر_40)$/i.test(command)) {
        if (!isROwner) {
            return conn.reply(m.chat, '❌ هذا الأمر مخصص للمطور الأساسي فقط.', m)
        }

        let targetJid = ''
        if (m.mentionedJid && m.mentionedJid[0]) {
            targetJid = m.mentionedJid[0]
        } else if (m.quoted) {
            targetJid = m.quoted.sender
        } else if (text) {
            let cleanText = text.replace(/[^0-9]/g, '')
            let foundBot = activeBots.find(c => c.user.jid.includes(cleanText))
            if (foundBot) targetJid = foundBot.user.jid
        }

        if (!targetJid) {
            return conn.reply(m.chat, '⚠️ يرجى تحديد السب بوت المطلوب استعراض رسائله عبر منشنه، الرد على رسالته، أو كتابة رقمه.', m)
        }

        let targetNum = targetJid.replace(/[^0-9]/g, '')
        
        // التحقق من مصفوفة الرسائل الأخيرة المخزنة عالمياً أو الخاصة بالبوت
        // إذا كان النظام يخزنها في global.lastMessages أو متغير خاص بالبوتات
        let messagesLog = global.lastMessages || []
        let botMessages = messagesLog.filter(msg => msg.chat?.includes(targetNum) || msg.sender?.includes(targetNum) || true) // يعرض آخر الأنشطة المسجلة
        
        // أخذ آخر 40 رسالة
        let last40 = messagesLog.slice(-40)

        if (!last40 || last40.length === 0) {
            return conn.reply(m.chat, `ℹ️ لا توجد سجلات رسائل مخزنة حالياً لهذا البوت (${targetNum}).`, m)
        }

        let reportText = `✦ 𝙹𝙾𝙺𝙴𝚁 • 𝐋𝐀𝐒𝐓 𝟒𝟎 𝐌𝐄𝐒𝐒𝐀𝐆𝐄𝚂 ✦\n`
        reportText += `🤖 البوت المستهدف: wa.me/${targetNum}\n`
        reportText += `📊 عدد الرسائل المسجلة: ${last40.length}\n`
        reportText += `━━━━━━━━━━━━━━━━━━━\n\n`

        last40.forEach((msg, index) => {
            let timeFormatted = new Date(msg.time || Date.now()).toLocaleTimeString()
            reportText += `[${index + 1}] الوقت: ${timeFormatted}\n`
            reportText += `👤 المرسل: ${msg.senderName || 'مجهول'} (${msg.sender?.split('@')[0]})\n`
            reportText += `💬 النص: ${msg.text || msg.body || 'محتوى غير متوفر'}\n`
            reportText += `───────────────────\n`
        })

        if (reportText.length > 4000) {
            // إذا تجاوزت الحد الأقصى للرسالة نقوم بإرسالها كملف نصي أو مقسمة
            let filePath = path.join(__dirname, `../last40_${targetNum}.txt`)
            fs.writeFileSync(filePath, reportText)
            await conn.sendMessage(m.chat, { document: { url: filePath }, mimetype: 'text/plain', fileName: `Last_40_Messages_${targetNum}.txt` }, { quoted: m })
            try { fs.unlinkSync(filePath) } catch {}
            return
        }

        return conn.reply(m.chat, reportText, m)
    }

    // عرض الإحصائيات الافتراضي (الأمر الأصلي)
    await m.react('📊')

    let cantidadCarpetas = 0
    try {
        cantidadCarpetas = fs.readdirSync(carpetaBase, { withFileTypes: true })
            .filter(dir => dir.isDirectory()).length
    } catch {}

    const uptimeMs = process.uptime() * 1000
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60))
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((uptimeMs % (1000 * 60)) / 1000)
    const uptimeString = `${hours}س ${minutes}د ${seconds}ث`

    let botListDetails = ''
    if (activeBots.length > 0) {
        botListDetails = activeBots.map((v, index) => {
            const userDB = global.db?.data?.users?.[v.user.jid] || {}
            const hidden = userDB.privacy === true
            const botNumber = hidden ? 'مخفي للخصوصية' : `wa.me/${v.user.jid.replace(/[^0-9]/g, '')}`
            return `[${index + 1}] ${v.user.name || userDB.name || 'مجهول'} (${botNumber})`
        }).join('\n')
    } else {
        botListDetails = '❌ لا يوجد سب بوت متصل حالياً'
    }

    let submessages = [
        {
            messageType: 2,
            messageText: `⌁ 𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ⌁\n📊 إحصائيات البوتات الفرعية والتحكم النظامي`
        },
        {
            messageType: 4,
            tableMetadata: {
                rows: [
                    { items: ['🤖 اسم البوت', '𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃'], isHeading: false },
                    { items: ['⚡ السب بوتات المتصلة', `${activeBots.length}`], isHeading: false },
                    { items: ['📁 الجلسات المنشأة', `${cantidadCarpetas}`], isHeading: false },
                    { items: ['⏳ وقت التشغيل', uptimeString], isHeading: false },
                    { items: ['👑 المطور', 'ITACHI'], isHeading: false },
                    { items: ['📞 رقم المطور', '+249927142037'], isHeading: false }
                ],
                title: '⌁ 𝙹𝙾𝙺𝙴𝚁 • 𝐒𝐘𝐒𝐓𝐄𝐌 ⌁'
            }
        },
        {
            messageType: 2,
            messageText: `📋 تفاصيل السب بوتات:\n${botListDetails}\n\n🛠️ أوامر التحكم للمطور:\n• .فصل [منشن/رقم/رد]\n• .اخر40 [منشن/رقم/رد]\n\n🖤 شكرًا لاستخدامك JOKER BOT\n亗 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞`
        }
    ]

    let richMsg = generateWAMessageFromContent(
        m.chat,
        {
            botForwardedMessage: {
                message: {
                    richResponseMessage: {
                        messageType: 1,
                        submessages: submessages,
                        contextInfo: {
                            forwardingScore: 99999,
                            isForwarded: true,
                            forwardedAiBotMessageInfo: {
                                botJid: conn.user.id.split(':')[0] + '@bot'
                            },
                            forwardOrigin: 4
                        }
                    }
                }
            }
        },
        {}
    )

    await conn.relayMessage(
        m.chat,
        richMsg.message,
        {
            messageId: richMsg.key.id,
            additionalNodes: [
                {
                    tag: 'biz',
                    attrs: {},
                    content: [
                        {
                            tag: 'interactive',
                            attrs: { type: 'native_flow', v: '1' },
                            content: [
                                {
                                    tag: 'native_flow',
                                    attrs: { v: '9', name: 'mixed' }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    )
}

handler.help = ['احصائيات', 'بوتات', 'فصل', 'اخر40']
handler.tags = ['main', 'owner']
handler.command = /^(قائمة_البوتات|البوتات|بوتات|bots|سب_بوتات|احصائيات|إحصائيات|stats|فصل|stopbot|اخر40|last40)$/i

export default handler
