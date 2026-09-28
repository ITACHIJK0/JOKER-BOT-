/*
⌁ 𝙹𝙾𝙺𝙴𝚁 𝐗 𝙸𝚃𝙰𝙲𝙷𝙸 ⌁
𝙹𝙾𝙺𝙴𝚁 𝙱𝙾𝚃 ♻️ 𝙴𝙳𝙸𝚃𝙸𝙾𝙽 ʙʏ ɪᴛ𝙰𝙲𝙷𝙸

「 𝐂𝐫𝐞𝐝𝐢𝐭𝐬 𝐛𝐲 𝙅𝙾𝙆𝙴𝙍 𝘽𝙾𝚃 」
「 لا تحذف الحقوق 🖤 」
*/

import { exec } from 'child_process'
import fs from 'fs'
import util from 'util'
import { downloadContentFromMessage } from '@whiskeysockets/baileys'
import { theme } from '../core/theme.js'

const execAsync = util.promisify(exec)

// قاموس الترجمة الذكي للأنماط (يدعم الإنجليزية والعربية مع الاختصارات)
const styleMap = {
    // إنجليزية
    circle: 'circle',
    crop: 'crop',
    bw: 'bw',
    invert: 'invert',
    blur: 'blur',
    pixel: 'pixel',
    sepia: 'sepia',
    neon: 'neon',
    
    // عربية واختصارات
    'دائري': 'circle',
    'دائره': 'circle',
    'مربع': 'crop',
    'قص': 'crop',
    'ابيض وأسود': 'bw',
    'اسود': 'bw',
    'أبيض وأسود': 'bw',
    'عكس': 'invert',
    'عكس الألوان': 'invert',
    'تمويه': 'blur',
    'غواش': 'blur',
    'بكسل': 'pixel',
    'تكسر': 'pixel',
    'سيبيا': 'sepia',
    'نيون': 'neon',
    'حواف': 'neon'
}

const stylesDescription = {
    circle: 'دائري (قص دائري إطاري)',
    crop: 'مربع / قص مركزي 512x512',
    bw: 'أبيض وأسود',
    invert: 'عكس الألوان',
    blur: 'تمويه خفيف',
    pixel: 'تكسّر البكسل (Retro)',
    sepia: 'تأثير سيبيا قديم',
    neon: 'حواف نيون'
}

// دالة إضافة حقوق الـ EXIF للملصق
async function addExif(webpBuffer, packname = '♖ 𝑇ℎ𝑒 𝑗𝑜𝑘𝚎𝑟 𝑏𝑜𝑡 ♕', author = '𝑝𝑦 𝑖𝑡𝑎𝑐ℎ𝑖 ♞') {
    const img = new import('node-webpmux').Image()
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
}

