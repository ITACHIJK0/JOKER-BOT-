// plugins/anime-edit.js
// ✧ 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 𝜰 — نظام جلب الإيديتات الأسطوري (Multi-Source Engine) 🎬⚔️

import yts from 'yt-search'
import axios from 'axios'
import crypto from 'crypto'
import { join } from 'path'
import { tmpdir } from 'os'
import { existsSync, unlinkSync, statSync, readFileSync, createWriteStream } from 'fs'
import { pipeline } from 'stream/promises'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)
const DOWNLOAD_TIMEOUT_MS = 180000

function cleanQuery(text) {
  return text.trim().replace(/\s+/g, ' ').slice(0, 100)
}

function isUsableVideo(v) {
  return !!(v?.url && (v?.type === 'video' || v?.seconds || v?.duration))
}

async function searchEdits(query) {
  const queries = [
    `${query} anime edit 4k`,
    `${query} إيديت أنمي`,
    `${query} edit 60fps`,
    query
  ]

  let allVideos = []
  for (const q of queries) {
    try {
      const result = await yts(q)
      const videos = (result?.videos || [])
        .filter(isUsableVideo)
        .filter(v => v.seconds > 0 && v.seconds <= 120) // حصر النتائج في الإيديتات القصيرة تحت دقيقتين
      
      allVideos.push(...videos)
    } catch {}
  }

  // إزالة التكرار بناءً على الـ videoId
  const uniqueVideos = Array.from(new Map(allVideos.map(v => [v.videoId, v])).values())
  return uniqueVideos.sort((a, b) => (a.seconds || 9999) - (b.seconds || 9999))
}

// 🛡️ كلاس SaveTube لجلب الإيديتات والفيديوهات بجودة قوية ومستقرة
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
    const id = url.match(this.m)?.[3] || url.split('v=')[1]?.substring(0, 11)
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
  return { title: meta.title, downloadUrl: result.downloadUrl }
}

// 🔄 نظام تحميل متعدد المصادر للإيديتات مع معالجة FFmpeg لتوافق تام وصحيح مع واتساب
class MultiSourceEditDownloader {
  async download(url, outputPath) {
    const errors = []
    let tempRawPath = `${outputPath}_raw.mp4`

    // 1️⃣ المحاولة الأولى عبر SaveTube
    try {
      const st = new SaveTube()
      const result = await st.download(url, 'video', '360')
      await st.downloadToFile(result.download, tempRawPath)

      if (existsSync(tempRawPath) && statSync(tempRawPath).size > 15000) {
        await this.processWithFFmpeg(tempRawPath, outputPath)
        return true
      }
    } catch (e1) {
      errors.push(`SaveTube: ${e1.message}`)
      if (existsSync(tempRawPath)) try { unlinkSync(tempRawPath) } catch {}
    }

    // 2️⃣ المحاولة الثانية عبر ytconvert
    try {
      const convResult = await convertVideo(url)
      const response = await axios.get(convResult.downloadUrl, {
        responseType: 'stream',
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
        timeout: DOWNLOAD_TIMEOUT_MS,
        maxContentLength: Infinity
      })

      const writer = createWriteStream(tempRawPath)
      await pipeline(response.data, writer)

      if (existsSync(tempRawPath) && statSync(tempRawPath).size > 15000) {
        await this.processWithFFmpeg(tempRawPath, outputPath)
        return true
      }
    } catch (e2) {
      errors.push(`Converter: ${e2.message}`)
      if (existsSync(tempRawPath)) try { unlinkSync(tempRawPath) } catch {}
    }

    throw new Error(`فشل التحميل من كافة السيرفرات: ${errors.join(' | ')}`)
  }

  async processWithFFmpeg(inputPath, outputPath) {
    try {
      const ffmpegCmd = `ffmpeg -y -i "${inputPath}" -c:v libx264 -preset ultrafast -crf 26 -c:a aac -b:a 128k -movflags +faststart "${outputPath}"`
      await execAsync(ffmpegCmd, { timeout: 60000 })
    } catch (err) {
      // في حال حدث خطأ أثناء المعالجة، نستخدم الملف الأصلي مباشرة كبديل آمن
      const { copyFileSync } = await import('fs')
      copyFileSync(inputPath, outputPath)
    } finally {
      if (existsSync(inputPath)) try { unlinkSync(inputPath) } catch {}
    }
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text?.trim()) {
    let menuText = `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ] ── ✦ ── ❖
🎬 *نـظـام جـلـب الإيـديـتـات الأَسْـطُـوري*
───────────────────
📌 *طريقة الاستخدام:*
 \`${usedPrefix}${command} [اسم الشخصية أو الأنمي]\`

💡 *أمثلة سريعة:*
 ┠ \`${usedPrefix}${command} itachi\`
 ┠ \`${usedPrefix}${command} جوجوتسو كايسن\`
 ┠ \`${usedPrefix}${command} goku ultra instinct\`
───────────────────
〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ 𝐁𝐘 𝐈𝐓𝐀𝐂𝐇𝐈 卍`;
    return await conn.sendMessage(m.chat, { text: menuText }, { quoted: m });
  }

