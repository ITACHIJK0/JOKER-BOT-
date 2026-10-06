/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸Ο𝙽 ʙʏ ɪᴛ𝙰𝙲𝙷𝙸

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 」
「 لا تحذف الحقوق 🖤 」
*/

import axios from 'axios'
import { writeFileSync, unlinkSync, readFileSync, existsSync } from 'fs'
import { execSync } from 'child_process'
import crypto from 'crypto'
import https from 'https'

const API_BASE = 'https://engez.a7a.online/api/v1'
const PINTEREST_ENDPOINT = `${API_BASE}/search/pinterest`
const MAX_TRIED = 40

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

        if (pin.video_url) params.videoUrl = pin.video_url
        if (pin.hls_url) params.hlsUrl = pin.hls_url
        if (pin.video_signature) params.videoSignature = pin.video_signature

        const { data } = await axios.get(PINTEREST_ENDPOINT, {
                params,
                timeout: 30000,
                validateStatus: () => true
        })

        if (!data || data.success !== true || !data.response?.downloadUrl) {
                throw new Error(data?.error || 'فشل الحصول على رابط التحميل المباشر')
        }

        return data.response.downloadUrl
}

async function downloadVideoBuffer(url) {
        const response = await axios.get(url, {
                responseType: 'arraybuffer',
                headers: {
                        'user-agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 Chrome/139.0.0.0 Mobile Safari/537.36'
                },
                timeout: 60000,
                maxRedirects: 5,
                validateStatus: () => true
        })

        const buffer = Buffer.from(response.data)
        if (buffer.length < 30000) {
                throw new Error('الملف غير صالح أو صغير جداً')
        }
        return buffer
}

async function getSharp() {
  try {
    const mod = await import('sharp')
    return mod.default
  } catch {
    throw new Error('❌ مكتبة sharp غير مثبتة\n📦 npm i sharp')
  }
}

async function makeTrayWebp(buffer) {
  const sharp = await getSharp()
  return sharp(buffer, { animated: false }).resize(252, 252, { fit: 'cover' }).webp().toBuffer()
}

async function makeBlankTrayWebp() {
  const sharp = await getSharp()
  return sharp({ create: { width: 252, height: 252, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } }).webp().toBuffer()
}

async function makeThumbnailJpeg(buffer) {
  const sharp = await getSharp()
  return sharp(buffer).resize(252, 252, { fit: 'cover' }).jpeg().toBuffer()
}

function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest()
}

function toB64Url(buffer) {
  return Buffer.from(buffer).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
}

// دالة حقن الحقوق الاحترافية للملصقات المتحركة
async function addExif(webpBuffer, packname = '亗 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰', author = '𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞') {
    const tmpInput = `./tmp_exif_in_${Date.now()}_${Math.random()}.webp`
    const tmpOutput = `./tmp_exif_out_${Date.now()}_${Math.random()}.webp`
    
    try {
        writeFileSync(tmpInput, webpBuffer)
        const mod = await import('node-webpmux')
        const img = new mod.Image()
        await img.load(tmpInput)

        const json = {
            'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
            'sticker-pack-name': packname,
            'sticker-pack-publisher': author,
            'emojis': ['🖤', '🃏', '🔥', '👑']
        }

        const exifAttr = Buffer.from([
            0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
            0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x16, 0x00, 0x00, 0x00
        ])

        const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
        let exif = Buffer.concat([exifAttr, jsonBuffer])
        exif.writeUIntLE(jsonBuffer.length, 14, 4)
        img.exif = exif

        await img.save(tmpOutput)
        const finalBuffer = readFileSync(tmpOutput)
        return finalBuffer
    } catch (e) {
        return webpBuffer
    } finally {
        try { if (existsSync(tmpInput)) unlinkSync(tmpInput) } catch {}
        try { if (existsSync(tmpOutput)) unlinkSync(tmpOutput) } catch {}
    }
}

