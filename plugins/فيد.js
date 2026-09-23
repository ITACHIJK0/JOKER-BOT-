/*
⌁ 𝐉𝐎𝐊𝐄𝐑 𝐗 𝐈𝐓𝐀𝐂𝐇𝐈 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪᴛᴀᴄʜɪ

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 」
「 لا تحذف الحقوق 🖤 」
*/

import axios from 'axios'
import yts from 'yt-search'

const AXIOS_DEFAULTS = {
    timeout: 60000,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json, text/plain, */*'
    }
}

async function tryRequest(getter, attempts = 3) {
    let lastError
    for (let attempt = 1; attempt <= attempts; attempt++) {
        try {
            return await getter()
        } catch (err) {
            lastError = err
            if (attempt < attempts) {
                await new Promise(r => setTimeout(r, 1000 * attempt))
            }
        }
    }
    throw lastError
}

async function getEliteProTechVideoByUrl(youtubeUrl) {
    const apiUrl = `https://eliteprotech-apis.zone.id/ytdown?url=${encodeURIComponent(youtubeUrl)}&format=mp4`
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS))
    if (res?.data?.success && res?.data?.downloadURL) {
        return {
            download: res.data.downloadURL,
            title: res.data.title
        }
    }
    throw new Error('err')
}

async function getYupraVideoByUrl(youtubeUrl) {
    const apiUrl = `https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}`
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS))
    if (res?.data?.success && res?.data?.data?.download_url) {
        return {
            download: res.data.data.download_url,
            title: res.data.data.title,
            thumbnail: res.data.data.thumbnail
        }
    }
    throw new Error('err')
}

async function getOkatsuVideoByUrl(youtubeUrl) {
    const apiUrl = `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encodeURIComponent(youtubeUrl)}`
    const res = await tryRequest(() => axios.get(apiUrl, AXIOS_DEFAULTS))
    if (res?.data?.result?.mp4) {
        return {
            download: res.data.result.mp4,
            title: res.data.result.title
        }
    }
    throw new Error('err')
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    try {
        if (!text) {
            return conn.reply(m.chat,
`🎬 *[ 𝐉𝐎𝐊𝐄𝐑 - يوتيوب فيديو ]*

> طريقة الاستخدام:
📌 *${usedPrefix + command}* <رابط يوتيوب>
أو
📌 *${usedPrefix + command}* <اسم الفيديو>

> مثال:
${usedPrefix}${command} Dominic Fike babydoll
${usedPrefix}${command} https://youtu.be/nb8CnIo_-_A

🃏 𝐉𝐎𝐊𝐄𝐑 𝖷 𝙸𝚃𝙰𝙲𝙷𝙸 ⚡`,
m)
        }
        let videoUrl = ''
        let videoTitle = ''
        let videoThumbnail = ''

        if (text.startsWith('http://') || text.startsWith('https://')) {
            videoUrl = text
        } else {
            const { videos } = await yts(text)
            if (!videos || !videos.length) {
                return conn.reply(m.chat, '❌ لم يتم العثور على فيديوهات مطابقة لطلبك.', m)
            }
            videoUrl = videos[0].url
            videoTitle = videos[0].title
            videoThumbnail = videos[0].thumbnail
        }

        await conn.sendMessage(m.chat, {
            react: { text: '⏳', key: m.key }
        })

        const apiMethods = [
            () => getEliteProTechVideoByUrl(videoUrl),
            () => getYupraVideoByUrl(videoUrl),
            () => getOkatsuVideoByUrl(videoUrl)
        ]

        let videoData
        for (let method of apiMethods) {
            try {
                videoData = await method()
                if (videoData?.download) break
            } catch { continue }
        }

        if (!videoData?.download) {
            throw new Error('فشلت جميع مصادر التنزيل المتاحة.')
        }

        await conn.sendMessage(m.chat, {
            video: { url: videoData.download },
            mimetype: 'video/mp4',
            fileName: `${(videoData.title || videoTitle || 'joker-video').replace(/[^\w\s-]/g, '')}.mp4`,
            caption: `🎬 *${videoData.title || videoTitle || 'فيديو بدون عنوان'}*\n\n> تم التنزيل بنجاح بواسطه جوكر 🃏\n\n> 🥷 𝐉𝐎𝐊𝐄𝐑 - 𝐁𝐎𝐓`
        }, { quoted: m })

    } catch (err) {
        console.error(err)
        conn.reply(m.chat, `❌ حدث خطأ أثناء تنزيل الفيديو: ${err.message}`, m)
    }
}

handler.help = ['فيد <رابط/اسم>', 'فيديو <رابط/اسم>']
handler.tags = ['download']
handler.command = ['ytvideo','فيد','فيديو','ytv','ytmp4']

export default handler
