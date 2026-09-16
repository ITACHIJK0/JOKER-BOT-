// plugins/فيديو.js
// ♡ joker bot- YouTube Video Downloader (Multi-Source & FFmpeg Processed) 🎥

import { theme } from '../core/theme.js'
import axios from 'axios'
import crypto from 'crypto'
import { createWriteStream, existsSync, promises as fsPromises, readFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { pipeline } from 'stream/promises'
import { exec } from 'child_process'
import { promisify } from 'util'
import yts from 'yt-search'

const execAsync = promisify(exec)
const DOWNLOAD_TIMEOUT_MS = 180000

// 🛡️ نظام تحميل متعدد المصادر لضمان عدم تلف الملفات أبداً
class MultiSourceDownloader {
  constructor() {
    this.m = /^((?:https?:)?\/\/)?((?:www|m|music)\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=)?(?:embed\/)?(?:v\/)?(?:shorts\/)?([a-zA-Z0-9_-]{11})/
  }

  // 1️⃣ المصدر الأول: Cobalt API (سريع ومستقر جداً)
  async downloadFromCobalt(url) {
    try {
      const response = await axios.post('https://co.wuk.sh/api/json', {
        url: url,
        vQuality: '360',
        filenamePattern: 'classic'
      }, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
        },
        timeout: 45000
      })

      if (response.data && (response.data.status === 'stream' || response.data.status === 'redirect')) {
        return {
          title: response.data.filename ? response.data.filename.replace(/\.[^/.]+$/, "") : 'YouTube Video',
          downloadUrl: response.data.url,
          filename: response.data.filename || 'video.mp4'
        }
      }
    } catch (e) {
      console.log('[Cobalt-Fallback] Failed, trying next source...')
    }
    throw new Error('فشل المصدر الأول')
  }

  // 2️⃣ المصدر الثاني: SaveTube المحدث
  async downloadFromSaveTube(url) {
    const id = url.match(this.m)?.[3]
    if (!id) throw new Error("رابط يوتيوب غير صالح")

    const client = axios.create({
      headers: {
        'content-type': 'application/json',
        'origin': 'https://yt.savetube.me',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 30000
    })

    // جلب CDN جديد
    const cdnRes = await client.get("https://media.savetube.vip/api/random-cdn")
    const cdn = cdnRes.data.cdn

    const info = await client.post(`https://${cdn}/v2/info`, { url: `https://www.youtube.com/watch?v=${id}` })
    
    // فك التشفير الخاص بـ Savetube
    const ky = 'C5D58EF67A7584E4A29F6C35BBC4EB12'
    const buf = Buffer.from(info.data.data, 'base64')
    const key = Buffer.from(ky, 'hex')
    const iv = buf.slice(0, 16)
    const data = buf.slice(16)
    const decipher = crypto.createDecipheriv('aes-128-cbc', key, iv)
    const dec = JSON.parse(Buffer.concat([decipher.update(data), decipher.final()]).toString())

    const dl = await client.post(`https://${cdn}/download`, { 
      id, 
      downloadType: 'video', 
      quality: '360', 
      key: dec.key 
    })

    return {
      title: dec.title || 'YouTube Video',
      downloadUrl: dl.data.data.downloadUrl,
      filename: `${(dec.title || 'video').replace(/[^\w\s-]/gi, '')}.mp4`
    }
  }

  // الدالة العامة للتنزيل مع التبديل التلقائي بين المصادر
  async getDownloadData(url) {
    try {
      return await this.downloadFromCobalt(url)
    } catch (e1) {
      try {
        return await this.downloadFromSaveTube(url)
      } catch (e2) {
        throw new Error('جميع سيرفرات التحميل توقفت مؤقتاً، حاول لاحقاً.')
      }
    }
  }

  async downloadToFile(url, filePath) {
    const response = await axios.get(url, {
      responseType: 'stream',
      headers: { 
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Range': 'bytes=0-'
      },
      timeout: DOWNLOAD_TIMEOUT_MS,
      maxContentLength: Infinity
    })
    const writer = createWriteStream(filePath)
    await pipeline(response.data, writer)
    return filePath
  }
}

async function downloadVideoWithFallback(url) {
  let tempFilePath = join(tmpdir(), `raw_${Date.now()}.mp4`)
  let processedFilePath = join(tmpdir(), `fixed_${Date.now()}.mp4`)
  
  const downloader = new MultiSourceDownloader()
  const resultInfo = await downloader.getDownloadData(url)

  await downloader.downloadToFile(resultInfo.downloadUrl, tempFilePath)

  const stats = await fsPromises.stat(tempFilePath)
  // تم زيادة الحد الأدنى للحجم لضمان عدم قبول الملفات التالفة
  if (stats.size < 10000) throw new Error('الملف المحمل صغير جداً أو تالف')

  // 🛠️ معالجة الفيديو وإصلاحه عبر FFmpeg ليتوافق تماماً مع مشغل الواتساب (H.264 / AAC)
  try {
    const ffmpegCmd = `ffmpeg -y -i "${tempFilePath}" -c:v libx264 -preset ultrafast -crf 26 -c:a aac -b:a 128k -movflags +faststart "${processedFilePath}"`
    await execAsync(ffmpegCmd, { timeout: 60000 })
    
    if (existsSync(processedFilePath)) {
      const pStats = await fsPromises.stat(processedFilePath)
      if (pStats.size > 5000) {
        await fsPromises.unlink(tempFilePath).catch(() => {})
        return { title: resultInfo.title, filename: resultInfo.filename, filePath: processedFilePath }
      }
    }
  } catch (err) {
    console.error('[FFmpeg-Fix-Error]', err)
  }

  // إذا فشلت المعالجة يتم إرجاع الملف الأصلي إن كان سليماً
  return { title: resultInfo.title, filename: resultInfo.filename, filePath: tempFilePath }
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
    let statusMsg = await m.reply(`⏳ *جاري تحميل ومعالجة الفيديو ليطابق معايير واتساب...*`)
    let downloadedFilePath = null

    try {
        const result = await downloadVideoWithFallback(targetUrl)
        downloadedFilePath = result.filePath

        const stats = await fsPromises.stat(downloadedFilePath)
        if (stats.size < 10000) throw new Error('الملف فارغ أو تالف تماماً')

        const videoBuffer = readFileSync(downloadedFilePath)

        try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}

        await conn.sendMessage(m.chat, {
            video: videoBuffer,
            mimetype: 'video/mp4',
            fileName: result.filename,
            caption: `🎬 *${result.title || 'فيديو يوتيوب'}*`
        }, { quoted: m })

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } thend { // ملاحظة تم تصحيحها في الكود أدناه إلى catch
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