  const queryName = cleanQuery(text)
  const status = await m.reply(`⚡ *[ Itachi ]* : جاري استدعاء إيديت أسطوري لـ (*${queryName}*) عبر بُعد الشارينگان... 👁️‍🗨️`)
  await conn.sendMessage(m.chat, { react: { text: '👁️', key: m.key } }).catch(() => {})

  let outPath = null
  const downloader = new MultiSourceEditDownloader()

  try {
    const videos = await searchEdits(queryName)
    if (!videos.length) throw new Error('لا توجد نتائج مطابقة في الأبعاد الروحية')

    let lastError = null
    // تجربة أول 5 فيديوهات قصيرة متاحة لضمان النجاح الفوري
    for (const video of videos.slice(0, 5)) {
      try {
        const safeId = String(video.videoId || Date.now()).replace(/[^a-zA-Z0-9_-]/g, '')
        outPath = join(tmpdir(), `itachi_edit_${safeId}_${Date.now()}.mp4`)
        
        await downloader.download(video.url, outPath)

        if (!existsSync(outPath) || statSync(outPath).size < 20000) {
          throw new Error('ملف الفيديو غير صالح أو تالف')
        }

        const videoBuffer = readFileSync(outPath)

        // إعدادات القناة والمعاينة الرسمية (External Ad Reply)
        const channelContext = {
          contextInfo: {
            isForwarded: true,
            forwardingScore: 1,
            forwardedNewsletterMessageInfo: {
              newsletterJid: '120363429074575231@newsletter',
              newsletterName: '𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 𝜰',
              serverMessageId: 970
            },
            externalAdReply: {
              title: `🎬 EDIT: ${queryName.toUpperCase()}`,
              body: 'اضغط للانضمام لقناة البوت الرسمية',
              thumbnailUrl: 'https://files.catbox.moe/g2w389.jpg',
              sourceUrl: 'https://whatsapp.com/channel/0029Vb8iiA24tRrvy4FB0H0A',
              mediaType: 1,
              renderLargerThumbnail: true
            }
          }
        }

        try { await conn.sendMessage(m.chat, { delete: status.key }) } catch {}

        await conn.sendMessage(m.chat, {
          video: videoBuffer,
          mimetype: 'video/mp4',
          caption: `❖ ── ✦ ── [ 𝓣𝐇𝐄 𝐉𝐎𝐊𝐄𝐑 ] ── ✦ ── ❖\n🎬 *العنوان:* ${video.title || 'Anime Masterpiece'}\n⏱️ *المدة:* ${video.timestamp || 'غير محدد'}\n👁️ *بواسطة:* 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹\n───────────────────\n〽️ 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞ BY 𝐈𝐓𝐀𝐂𝐇𝐈 卍`,
          ...channelContext
        }, { quoted: m })

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } }).catch(() => {})
        return
      } catch (e) {
        lastError = e
        try { if (outPath && existsSync(outPath)) unlinkSync(outPath) } catch {}
        outPath = null
      }
    }

    throw lastError || new Error('فشلت جميع محاولات التحميل المتاحة')
  } catch (e) {
    console.error('[Itachi-Edit-Error]', e?.message || e)
    try { await conn.sendMessage(m.chat, { delete: status.key }) } catch {}
    await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } }).catch(() => {})
    await m.reply(`❌ *عذراً يا محارب:* تعذر جلب الإيديت المطلوب حالياً بسبب ضغط السيرفرات أو قيود الرابط.\n\n💡 *جرّب كتابة اسم الشخصية بالإنجليزية (مثل: Sasuke أو Gojo) أو حاول مرة أخرى بعد قليل.*`)
  } finally {
    try { if (outPath && existsSync(outPath)) unlinkSync(outPath) } catch {}
  }
}

handler.help = ['ايديت', 'edit', 'إيديت']
handler.tags = ['anime']
handler.command = /^(ايديت|edit|إيديت)$/i

export default handler
