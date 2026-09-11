// plugins/sticker.js
// 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - Ultimate Smart Sticker Maker (FFmpeg Edition) 🎨⚔️

import { exec } from 'child_process'
import { promisify } from 'util'
import { writeFileSync, unlinkSync, existsSync, readFileSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import webp from 'node-webpmux'
import crypto from 'crypto'
import https from 'https'

const execAsync = promisify(exec)

// ⚡ إضافة Metadata للملصق بحقوق أتاتشي والجوكر
async function addStickerMetadata(webpBuffer, packName = '👑 𝐈𝐭𝐚𝐜𝐡𝐢 𝑷𝒂𝒄𝒌 ✧', authorName = '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ') {
  try {
    const img = new webp.Image()
    await img.load(webpBuffer)

    const json = {
      'sticker-pack-id': crypto.randomBytes(32).toString('hex'),
      'sticker-pack-name': packName,
      'sticker-pack-publisher': authorName,
      'emojis': ['👑', '⚔️', '🔥']
    }

    const exifAttr = Buffer.from([
      0x49, 0x49, 0x2A, 0x00, 0x08, 0x00, 0x00, 0x00,
      0x01, 0x00, 0x41, 0x57, 0x07, 0x00, 0x00, 0x00,
      0x00, 0x00, 0x16, 0x00, 0x00, 0x00
    ])

    const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf8')
    const exif = Buffer.concat([exifAttr, jsonBuffer])
    exif.writeUIntLE(jsonBuffer.length, 14, 4)
    img.exif = exif

    return await img.save(null)
  } catch {
    return webpBuffer
  }
}

// 📦 أدوات رفع حزمة الملصقات المجمعة
function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest()
}

function toB64Url(buffer) {
  return Buffer.from(buffer).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '')
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

async function getSharp() {
  const mod = await import('sharp')
  return mod.default
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

async function sendStickerPack(conn, m, pack) {
  const JSZip = (await import('jszip')).default
  const zip = new JSZip()
  const stickersMetadata = []

  for (const item of pack) {
    const fileName = `${toB64Url(sha256(item.buffer))}.webp`
    zip.file(fileName, item.buffer)
    stickersMetadata.push({
      fileName,
      isAnimated: item.isAnimated,
      emojis: ['👑', '⚔️'],
      accessibilityLabel: '',
      isLottie: false,
      mimetype: 'image/webp'
    })
  }

  const trayIconFileName = 'tray_icon.webp'
  const traySource = pack.find(v => !v.isAnimated)?.buffer || pack[0]?.buffer
  const trayBuffer = traySource ? await makeTrayWebp(traySource) : await makeBlankTrayWebp()
  zip.file(trayIconFileName, trayBuffer)

  const archive = await zip.generateAsync({ type: 'nodebuffer', compression: 'STORE' })

  const packUpload = await uploadToServer(conn, archive, { hkdf: 'WhatsApp Sticker Pack Keys', mediaPath: '/mms/sticker-pack' })
  const thumbnailBuffer = await makeThumbnailJpeg(trayBuffer)
  const thumbUpload = await uploadToServer(conn, thumbnailBuffer, { hkdf: 'WhatsApp Sticker Pack Thumbnail Keys', mediaPath: '/mms/thumbnail-sticker-pack', mediaKey: packUpload.mediaKey })

  await conn.relayMessage(m.chat, {
    messageContextInfo: { messageSecret: crypto.randomBytes(32) },
    stickerPackMessage: {
      stickerPackId: 'Pack_' + crypto.randomBytes(8).toString('hex'),
      name: '👑 𝐈𝐭𝐚𝐜𝐡𝐢 𝑷𝒂𝒄𝒌 ✧',
      publisher: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ',
      packDescription: '👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - Sticker Pack',
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

let handler = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    // 🔍 التحقق مما إذا كانت الرسالة عبارة عن مجموعة صور أو عدة وسائط
    let messagesToProcess = []
    
    if (q.message?.extendedTextMessage?.contextInfo?.quotedMessage) {
        // دعم الرد على الرسائل المتعددة إذا توفرت
    }

    if (!mime && !q.message) {
        return m.reply('👑 *𝐈𝐭𝐚𝐜𝐡𝐢: "الرجاء الرد على صورة، فيديو، أو ألبوم صور لتوليد الملصقات"*')
    }

    await conn.sendMessage(m.chat, { react: { text: '⚡', key: m.key } })

    try {
        // جمع الوسائط (سواء عنصر واحد أو ألبوم متعدد)
        let mediaBuffers = []
        
        if (q.download) {
            let buffer = await q.download()
            mediaBuffers.push({ buffer, mime: mime || 'image/jpeg' })
        } else {
            let buffer = await m.download()
            mediaBuffers.push({ buffer, mime: mime || 'image/jpeg' })
        }

        let pack = []

        for (let i = 0; i < mediaBuffers.length; i++) {
            let item = mediaBuffers[i]
            let isVideo = item.mime.includes('video')
            let inputPath = join(tmpdir(), `in_${Date.now()}_${i}.${isVideo ? 'mp4' : 'jpg'}`)
            let outputPath = join(tmpdir(), `out_${Date.now()}_${i}.webp`)

            writeFileSync(inputPath, item.buffer)

            try {
                if (!isVideo) {
                    // 🖼️ معالجة الصورة المربعة الفخمة
                    let cmd = `ffmpeg -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=increase,crop=512:512" -vcodec libwebp -lossless 0 -q:v 85 "${outputPath}" -y`
                    await execAsync(cmd, { timeout: 30000 })
                } else {
                    // 🎞️ معالجة وقص الفيديو التلقائي (أول 7 ثوانٍ وبدقة مربعة متناسقة)
                    let cmd = `ffmpeg -i "${inputPath}" -t 7 -vf "fps=15,scale=512:512:force_original_aspect_ratio=increase,crop=512:512" -c:v libwebp -loop 0 -preset default -an -vsync 0 "${outputPath}" -y`
                    await execAsync(cmd, { timeout: 45000 })
                }

                if (existsSync(outputPath)) {
                    let webpBuf = readFileSync(outputPath)
                    webpBuf = await addStickerMetadata(webpBuf)
                    pack.push({ buffer: webpBuf, isAnimated: isVideo })
                }
            } finally {
                try { if (existsSync(inputPath)) unlinkSync(inputPath) } catch {}
                try { if (existsSync(outputPath)) unlinkSync(outputPath) } catch {}
            }
        }

        if (pack.length === 0) {
            throw new Error('فشل معالجة الملفات')
        }

        // إذا كان هناك أكثر من ملصق أو تم اختيار نظام الحزمة، يتم إرسالها كباكج متكامل
        if (pack.length > 1) {
            await sendStickerPack(conn, m, pack)
        } else {
            // ملصق فردي عادي
            await conn.sendMessage(m.chat, { sticker: pack[0].buffer }, { quoted: m })
        }

        await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })

    } catch (e) {
        console.error('[Itachi-Sticker-FFmpeg] Error:', e)
        await m.reply('❌ *𝐈𝐭𝐚𝐜𝐡𝐢: "فشل توليد الملصق، تأكد من جودة الملف أو حزمة ffmpeg"*')
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    }
}

handler.command = ['ستيكر', 'sticker', 'ملصق', 'ملصقات']
handler.help = ['ستيكر']
handler.tags = ['sticker']

export default handler
