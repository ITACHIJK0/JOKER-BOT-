/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪᴛ𝙰𝙲𝙷𝙸

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 」
「 لا تحذف الحقوق 🖤 」
*/

import axios from 'axios'
import {
        proto,
        generateWAMessageFromContent,
        generateWAMessageContent
} from '@whiskeysockets/baileys'
import { theme } from '../core/theme.js'

const API_BASE = 'https://engez.a7a.online/api/v1'
const PINTEREST_ENDPOINT = `${API_BASE}/search/pinterest`
const MAX_VIDEOS = 5
const MAX_TRIED = 10

function shuffle(a) {
        for (let i = a.length - 1; i > 0; i--) {
                const randomIndex = Math.floor(Math.random() * (i + 1))
                const temp = a[i]
                a[i] = a[randomIndex]
                a[randomIndex] = temp
        }
        return a
}

async function searchPins(query) {
        const { data } = await axios.get(PINTEREST_ENDPOINT, {
                params: {
                        action: 'بحث',
                        q: query
                },
                timeout: 30000,
                validateStatus: () => true
        })

        if (!data || data.success !== true) {
                throw new Error('فشل البحث في Pinterest')
        }

        const results = data.response?.results

        if (!Array.isArray(results) || !results.length) {
                throw new Error('لا توجد نتائج فيديو لهذا البحث')
        }

        return results
}

async function resolveDownloadUrl(pin) {
        const params = {
                action: 'تحميل',
                pinUrl: pin.pin_url
        }

        if (pin.video_url) {
                params.videoUrl = pin.video_url
        }

        if (pin.hls_url) {
                params.hlsUrl = pin.hls_url
        }

        if (pin.video_signature) {
                params.videoSignature = pin.video_signature
        }

        const { data } = await axios.get(PINTEREST_ENDPOINT, {
                params,
                timeout: 30000,
                validateStatus: () => true
        })

        if (!data || data.success !== true || !data.response?.downloadUrl) {
                throw new Error(
                        data?.error || 'فشل الحصول على رابط التحميل المباشر'
                )
        }

        return data.response.downloadUrl
}

async function downloadVideo(url) {
        const response = await axios.get(url, {
                responseType: 'arraybuffer',
                headers: {
                        'user-agent':
                                'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/139.0.0.0 Mobile Safari/537.36'
                },
                timeout: 60000,
                maxRedirects: 5,
                validateStatus: () => true
        })

        const buffer = Buffer.from(response.data)

        if (buffer.length < 50000) {
                throw new Error('الفيديو غير صالح')
        }

        return buffer
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
        const chat = m.chat

        if (!args[0]) {
                await conn.sendMessage(chat, {
                        react: {
                                text: '❌',
                                key: m.key
                        }
                })

                return m.reply(
                        theme.build([
                                {
                                        type: 'title',
                                        text: '🎬 بـحـث اديـتـات بـنـتـرسـت'
                                },
                                {
                                        type: 'divider'
                                },
                                {
                                        type: 'info',
                                        label: '⚡ الاستخدام',
                                        value: `${usedPrefix}${command} <كلمة البحث>`
                                },
                                {
                                        type: 'line',
                                        text: `${usedPrefix}${command} انمي`
                                },
                                {
                                        type: 'line',
                                        text: `${usedPrefix}${command} ناروتو`
                                },
                                {
                                        type: 'line',
                                        text: `${usedPrefix}${command} itachi`
                                }
                        ])
                )
        }

        const query = args.join(' ')

        await conn.sendMessage(chat, {
                react: {
                        text: '🔍',
                        key: m.key
                }
        })

        try {
                const pins = shuffle(await searchPins(query))

                const validVideos = []
                let tried = 0
                for (
                        let i = 0;
                        i < pins.length &&
                        validVideos.length < MAX_VIDEOS &&
                        tried < MAX_TRIED;
                        i++
                ) {
                        tried++

                        try {
                                const pin = pins[i]
                                const downloadUrl = await resolveDownloadUrl(pin)
                                const buffer = await downloadVideo(downloadUrl)
                                validVideos.push({
                                        title: pin.title || 'اديت 🎬',
                                        videoBuffer: buffer
                                })
                        } catch {}
                }

                if (!validVideos.length) {
                        throw new Error('لا توجد فيديوهات صالحة')
                }

                await sendCarousel(
                        conn,
                        chat,
                        m,
                        query,
                        validVideos
                )

                await conn.sendMessage(chat, {
                        react: {
                                text: '✅',
                                key: m.key
                        }
                })
        } catch (err) {
                console.error('❌ Edit Error:', err)

                await conn.sendMessage(chat, {
                        react: {
                                text: '❌',
                                key: m.key
                        }
                })

                await m.reply(theme.error(`فشل: ${err.message}`))
        }
}

async function sendCarousel(conn, chat, m, query, videos) {
        const cards = []

        for (let i = 0; i < videos.length; i++) {
                const video = videos[i]
                try {
                        const { videoMessage } = await generateWAMessageContent(
                                {
                                        video: video.videoBuffer
                                },
                                {
                                        upload: conn.waUploadToServer
                                }
                        )

                        cards.push({
                                body: proto.Message.InteractiveMessage.Body.fromObject({
                                        text: `🎬 اديت رقم ${i + 1}`
                                }),

                                footer: proto.Message.InteractiveMessage.Footer.fromObject({
                                        text: '亗 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞'
                                }),

                                header: proto.Message.InteractiveMessage.Header.fromObject({
                                        title:
                                                video.title.length > 50
                                                        ? video.title.substring(0, 47) + '...'
                                                        : video.title,
                                        hasMediaAttachment: true,
                                        videoMessage
                                }),

                                nativeFlowMessage:
                                        proto.Message.InteractiveMessage.NativeFlowMessage.fromObject({
                                                buttons: []
                                        })
                        })
                } catch (err) {
                        console.log('Card error:', err.message)
                }
        }

        if (!cards.length) {
                throw new Error('No cards created')
        }

        const msg = generateWAMessageFromContent(
                chat,
                {
                        viewOnceMessage: {
                                message: {
                                        messageContextInfo: {
                                                deviceListMetadata: {},
                                                deviceListMetadataVersion: 2
                                        },

                                        interactiveMessage:
                                                proto.Message.InteractiveMessage.fromObject({
                                                        body: proto.Message.InteractiveMessage.Body.create({
                                                                text: theme.build([
                                                                        {
                                                                                type: 'title',
                                                                                text: `🎬 اديـتـات: ${query}`
                                                                        },
                                                                        {
                                                                                type: 'info',
                                                                                label: '📹 فيديوهات',
                                                                                value: cards.length.toString()
                                                                        }
                                                                ])
                                                        }),

                                                        footer:
                                                                proto.Message.InteractiveMessage.Footer.create({
                                                                        text: '亗 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰ 𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞'
                                                                }),

                                                        header:
                                                                proto.Message.InteractiveMessage.Header.create({
                                                                        hasMediaAttachment: false
                                                                }),

                                                        carouselMessage:
                                                                proto.Message.InteractiveMessage.CarouselMessage.fromObject({
                                                                        cards
                                                                })
                                                })
                                }
                        }
                },
                {
                        quoted: m
                }
        )

        await conn.relayMessage(
                chat,
                msg.message,
                {
                        messageId: msg.key.id
                }
        )
}

handler.help = ['ايديت']
handler.tags = ['download']
handler.command = /^(ايديت|edit|اديتات|edits|إيديت|أيديت)$/i

export default handler