async function uploadToServer(conn, buffer, { hkdf, mediaPath, mediaKey = crypto.randomBytes(32) }) {
  let lastError
  const expanded = Buffer.from(crypto.hkdfSync('sha256', mediaKey, Buffer.alloc(32), Buffer.from(hkdf), 112))
  const iv = expanded.subarray(0, 16)
  const cipherKey = expanded.subarray(16, 48)
  const macKey = expanded.subarray(48, 80)
  const cipher = crypto.createCipheriv('aes-256-cbc', cipherKey, iv)
  const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()])
  const mac = crypto.createHmac('sha256', macKey).update(iv).update(encrypted).digest().subarray(0, 10)
  const encBuffer = Buffer.concat([encrypted, mac])
  const fileSha256 = sha256(buffer)
  const fileEncSha256 = sha256(encBuffer)

  const iq = await conn.query({
    tag: 'iq', attrs: { id: conn.generateMessageTag?.() ?? Date.now().toString(), to: 's.whatsapp.net', type: 'set', xmlns: 'w:m' },
    content: [{ tag: 'media_conn', attrs: {} }]
  })

  const mediaConn = iq.content?.find(v => v.tag === 'media_conn')
  if (!mediaConn) throw new Error('media_conn غير موجود')
  const auth = mediaConn.attrs?.auth
  if (!auth) throw new Error('auth غير موجود')

  const hosts = (mediaConn.content || []).filter(v => v.tag === 'host').map(v => v.attrs?.hostname).filter(Boolean)
  if (!hosts.length) throw new Error('لا يوجد host للرفع')

  const token = encodeURIComponent(fileEncSha256.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, ''))

  for (const host of hosts) {
    try {
      const json = await new Promise((resolve, reject) => {
        const url = new URL(`https://${host}${mediaPath}/${token}?auth=${encodeURIComponent(auth)}&token=${token}`)
        const req = https.request({
          hostname: url.hostname, port: 443, path: url.pathname + url.search, method: 'POST',
          headers: { Origin: 'https://web.whatsapp.com', Referer: 'https://web.whatsapp.com/', 'Content-Type': 'application/octet-stream', 'Content-Length': encBuffer.length }
        }, (res) => {
          let body = ''
          res.on('data', c => body += c)
          res.on('end', () => {
            if (res.statusCode < 200 || res.statusCode >= 300) return reject(new Error(`فشل الرفع ${res.statusCode}`))
            try { resolve(JSON.parse(body)) } catch { reject(new Error('رد غير JSON')) }
          })
        })
        req.on('error', reject)
        req.write(encBuffer)
        req.end()
      })
      const directPath = json.direct_path ?? json.directPath ?? json.url ?? json.path
      if (!directPath) throw new Error('directPath غير موجود')
      return { mediaKey, fileLength: buffer.length, fileSha256, fileEncSha256, directPath, ...json }
    } catch (e) { lastError = e }
  }
  throw lastError ?? new Error('جميع محاولات الرفع فشلت')
}

async function sendStickerPack(conn, m, pack, query) {
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()
  const stickersMetadata = []

  for (const item of pack) {
    let finalBuffer = await addExif(item.buffer, '亗 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰', '𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞')
    const fileName = `${toB64Url(sha256(finalBuffer))}.webp`
    zip.file(fileName, finalBuffer)
    stickersMetadata.push({
      fileName,
      isAnimated: true,
      emojis: ['🃏', '🖤', '🔥'],
      accessibilityLabel: '',
      isLottie: false,
      mimetype: 'image/webp'
    })
  }

  const trayIconFileName = 'tray_icon.webp'
  const trayBuffer = pack[0]?.buffer ? await makeTrayWebp(pack[0].buffer) : await makeBlankTrayWebp()
  zip.file(trayIconFileName, trayBuffer)

  const archive = await zip.generateAsync({ type: 'nodebuffer', compression: 'STORE' })

  const packUpload = await uploadToServer(conn, archive, { hkdf: 'WhatsApp Sticker Pack Keys', mediaPath: '/mms/sticker-pack' })
  const thumbnailBuffer = await makeThumbnailJpeg(trayBuffer)
  const thumbUpload = await uploadToServer(conn, thumbnailBuffer, { hkdf: 'WhatsApp Sticker Pack Thumbnail Keys', mediaPath: '/mms/thumbnail-sticker-pack', mediaKey: packUpload.mediaKey })

  await conn.relayMessage(m.chat, {
    messageContextInfo: { messageSecret: crypto.randomBytes(32) },
    stickerPackMessage: {
      stickerPackId: 'Pack_' + crypto.randomBytes(8).toString('hex'),
      name: '亗 𝐉𝐨𝐤𝐞𝐫 𝐁𝐨𝐭 ✰',
      publisher: '𝐁𝐲 𝐈𝐭𝐚𝐜𝐡𝐢 ♞',
      packDescription: `🃏 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 | حزمة متحركة: ${query}`,
      stickers: stickersMetadata,
      fileLength: packUpload.fileLength,
      fileSha256: packUpload.fileSha256,
      fileEncSha256: packUpload.fileEncSha256,
      mediaKey: packUpload.mediaKey,
      directPath: packUpload.directPath,
      mediaKeyTimestamp: Math.floor(Date.now() / 1000),
      stickerPackSize: packUpload.fileLength,
      stickerPackOrigin: 2,
      trayIconFileName,
      thumbnailDirectPath: thumbUpload.directPath,
      thumbnailSha256: thumbUpload.fileSha256,
      thumbnailEncSha256: thumbUpload.fileEncSha256,
      thumbnailHeight: 252,
      thumbnailWidth: 252,
      imageDataHash: thumbUpload.fileSha256.toString('base64')
    }
  }, { quoted: m })
}

