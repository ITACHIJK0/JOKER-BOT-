/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪᴛ𝙰𝙲𝙷𝙸

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 」
「 لا تحذف الحقوق 🖤 」
*/

import axios from 'axios'
import FormData from 'form-data'
import { theme } from '../core/theme.js'

const API_KEY = '154fbec7d9a073f9b3a8ef0398342394'

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        const quoted = m.quoted
        const msg = quoted?.message || m.message
        const type = Object.keys(msg || {})[0]

        if (!quoted && !m.message?.imageMessage) {
            const helpContent = [
                { type: 'title', text: '🖼️ رفـع الـصـور - ImgBB' },
                { type: 'divider' },
                { type: 'line', text: '❌ أرسل صورة أو قم بالرد على صورة لرفعها.' },
                { type: 'info', label: 'الاستخدام', value: `${usedPrefix}${command}` }
            ]
            return conn.reply(m.chat, theme.build(helpContent), m)
        }

        const target = quoted || m

        if (!target.download) {
            return conn.reply(m.chat, theme.error('❌ لم أستطع قراءة الصورة المحددة.'), m)
        }

        await m.react('⏳')

        const buffer = await target.download()

        if (!buffer) {
            return conn.reply(m.chat, theme.error('❌ فشل تحميل ملف الصورة.'), m)
        }

        const form = new FormData()
        form.append('image', buffer, {
            filename: 'joker-image.jpg',
            contentType: 'image/jpeg'
        })

        const response = await axios.post(
            `https://api.imgbb.com/1/upload?key=${API_KEY}`,
            form,
            {
                headers: form.getHeaders(),
                maxContentLength: Infinity,
                maxBodyLength: Infinity
            }
        )

        const data = response.data

        if (!data.success) {
            throw new Error('ImgBB upload failed')
        }

        const image = data.data
        await m.react('✅')

        const successContent = [
            { type: 'title', text: '✨ تـم رفـع الـصـور بـنـجـاح' },
            { type: 'divider' },
            { type: 'line', text: '🔗 **الرابط المباشر:**' },
            { type: 'line', text: image.url },
            { type: 'divider' },
            { type: 'info', label: '🌐 صفحة العرض', value: image.url_viewer }
        ]

        await conn.reply(m.chat, theme.build(successContent), m)

    } catch (error) {
        console.error('Joker ImgBB Error:', error?.response?.data || error)
        await m.react('❌')

        await conn.reply(
            m.chat,
            theme.error('حدث خطأ أثناء رفع الصورة إلى ImgBB.\nتأكد من صحة الصورة أو مفتاح الـ API ثم حاول مرة أخرى.'),
            m
        )
    }
}

handler.help = ['رفع_صوره']
handler.tags = ['tools']
handler.command = ['رفع_صوره']

export default handler
