/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝐑 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪᴛ𝙰𝙲𝙷𝙸

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 by 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 」
「 لا تحذف الحقوق 🖤 」
*/

import axios from 'axios'
import fetch from 'node-fetch'
import { writeFileSync, unlinkSync, readFileSync, existsSync } from 'fs'
import { execSync } from 'child_process'
import crypto from 'crypto'
import https from 'https'
import { theme } from '../core/theme.js'

const API_BASE = 'https://engez.a7a.online/api/v1'
const PINTEREST_ENDPOINT = `${API_BASE}/search/pinterest`

// دالة خلط النتائج عشوائياً لضمان التنوع
function shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1))
        const temp = a[i]
        a[i] = a[randomIndex]
        a[randomIndex] = temp
    }
    return a
}

// البحث الذكي عن الصور الثابتة عبر الـ API
async function searchPinterestSmart(query) {
    const { data } = await axios.get(PINTEREST_ENDPOINT, {
        params: { action: 'بحث', q: query },
        timeout: 30000,
        validateStatus: () => true
    })

    if (!data || data.success !== true) {
        throw new Error('فشل البحث في Pinterest')
    }

    const results = data.response?.results
    if (!Array.isArray(results) || !results.length) {
        throw new Error('لا توجد نتائج مطابقة لهذا البحث')
    }
    return results
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

// دالة حقن الحقوق EXIF الاحترافية للملصقات الثابتة
async function addExif(webpBuffer, packname = '♖ 𝑇ℎ𝑒 𝑗𝑜𝑘𝚎𝑟 𝑏𝑜𝑡 ♕', author = '𝑝𝑦 𝑖𝑡𝑎𝐜ℎ𝑖 ♞') {
    try {
        const mod = await import('node-webpmux')
        const img = new mod.Image()
        await img.load(webpBuffer)
        const json = {
            'sticker-pack-id': 'https://github.com/Itachi/JokerBot',
            'sticker-pack-name': packname,
            'sticker-pack-publisher': author,
            'emojis': ['🖤', '🃏', '🔥']
        }
        const exifAttr = Buffer.from([0x49, 0x43, 0x45, 0x54, 0x00, 0x00, 0x00, 0x0b, 0x00, 0x00, 0x00, 0x4e, 0x61, 0x6d, 0x65, 0x73, 0x74, 0x72, 0x69, 0x6e, 0x67])
        const jsonBuffer = Buffer.from(JSON.stringify(json), 'utf-8')
        let exif = Buffer.concat([exifAttr, jsonBuffer])
        exif.writeUIntLE(jsonBuffer.length, 14, 4)
        img.exif = exif
        return await img.save(null)
    } catch {
        return webpBuffer
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
        const fileName = `${toB64Url(sha256(item.buffer))}.webp`
        zip.file(fileName, item.buffer)
        stickersMetadata.push({
            fileName,
            isAnimated: false,
            emojis: ['🖤', '🃏'],
            accessibilityLabel: '',
            isLottie: false,
            mimetype: 'image/webp'
        })
    }

    const trayIconFileName = 'tray_icon.webp'
    const traySource = pack[0]?.buffer
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
            name: '🃏 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 ♞',
            publisher: '👑 𝐈𝐭𝐚𝐜𝐡𝐢',
            packDescription: `🃏 𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓 | ${query}`,
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

async function makeWebpFromImageBuffer(buffer) {
    const ts = Date.now() + Math.random()
    const inputPath = `./tmp_stk_${ts}.jpg`
    const outputPath = `./tmp_stk_${ts}.webp`
    try {
        writeFileSync(inputPath, buffer)
        const filter = 'scale=512:512:force_original_aspect_ratio=decrease,pad=512:512:(ow-iw)/2:(oh-ih)/2:color=0x00000000'
        
        execSync(`ffmpeg -y -i "${inputPath}" -an -vf "${filter}" -loop 0 -q:v 80 "${outputPath}"`, { stdio: 'pipe' })
        
        let resultBuffer = readFileSync(outputPath)
        resultBuffer = await addExif(resultBuffer, '♖ 𝑇ℎ𝑒 𝑗𝑜𝑘𝚎𝑟 𝑏𝑜𝑡 ♕', '𝑝𝑦 𝑖𝑡𝑎𝐜ℎ𝑖 ♞')
        return { buffer: resultBuffer }
    } finally {
        try { if (existsSync(inputPath)) unlinkSync(inputPath) } catch {}
        try { if (existsSync(outputPath)) unlinkSync(outputPath) } catch {}
    }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) {
        return m.reply(theme.build([
            { type: 'title', text: '🃏 مـلـصـقـات Pinterest الثابتة' },
            { type: 'divider' },
            { type: 'line', text: `• الاستخدام: ${usedPrefix}ملصقات <بحث> [عدد]` },
            { type: 'line', text: `• مثال: ${usedPrefix}ملصقات أنمي 15` }
        ]))
    }

    let query = text
    let count = 10 // الافتراضي 10 ملصقات ثابتة

    const parts = text.split(' ')
    const lastPart = parts[parts.length - 1]
    if (!isNaN(lastPart) && parts.length > 1) {
        count = Math.min(30, Math.max(1, parseInt(lastPart)))
        query = parts.slice(0, -1).join(' ')
    }

    let statusMsg = await m.reply(`🃏 *𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓* ➢ جاري جلب ملصقات "${query}" الثابتة... ⏳`)

    try {
        const rawPins = shuffle(await searchPinterestSmart(query))
        const pack = []
        const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'

        for (let i = 0; i < rawPins.length && pack.length < count; i++) {
            const pin = rawPins[i]

            if (pin.images?.orig?.url) {
                try {
                    const imgRes = await fetch(pin.images.orig.url, { headers: { 'User-Agent': UA }, timeout: 10000 })
                    if (imgRes.ok) {
                        const mediaBuffer = Buffer.from(await imgRes.arrayBuffer())
                        if (mediaBuffer.length > 0) {
                            const stickerObj = await makeWebpFromImageBuffer(mediaBuffer)
                            pack.push(stickerObj)
                        }
                    }
                } catch (err) {
                    console.error('Image item process error:', err.message)
                }
            }
        }

        if (pack.length === 0) {
            try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}
            return m.reply(`❌ *𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓* ➢ تعذر العثور على صور صالحة مطابقة لـ "${query}"`)
        }

        try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}

        // إرسال حزمة الملصقات الثابتة مع الحقوق كاملة
        await sendStickerPack(conn, m, pack, query)

    } catch (e) {
        console.error(e)
        try { await conn.sendMessage(m.chat, { delete: statusMsg.key }) } catch {}
        m.reply(`❌ *𝐉𝐎𝐊𝐄𝐑 𝐁𝐎𝐓* ➢ حدث خطأ: ${e.message}`)
    }
}

handler.help = ['ملصقات <بحث>']
handler.tags = ['sticker']
handler.command = /^(ملصقات|باكج|stickerpack|pack|حزمه|حزمة|ملصقات_ثابته|باكج_ثابت|حزمه_ثابته)$/i

export default handler
