/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪᴛ𝙰𝙲𝙷𝙸

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 」
「 لا تحذف الحقوق 🖤 」
*/

import axios from 'axios'
import { theme } from '../core/theme.js'

const API_URL = 'https://2b.hidenfree.com'

const DEFAULT_KEYWORDS = [
    'anime edit',
    'naruto edit',
    'jjk edit',
    'demon slayer edit',
    'chainsaw man edit',
    'solo leveling edit',
    'bleach edit',
    'guts edit'
]

const CHANNELS = [
    {
        jid: '120363429074575231@newsletter',
        name: '𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸'
    }
]

const handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        await conn.sendMessage(m.chat, {
            react: {
                text: '🎬',
                key: m.key
            }
        })

        const randomChannel = CHANNELS[Math.floor(Math.random() * CHANNELS.length)]

        const searchQuery = text?.trim()
            ? `${text.trim()} edit`
            : DEFAULT_KEYWORDS[
                Math.floor(Math.random() * DEFAULT_KEYWORDS.length)
            ]

        const searchRes = await axios.get(
            `${API_URL}/api/pinterest/search`,
            {
                params: {
                    q: searchQuery,
                    type: 'video',
                    limit: 5
                },
                timeout: 30000,
                validateStatus: () => true
            }
        )

        const videos = searchRes.data?.results || []

        if (!videos.length) {
            throw new Error('لا توجد فيديوهات مطابقة للبحث')
        }

        const randomVideo = videos[Math.floor(Math.random() * videos.length)]
        if (!randomVideo?.url) {
            throw new Error('رابط الفيديو غير موجود')
        }

        const downloadRes = await axios.get(
            `${API_URL}/api/pinterest/public`,
            {
                params: {
                    api_key: 'free_key',
                    url: randomVideo.url,
                    type: 'video'
                },
                timeout: 300000,
                validateStatus: () => true
            }
        )

        const downloadData = downloadRes.data
        if (!downloadData?.success || !downloadData?.fileKey) {
            throw new Error('فشل التحميل من السيرفر')
        }

        const fileRes = await axios.get(
            `${API_URL}/api/pinterest/download?file=${encodeURIComponent(downloadData.fileKey)}`,
            {
                responseType: 'arraybuffer',
                timeout: 300000,
                validateStatus: () => true
            }
        )

        const videoBuffer = Buffer.from(fileRes.data)

        if (!videoBuffer.length) {
            throw new Error('ملف الفيديو فارغ')
        }

        const captionContent = [
            {
                type: 'title',
                text: `🎬 إيـديـت: ${text?.trim() || 'أنـمـي عـشـوائـي'}`
            },
            {
                type: 'divider'
            },
            {
                type: 'info',
                label: 'الـمـطـور',
                value: 'ITACHI'
            }
        ]

        await conn.sendMessage(
            m.chat,
            {
                video: videoBuffer,
                ptv: true,
                caption: theme.build(captionContent),
                contextInfo: {
                    isForwarded: true,
                    forwardingScore: 999,
                    forwardedNewsletterMessageInfo: {
                        newsletterJid: randomChannel.jid,
                        newsletterName: randomChannel.name,
                        serverMessageId: 1
                    }
                }
            },
            {
                quoted: m
            }
        )

        await conn.sendMessage(m.chat, {
            react: {
                text: '✅',
                key: m.key
            }
        })

    } catch (e) {
        console.error('خطأ في انمي_اديت:', e)
        try {
            await conn.sendMessage(m.chat, {
                react: {
                    text: '❌',
                    key: m.key
                }
            })

            const errorContent = [
                {
                    type: 'title',
                    text: '❌ فـشـل الـتـحـمـيـل'
                },
                {
                    type: 'subtitle',
                    text: 'حدث خطأ أثناء جلب إديت الأنمي المطلوبة'
                },
                {
                    type: 'divider'
                },
                {
                    type: 'line',
                    text: 'تأكد من اسم الشخصية أو الأنمي وحاول مرة أخرى لاحقاً.'
                }
            ]

            await conn.reply(m.chat, theme.build(errorContent), m)
        } catch (replyError) {
            console.error('خطأ أثناء إرسال رسالة الخطأ:', replyError)
        }
    }
}

handler.help = ['انمي_اديت']
handler.tags = ['anime']
handler.command = /^انمي_اديت$/i

export default handler