const handler = async (m, { conn, args, usedPrefix, command }) => {
    try {
        const from = m.chat
        const rawOpt = (args?.[0] || '').toLowerCase()
        const opt = styleMap[rawOpt] || rawOpt

        // قائمة الأنماط المتكاملة (إنجليزي + عربي)
        const listContent = [
            { type: 'title', text: '🎨 أنماط الملصقات الاحترافية (عربي/إنجليزي)' },
            { type: 'divider' },
            { type: 'line', text: '• دائري  ──  circle' },
            { type: 'line', text: '• مربع / قص  ──  crop' },
            { type: 'line', text: '• ابيض وأسود  ──  bw' },
            { type: 'line', text: '• عكس  ──  invert' },
            { type: 'line', text: '• تمويه  ──  blur' },
            { type: 'line', text: '• بكسل  ──  pixel' },
            { type: 'line', text: '• سيبيا  ──  sepia' },
            { type: 'line', text: '• نيون  ──  neon' },
            { type: 'divider' },
            { type: 'info', label: 'للعرض السريع', value: `${usedPrefix + command} list` }
        ]

        if (opt === 'list') {
            return await conn.sendMessage(
                from,
                { text: theme.build(listContent) },
                { quoted: m }
            )
        }

        // تجميع الوسائط المستهدفة (سواء رسالة مفردة أو ألبوم/عدة صور بالرد)
        let messagesToProcess = []
        
        // التحقق من الرسالة الحالية
        if (m.message?.imageMessage || m.message?.videoMessage) {
            messagesToProcess.push(m.message)
        }

        // التحقق من الرسالة المقتبسة أو الألبومات
        const ctx = m?.message?.extendedTextMessage?.contextInfo
        const quotedMsg = ctx?.quotedMessage?.message || ctx?.quotedMessage || null

        if (quotedMsg) {
            if (quotedMsg.imageMessage || quotedMsg.videoMessage) {
                messagesToProcess.push(quotedMsg)
            }
            // دعم الألبومات المتعددة في الرد (quoted message containing multi-media / viewOnce / etc)
            if (quotedMsg.ephemeralMessage?.message) {
                const inner = quotedMsg.ephemeralMessage.message
                if (inner.imageMessage || inner.videoMessage) messagesToProcess.push(inner)
            }
        }

        // إذا لم يتم العثور على وسائط
        if (messagesToProcess.length === 0) {
            const helpContent = [
                { type: 'title', text: '🖼️ صانع الملصقات الاحترافي - JOKER' },
                { type: 'divider' },
                { type: 'line', text: 'قم بإرسال أو الرد على صورة/فيديو (أو عدة صور دفعة واحدة) لتمرير السحر.' },
                { type: 'info', label: 'مثال عربي', value: `${usedPrefix + command} دائري` },
                { type: 'info', label: 'مثال إنجليزي', value: `${usedPrefix + command} circle` },
                { type: 'info', label: 'القائمة الشاملة', value: `${usedPrefix + command} list` }
            ]
            return await conn.sendMessage(
                from,
                { text: theme.build(helpContent) },
                { quoted: m }
            )
        }

        if (rawOpt && rawOpt !== 'list' && !styleMap[rawOpt]) {
            return await conn.sendMessage(
                from,
                { text: theme.error(`النمط أو الاختصار *${rawOpt}* غير موجود.\n\nاستخدم ${usedPrefix + command} list لمعرفة الأنماط المتاحة.`) },
                { quoted: m }
            )
        }

        await m.react('⏳')
        let successCount = 0

        for (const msgObj of messagesToProcess) {
            const isImage = Boolean(msgObj.imageMessage)
            const isVideo = Boolean(msgObj.videoMessage)
            const mediaMsg = isImage ? msgObj.imageMessage : msgObj.videoMessage
            const dlType = isImage ? 'image' : 'video'

            let buffer
            try {
                const stream = await downloadContentFromMessage(mediaMsg, dlType)
                const chunks = []
                for await (const chunk of stream) {
                    chunks.push(chunk)
                }
                buffer = Buffer.concat(chunks)
            } catch (e) {
                continue
            }

            if (!buffer || !buffer.length) continue

            const tmpDir = './tmp'
            await fs.promises.mkdir(tmpDir, { recursive: true })

            const ts = Date.now() + Math.random()
            const input = `${tmpDir}/joker_${ts}.${isImage ? 'jpg' : 'mp4'}`
            const output = `${tmpDir}/joker_${ts}.webp`

            await fs.promises.writeFile(input, buffer)

            const activeStyle = opt || 'circle'

            const baseContain =
                'fps=15,' +
                'scale=512:512:force_original_aspect_ratio=decrease,' +
                'pad=512:512:(ow-iw)/2:(oh-ih)/2:color=white@0.0'

            const baseCoverCrop =
                'fps=15,' +
                'scale=512:512:force_original_aspect_ratio=increase,' +
                'crop=512:512'

            const geqCircle =
                "geq=lum='p(X,Y)':a='if(lte(hypot(X-256,Y-256),256),255,0)'"

            const vf =
                activeStyle === 'circle'
                    ? `${baseCoverCrop},format=rgba,${geqCircle}`
                : activeStyle === 'crop'
                    ? baseCoverCrop
                : activeStyle === 'bw'
                    ? `${baseContain},hue=s=0`
                : activeStyle === 'invert'
                    ? `${baseContain},negate`
                : activeStyle === 'blur'
                    ? `${baseContain},gblur=sigma=6`
                : activeStyle === 'pixel'
                    ? `${baseContain},scale=128:128:flags=neighbor,scale=512:512:flags=neighbor`
                : activeStyle === 'sepia'
                    ? `${baseContain},colorchannelmixer=.393:.769:.189:0:.349:.686:.168:0:.272:.534:.131`
                : activeStyle === 'neon'
                    ? `${baseContain},edgedetect=low=0.08:high=0.2`
                : `${baseCoverCrop},format=rgba,${geqCircle}`

            const ffmpegCmd = isVideo
                ? `ffmpeg -y -i "${input}" -t 7 -an -vf "${vf}" -loop 0 -fps_mode passthrough "${output}"`
                : `ffmpeg -y -i "${input}" -an -vf "${vf}" -loop 0 -fps_mode passthrough "${output}"`

            try {
                await execAsync(ffmpegCmd)
                let stickerBuffer = await fs.promises.readFile(output)

                if (stickerBuffer.length) {
                    // حقن الحقوق الاحترافية داخل الميتا داتا لكل ملصق
                    try {
                        stickerBuffer = await addExif(stickerBuffer, '♖ 𝑇ℎ𝑒 𝑗𝑜𝑘𝚎𝑟 𝑏𝑜𝑡 ♕', '𝑝𝑦 𝑖𝑡𝑎𝐜ℎ𝑖 ♞')
                    } catch {}

                    await conn.sendMessage(from, { sticker: stickerBuffer }, { quoted: m })
                    successCount++
                }
            } catch (err) {
                console.error('Sticker Processing Error:', err)
            } finally {
                try {
                    if (fs.existsSync(input)) await fs.promises.unlink(input)
                    if (fs.existsSync(output)) await fs.promises.unlink(output)
                } catch {}
            }
        }

        if (successCount > 0) {
            await m.react('✅')
        } else {
            await m.react('❌')
            await conn.sendMessage(from, { text: theme.error('تعذر معالجة أو إنشاء الملصقات للوسائط المحددة.') }, { quoted: m })
        }

    } catch (error) {
        console.error('Joker Sticker Handler Error:', error)
        await m.react('❌')
        return conn.reply(m.chat, theme.error(`تعذر إكمال العملية\n\n${error?.message || 'حدث خطأ غير معروف'}`), m)
    }
}

handler.help = ['ملصق [النمط/عربي]']
handler.tags = ['sticker']
handler.command = ['لملصق', 's', 'ملصق']

export default handler
