/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪᴛ𝙰𝙲𝙷𝙸

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 」
「 لا تحذف الحقوق 🖤 」
*/

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import ws from 'ws'
import { generateWAMessageFromContent } from '@whiskeysockets/baileys'

let handler = async (m, { conn }) => {
    await m.react('📊')

    const __filename = fileURLToPath(import.meta.url)
    const __dirname = path.dirname(__filename)

    // مسار جلسات السب بوت
    const carpetaBase = path.resolve(__dirname, '..', 'MB-2BSubBot')
    let cantidadCarpetas = 0

    try {
        cantidadCarpetas = fs.readdirSync(carpetaBase, { withFileTypes: true })
            .filter(dir => dir.isDirectory()).length
    } catch {}

    // حساب وقت تشغيل السيرفر
    const uptimeMs = process.uptime() * 1000
    const hours = Math.floor(uptimeMs / (1000 * 60 * 60))
    const minutes = Math.floor((uptimeMs % (1000 * 60 * 60)) / (1000 * 60))
    const seconds = Math.floor((uptimeMs % (1000 * 60)) / 1000)
    const uptimeString = `${hours}س ${minutes}د ${seconds}ث`

    // تأمين مصفوفة الاتصالات
    const conns = Array.isArray(global.conns) ? global.conns : []
    const users = conns.filter(
        c =>
            c?.user &&
            c?.ws?.socket &&
            c.ws.socket.readyState !== ws.CLOSED
    )

    // تجهيز جدول الحانات أو العناصر الفرعية إذا وجدت بوتات متصلة
    let botListDetails = ''
    if (users.length > 0) {
        botListDetails = users.map((v, index) => {
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
            messageText: `⌁ 𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ⌁\n📊 إحصائيات البوتات الفرعية والنظام`
        },
        {
            messageType: 4,
            tableMetadata: {
                rows: [
                    {
                        items: ['🤖 اسم البوت', '𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃'],
                        isHeading: false
                    },
                    {
                        items: ['⚡ السب بوتات المتصلة', `${users.length}`],
                        isHeading: false
                    },
                    {
                        items: ['📁 الجلسات المنشأة', `${cantidadCarpetas}`],
                        isHeading: false
                    },
                    {
                        items: ['⏳ وقت التشغيل', uptimeString],
                        isHeading: false
                    },
                    {
                        items: ['👑 المطور', 'ITACHI'],
                        isHeading: false
                    },
                    {
                        items: ['📞 رقم المطور', '+249927142037'],
                        isHeading: false
                    }
                ],
                title: '⌁ 𝙹𝙾𝙺𝙴𝚁 • 𝐒𝐘𝐒𝐓𝐄𝐌 ⌁'
            }
        },
        {
            messageType: 2,
            messageText: `📋 تفاصيل السب بوتات:\n${botListDetails}\n\n🖤 شكرًا لاستخدامك JOKER BOT\n亗 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞`
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
                            attrs: {
                                type: 'native_flow',
                                v: '1'
                            },
                            content: [
                                {
                                    tag: 'native_flow',
                                    attrs: {
                                        v: '9',
                                        name: 'mixed'
                                    }
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    )
}

handler.help = ['احصائيات', 'بوتات']
handler.tags = ['main']
handler.command = /^(قائمة_البوتات|البوتات|بوتات|bots|سب_بوتات|احصائيات|إحصائيات|stats)$/i

export default handler
