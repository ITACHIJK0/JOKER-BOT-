/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪᴛ𝙰𝙲𝙷𝙸

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 」
「 لا تحذف الحقوق 🖤 」
*/

import { generateWAMessageFromContent } from '@whiskeysockets/baileys'
import { theme } from '../core/theme.js'

const DEVELOPER_JID = '249927142037@s.whatsapp.net'
const DEVELOPER_LID = '212408480080003@lid'

let handler = async (m, { conn, text, command, pushName, usedPrefix }) => {
    const isReport = ['إبلاغ', 'ابلاغ', 'بلاغ', 'شكوي', 'شكوى'].includes(command.toLowerCase())

    if (!text || !text.trim()) {
        const errorContent = isReport
            ? [
                  { type: 'title', text: '🚨 نـظـام الـبـلاغـات والـشـكاوي' },
                  { type: 'divider' },
                  { type: 'line', text: 'اكتب المشكلة أو الشكوى بعد الأمر.' },
                  { type: 'info', label: 'مثال', value: `${usedPrefix}${command} البوت مش بيرد على أوامر الجروب` }
              ]
            : [
                  { type: 'title', text: '💡 نـظـام الاقـتـراحـات' },
                  { type: 'divider' },
                  { type: 'line', text: 'اكتب اقتراحك المبدع بعد الأمر.' },
                  { type: 'info', label: 'مثال', value: `${usedPrefix}${command} ضيفوا أمر تحويل العملات` }
              ]

        return conn.reply(m.chat, theme.build(errorContent), m)
    }

    await m.react('🕒')

    const senderName = pushName || m.pushName || 'غير معروف'
    const senderNumber = m.sender.split('@')[0]
    const chatType = m.isGroup ? 'داخل جروب' : 'دردشة خاصة'

    let groupName = ''
    if (m.isGroup) {
        try {
            const meta = await conn.groupMetadata(m.chat, false)
            groupName = meta.subject || m.chat
        } catch {
            groupName = m.chat
        }
    }

    const typeTitle = isReport ? '🚨 بلاغ أو شكوى جديدة' : '💡 اقتراح جديد'

    const htmlPayload = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Joker Report Card</title>
<style>
html,body{margin:0;background:transparent;font-family:'Segoe UI',Arial}
*{box-sizing:border-box}
.wrap{max-width:620px;margin:auto;padding:12px}
.card{width:100%;background:linear-gradient(135deg,#111 0%,#222 100%);color:#fff;border-radius:20px;padding:18px;box-shadow:0 10px 30px rgba(0,0,0,.7);border:1px solid rgba(255,0,0,0.3);position:relative;overflow:hidden}
.header{font-size:16px;font-weight:900;margin-bottom:10px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(255,255,255,.2);padding-bottom:8px;color:#ff3333}
.info-row{font-size:12px;margin-bottom:6px;display:flex;gap:6px}
.info-label{opacity:.8;font-weight:bold;color:#ccc}
.info-val{font-weight:600}
.message-box{background:rgba(255,255,255,.05);border-radius:10px;padding:10px;margin-top:10px;font-size:12px;line-height:1.5;word-break:break-word;border-right:3px solid #ff3333}
.footer-credit{font-size:9px;text-align:center;margin-top:10px;opacity:.75;letter-spacing:1px;color:#aaa}
</style>
</head>
<body>
<div class="wrap">
  <div class="card">
    <div class="header">
      <span>${typeTitle}</span>
      <span style="font-size:11px;background:rgba(255,0,0,.2);color:#ff6666;padding:3px 8px;border-radius:6px">𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃</span>
    </div>
    <div class="info-row"><span class="info-label">👤 الاسم:</span> <span class="info-val">${senderName}</span></div>
    <div class="info-row"><span class="info-label">🪪 الرقم:</span> <span class="info-val">+${senderNumber}</span></div>
    <div class="info-row"><span class="info-label">📍 المصدر:</span> <span class="info-val">${chatType} ${groupName ? '• ' + groupName : ''}</span></div>
    <div class="message-box"><b>📝 المحتوى:</b><br>${text.trim()}</div>
    <div class="footer-credit">亗 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞</div>
  </div>
</div>
</body>
</html>`

    const submessages = [
        {
            messageType: 2,
            messageText: `⌁ 𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ⌁\n\n${isReport ? '🚨 بلاغ أو شكوى جديدة' : '💡 اقتراح جديد'}`
        },
        {
            messageType: 2,
            messageText: `🖤 تم استقبال ${isReport ? 'الشكوى/البلاغ' : 'الاقتراح'} بنجاح\n\n亗 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞`
        }
    ]

    const sections = [
        {
            __typename: 'GenAIUnifiedResponseSection',
            view_model: {
                __typename: 'GenAISingleLayoutViewModel',
                primitive: {
                    __typename: 'GenAIaeacdsnwHtmlPrimitive',
                    payload: htmlPayload
                }
            }
        }
    ]

    try {
        const richMsg = generateWAMessageFromContent(
            DEVELOPER_JID,
            {
                botForwardedMessage: {
                    message: {
                        richResponseMessage: {
                            messageType: 1,
                            submessages,
                            unifiedResponse: {
                                data: Buffer.from(JSON.stringify({
                                    "__typename": "GenAIUnifiedResponse",
                                    "response_id": "joker-report-response",
                                    "sections": sections
                                })).toString("base64")
                            },
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
            DEVELOPER_JID,
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
                    },
                    {
                        tag: 'device_identity',
                        attrs: {
                            lid: DEVELOPER_LID
                        }
                    }
                ]
            }
        )

        await m.react('✔️')

        const successTitle = isReport ? '🚨 تم إرسال شكواك وبلاغك بنجاح للمطور' : '💡 تم إرسال اقتراحك بنجاح للمطور'

        const successContent = [
            { type: 'title', text: '✨ تـم الـإرسـال بـنـجـاح' },
            { type: 'divider' },
            { type: 'line', text: successTitle },
            { type: 'line', text: '🖤 شكرًا لمساعدتك في تطوير وتشغيل JOKER BOT' }
        ]

        await conn.reply(m.chat, theme.build(successContent), m)

    } catch (e) {
        console.error(e)
        await m.react('✖️')

        const errorMsg = [
            { type: 'title', text: '❌ خطأ في الإرسال' },
            { type: 'divider' },
            { type: 'line', text: `تعذر إرسال ${isReport ? 'البلاغ/الشكوى' : 'الاقتراح'}.` },
            { type: 'info', label: 'حاول', value: 'مرة أخرى بعد قليل.' }
        ]

        await conn.reply(m.chat, theme.build(errorMsg), m)
    }
}

handler.help = ['إبلاغ', 'شكوى', 'اقتراح']
handler.tags = ['tools']
handler.command = ['إبلاغ', 'ابلاغ', 'بلاغ', 'شكوي', 'شكوى', 'اقتراح']

export default handler
