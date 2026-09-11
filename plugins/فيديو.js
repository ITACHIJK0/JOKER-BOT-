// plugins/فيديو.js
// ♡ joker bot- YouTube Video Downloader 🎥

import { theme } from '../core/theme.js'
import axios from 'axios'
import crypto from 'crypto'
import { createWriteStream, existsSync, promises as fsPromises, readFileSync } from 'fs'
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
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
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

  async download(url, quality = '360') {
    const id = url.match(this.m)?.[3]
    if (!id) throw new Error("رابط يوتيوب غير صالح")
    const cdn = await this.getCdn()
    const info = await this.is.post(`https://${cdn.data}/v2/info`, { url: `https://www.youtube.com/watch?v=${id}` })
    const dec = await this.decrypt(info.data.data)
    
    const dl = await this.is.post(`https://${cdn.data}/download`, { 
      id, 
      downloadType: 'video', 
      quality: quality, 
      key: dec.key 
    })
    
    return { 
      title: dec.title, 
      duration: dec.duration, 
      thumb: dec.thumbnail, 
      download: dl.data.data.downloadUrl,
      filename: `${(dec.title || 'video').replace(/[^\w\s-]/gi, '')}.mp4`
    }
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

async function downloadVideoWithFallback(url) {
  let tempFilePath = join(tmpdir(), `${Date.now()}.mp4`)
  const st = new SaveTubeVideo()
  
  try {
    const result = await st.download(url, '360')
    await st.downloadToFile(result.download, tempFilePath)

    const stats = await fsPromises.stat(tempFilePath)
    if (stats.size < 5000) throw new Error('الملف صغير جداً أو تالف')

    return { ...result, filePath: tempFilePath }
  } catch (e) {
    if (existsSync(tempFilePath)) await fsPromises.unlink(tempFilePath).catch(() => {})
    
    tempFilePath = join(tmpdir(), `${Date.now()}.mp4`)
    const result = await st.download(url, '480')
    await st.downloadToFile(result.download, tempFilePath)

    const stats = await fsPromises.stat(tempFilePath)
    if (stats.size < 5000) throw new Error('الملف صغير جداً أو تالف')

    return { ...result, filePath: tempFilePath }
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(theme.build([
            { type: 'title', text: '🎥 يـوتـيـوب فـيـديـو' },
            { type: 'divider' },
            { type: 'info', label: '🔗 تحميل', value: `${usedPrefix + command} <رابط يوتيوب>` },
            { type: 'info', label: '🔍 بحث', value: `${usedPrefix + command} <اسم الفيديو>` }
        ]))
    }

    let targetUrl = text.trim()

    if (!targetUrl.includes('youtu.be') && !targetUrl.includes('youtube.com')) {
        await conn.sendMessage(m.chat, { react: { text: '🔍', key: m.key } })
        try {
            let searchResults = await yts(text)
            let video = searchResults.videos[0]

            if (!video) {
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
                return m.reply(theme.build([{ type: 'title', text: '❌ لا توجد نتائج للبحث' }]))
            }
            targetUrl = video.url
        } catch (error) {
            console.error('[YT-Search]', error)
            await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
            return m.reply(theme.build([{ type: 'title', text: '❌ خطأ في البحث' }, { type: 'line', text: 'يرجى المحاولة مرة أخرى لاحقاً.' }]))
        }
    }

    await conn.sendMessage(m.chat, { react: { text: '⏳', key: m.key } })
    let statusMsg = await m.reply(`⏳ *جاري تحميل الفيديو، انتظر قليلاً...*`)
    let downloadedFilePath = null

    try {
        const result = await downloadVideoWithFallback(targetUrl)
        downloadedFilePath = result.filePath

        const stats = await fsPromises.stat(downloadedFilePath)
        if (stats.size < 5000) throw new Error('الملف فارغ أو تالف')

        // قراءة الملف كـ Buffer لضمان عدم حدوث خطأ "الملف غير موجود" في الواتساب
        const videoBuffer = readFileSync(downloadedFilePath)

        try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}

        await conn.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            fileName: result.filename,
            caption: `🎬 *${result.title || 'فيديو يوتيوب'}*`
        }, { quoted: m })

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
        console.error('[YT-Video]', e)
        try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
        m.reply(`❌ *فـشـل تـحـمـيـل الـفـيـديـو*\n\n${e.message?.substring(0, 200) || 'حدث خطأ غير متوقع'}`)
    } finally {
        if (downloadedFilePath && existsSync(downloadedFilePath)) {
            await fsPromises.unlink(downloadedFilePath).catch(() => {})
        }
    }
}

handler.help = ['فيديو']
handler.tags = ['downloader']
handler.command = /^(فيديو|video|ytv)$/i

export default handler