async function makeAnimatedWebpFromVideoBuffer(videoBuffer, index) {
  const ts = Date.now()
  const inputPath = `./tmp_v_in_${ts}_${index}_${Math.random()}.mp4`
  const outputPath = `./tmp_v_out_${ts}_${index}_${Math.random()}.webp`
  try {
    writeFileSync(inputPath, videoBuffer)
    // تحويل آمن ومضبوط لملصق متحرك عبر FFmpeg (أعلى جودة وثبات)
    execSync(`ffmpeg -y -i "${inputPath}" -t 5 -vf "scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000,fps=15" -loop 0 -q:v 75 -preset default -an "${outputPath}"`, { stdio: 'pipe' })
    let result = readFileSync(outputPath)
    return result
  } finally {
    try { if (existsSync(inputPath)) unlinkSync(inputPath) } catch {}
    try { if (existsSync(outputPath)) unlinkSync(outputPath) } catch {}
  }
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
        if (!args[0]) {
                return m.reply(`🃏 *𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓* ➢ الاستخدام الصحيح:\n📌 مثال: \`${usedPrefix + command} انمي 15\`\n(الحد الأقصى 30 فيديو في الحزمة)`)
        }

        let query = args.join(' ')
        let count = 10 // القيمة الافتراضية إذا لم يحدد المستخدم
        const parts = args
        const lastPart = parts[parts.length - 1]
        
        if (!isNaN(lastPart) && parts.length > 1) {
                count = Math.min(30, Math.max(1, parseInt(lastPart)))
                query = parts.slice(0, -1).join(' ')
        }

        let statusMsg = await m.reply(`⏳ *جاري سحب ومعالجة ${count} فيديو وتحويلها لملصقات متحركة (خذ راحتك سأستغرق وقتاً لإنتاج حزمة جبارة بدون أخطاء)...*`)

        await conn.sendMessage(m.chat, {
                react: { text: '⏳', key: m.key }
        })

        try {
                const pins = shuffle(await searchPins(query))
                const pack = []
                let tried = 0
                let pinIndex = 0

                // نظام المعالجة والتحميل بالتتابع (Sequential) لضمان عدم حدوث أي خطأ أو انهيار
                while (pack.length < count && pinIndex < pins.length && tried < MAX_TRIED) {
                        tried++
                        const pin = pins[pinIndex++]
                        
                        try {
                                const downloadUrl = await resolveDownloadUrl(pin)
                                const videoBuffer = await downloadVideoBuffer(downloadUrl)
                                const webpBuffer = await makeAnimatedWebpFromVideoBuffer(videoBuffer, pack.length)
                                
                                if (webpBuffer && webpBuffer.length > 1000) {
                                        pack.push({ buffer: webpBuffer })
                                }
                        } catch (e) {
                                // تخطي الفيديو التالف والمتابعة بصمت لضمان نجاح الحزمة بالكامل
                        }
                }

                try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}

                if (!pack.length) {
                        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
                        return m.reply('❌ تعذر إعداد الحزمة، جرب كلمة بحث أخرى.')
                }

                // إرسال الحزمة المتحركة الكبرى المتكاملة دفعة واحدة
                await sendStickerPack(conn, m, pack, query)

                await conn.sendMessage(m.chat, {
                        react: { text: '🃏', key: m.key }
                })

        } catch (err) {
                console.error('❌ Sticker Pack Error:', err)
                try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}
                await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
                await m.reply(`❌ حدث خطأ أثناء إنشاء حزمة الفيديوهات المتحركة: ${err.message}`)
        }
}

handler.help = ['حزمه_متحركه', 'حزمة_محتركة']
handler.tags = ['sticker', 'download']
handler.command = /^(حزمه_متحركه|حزمة_محتركة|باكج_فيديو|حزمة_فيديوهات)$/i

export default handler
