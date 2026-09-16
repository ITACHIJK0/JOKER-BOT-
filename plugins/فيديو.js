// plugins/فيديو.js
// ♡ joker bot - YouTube Video Downloader (Multi-Source & FFmpeg Processed) 🎥

import { theme } from '../core/theme.js'
import axios from 'axios'
import crypto from 'crypto'
import { createWriteStream, existsSync, promises as fsPromises } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import { pipeline } from 'stream/promises'
import { exec } from 'child_process'
import { promisify } from 'util'
import yts from 'yt-search'

const execAsync = promisify(exec)
const DOWNLOAD_TIMEOUT_MS = 180000

// 🛡️ كلاس SaveTube لجلب روابط الفيديو بجودة قوية ومستقرة
class SaveTube {
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

  async download(url, type = 'video', quality = '360') {
    const id = url.match(this.m)?.[3]
    if (!id) throw new Error("Invalid YouTube URL")
    const cdn = await this.getCdn()
    const info = await this.is.post(`https://${cdn.data}/v2/info`, { url: `https://www.youtube.com/watch?v=${id}` })
    const dec = await this.decrypt(info.data.data)
    const dl = await this.is.post(`https://${cdn.data}/download`, { id, downloadType: type, quality: quality, key: dec.key })
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

const apiHeaders = {
  accept: "application/json",
  "content-type": "application/json",
  "user-agent": "Mozilla/5.0 (Android)",
  referer: "https://ytmp3.gg/"
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

async function poll(statusUrl) {
  const { data } = await axios.get(statusUrl, { headers: apiHeaders, timeout: DOWNLOAD_TIMEOUT_MS })
  if (data.status === "completed") return data
  if (data.status === "failed") throw new Error(data.message || "Conversion failed")
  await sleep(2000)
  return poll(statusUrl)
}

async function convertVideo(url, quality = "360") {
  const { data: meta } = await axios.get("https://www.youtube.com/oembed", { params: { url, format: "json" }, timeout: DOWNLOAD_TIMEOUT_MS })
  const payload = { url, os: "android", output: { type: "video", format: "mp4", quality } }

  let downloadInit
  try {
    downloadInit = await axios.post("https://hub.ytconvert.org/api/download", payload, { headers: apiHeaders, timeout: DOWNLOAD_TIMEOUT_MS })
  } catch {
    downloadInit = await axios.post("https://api.ytconvert.org/api/download", payload, { headers: apiHeaders, timeout: DOWNLOAD_TIMEOUT_MS })
  }

  if (!downloadInit?.data?.statusUrl) throw new Error("Converter failed to respond")
  const result = await poll(downloadInit.data.statusUrl)
  return { title: meta.title, author: meta.author_name, downloadUrl: result.downloadUrl, filename: `${meta.title.replace(/[^\w\s-]/gi, '')}.mp4` }
}

// 🔄 دالة التحميل مع نظام الاحتياط (Fallback) والمعالجة عبر FFmpeg
async function downloadVideoWithFallback(url) {
  const errors = []
  let tempFilePath = join(tmpdir(), `raw_${Date.now()}.mp4`)
  let processedFilePath = join(tmpdir(), `fixed_${Date.now()}.mp4`)

  // 1️⃣ المحاولة الأولى عبر SaveTube
  try {
    const st = new SaveTube()
    const result = await st.download(url, 'video', '360')
    await st.downloadToFile(result.download, tempFilePath)

    const stats = await fsPromises.stat(tempFilePath)
    if (stats.size > 15000) {
      // معالجة الفيديو وإصلاحه عبر FFmpeg للتوافق التام مع واتساب
      try {
        const ffmpegCmd = `ffmpeg -y -i "${tempFilePath}" -c:v libx264 -preset ultrafast -crf 26 -c:a aac -b:a 128k -movflags +faststart "${processedFilePath}"`
        await execAsync(ffmpegCmd, { timeout: 90000 })
        
        if (existsSync(processedFilePath)) {
          const pStats = await fsPromises.stat(processedFilePath)
          if (pStats.size > 10000) {
            await fsPromises.unlink(tempFilePath).catch(() => {})
            return { title: result.title, filename: `${(result.title || 'video').replace(/[^\w\s-]/gi, '')}.mp4`, filePath: processedFilePath }
          }
        }
      } catch (err) {
        console.error('[FFmpeg-Video-Error]', err)
      }
      return { title: result.title, filename: `${(result.title || 'video').replace(/[^\w\s-]/gi, '')}.mp4`, filePath: tempFilePath }
    }
  } catch (e) {
    errors.push(`SaveTube: ${e.message}`)
    if (existsSync(tempFilePath)) await fsPromises.unlink(tempFilePath).catch(() => {})
    tempFilePath = join(tmpdir(), `raw_${Date.now()}.mp4`)
  }

  // 2️⃣ المحاولة الثانية عبر ytconvert
  try {
    let result = await convertVideo(url)

    const response = await axios.get(result.downloadUrl, {
      responseType: 'stream',
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
      timeout: DOWNLOAD_TIMEOUT_MS,
      maxContentLength: Infinity
    })

    const writer = createWriteStream(tempFilePath)
    await pipeline(response.data, writer)

    const stats = await fsPromises.stat(tempFilePath)
    if (stats.size > 15000) {
      try {
        const ffmpegCmd = `ffmpeg -y -i "${tempFilePath}" -c:v libx264 -preset ultrafast -crf 26 -c:a aac -b:a 128k -movflags +faststart "${processedFilePath}"`
        await execAsync(ffmpegCmd, { timeout: 90000 })
        
        if (existsSync(processedFilePath)) {
          const pStats = await fsPromises.stat(processedFilePath)
          if (pStats.size > 10000) {
            await fsPromises.unlink(tempFilePath).catch(() => {})
            return { title: result.title, filename: result.filename, filePath: processedFilePath }
          }
        }
      } catch (err) {
        console.error('[FFmpeg-Video-Error]', err)
      }
      return { title: result.title, filename: result.filename, filePath: tempFilePath }
    }
  } catch (e) {
    errors.push(`Converter: ${e.message}`)
    if (existsSync(tempFilePath)) await fsPromises.unlink(tempFilePath).catch(() => {})
  }

  throw new Error(`فشل تحميل الفيديو من جميع المصادر: ${errors.join('; ')}`)
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
    let statusMsg = await m.reply(`⏳ *جاري تحميل ومعالجة الفيديو بجودة عالية...*`)
    let downloadedFilePath = null

    try {
        const result = await downloadVideoWithFallback(targetUrl)
        downloadedFilePath = result.filePath

        const stats = await fsPromises.stat(downloadedFilePath)
        if (stats.size < 10000) throw new Error('الملف الناتج تالف أو صغير جداً')

        try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}

        await conn.sendMessage(m.chat, {
            video: { url: downloadedFilePath },
            mimetype: 'video/mp4',
            fileName: result.filename || 'video.mp4',
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
