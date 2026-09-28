/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪᴛ𝙰𝙲𝙷𝙸

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝙅𝙾𝙆𝙴𝙍 𝘽𝙾𝐓 」
「 لا تحذف الحقوق 🖤 」
*/

import { theme } from '../core/theme.js'
import axios from 'axios'
import crypto from 'crypto'
import { createWriteStream, existsSync, promises as fsPromises } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { pipeline } from 'stream/promises'
import yts from 'yt-search'

const DOWNLOAD_TIMEOUT_MS = 180000

class SaveTubeVideo {
  constructor() {
    this.ky = 'C5D58EF67A7584E4A29F6C35BBC4EB12'
    this.m = /^((?:https?:)?\/\/)?((?:www|m|music)\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?([a-zA-Z0-9_-]{11})/
    this.is = axios.create({
      headers: {
        'content-type': 'application/json',
        'origin': 'https://yt.savetube.me',
        'user-agent': 'Mozilla/5.0 (Android 15; Mobile)'
      },
      timeout: DOWNLOAD_TIMEOUT_MS
    })
  }

  async decrypt(enc) {
    const buf = Buffer.from(enc, 'base64')
    const key = Buffer.from(this.ky, 'hex')
    const iv = buf.slice(0, 16)
    const data = buf.slice(16)
    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
    const decrypted = Buffer.concat([decipher.update(data), decipher.final()])
    return JSON.parse(decrypted.toString())
  }

  async getCdn() {
    const res = await this.is.get("https://media.savetube.vip/api/random-cdn")
    return { status: true, data: res.data.cdn }
  }

  async download(url, quality = '720') {
    const id = url.match(this.m)?.[3]
    if (!id) throw new Error("رابط يوتيوب غير صالح")
    const cdn = await this.getCdn()
    const info = await this.is.post(`https://${cdn.data}/v2/info`, { url: `https://www.youtube.com/watch?v=${id}` })
    const dec = await this.decrypt(info.data.data)
    
    // طلب نوع الفيديو بجودة عالية
    const dl = await this.is.post(`https://${cdn.data}/download`, { id, downloadType: 'video', quality: quality, key: dec.key })
    return { title: dec.title, duration: dec.duration, thumb: dec.thumbnail, download: dl.data.data.downloadUrl }
  }

  async downloadToFile(url, filePath) {
    const response = await axios.get(url, {
      responseType: 'stream',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: DOWNLOAD_TIMEOUT_MS,
      maxContentLength: Infinity
    })
    const writer = createWriteStream(filePath)
    await pipeline(response.data, writer)
    return filePath
  }
}

// محولات بديلة في حال تعطل السيرفر الرئيسي
async function getAlternativeVideo(url) {
  const apis = [
    `https://eliteprotech-apis.zone.id/ytdown?url=${encodeURIComponent(url)}&format=mp4`,
    `https://api.yupra.my.id/api/downloader/ytmp4?url=${encodeURIComponent(url)}`,
    `https://okatsu-rolezapiiz.vercel.app/downloader/ytmp4?url=${encodeURIComponent(url)}`
  ]

  for (const api of apis) {
    try {
      const { data } = await axios.get(api, { timeout: 30000 })
      const dlUrl = data?.downloadURL || data?.data?.download_url || data?.result?.mp4
      const title = data?.title || data?.data?.title || data?.result?.title || 'joker-video'
      if (dlUrl) return { download: dlUrl, title }
    } catch {}
  }
  throw new Error('فشلت جميع مصادر البدائل بالفيديو')
}

async function downloadVideoWithFallback(url) {
  const errors = []
  let tempFilePath = join(tmpdir(), `${Date.now()}_joker.mp4`)

  // محاولة 1: باستخدام محرك SaveTube القوي (جودة عالية)
  try {
    const st = new SaveTubeVideo()
    let result = await st.download(url, '720')
    await st.downloadToFile(result.download, tempFilePath)
    
    const stats = await fsPromises.stat(tempFilePath)
    if (stats.size < 20000) throw new Error('الملف صغير جداً أو تالف')
    
    return { title: result.title, filePath: tempFilePath, filename: `${result.title.replace(/[^\w\s-]/gi, '').trim()}.mp4` }
  } catch (e) {
    errors.push(`SaveTube: ${e.message}`)
    if (existsSync(tempFilePath)) await fsPromises.unlink(tempFilePath)
    tempFilePath = join(tmpdir(), `${Date.now()}_joker.mp4`)
  }

  // محاولة 2: السيرفرات البديلة (Elite/Yupra/Okatsu)
  try {
    const alt = await getAlternativeVideo(url)
    const response = await axios.get(alt.download, {
      responseType: 'stream',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: DOWNLOAD_TIMEOUT_MS,
      maxContentLength: Infinity
    })
    
    const writer = createWriteStream(tempFilePath)
    await pipeline(response.data, writer)
    
    const stats = await fsPromises.stat(tempFilePath)
    if (stats.size < 20000) throw new Error('الملف البديل صغير جداً')

    return { title: alt.title, filePath: tempFilePath, filename: `${alt.title.replace(/[^\w\s-]/gi, '').trim()}.mp4` }
  } catch (e) {
    errors.push(`Alternative: ${e.message}`)
    if (existsSync(tempFilePath)) await fsPromises.unlink(tempFilePath)
  }

  throw new Error(`تعذر تنزيل الفيديو نهائياً: ${errors.join('; ')}`)
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        const helpText = theme.build([
            { type: 'title', text: '🎬 تـحـمـيـل فـيـديـو يـوتـيـوب' },
            { type: 'divider' },
            { type: 'line', text: `طريقة الاستخدام: ${usedPrefix + command} <الرابط أو الاسم>` },
            { type: 'line', text: `مثال: ${usedPrefix + command} Dominic Fike babydoll` },
            { type: 'line', text: `مثال: ${usedPrefix + command} https://youtu.be/...` }
        ])
        return conn.reply(m.chat, helpText, m)
    }

