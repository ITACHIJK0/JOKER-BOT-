// plugins/sticker.js
// 👑 𝐈𝐭𝐚𝐜𝐡𝐢♞ | 𝐓𝐇𝐄 𝑱𝑶𝑲𝑬𝑹 ᜰ - Single Smart Sticker Maker (FFmpeg Edition) 🎨⚔️

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

let handler = async (m, { conn }) => {
    let q = m.quoted ? m.quoted : m
    let mime = (q.msg || q).mimetype || ''

    if (!mime && !q.message) {
        return m.reply('👑 *𝐈𝐭𝐚𝐜𝐡𝐢: "الرجاء الرد على صورة أو فيديو لتوليد الملصق"*')
    }

    await conn.sendMessage(m.chat, { react: { text: '⚡', key: m.key } })

    try {
        let buffer = q.download ? await q.download() : await m.download()
        let isVideo = mime.includes('video')
        let inputPath = join(tmpdir(), `in_${Date.now()}.${isVideo ? 'mp4' : 'jpg'}`)
        let outputPath = join(tmpdir(), `out_${Date.now()}.webp`)

        writeFileSync(inputPath, buffer)

        try {
            if (!isVideo) {
                // 🖼️ معالجة الصورة الفردية المربعة
                let cmd = `ffmpeg -i "${inputPath}" -vf "scale=512:512:force_original_aspect_ratio=increase,crop=512:512" -vcodec libwebp -lossless 0 -q:v 85 "${outputPath}" -y`
                await execAsync(cmd, { timeout: 30000 })
            } else {
                // 🎞️ معالجة الفيديو (أول 7 ثوانٍ)
                let cmd = `ffmpeg -i "${inputPath}" -t 7 -vf "fps=15,scale=512:512:force_original_aspect_ratio=increase,crop=512:512" -c:v libwebp -loop 0 -preset default -an -vsync 0 "${outputPath}" -y`
                await execAsync(cmd, { timeout: 45000 })
            }

            if (existsSync(outputPath)) {
                let webpBuf = readFileSync(outputPath)
                webpBuf = await addStickerMetadata(webpBuf)
                
                // إرسال الملصق الفردي
                await conn.sendMessage(m.chat, { sticker: webpBuf }, { quoted: m })
                await conn.sendMessage(m.chat, { react: { text: '✅', key: m.key } })
            } else {
                throw new Error('فشل توليد ملف الـ webp')
            }
        } finally {
            try { if (existsSync(inputPath)) unlinkSync(inputPath) } catch {}
            try { if (existsSync(outputPath)) unlinkSync(outputPath) } catch {}
        }

    } catch (e) {
        console.error('[Itachi-Sticker-FFmpeg] Error:', e)
        await m.reply('❌ *𝐈𝐭𝐚𝐜𝐡𝐢: "فشل توليد الملصق، تأكد من جودة الملف أو حزمة ffmpeg"*')
        await conn.sendMessage(m.chat, { react: { text: '❌', key: m.key } })
    }
}

handler.command = /^ملصق$/i
handler.help = ['ملصق']
handler.tags = ['sticker']

export default handler