    let videoUrl = ''

    if (text.startsWith('http://') || text.startsWith('https://')) {
        videoUrl = text
    } else {
        await m.react('🔍')
        try {
            const searchResults = await yts(text)
            const videos = searchResults?.videos || []
            if (!videos.length) {
                await m.react('❌')
                return conn.reply(m.chat, theme.error('لم يتم العثور على فيديوهات مطابقة لطلبك.'), m)
            }
            videoUrl = videos[0].url
        } catch (e) {
            await m.react('❌')
            return conn.reply(m.chat, theme.error('حدث خطأ أثناء البحث عن الفيديو.'), m)
        }
    }

    await m.react('⏳')
    let statusMsg = await m.reply(`⏳ *جاري جلب الفيديو بأفضل جودة...*`)
    let downloadedFilePath = null

    try {
        const result = await downloadVideoWithFallback(videoUrl)
        downloadedFilePath = result.filePath

        const stats = await fsPromises.stat(downloadedFilePath)
        if (stats.size < 20000) throw new Error('الملف فارغ أو تالف تماماً')

        try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}

        const finalTitle = result.title || 'joker-video'
        const captionText = theme.build([
            { type: 'title', text: finalTitle.slice(0, 50) },
            { type: 'line', text: 'تم التنزيل بنجاح بواسطة إتاشي 🃏' }
        ])

        // محاولة إرسال الفيديو مباشرة
        try {
            await conn.sendMessage(m.chat, {
                video: { url: downloadedFilePath },
                mimetype: 'video/mp4',
                fileName: result.filename,
                caption: captionText
            }, { quoted: m })
        } catch (videoError) {
            // نظام الحماية البديل: إرسال كملف وثيقة لضمان عدم ضغطه أو تلفه
            await conn.sendMessage(m.chat, {
                document: { url: downloadedFilePath },
                mimetype: 'video/mp4',
                fileName: result.filename,
                caption: captionText
            }, { quoted: m })
        }

        await m.react('✅')

    } catch (err) {
        console.error('[YT-VIDEO]', err)
        try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}
        await m.react('❌')
        conn.reply(m.chat, theme.error(`فشل تحميل الفيديو:\n\n${err.message || 'حدث خطأ غير معروف'}`), m)
    } finally {
        if (downloadedFilePath && existsSync(downloadedFilePath)) {
            await fsPromises.unlink(downloadedFilePath).catch(() => {})
        }
    }
}

handler.help = ['فيد <رابط/اسم>', 'فيديو <رابط/اسم>']
handler.tags = ['download']
handler.command = ['ytvideo', 'فيد', 'فيديو', 'ytv', 'ytmp4']

export default handler
